
import React, { useState, useRef } from 'react';
import { Save, Bell, LayoutList, Monitor, RefreshCw, Database, Download, Upload, History, CheckCircle2, User, Camera, Mail, Briefcase, Moon, Sun, Loader2, Trash2, Shield, Plus, Lock, PenSquare, LogOut } from 'lucide-react';
import { SystemSettings, UserProfile, Student, ClassRoom, UserAccount } from '../types';

interface SettingsProps {
  settings: SystemSettings;
  onSave: (newSettings: SystemSettings) => void;
  userProfile: UserAccount; // Updated to full account to check email/role
  onUpdateProfile: (newProfile: UserProfile) => void;
  data: { students: Student[], classes: ClassRoom[] };
  onRestore: (backupData: any) => void;
  
  // Admin Props
  allUsers: UserAccount[];
  onAddUser: (user: UserAccount) => void;
  onUpdateUser: (user: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
  
  // Auth Props
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  settings, onSave, userProfile, onUpdateProfile, data, onRestore,
  allUsers, onAddUser, onUpdateUser, onDeleteUser,
  onLogout
}) => {
  const [localSettings, setLocalSettings] = useState<SystemSettings>(settings);
  const [localProfile, setLocalProfile] = useState<UserProfile>(userProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'GENERAL' | 'USERS'>('GENERAL');
  const [isSaved, setIsSaved] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // User Management State
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const isAdmin = userProfile.email === 'admin@gmail.com';

  const handleChange = (key: keyof SystemSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setIsSaved(false);
  };

  const handleProfileChange = (key: keyof UserProfile, value: any) => {
    setLocalProfile(prev => ({ ...prev, [key]: value }));
    setIsSaved(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingAvatar(true);
      setTimeout(() => {
        const reader = new FileReader();
        reader.onloadend = () => {
          handleProfileChange('avatar', reader.result as string);
          setIsUploadingAvatar(false);
        };
        reader.readAsDataURL(file);
      }, 1500);
    }
  };

  const handleRemoveAvatar = () => {
    if (window.confirm('Bạn có chắc muốn xóa ảnh đại diện hiện tại?')) {
       const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(localProfile.name)}&background=6366f1&color=fff&bold=true`;
       handleProfileChange('avatar', defaultAvatar);
    }
  };

  const handleSave = () => {
    onSave(localSettings);
    onUpdateProfile(localProfile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleBackup = () => {
    setIsBackingUp(true);
    const backupData = {
        settings: localSettings,
        profile: localProfile,
        students: data.students,
        classes: data.classes,
        timestamp: new Date().toISOString(),
        systemVersion: "2.0.0"
    };

    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `edunova_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode); 
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

      setIsBackingUp(false);
      
      const now = new Date();
      const dateStr = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      
      const newSettings = { ...localSettings, lastBackupDate: dateStr };
      setLocalSettings(newSettings);
      onSave(newSettings); 
    }, 1500);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let jsonContent = event.target?.result as string;
        if (jsonContent.charCodeAt(0) === 0xFEFF) {
            jsonContent = jsonContent.slice(1);
        }

        const parsedData = JSON.parse(jsonContent);
        
        onRestore(parsedData);
        
        if (parsedData.settings) setLocalSettings(parsedData.settings);
        if (parsedData.profile) setLocalProfile(parsedData.profile);

        const studentCount = Array.isArray(parsedData.students) ? parsedData.students.length : 0;
        const classCount = Array.isArray(parsedData.classes) ? parsedData.classes.length : 0;

        setTimeout(() => {
          setIsRestoring(false);
          alert(`Khôi phục thành công!\n\n- ${studentCount} Học viên\n- ${classCount} Lớp học\n- Cài đặt hệ thống\n\nDữ liệu đã được cập nhật.`);
        }, 800);

      } catch (error) {
        console.error("Restore failed:", error);
        alert('Lỗi: File sao lưu không hợp lệ hoặc bị hỏng. Vui lòng kiểm tra lại file JSON.');
        setIsRestoring(false);
      } finally {
         e.target.value = ''; 
      }
    };
    
    reader.onerror = () => {
      alert('Lỗi khi đọc file.');
      setIsRestoring(false);
      e.target.value = '';
    }

    reader.readAsText(file);
  };

  // User Management Handlers
  const handleOpenUserModal = (user?: UserAccount) => {
    if (user) {
      setEditingUser(user);
    } else {
      setEditingUser({
        id: '',
        name: '',
        email: '',
        password: '',
        role: 'Giáo viên',
        avatar: '',
        isActive: true,
        createdAt: ''
      });
    }
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (editingUser.id) {
       onUpdateUser(editingUser);
    } else {
       const newUser = {
         ...editingUser,
         id: `USER-${Date.now()}`,
         createdAt: new Date().toISOString(),
         avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(editingUser.name)}&background=random&color=fff`
       };
       onAddUser(newUser);
    }
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24 animate-fade-in h-full overflow-y-auto custom-scrollbar">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Cấu hình Hệ thống</h2>
          <p className="text-slate-500 dark:text-slate-400">Quản lý hồ sơ, giao diện và người dùng</p>
        </div>
        
        {isAdmin && (
          <div className="bg-slate-100 dark:bg-dark-800 p-1 rounded-xl flex gap-1">
             <button
               onClick={() => setActiveTab('GENERAL')}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'GENERAL' ? 'bg-white dark:bg-dark-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
             >
               Cài đặt Chung
             </button>
             <button
               onClick={() => setActiveTab('USERS')}
               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'USERS' ? 'bg-white dark:bg-dark-700 shadow-sm text-indigo-500' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <Shield className="w-4 h-4" /> Quản lý Users
             </button>
          </div>
        )}
      </div>

      {activeTab === 'GENERAL' ? (
        <div className="space-y-8">
          
          {/* SECTION 0: PERSONAL PROFILE */}
          <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-2xl p-6 shadow-xl hover:border-indigo-500/30 transition-colors">
            <div className="flex items-start gap-4 mb-6">
               <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-xl text-indigo-500 dark:text-indigo-400 border border-indigo-500/10">
                  <User className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thông tin Hồ sơ</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Cập nhật thông tin cá nhân và ảnh đại diện</p>
               </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
               {/* Left: Avatar Upload */}
               <div className="flex flex-col items-center gap-4">
                  <div 
                     className="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden shadow-2xl ring-4 ring-slate-100 dark:ring-dark-700" 
                     onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
                  >
                     <img 
                        src={localProfile.avatar} 
                        alt="Avatar" 
                        className={`w-full h-full object-cover transition-all duration-300 ${isUploadingAvatar ? 'opacity-50 blur-sm scale-105' : 'group-hover:opacity-80'}`}
                     />
                     
                     <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isUploadingAvatar ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {isUploadingAvatar ? (
                           <Loader2 className="w-8 h-8 text-white animate-spin" />
                        ) : (
                           <Camera className="w-8 h-8 text-white" />
                        )}
                     </div>

                     <input 
                        ref={fileInputRef}
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleAvatarChange}
                        disabled={isUploadingAvatar}
                     />
                  </div>
                  
                  <div className="flex items-center gap-2">
                     <button 
                       onClick={() => fileInputRef.current?.click()}
                       disabled={isUploadingAvatar}
                       className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
                     >
                       Thay đổi
                     </button>
                     <button 
                       onClick={handleRemoveAvatar}
                       disabled={isUploadingAvatar}
                       className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50"
                       title="Sử dụng ảnh mặc định"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>

               {/* Right: Form Fields */}
               <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div>
                     <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Họ và Tên</label>
                     <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <input 
                          type="text" 
                          value={localProfile.name}
                          onChange={(e) => handleProfileChange('name', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-600 text-slate-900 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        />
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Chức danh / Vai trò</label>
                     <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <input 
                          type="text" 
                          value={localProfile.role}
                          onChange={(e) => handleProfileChange('role', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-600 text-slate-900 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        />
                     </div>
                  </div>
                  <div className="md:col-span-2">
                     <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Email Liên hệ</label>
                     <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <input 
                          type="email" 
                          value={localProfile.email}
                          onChange={(e) => handleProfileChange('email', e.target.value)}
                          readOnly={true} // Email should be unique ID in auth system, changing it requires more logic
                          className="w-full bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-dark-600 text-slate-500 dark:text-slate-400 pl-10 pr-4 py-2.5 rounded-xl cursor-not-allowed"
                        />
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* SECTION 1: DISPLAY & PAGINATION */}
            <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-2xl p-6 shadow-xl hover:border-primary/30 transition-colors">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-primary/20 to-indigo-500/20 rounded-xl text-primary border border-primary/10">
                  <LayoutList className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hiển thị & Danh sách</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Tùy chỉnh cách dữ liệu được trình bày</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
                    Số dòng mỗi trang (Học viên)
                  </label>
                  <div className="relative">
                    <select
                      value={localSettings.itemsPerPage}
                      onChange={(e) => handleChange('itemsPerPage', Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-600 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary block p-3 appearance-none transition-all"
                    >
                      <option value={5}>5 dòng / trang</option>
                      <option value={10}>10 dòng / trang</option>
                      <option value={20}>20 dòng / trang</option>
                      <option value={50}>50 dòng / trang</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-950/50 rounded-xl border border-slate-200 dark:border-dark-700">
                   <div>
                     <span className="block text-sm font-semibold text-slate-900 dark:text-slate-200">Tự động làm mới dữ liệu</span>
                     <span className="text-xs text-slate-500">Cập nhật trạng thái realtime (30s)</span>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={localSettings.autoRefresh}
                      onChange={(e) => handleChange('autoRefresh', e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-300 dark:bg-dark-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* SECTION 2: NOTIFICATIONS & SYSTEM */}
            <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-2xl p-6 shadow-xl hover:border-secondary/30 transition-colors">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-secondary/20 to-pink-500/20 rounded-xl text-secondary border border-secondary/10">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hệ thống & Thông báo</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý thông báo và giao diện</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-dark-700">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Nhận thông báo qua Email</span>
                  </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={localSettings.enableNotifications}
                      onChange={(e) => handleChange('enableNotifications', e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-slate-300 dark:bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
                  </label>
                </div>
                
                {/* Theme Toggle */}
                <div className="flex items-center justify-between py-3">
                   <div className="flex items-center gap-3">
                      {localSettings.themeMode === 'dark' ? (
                         <Moon className="w-5 h-5 text-indigo-400" />
                      ) : (
                         <Sun className="w-5 h-5 text-amber-500" />
                      )}
                      <div>
                         <span className="block text-slate-700 dark:text-slate-300 font-medium">Chế độ Giao diện</span>
                         <span className="text-xs text-slate-500">{localSettings.themeMode === 'dark' ? 'Đang dùng chế độ Tối' : 'Đang dùng chế độ Sáng'}</span>
                      </div>
                   </div>
                   
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                         type="checkbox" 
                         checked={localSettings.themeMode === 'dark'}
                         onChange={(e) => handleChange('themeMode', e.target.checked ? 'dark' : 'light')}
                         className="sr-only peer" 
                      />
                      <div className="w-14 h-7 bg-amber-200 dark:bg-indigo-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-900 flex items-center justify-between px-2">
                         <Sun className="w-3 h-3 text-amber-600" />
                         <Moon className="w-3 h-3 text-indigo-400" />
                      </div>
                   </label>
                </div>
              </div>
            </div>

            {/* SECTION 3: BACKUP & RESTORE */}
            <div className="lg:col-span-2 bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-2xl p-6 shadow-xl hover:border-emerald-500/30 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Database className="w-48 h-48 text-emerald-500" />
              </div>

              <div className="flex items-start gap-4 mb-6 relative z-10">
                <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl text-emerald-500 dark:text-emerald-400 border border-emerald-500/10">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sao lưu & Khôi phục</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Bảo vệ dữ liệu an toàn và khôi phục khi cần thiết</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                 {/* Backup Column */}
                 <div className="bg-slate-50 dark:bg-dark-950/50 p-5 rounded-xl border border-slate-200 dark:border-dark-600 flex flex-col">
                    <h4 className="text-slate-800 dark:text-white font-semibold mb-2 flex items-center gap-2">
                      <Download className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> Sao lưu dữ liệu
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex-1">
                      Tải xuống bản sao đầy đủ của cơ sở dữ liệu hiện tại (Học viên, Lớp học, Điểm số) dưới dạng file JSON.
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200 dark:border-dark-700">
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                          <History className="w-3 h-3" />
                          <span>Gần nhất: {localSettings.lastBackupDate || 'Chưa sao lưu'}</span>
                       </div>
                       <button 
                         onClick={handleBackup}
                         disabled={isBackingUp}
                         className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         {isBackingUp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                         {isBackingUp ? 'Đang xử lý...' : 'Tải bản sao lưu'}
                       </button>
                    </div>
                 </div>

                 {/* Restore Column */}
                 <div className="bg-slate-50 dark:bg-dark-950/50 p-5 rounded-xl border border-slate-200 dark:border-dark-600 flex flex-col">
                    <h4 className="text-slate-800 dark:text-white font-semibold mb-2 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-blue-500 dark:text-blue-400" /> Khôi phục dữ liệu
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex-1">
                      Tải lên file sao lưu (.json) để khôi phục hệ thống về trạng thái trước đó. <span className="text-rose-500 dark:text-rose-400">Lưu ý: Dữ liệu hiện tại sẽ bị ghi đè.</span>
                    </p>
                    <div className="flex items-center justify-end mt-auto pt-4 border-t border-slate-200 dark:border-dark-700">
                       <label className={`cursor-pointer px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-dark-700 dark:hover:bg-dark-600 border border-slate-300 dark:border-dark-500 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isRestoring ? 'opacity-50 pointer-events-none' : ''}`}>
                         {isRestoring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                         {isRestoring ? 'Đang khôi phục...' : 'Chọn file khôi phục'}
                         <input type="file" className="hidden" accept=".json" onChange={handleRestore} disabled={isRestoring} />
                       </label>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
           {/* USERS MANAGEMENT TAB */}
           <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-200 dark:border-dark-700 flex justify-between items-center bg-slate-50 dark:bg-dark-900/50">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
                      <Shield className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Danh sách Người dùng</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý tài khoản truy cập hệ thống</p>
                   </div>
                </div>
                <button 
                  onClick={() => handleOpenUserModal()}
                  className="px-4 py-2 bg-primary hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-primary/20 transition-all font-bold text-sm flex items-center gap-2"
                >
                   <Plus className="w-4 h-4" /> Thêm User
                </button>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-dark-900 text-slate-500 dark:text-slate-400">
                       <tr>
                          <th className="p-4 text-xs font-bold uppercase tracking-wider">Người dùng</th>
                          <th className="p-4 text-xs font-bold uppercase tracking-wider">Email</th>
                          <th className="p-4 text-xs font-bold uppercase tracking-wider">Vai trò</th>
                          <th className="p-4 text-xs font-bold uppercase tracking-wider text-center">Trạng thái</th>
                          <th className="p-4 text-xs font-bold uppercase tracking-wider text-right">Thao tác</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                       {allUsers.map(user => (
                          <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors">
                             <td className="p-4">
                                <div className="flex items-center gap-3">
                                   <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full border border-slate-200 dark:border-dark-600" />
                                   <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{user.name}</span>
                                </div>
                             </td>
                             <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{user.email}</td>
                             <td className="p-4">
                                <span className={`px-2 py-1 rounded-md text-xs font-bold border ${user.email === 'admin@gmail.com' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-slate-100 dark:bg-dark-700 text-slate-500 border-slate-200 dark:border-dark-600'}`}>
                                   {user.role}
                                </span>
                             </td>
                             <td className="p-4 text-center">
                                <span className={`w-2.5 h-2.5 rounded-full inline-block ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} title={user.isActive ? 'Hoạt động' : 'Đã khóa'}></span>
                             </td>
                             <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                   <button 
                                      onClick={() => handleOpenUserModal(user)}
                                      className="p-1.5 text-slate-400 hover:text-indigo-500 bg-slate-100 dark:bg-dark-700 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                                   >
                                      <PenSquare className="w-4 h-4" />
                                   </button>
                                   {user.email !== 'admin@gmail.com' && (
                                     <button 
                                        onClick={() => {
                                           if (window.confirm(`Xóa user ${user.name}?`)) onDeleteUser(user.id);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-rose-500 bg-slate-100 dark:bg-dark-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                                     >
                                        <Trash2 className="w-4 h-4" />
                                     </button>
                                   )}
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* GLOBAL LOGOUT BUTTON - Always visible at bottom */}
      <div className="flex justify-center pt-8 border-t border-slate-200 dark:border-dark-700 mt-8 mb-20">
        <button 
          onClick={onLogout}
          className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95 flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất khỏi hệ thống
        </button>
      </div>

      {/* USER EDIT MODAL */}
      {isUserModalOpen && editingUser && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-dark-800 w-full max-w-md rounded-2xl border border-dark-600 shadow-2xl overflow-hidden">
               <div className="px-6 py-4 border-b border-dark-700 bg-dark-900/50 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white">{editingUser.id ? 'Cập nhật User' : 'Thêm User Mới'}</h3>
                  <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-white"><Shield className="w-5 h-5 rotate-45" /></button>
               </div>
               
               <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tên hiển thị</label>
                     <input 
                        required
                        type="text" 
                        value={editingUser.name}
                        onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                        className="w-full bg-dark-950 border border-dark-600 text-white px-3 py-2 rounded-lg focus:border-indigo-500 outline-none"
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email (Đăng nhập)</label>
                     <input 
                        required
                        type="email" 
                        value={editingUser.email}
                        readOnly={!!editingUser.id} // Cannot change email for existing users easily in this demo
                        onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                        className={`w-full bg-dark-950 border border-dark-600 text-white px-3 py-2 rounded-lg focus:border-indigo-500 outline-none ${editingUser.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mật khẩu</label>
                     <div className="relative">
                        <input 
                           required={!editingUser.id}
                           type="text" 
                           value={editingUser.password}
                           onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                           placeholder={editingUser.id ? "Giữ nguyên nếu không đổi" : ""}
                           className="w-full bg-dark-950 border border-dark-600 text-white px-3 py-2 rounded-lg focus:border-indigo-500 outline-none"
                        />
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Vai trò</label>
                        <select 
                           value={editingUser.role}
                           onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                           className="w-full bg-dark-950 border border-dark-600 text-white px-3 py-2 rounded-lg focus:border-indigo-500 outline-none"
                        >
                           <option value="Quản trị viên">Quản trị viên</option>
                           <option value="Giáo viên">Giáo viên</option>
                           <option value="Nhân viên">Nhân viên</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Trạng thái</label>
                        <select 
                           value={editingUser.isActive ? 'true' : 'false'}
                           onChange={(e) => setEditingUser({...editingUser, isActive: e.target.value === 'true'})}
                           className="w-full bg-dark-950 border border-dark-600 text-white px-3 py-2 rounded-lg focus:border-indigo-500 outline-none"
                        >
                           <option value="true">Hoạt động</option>
                           <option value="false">Đã khóa</option>
                        </select>
                     </div>
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                     <button type="button" onClick={() => setIsUserModalOpen(false)} className="flex-1 py-2 rounded-lg border border-dark-600 text-slate-400 hover:text-white hover:bg-dark-700 transition-colors">Hủy</button>
                     <button type="submit" className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors">Lưu User</button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {activeTab === 'GENERAL' && (
        <div className="fixed z-20 bottom-6 right-24">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-4 bg-primary hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-2xl shadow-primary/40 transition-all hover:-translate-y-1 active:scale-95"
          >
            {isSaved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {isSaved ? 'Đã lưu!' : 'Lưu thay đổi'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Settings;
