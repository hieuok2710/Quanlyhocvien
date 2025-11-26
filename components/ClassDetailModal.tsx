
import React, { useState, useMemo } from 'react';
import { X, User, Mail, Trash2, Plus, Search, UserPlus, Users, Clock, AlertCircle, Eye, CheckCircle2, ArrowRightLeft, Filter, Shield, AlertTriangle, BarChart2 } from 'lucide-react';
import { Student, ClassRoom } from '../types';
import StudentDetail from './StudentDetail';
import AddStudentModal from './AddStudentModal';

interface ClassDetailModalProps {
  classData: ClassRoom;
  allStudents: Student[];
  classes?: ClassRoom[]; // Add list of classes for transfer functionality
  onClose: () => void;
  onUpdateStudentClass: (studentId: string, newClassId: string) => void;
  onDeleteClass: (classId: string) => void;
  onAddStudent: (student: Student) => void;
  userRole: string;
}

const ClassDetailModal: React.FC<ClassDetailModalProps> = ({ classData, allStudents, classes = [], onClose, onUpdateStudentClass, onDeleteClass, onAddStudent, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [addSearchTerm, setAddSearchTerm] = useState('');
  const [onlyFreeStudents, setOnlyFreeStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isCreateStudentOpen, setIsCreateStudentOpen] = useState(false);
  const [addingStudentId, setAddingStudentId] = useState<string | null>(null);
  
  // State for removal confirmation
  const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);
  const [isDeleteClassConfirmOpen, setIsDeleteClassConfirmOpen] = useState(false);

  // State for Transfer Student
  const [transferStudent, setTransferStudent] = useState<Student | null>(null);
  const [targetClass, setTargetClass] = useState<string>('');

  // State for Confirming Add (Steal from other class)
  const [conflictingStudent, setConflictingStudent] = useState<{id: string, name: string, currentClass: string} | null>(null);

  // Check Admin Permissions
  const isAdmin = useMemo(() => {
    const role = (userRole || '').toLowerCase();
    return role.includes('admin') || role.includes('quản trị') || role.includes('quản lý') || role.includes('super');
  }, [userRole]);

  // CRITICAL: Filter logic must match how App.tsx generates data.
  // Mock data links students via Class NAME, not ID. We check both to be safe.
  const classStudents = useMemo(() => {
    return allStudents.filter(s => s.classId === classData.name || s.classId === classData.id);
  }, [allStudents, classData]);

  // Students NOT in this class (available to add)
  const availableStudents = useMemo(() => {
    return allStudents.filter(s => {
      // Exclude students already in this class
      const isInClass = s.classId === classData.name || s.classId === classData.id;
      if (isInClass) return false;

      // Filter by search term
      const term = addSearchTerm.toLowerCase();
      const matchesSearch = s.name.toLowerCase().includes(term) || 
                            s.email.toLowerCase().includes(term);
      
      // Filter by "Free" status if checked
      const isFree = !s.classId || s.classId === '' || s.classId === 'Chưa phân lớp';
      if (onlyFreeStudents && !isFree) return false;

      return matchesSearch;
    });
  }, [allStudents, classData, addSearchTerm, onlyFreeStudents]);

  // Filter for current list display
  const filteredClassStudents = classStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const initiateRemoveStudent = (e: React.MouseEvent, student: Student) => {
    // Aggressively stop propagation
    e.preventDefault();
    e.stopPropagation(); 
    e.nativeEvent.stopImmediatePropagation();
    setStudentToRemove(student);
  };

  const confirmRemoveStudent = () => {
    if (studentToRemove) {
      // Set classId to empty string to remove
      onUpdateStudentClass(studentToRemove.id, ''); 
      showNotification(`Đã xóa ${studentToRemove.name} khỏi lớp`);
      setStudentToRemove(null);
    }
  };

  const initiateTransfer = (e: React.MouseEvent, student: Student) => {
    e.preventDefault();
    e.stopPropagation();
    setTransferStudent(student);
    setTargetClass(''); // Reset selection
  };

  const confirmTransfer = () => {
    if (transferStudent && targetClass) {
      onUpdateStudentClass(transferStudent.id, targetClass);
      // Updated confirmation message
      showNotification(`Thành công! Đã chuyển ${transferStudent.name} sang lớp ${targetClass}.`);
      setTransferStudent(null);
      setTargetClass('');
    }
  };

  const handleAddStudent = (e: React.MouseEvent, student: Student) => {
    e.preventDefault();
    e.stopPropagation();

    const currentClassId = student.classId;

    // Confirmation if stealing from another class
    if (currentClassId && currentClassId !== '' && currentClassId !== 'Chưa phân lớp') {
      setConflictingStudent({
        id: student.id,
        name: student.name,
        currentClass: currentClassId
      });
      return;
    }
    
    executeAddStudent(student.id);
  };

  const confirmConflictAdd = () => {
    if (conflictingStudent) {
      executeAddStudent(conflictingStudent.id);
      setConflictingStudent(null);
    }
  };

  const executeAddStudent = (studentId: string) => {
    setAddingStudentId(studentId);

    // UX Delay
    setTimeout(() => {
      // IMPORTANT: Use classData.name to match the mock data structure in App.tsx
      onUpdateStudentClass(studentId, classData.name);
      
      setAddingStudentId(null);
      showNotification('Đã thêm học viên vào lớp');
    }, 400);
  };

  const handleCreateNewStudent = (newStudent: Student) => {
    // When creating new, ensure classId is set to current class Name
    const studentWithClass = { ...newStudent, classId: classData.name };
    onAddStudent(studentWithClass);
    setIsCreateStudentOpen(false);
    showNotification('Đã tạo và thêm học viên mới');
    
    // Auto switch to list view to see result
    setTimeout(() => setActiveTab('list'), 500);
  };

  const confirmDeleteClass = () => {
    onDeleteClass(classData.id);
    onClose();
  };

  // Filter available target classes (exclude current class)
  const targetClasses = useMemo(() => {
    return classes.filter(c => c.id !== classData.id && c.name !== classData.name);
  }, [classes, classData]);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="bg-dark-800 w-full max-w-5xl h-[90vh] rounded-2xl border border-dark-600 shadow-2xl relative overflow-hidden flex flex-col">
          
          {/* Notification Toast */}
          {notification && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[60] bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-slide-up font-bold border border-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span>{notification}</span>
            </div>
          )}

          {/* Header Area */}
          <div className="relative h-56 shrink-0 group">
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent z-10" />
            <img 
              src={classData.image || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1000&auto=format&fit=crop"} 
              alt={classData.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Top Controls */}
            <div className="absolute top-4 right-4 z-20 flex gap-3">
              {isAdmin && (
                <button 
                  onClick={() => setIsDeleteClassConfirmOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-full transition-all backdrop-blur-md hover:shadow-lg hover:shadow-rose-600/30 font-medium text-sm"
                  title="Xóa lớp học này"
                >
                  <Trash2 className="w-4 h-4" /> Xóa Lớp
                </button>
              )}
              <button 
                onClick={onClose}
                className="p-2 bg-black/40 hover:bg-slate-700 text-white rounded-full transition-colors backdrop-blur-md"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Class Info */}
            <div className="absolute bottom-0 left-0 w-full p-8 z-20">
              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 bg-primary/20 border border-primary/30 text-primary text-xs font-bold rounded uppercase tracking-wider">
                      {classData.subject}
                    </span>
                    {isAdmin && (
                      <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold rounded uppercase tracking-wider flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Admin Access
                      </span>
                    )}
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-2 shadow-sm">{classData.name}</h2>
                  <div className="flex items-center gap-6 text-slate-200 text-sm font-medium">
                     <span className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm"><User className="w-4 h-4 text-primary" /> {classData.teacher}</span>
                     <span className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm"><Clock className="w-4 h-4 text-emerald-400" /> {classData.schedule}</span>
                  </div>
                </div>
                <div className="text-right bg-black/30 p-3 rounded-2xl backdrop-blur-sm border border-white/5">
                  <div className="text-3xl font-bold text-white leading-none">
                    {classStudents.length}<span className="text-lg text-slate-400 font-normal">/{classData.maxCapacity}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Sĩ số</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-dark-700 bg-dark-900 px-8">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'list' 
                  ? 'border-primary text-white bg-white/5' 
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" /> Danh sách Học viên
              <span className="bg-dark-700 text-slate-300 px-2 py-0.5 rounded-full text-xs ml-1">{classStudents.length}</span>
            </button>
            
            {isAdmin && (
              <button
                onClick={() => setActiveTab('add')}
                className={`px-6 py-5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'add' 
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' 
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                <UserPlus className="w-4 h-4" /> Thêm Học viên vào Lớp
              </button>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden bg-dark-800 p-8">
            
            {/* TAB: Student List */}
            {activeTab === 'list' && (
              <div className="h-full flex flex-col animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                   <div className="relative w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Tìm học viên trong lớp..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-dark-900 border border-dark-600 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:border-primary outline-none transition-all text-sm shadow-inner"
                      />
                   </div>
                   
                   <div className="flex items-center gap-3">
                     {isAdmin && (
                        <button 
                          onClick={() => setIsCreateStudentOpen(true)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 text-sm font-bold"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span className="hidden sm:inline">Tạo HV Mới</span>
                        </button>
                     )}

                     {classStudents.length === 0 && (
                       <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 px-4 py-2 rounded-lg text-sm border border-amber-500/20">
                         <AlertCircle className="w-4 h-4" /> Lớp học đang trống
                       </div>
                     )}
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar border border-dark-700 rounded-2xl bg-dark-900/20 shadow-inner">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-dark-900 sticky top-0 z-10 shadow-md">
                      <tr>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Học viên</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Liên hệ</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Tiến độ</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Trạng thái</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-700">
                      {filteredClassStudents.length > 0 ? (
                        filteredClassStudents.map(student => (
                          <tr 
                            key={student.id} 
                            onClick={() => setSelectedStudent(student)}
                            className="hover:bg-dark-700/50 transition-colors group cursor-pointer"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-4 group/info relative">
                                <div className="relative">
                                  <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full border-2 border-dark-600 object-cover group-hover:border-primary transition-colors" />
                                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-dark-800 ${student.status === 'Đang học' ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-200 group-hover:text-primary transition-colors">{student.name}</p>
                                  <p className="text-xs text-slate-500">{student.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-slate-400">
                               <div className="flex flex-col gap-1">
                                 <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {student.email}</span>
                                 <span className="text-xs text-slate-500">{student.phone}</span>
                               </div>
                            </td>
                            <td className="p-4">
                                <div className="flex flex-col gap-1.5 items-center">
                                    <div className="flex items-center justify-between text-xs w-24">
                                        <span className="text-slate-500">GPA</span>
                                        <span className={`font-bold ${student.gpa >= 8 ? 'text-emerald-400' : student.gpa >= 5 ? 'text-slate-300' : 'text-rose-400'}`}>{student.gpa}</span>
                                    </div>
                                    <div className="w-24 h-1.5 bg-dark-700 rounded-full overflow-hidden" title={`Chuyên cần: ${student.attendance}%`}>
                                        <div 
                                            className={`h-full rounded-full ${student.attendance >= 90 ? 'bg-blue-500' : 'bg-amber-500'}`}
                                            style={{ width: `${student.attendance}%` }}
                                        />
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-center">
                               <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                  student.status === 'Đang học' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                               }`}>
                                 {student.status}
                               </span>
                            </td>
                            <td className="p-4 text-right">
                               {/* Use e.stopPropagation on the container to be absolutely sure buttons don't trigger row click */}
                               <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                  <button
                                     onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedStudent(student); }}
                                     className="p-2 text-slate-400 hover:text-white hover:bg-primary/20 rounded-lg transition-colors relative group/btn"
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs font-medium text-white bg-slate-800 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-10 border border-slate-700">Xem chi tiết</span>
                                  </button>
                                  
                                  {isAdmin && (
                                    <>
                                      {/* Transfer Button */}
                                      <button 
                                        onClick={(e) => initiateTransfer(e, student)}
                                        className="p-2 text-slate-400 hover:text-white hover:bg-blue-500/50 rounded-lg transition-colors relative group/transfer"
                                      >
                                        <ArrowRightLeft className="w-4 h-4 group-hover/transfer:scale-110 transition-transform" />
                                        <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs font-medium text-white bg-slate-800 rounded-lg opacity-0 group-hover/transfer:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-10 border border-slate-700">Chuyển lớp</span>
                                      </button>

                                      <button 
                                        onClick={(e) => initiateRemoveStudent(e, student)}
                                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors relative group/delete"
                                      >
                                        <Trash2 className="w-4 h-4 group-hover/delete:animate-bounce transition-transform" />
                                        <span className="absolute bottom-full right-0 mb-2 px-2 py-1 text-xs font-medium text-white bg-slate-800 rounded-lg opacity-0 group-hover/delete:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-10 border border-slate-700">Xóa khỏi lớp</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-slate-500">
                            <div className="flex flex-col items-center gap-3">
                               <Users className="w-12 h-12 opacity-10" />
                               <p className="text-lg font-medium">Danh sách trống</p>
                               <p className="text-sm opacity-60">Không tìm thấy học viên nào phù hợp với từ khóa.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: Add Student */}
            {activeTab === 'add' && isAdmin && (
              <div className="h-full flex flex-col animate-fade-in">
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  {/* Create New Button Card */}
                  <button 
                     onClick={() => setIsCreateStudentOpen(true)}
                     className="w-full md:w-1/3 bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white p-6 rounded-2xl shadow-xl shadow-emerald-900/20 flex flex-col items-center justify-center gap-3 transition-all hover:-translate-y-1 active:scale-95 text-center group border border-white/10"
                  >
                     <div className="bg-white/20 p-3 rounded-full group-hover:scale-110 transition-transform"><UserPlus className="w-6 h-6" /></div>
                     <div>
                       <div className="font-bold text-lg">Tạo Học viên Mới</div>
                       <div className="text-xs opacity-90 mt-1">Điền thông tin và thêm ngay vào lớp này</div>
                     </div>
                  </button>

                  <div className="flex-1 bg-dark-900/50 border border-dark-700 p-6 rounded-2xl flex flex-col justify-center">
                     <div className="flex items-start gap-4">
                        <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><Search className="w-6 h-6" /></div>
                        <div className="flex-1">
                           <h4 className="font-bold text-white mb-1">Thêm từ danh sách có sẵn</h4>
                           <p className="text-xs text-slate-400 mb-4">Tìm kiếm học viên tự do hoặc chuyển lớp cho học viên từ các lớp khác.</p>
                           
                           <div className="flex gap-3">
                              <div className="relative flex-1">
                                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                 <input 
                                   type="text" 
                                   placeholder="Tên, email..." 
                                   value={addSearchTerm}
                                   onChange={(e) => setAddSearchTerm(e.target.value)}
                                   className="w-full bg-dark-950 border border-dark-600 text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:border-blue-500 outline-none transition-all text-sm"
                                 />
                              </div>
                              <button 
                                onClick={() => setOnlyFreeStudents(!onlyFreeStudents)}
                                className={`px-4 py-2.5 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                                   onlyFreeStudents 
                                     ? 'bg-blue-500 text-white border-blue-500' 
                                     : 'bg-dark-800 border-dark-600 text-slate-400 hover:text-white'
                                }`}
                              >
                                 <Filter className="w-3 h-3" />
                                 Chỉ HV Tự do
                              </button>
                              
                              <button 
                                onClick={() => setIsCreateStudentOpen(true)}
                                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20 whitespace-nowrap"
                              >
                                 <Plus className="w-3 h-3" />
                                 + Add Student
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Available Students Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar border border-dark-700 rounded-2xl bg-dark-900/20 p-1">
                   {availableStudents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
                         {availableStudents.map(student => {
                            const isAssigned = student.classId && student.classId !== '' && student.classId !== 'Chưa phân lớp';
                            const isAdding = addingStudentId === student.id;

                            return (
                                <div key={student.id} className="bg-dark-800 p-4 rounded-xl border border-dark-700 flex items-center justify-between group hover:border-emerald-500/50 hover:bg-dark-800/80 transition-all shadow-sm">
                                   <div className="flex items-center gap-4 overflow-hidden">
                                      <img src={student.avatar} alt={student.name} className="w-12 h-12 rounded-full border-2 border-dark-600 object-cover shrink-0" />
                                      <div className="min-w-0">
                                         <p className="font-bold text-slate-200 text-sm truncate">{student.name}</p>
                                         <div className="flex items-center gap-2 mt-0.5">
                                           <span className={`text-[10px] px-1.5 py-0.5 rounded border truncate max-w-[120px] ${
                                              isAssigned 
                                                ? 'bg-amber-900/30 text-amber-400 border-amber-500/20' 
                                                : 'bg-emerald-900/30 text-emerald-400 border-emerald-500/20'
                                           }`}>
                                              {isAssigned ? student.classId : 'Tự do'}
                                           </span>
                                         </div>
                                      </div>
                                   </div>
                                   
                                   <div className="flex items-center gap-2 shrink-0">
                                      <button
                                         onClick={() => setSelectedStudent(student)}
                                         className="p-2 bg-dark-700 hover:bg-dark-600 text-slate-400 rounded-lg transition-colors"
                                         title="Xem thông tin"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </button>
                                      <button 
                                         onClick={(e) => handleAddStudent(e, student)}
                                         disabled={isAdding}
                                         className={`px-4 py-2 text-white text-xs font-bold rounded-lg shadow-lg transition-all active:scale-95 flex items-center gap-1.5 min-w-[90px] justify-center ${
                                            isAdding 
                                              ? 'bg-emerald-500 cursor-default opacity-100'
                                              : isAssigned 
                                                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' 
                                                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                                         }`}
                                      >
                                         {isAdding ? (
                                            <>
                                               <CheckCircle2 className="w-3.5 h-3.5" /> Đã xong
                                            </>
                                         ) : (
                                            <>
                                               {isAssigned ? <ArrowRightLeft className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />} 
                                               {isAssigned ? 'Chuyển' : 'Thêm'}
                                            </>
                                         )}
                                      </button>
                                   </div>
                                </div>
                            );
                         })}
                      </div>
                   ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8">
                         <Search className="w-12 h-12 mb-3 opacity-20" />
                         <p className="font-medium">Không tìm thấy học viên nào.</p>
                         <p className="text-xs opacity-60 mt-1">Thử thay đổi bộ lọc tìm kiếm.</p>
                      </div>
                   )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Student Removal */}
      {studentToRemove && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
           <div className="bg-dark-800 rounded-2xl border border-dark-600 shadow-2xl p-6 max-w-sm w-full animate-slide-up">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-rose-500/10 mb-4 mx-auto">
                 <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Xác nhận rời lớp</h3>
              <p className="text-slate-400 text-center text-sm mb-6">
                 Bạn có chắc muốn xóa <b>{studentToRemove.name}</b> khỏi lớp <b>{classData.name}</b> không?
                 <br/><span className="text-xs text-slate-500 mt-2 block">Học viên sẽ trở về trạng thái Tự do (Chưa phân lớp).</span>
              </p>
              <div className="flex gap-3">
                 <button 
                    onClick={() => setStudentToRemove(null)}
                    className="flex-1 py-2.5 rounded-xl border border-dark-600 text-slate-300 hover:bg-dark-700 transition-colors font-medium"
                 >
                    Hủy bỏ
                 </button>
                 <button 
                    onClick={confirmRemoveStudent}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all font-bold"
                 >
                    Xóa khỏi lớp
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Confirmation Modal for Adding Student from Another Class (Stealing) */}
      {conflictingStudent && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
           <div className="bg-dark-800 rounded-2xl border border-dark-600 shadow-2xl p-6 max-w-sm w-full animate-slide-up">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/10 mb-4 mx-auto">
                 <ArrowRightLeft className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Xác nhận chuyển lớp</h3>
              <p className="text-slate-400 text-center text-sm mb-6">
                 Học viên <b>{conflictingStudent.name}</b> đang thuộc lớp <b>{conflictingStudent.currentClass}</b>.
                 <br/><span className="text-amber-400/80 mt-2 block font-medium">Bạn có chắc chắn muốn chuyển sang lớp này?</span>
              </p>
              <div className="flex gap-3">
                 <button 
                    onClick={() => setConflictingStudent(null)}
                    className="flex-1 py-2.5 rounded-xl border border-dark-600 text-slate-300 hover:bg-dark-700 transition-colors font-medium"
                 >
                    Hủy bỏ
                 </button>
                 <button 
                    onClick={confirmConflictAdd}
                    className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20 transition-all font-bold"
                 >
                    Xác nhận chuyển
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Confirmation Modal for Class Deletion */}
      {isDeleteClassConfirmOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
           <div className="bg-dark-800 rounded-2xl border border-dark-600 shadow-2xl p-6 max-w-sm w-full animate-slide-up">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10 mb-6 mx-auto border border-rose-500/20">
                 <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Xóa Lớp học?</h3>
              <p className="text-slate-400 text-center text-sm mb-6 leading-relaxed">
                 Bạn có chắc muốn xóa lớp <b>{classData.name}</b>? <br/>
                 <span className="text-rose-400 font-medium">Hành động này không thể hoàn tác.</span>
              </p>
              <div className="flex gap-3">
                 <button 
                    onClick={() => setIsDeleteClassConfirmOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-dark-600 text-slate-300 hover:bg-dark-700 transition-colors font-medium"
                 >
                    Hủy bỏ
                 </button>
                 <button 
                    onClick={confirmDeleteClass}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all font-bold"
                 >
                    Xóa lớp
                 </button>
              </div>
           </div>
        </div>
      )}
      
      {/* Transfer Student Modal */}
      {transferStudent && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
           <div className="bg-dark-800 rounded-2xl border border-dark-600 shadow-2xl p-6 max-w-md w-full animate-slide-up relative">
              <button 
                onClick={() => setTransferStudent(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/10 mb-4 mx-auto border border-blue-500/20">
                 <ArrowRightLeft className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-1">Chuyển lớp học viên</h3>
              <p className="text-slate-400 text-center text-sm mb-6">
                 Chuyển <b>{transferStudent.name}</b> từ lớp <b>{classData.name}</b> sang lớp khác.
              </p>
              
              <div className="mb-6">
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Chọn lớp đích</label>
                 <select
                   value={targetClass}
                   onChange={(e) => setTargetClass(e.target.value)}
                   className="w-full bg-dark-950 border border-dark-600 text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                 >
                   <option value="">-- Chọn lớp --</option>
                   {targetClasses.map(cls => (
                     <option key={cls.id} value={cls.name}>{cls.name}</option>
                   ))}
                   <option value="Chưa phân lớp">Chưa phân lớp (Rời lớp)</option>
                 </select>
              </div>

              <div className="flex gap-3">
                 <button 
                    onClick={() => setTransferStudent(null)}
                    className="flex-1 py-3 rounded-xl border border-dark-600 text-slate-300 hover:bg-dark-700 transition-colors font-medium"
                 >
                    Hủy bỏ
                 </button>
                 <button 
                    onClick={confirmTransfer}
                    disabled={!targetClass}
                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    Xác nhận
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Nested Student Detail Modal */}
      {selectedStudent && (
        <div className="relative z-[70]">
           <StudentDetail 
             student={selectedStudent} 
             allStudents={allStudents} 
             onClose={() => setSelectedStudent(null)} 
           />
        </div>
      )}

      {/* Create New Student Modal Inside Class */}
      {isCreateStudentOpen && (
         <AddStudentModal 
           onClose={() => setIsCreateStudentOpen(false)}
           onSave={handleCreateNewStudent}
           // IMPORTANT: Pass Class Name as ID because App.tsx mock data uses names for linking
           initialClassId={classData.name}
           lockedClass={true}
         />
      )}
    </>
  );
};

export default ClassDetailModal;
