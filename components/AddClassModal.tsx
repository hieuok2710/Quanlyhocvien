
import React, { useState } from 'react';
import { X, BookOpen, User, Calendar, Clock, Users, Check } from 'lucide-react';
import { ClassRoom } from '../types';

interface AddClassModalProps {
  onClose: () => void;
  onSave: (cls: ClassRoom) => void;
}

const AddClassModal: React.FC<AddClassModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    teacher: '',
    subject: '',
    schedule: '',
    maxCapacity: 30
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network request
    setTimeout(() => {
      const newClass: ClassRoom = {
        id: `C-${Date.now()}`,
        name: formData.name,
        teacher: formData.teacher,
        subject: formData.subject,
        schedule: formData.schedule,
        studentCount: 0,
        maxCapacity: Number(formData.maxCapacity),
        image: '' // Will use placeholder
      };

      onSave(newClass);
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-dark-800 w-full max-w-lg rounded-2xl border border-dark-600 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-700 flex justify-between items-center bg-dark-900/50">
          <h3 className="text-xl font-bold text-white">Tạo Lớp học Mới</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tên lớp học</label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                name="name"
                required
                type="text" 
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: ReactJS Advanced K18"
                className="w-full bg-dark-950 border border-dark-600 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-slate-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Giảng viên</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  name="teacher"
                  required
                  type="text" 
                  value={formData.teacher}
                  onChange={handleChange}
                  placeholder="Tên giảng viên"
                  className="w-full bg-dark-950 border border-dark-600 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-slate-600"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Chủ đề / Môn học</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  name="subject"
                  required
                  type="text" 
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Frontend, Backend..."
                  className="w-full bg-dark-950 border border-dark-600 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-slate-600"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Lịch học</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                name="schedule"
                required
                type="text" 
                value={formData.schedule}
                onChange={handleChange}
                placeholder="Ví dụ: T2 - T4 - T6 (19:30 - 21:30)"
                className="w-full bg-dark-950 border border-dark-600 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Sĩ số tối đa</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                name="maxCapacity"
                required
                type="number"
                min="1"
                max="100"
                value={formData.maxCapacity}
                onChange={handleChange}
                className="w-full bg-dark-950 border border-dark-600 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder-slate-600"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3 justify-end">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-300 font-medium hover:bg-dark-700 transition-colors"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-primary hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-primary/25 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <Check className="w-4 h-4" />}
              {isLoading ? 'Đang tạo...' : 'Tạo lớp học'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClassModal;
