import React, { useState, useRef } from 'react';
import { Save, Bell, LayoutList, Monitor, RefreshCw, Database, Download, Upload, History, CheckCircle2, User, Camera, Mail, Briefcase, Moon, Sun, Loader2, Trash2 } from 'lucide-react';
import { SystemSettings, UserProfile, Student, ClassRoom } from '../types';

interface SettingsProps {
  settings: SystemSettings;
  onSave: (newSettings: SystemSettings) => void;
  userProfile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
  data: { students: Student[], classes: ClassRoom[] };
  onRestore: (backupData: any) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave, userProfile, onUpdateProfile, data, onRestore }) => {
  // System Settings State
  const [localSettings, setLocalSettings] = useState<SystemSettings>(settings);
  
  // Profile Settings State
  const [localProfile, setLocalProfile] = useState<UserProfile>(userProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaved, setIsSaved] = useState(false);
  
  // Backup States
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  // Avatar State
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Handlers for System Settings
  const handleChange = (key: keyof SystemSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setIsSaved(false);
  };

  // Handlers for Profile Settings
  const handleProfileChange = (key: keyof UserProfile, value: any) => {
    setLocalProfile(prev => ({ ...prev, [key]: value }));
    setIsSaved(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingAvatar(true);
      
      // Simulate network upload delay for visual feedback
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
       // Generate default avatar based on name
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
    
    // Create a backup object containing current state including DATA
    const backupData = {
        settings: localSettings,
        profile: localProfile,
        students: data.students,
        classes: data.classes,
        timestamp: new Date().toISOString(),
        systemVersion: "1.0.0"
    };

    // Simulate processing delay then download
    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `edunova_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

      setIsBackingUp(false);
      
      // Update last backup date
      const now = new Date();
      const dateStr = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      
      const newSettings = { ...localSettings, lastBackupDate: dateStr };
      setLocalSettings(newSettings);
      onSave(newSettings); // Save immediately to global state
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
        
        // Remove Byte Order Mark (BOM) if present to prevent parse error
        if (jsonContent.charCodeAt(0) === 0xFEFF) {
            jsonContent = jsonContent.slice(1);
        }

        const parsedData = JSON.parse(jsonContent);
        
        // Basic validation
        if (!parsedData.systemVersion) {
           console.warn("Missing version info in backup file, proceeding anyway.");
        }

        // Call restore handler from App
        onRestore(parsedData);
        
        // Update local state to reflect changes immediately
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
         e.target.value = ''; // Reset input to allow selecting same file again
      }
    };
    
    reader.onerror = () => {
      alert('Lỗi khi đọc file.');
      setIsRestoring(false);
      e.target.value = '';
    }

    reader.readAsText(file);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in h-full overflow-y-auto custom-scrollbar pb-24">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Cấu hình Hệ thống</h2>
        <p className="text-slate-500 dark:text-slate-400">Quản lý hồ sơ, giao diện và dữ liệu</p>
      </div>

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
                   
                   {/* Hover Overlay */}
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
                        className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-600 text-slate-900 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
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
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                  </div>
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

      {/* Floating Action Button - Shifted left to accommodate global feedback button */}
      <div className="fixed bottom-6 right-24 z-20">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-4 bg-primary hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-2xl shadow-primary/40 transition-all hover:-translate-y-1 active:scale-95"
        >
          {isSaved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {isSaved ? 'Đã lưu cài đặt!' : 'Lưu tất cả thay đổi'}
        </button>
      </div>
    </div>
  );
};

export default Settings;