import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Download, Trash2, Edit2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, History, Clock, ArrowUpLeft, LayoutGrid, List, ArrowUpDown, Mail, AlertTriangle, CircleDollarSign, Filter } from 'lucide-react';
import { Student, StudentStatus } from '../types';
import StudentDetail from './StudentDetail';
import AddStudentModal from './AddStudentModal';

interface StudentListProps {
  students: Student[];
  itemsPerPage: number;
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  userRole: string;
  isMobile?: boolean; // New prop
}

type SortKey = 'name' | 'gpa' | 'attendance' | 'joinDate' | 'tuitionPaid';
type SortDirection = 'asc' | 'desc';

const StudentList: React.FC<StudentListProps> = ({ students, itemsPerPage, onAddStudent, onUpdateStudent, onDeleteStudent, userRole, isMobile = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | undefined>(undefined);
  
  // View Mode State (Grid vs List) - Default to Grid on mobile
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'joinDate', direction: 'desc' });
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  
  // Search History State
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Delete Confirmation State
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Load history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('student_search_history');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse search history");
      }
    }
    
    // Auto-detect mobile or if isMobile prop is passed, force grid
    if (window.innerWidth < 768 || isMobile) {
      setViewMode('grid');
    }
  }, [isMobile]);

  const saveSearchTerm = (term: string) => {
    if (!term.trim()) return;
    const newHistory = [term, ...searchHistory.filter(t => t !== term)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('student_search_history', JSON.stringify(newHistory));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveSearchTerm(searchTerm);
      setShowHistory(false);
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('student_search_history');
  };

  // Check if user is admin
  const isAdmin = userRole.toLowerCase().includes('admin') || userRole.toLowerCase().includes('quản trị');

  // Filter & Sort Logic
  const processedStudents = useMemo(() => {
    // 1. Filter
    let result = students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Sort
    result.sort((a, b) => {
      let aValue: any = a[sortConfig.key];
      let bValue: any = b[sortConfig.key];

      // Handle special cases
      if (sortConfig.key === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      }
      
      // Handle boolean sorting (tuitionPaid)
      if (sortConfig.key === 'tuitionPaid') {
        aValue = a.tuitionPaid ? 1 : 0;
        bValue = b.tuitionPaid ? 1 : 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [students, searchTerm, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(processedStudents.length / itemsPerPage);
  
  // Reset to page 1 when search or itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage, sortConfig]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedStudents.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusColor = (status: StudentStatus) => {
    switch (status) {
      case StudentStatus.ACTIVE: return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case StudentStatus.INACTIVE: return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case StudentStatus.GRADUATED: return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case StudentStatus.DROPPED: return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-500 dark:text-slate-400';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Chưa cập nhật';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Ngày không hợp lệ';
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setIsSortMenuOpen(false);
  };

  const handleOpenAdd = () => {
    setStudentToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, student: Student) => {
    e.stopPropagation();
    setStudentToEdit(student);
    setIsModalOpen(true);
  };

  const handleSaveModal = (student: Student) => {
    if (studentToEdit) {
      onUpdateStudent(student);
    } else {
      onAddStudent(student);
    }
  };

  const toggleTuition = (e: React.MouseEvent, student: Student) => {
    e.stopPropagation();
    if (!isAdmin) return;
    const updatedStudent = { ...student, tuitionPaid: !student.tuitionPaid };
    onUpdateStudent(updatedStudent);
  };

  const initiateDelete = (e: React.MouseEvent, student: Student) => {
    e.stopPropagation(); 
    setStudentToDelete(student);
  };

  const confirmDelete = () => {
    if (studentToDelete) {
      onDeleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  const handleExport = () => {
    if (processedStudents.length === 0) {
      alert("Không có dữ liệu học viên để xuất.");
      return;
    }

    const headers = [
      "Mã Học viên",
      "Họ và Tên",
      "Email",
      "Số điện thoại",
      "Ngày sinh",
      "Lớp học",
      "GPA",
      "Chuyên cần (%)",
      "Trạng thái",
      "Học phí"
    ];

    const rows = processedStudents.map(student => [
      `"${student.id}"`,
      `"${student.name}"`,
      `"${student.email}"`,
      `"${student.phone}"`,
      `"${formatDate(student.dob)}"`,
      `"${student.classId}"`,
      `"${student.gpa}"`,
      `"${student.attendance}%"`,
      `"${student.status}"`,
      `"${student.tuitionPaid ? 'Đã đóng' : 'Chưa đóng'}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Danh_sach_hoc_vien_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className={`p-4 ${isMobile ? 'pb-24 pt-4' : 'md:p-8 md:pb-8'} h-full flex flex-col animate-fade-in`}>
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-col md:flex-row justify-between items-start md:items-center gap-4'} mb-6`}>
          <div>
            <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-slate-900 dark:text-white mb-1`}>Danh sách Học viên</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý thông tin và trạng thái học tập</p>
          </div>
          <div className={`flex gap-2 ${isMobile ? 'w-full' : 'w-full md:w-auto'}`}>
             <button 
               onClick={handleExport}
               className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 dark:bg-dark-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-300 dark:border-dark-600 hover:bg-slate-300 dark:hover:bg-dark-600 transition-all text-sm"
             >
               <Download className="w-4 h-4" />
               <span className="font-medium">Xuất Excel</span>
             </button>
             
             {isAdmin && (
               <button 
                 onClick={handleOpenAdd}
                 className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 text-sm"
               >
                 <Plus className="w-4 h-4" />
                 <span className="font-medium">Thêm mới</span>
               </button>
             )}
          </div>
        </div>

        {/* Filters & Controls Bar - UPDATED for Mobile Stacking */}
        <div className={`bg-white dark:bg-dark-800 p-3 ${isMobile ? 'p-3 flex-col' : 'md:p-4 md:flex-row'} rounded-2xl border border-slate-200 dark:border-dark-700 mb-6 flex gap-3 items-stretch shadow-lg relative z-30`}>
          <div className="relative w-full md:flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowHistory(true)}
              onBlur={() => setTimeout(() => setShowHistory(false), 200)}
              className="w-full bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-600 text-slate-800 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-slate-400 text-sm md:text-base"
            />
            
            {/* Search History Dropdown */}
            {showHistory && searchHistory.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-dark-600 shadow-2xl overflow-hidden animate-fade-in z-50 ring-4 ring-slate-200/50 dark:ring-dark-900/50">
                <div className="px-4 py-3 bg-slate-50/80 dark:bg-dark-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-dark-700 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <History className="w-3.5 h-3.5" /> Gần đây
                  </span>
                  <button 
                    onMouseDown={(e) => { e.preventDefault(); clearHistory(); }}
                    className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-medium group/clear"
                  >
                    <Trash2 className="w-3.5 h-3.5 group-hover/clear:animate-bounce" />
                    Xóa tất cả
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  {searchHistory.map((term, idx) => (
                    <button
                      key={idx}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent blur
                        setSearchTerm(term);
                        setShowHistory(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-700/50 flex items-center gap-3 transition-all group border-b border-slate-100 dark:border-dark-700/50 last:border-0"
                    >
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-dark-700 text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="font-medium flex-1 truncate">{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex w-full md:w-auto gap-2 items-center">
            {/* Sort Dropdown */}
            <div className="relative flex-1 md:flex-none">
              <button 
                onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                className="w-full md:w-auto flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-600 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors min-w-[140px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  <span className="text-sm">
                    {sortConfig.key === 'name' ? 'Tên' : sortConfig.key === 'gpa' ? 'GPA' : sortConfig.key === 'attendance' ? 'Chuyên cần' : sortConfig.key === 'tuitionPaid' ? 'Học phí' : 'Ngày tham gia'}
                  </span>
                </div>
                {sortConfig.direction === 'asc' ? <ArrowUpLeft className="w-3 h-3 rotate-45" /> : <ArrowUpLeft className="w-3 h-3 -rotate-135" />}
              </button>

              {isSortMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSortMenuOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-full md:w-48 bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-600 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                    <div className="p-2 space-y-1">
                      {[
                        { key: 'name', label: 'Tên (A-Z)' },
                        { key: 'gpa', label: 'GPA (Điểm)' },
                        { key: 'attendance', label: 'Chuyên cần (%)' },
                        { key: 'tuitionPaid', label: 'Học phí (Đã đóng)' },
                        { key: 'joinDate', label: 'Ngày tham gia' }
                      ].map(opt => (
                        <button
                          key={opt.key}
                          onClick={() => handleSort(opt.key as SortKey)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                            sortConfig.key === opt.key 
                              ? 'bg-primary/10 text-primary font-medium' 
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-700'
                          }`}
                        >
                          {opt.label}
                          {sortConfig.key === opt.key && (
                            <span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded">
                              {sortConfig.direction === 'asc' ? 'Tăng' : 'Giảm'}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* View Toggle - Hidden on mobile, force grid */}
            {!isMobile && (
              <div className="hidden md:flex bg-slate-100 dark:bg-dark-900 p-1 rounded-xl border border-slate-200 dark:border-dark-600">
                 <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-dark-800 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  title="Dạng lưới"
                 >
                   <LayoutGrid className="w-4 h-4" />
                 </button>
                 <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-dark-800 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  title="Dạng danh sách"
                 >
                   <List className="w-4 h-4" />
                 </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        {currentItems.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-dark-700 p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-100 dark:bg-dark-700 rounded-full flex items-center justify-center mb-4">
                 <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Không tìm thấy kết quả</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc của bạn.
              </p>
           </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 pb-4">
             {/* Force Grid on mobile if viewMode is 'list', or just check viewMode */}
             {(viewMode === 'grid' || isMobile) ? (
                // GRID VIEW
                <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'} gap-4 md:gap-6`}>
                  {currentItems.map((student) => (
                    <div 
                      key={student.id} 
                      onClick={() => setSelectedStudent(student)}
                      className="group bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col"
                    >
                      {/* Top Accent */}
                      <div className={`absolute top-0 left-0 w-full h-1 ${student.gpa >= 8 ? 'bg-emerald-500' : student.gpa >= 5 ? 'bg-primary' : 'bg-rose-500'}`}></div>
                      
                      {/* Tuition Status Indicator (Top Right) */}
                      <div className="absolute top-3 right-3 z-10">
                        <button 
                          onClick={(e) => toggleTuition(e, student)}
                          className={`p-1.5 rounded-full transition-all duration-300 ${
                            student.tuitionPaid 
                              ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 animate-pulse'
                          }`}
                          title={student.tuitionPaid ? "Đã đóng học phí" : "Chưa đóng học phí"}
                        >
                          <CircleDollarSign className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex justify-between items-start mb-6">
                         <div className="relative">
                            <img src={student.avatar} alt={student.name} className="w-16 h-16 rounded-full border-2 border-slate-100 dark:border-dark-600 object-cover group-hover:scale-105 transition-transform" />
                            <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-dark-800 flex items-center justify-center text-[10px] font-bold text-white ${student.gpa >= 5 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                               {student.gpa}
                            </span>
                         </div>
                         <div className="flex flex-col items-end pt-5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(student.status)}`}>
                              {student.status}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-2">{student.id}</span>
                         </div>
                      </div>

                      <div className="mb-4 flex-1">
                         <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1" title={student.name}>{student.name}</h3>
                         <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1 mb-3">
                            <Mail className="w-3.5 h-3.5" /> <span className="truncate">{student.email}</span>
                         </div>
                         <div className="bg-slate-50 dark:bg-dark-900/50 rounded-xl p-3 border border-slate-100 dark:border-dark-700/50">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                               <span className="text-slate-500">Lớp học</span>
                               <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]" title={student.classId}>{student.classId || 'Chưa phân lớp'}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                               <span className="text-slate-500">Chuyên cần</span>
                               <span className={`font-bold ${student.attendance >= 90 ? 'text-emerald-500' : 'text-amber-500'}`}>{student.attendance}%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-dark-700 h-1.5 rounded-full mt-2 overflow-hidden">
                               <div className={`h-full rounded-full ${student.attendance >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${student.attendance}%` }} />
                            </div>
                         </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-dark-700 flex justify-between items-center mt-auto" onClick={(e) => e.stopPropagation()}>
                         <div className="flex gap-2">
                            {isAdmin ? (
                               <>
                                <button 
                                  onClick={(e) => handleOpenEdit(e, student)}
                                  className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors group/btn relative z-10" 
                                  title="Chỉnh sửa"
                                >
                                   <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => initiateDelete(e, student)}
                                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors group/btn relative z-10" 
                                  title="Xóa"
                                >
                                   <Trash2 className="w-4 h-4" />
                                </button>
                               </>
                            ) : (
                               <span className="text-xs text-slate-400 italic">Chỉ xem</span>
                            )}
                         </div>
                         <button 
                            onClick={() => setSelectedStudent(student)}
                            className="text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all"
                         >
                            Chi tiết <ChevronRight className="w-3 h-3" />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
             ) : (
                // LIST VIEW (Classic Table) - Only on Desktop
                <div className="bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-dark-700 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-dark-900/50 border-b border-slate-200 dark:border-dark-700">
                          <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Học viên</th>
                          <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lớp học</th>
                          <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Học phí</th>
                          <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trạng thái</th>
                          <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">GPA</th>
                          <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Chuyên cần</th>
                          <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                        {currentItems.map((student) => (
                          <tr 
                            key={student.id} 
                            onClick={() => setSelectedStudent(student)}
                            className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-700/80 transition-all duration-300"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full border border-slate-200 dark:border-dark-600 object-cover group-hover:scale-105 transition-transform" />
                                <div>
                                  <p className="font-medium text-slate-800 dark:text-white group-hover:text-primary transition-colors">{student.name}</p>
                                  <p className="text-xs text-slate-500">{student.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-slate-600 dark:text-slate-300 max-w-[150px] truncate">{student.classId || 'Chưa phân lớp'}</td>
                            <td className="p-4">
                              <button 
                                onClick={(e) => toggleTuition(e, student)}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                                  student.tuitionPaid 
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                                }`}
                              >
                                <CircleDollarSign className="w-3.5 h-3.5" />
                                {student.tuitionPaid ? 'Hoàn thành' : 'Chưa đóng'}
                              </button>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
                                {student.status}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`font-bold ${student.gpa >= 8 ? 'text-emerald-500 dark:text-emerald-400' : student.gpa >= 5 ? 'text-slate-700 dark:text-slate-200' : 'text-rose-500 dark:text-rose-400'}`}>
                                {student.gpa}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-16 h-1.5 bg-slate-200 dark:bg-dark-900 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${student.attendance >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                                    style={{ width: `${student.attendance}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400 w-8">{student.attendance}%</span>
                              </div>
                            </td>
                            <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setSelectedStudent(student)} className="p-2 text-slate-400 hover:text-primary rounded-lg transition-colors group/btn relative z-10" title="Xem chi tiết">
                                  <Eye className="w-4 h-4" />
                                </button>
                                {isAdmin && (
                                  <>
                                    <button 
                                      onClick={(e) => handleOpenEdit(e, student)}
                                      className="p-2 text-slate-400 hover:text-amber-500 rounded-lg transition-colors group/btn relative z-10" 
                                      title="Chỉnh sửa"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={(e) => initiateDelete(e, student)}
                                      className="p-2 text-slate-400 hover:text-rose-500 rounded-lg transition-colors group/btn relative z-10" 
                                      title="Xóa"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
             )}
          </div>
        )}
          
        {/* Pagination Footer */}
        <div className="py-4 border-t border-slate-200 dark:border-dark-700 flex flex-col sm:flex-row justify-between items-center mt-auto gap-4">
          <span className="text-sm text-slate-500 text-center sm:text-left">
            {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, processedStudents.length)} / {processedStudents.length}
          </span>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(1)} 
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-dark-700 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-dark-700 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-1 mx-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {currentPage}
              </span>
              <span className="text-sm text-slate-500">/ {totalPages}</span>
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-dark-700 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setCurrentPage(totalPages)} 
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-dark-700 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Render Student Detail Modal if selected */}
      {selectedStudent && (
        <StudentDetail 
          student={selectedStudent} 
          allStudents={students}
          onClose={() => setSelectedStudent(null)} 
        />
      )}

      {/* Render Add/Edit Student Modal */}
      {isModalOpen && (
        <AddStudentModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSaveModal} 
          initialData={studentToEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
           <div className="bg-dark-800 rounded-2xl border border-dark-600 shadow-2xl p-6 max-w-sm w-full animate-slide-up">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10 mb-6 mx-auto border border-rose-500/20">
                 <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Xóa Học viên?</h3>
              <p className="text-slate-400 text-center text-sm mb-6 leading-relaxed">
                 Bạn có chắc muốn xóa học viên <b>{studentToDelete.name}</b>? <br/>
                 <span className="text-rose-400 font-medium">Hành động này không thể hoàn tác.</span>
              </p>
              <div className="flex gap-3">
                 <button 
                    onClick={() => setStudentToDelete(null)}
                    className="flex-1 py-3 rounded-xl border border-dark-600 text-slate-300 hover:bg-dark-700 transition-colors font-medium"
                 >
                    Hủy bỏ
                 </button>
                 <button 
                    onClick={confirmDelete}
                    className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all font-bold"
                 >
                    Xóa
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default StudentList;