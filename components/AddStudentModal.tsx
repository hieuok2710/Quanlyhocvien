import React, { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Phone, Calendar, BookOpen, Save, Check, Lock, Camera, Upload, CircleDollarSign } from 'lucide-react';
import { Student, StudentStatus } from '../types';

interface AddStudentModalProps {
  onClose: () => void;
  onSave: (student: Student) => void;
  initialClassId?: string;
  lockedClass?: boolean;
  initialData?: Student;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ onClose, onSave, initialClassId = '', lockedClass = false, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    classId: initialClassId,
    avatar: '',
    tuitionPaid: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone,
        dob: initialData.dob,
        classId: initialData.classId,
        avatar: initialData.avatar,
        tuitionPaid: initialData.tuitionPaid || false
      });
    } else if (initialClassId) {
      setFormData(prev => ({ ...prev, classId: initialClassId }));
    }
  }, [initialData, initialClassId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        // Simulate network delay
        setTimeout(() => {
          setFormData(prev => ({ ...prev, avatar: reader.result as string }));
          setIsUploading(false);
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network request
    setTimeout(() => {
      const studentData: Student = {
        id: initialData ? initialData.id : `ST-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        // Use uploaded avatar, or existing one, or generate new default
        avatar: formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random&color=fff`,
        classId: formData.classId,
        joinDate: initialData ? initialData.joinDate : new Date().toISOString().split('T')[0],
        status: initialData ? initialData.status : StudentStatus.ACTIVE,
        gpa: initialData ? initialData.gpa : 0,
        attendance: initialData ? initialData.attendance : 100,
        tuitionPaid: formData.tuitionPaid,
        scores: initialData ? initialData.scores : []
      };

      onSave(studentData);
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-800 w-full max-w-lg rounded-2xl border border-dark-600 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-700 flex justify-between items-center bg-dark-900/50 shrink-0">
          <h3 className="text-xl font-bold text-white">
            {initialData ? 'Cập nhật Thông tin' : 'Thêm mới Học viên'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          
          {/* Avatar Upload Section */}
          <div className="flex justify-center mb-2">
            <div className="relative group cursor-pointer" onClick={() => !isUploading && fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-dark-600 group-hover:border-primary transition-all relative shadow-lg">
                <img 
                  src={formData.avatar || (formData.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random&color=fff` : "https://via.placeholder.com/150")} 
                  alt="Avatar Preview" 
                  className={`w-full h-full object-cover transition-opacity ${isUploading ? 'opacity-50' : ''}`}
                />
                
                {/* Upload Overlay */}
                <div className={`absolute inset-0 bg-black/50 flex flex-col items-center justify-center transition-opacity ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                   {isUploading ? (
                     <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                   ) : (
                     <Camera className="w-8 h-8 text-white mb-1" />
                   )}
                   {!isUploading && <span className="text-[10px] text-white font-bold uppercase">Đổi ảnh</span>}
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isUploading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Họ và Tên <span className="text-rose-500">*</span></label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                name="name"
                required
                type="text" 
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên học viên"
                className="w-full bg-dark-950 border border-dark-600 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-slate-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  name="email"
                  type="email" 
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@edunova.edu.vn"
                  className="w-full bg-dark-950 border border-dark-600 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-slate-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Số điện thoại <span className="text-rose-500">*</span></label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  name="phone"
                  required
                  type="tel" 
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0912..."
                  className="w-full bg-dark-950 border border-dark-600 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-slate-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Ngày sinh</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  name="dob"
                  type="date" 
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full bg-dark-950 border border-dark-600 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Mã lớp học</label>
              <div className="relative">
                {lockedClass ? (
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                ) : (
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                )}
                <input 
                  name="classId"
                  type="text" 
                  value={formData.classId}
                  onChange={handleChange}
                  readOnly={lockedClass}
                  placeholder="Ví dụ: FE-K15"
                  className={`w-full bg-dark-950 border border-dark-600 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-slate-600 ${
                    lockedClass ? 'opacity-70 cursor-not-allowed bg-dark-900 border-amber-500/30 text-amber-400' : ''
                  }`}
                />
              </div>
              {lockedClass && (
                <p className="text-[10px] text-amber-500 mt-1 ml-1">* Học viên sẽ được thêm trực tiếp vào lớp này</p>
              )}
            </div>
          </div>

          {/* Tuition Status Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-dark-900/50 border border-dark-700">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${formData.tuitionPaid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                 <CircleDollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-sm font-semibold text-slate-200">Trạng thái Học phí</span>
                <span className={`text-xs ${formData.tuitionPaid ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formData.tuitionPaid ? 'Đã hoàn thành' : 'Chưa đóng học phí'}
                </span>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.tuitionPaid}
                onChange={(e) => setFormData(prev => ({ ...prev, tuitionPaid: e.target.checked }))}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-dark-700 mt-2">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-300 font-medium hover:bg-dark-700 transition-colors"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit"
              disabled={isLoading || isUploading}
              className="px-5 py-2.5 bg-primary hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-primary/25 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <Check className="w-4 h-4" />}
              {isLoading ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Lưu học viên')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;