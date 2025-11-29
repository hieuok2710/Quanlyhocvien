import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar, Users, ChevronRight, Clock, MoreVertical, Plus, Trash2, AlertTriangle, X, ChevronsLeft, ChevronLeft, ChevronsRight, BarChart3, PieChart } from 'lucide-react';
import { ClassRoom, Student } from '../types';
import AddClassModal from './AddClassModal';
import ClassDetailModal from './ClassDetailModal';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface ClassManagerProps {
  classes: ClassRoom[];
  students: Student[];
  onAddClass: (cls: ClassRoom) => void;
  onAddStudent: (student: Student) => void;
  onUpdateStudentClass: (studentId: string, newClassId: string) => void;
  onDeleteClass: (classId: string) => void;
  userRole: string;
  isMobile?: boolean; // New prop
}

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";
const ITEMS_PER_PAGE = 12; // Display 12 items per page (3x4 or 4x3 grid)

const ClassManager: React.FC<ClassManagerProps> = ({ classes, students, onAddClass, onAddStudent, onUpdateStudentClass, onDeleteClass, userRole, isMobile = false }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassRoom | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for Dropdown Menu
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  
  // State for Delete Confirmation
  const [classToDelete, setClassToDelete] = useState<ClassRoom | null>(null);
  
  const isAdmin = userRole.toLowerCase().includes('admin') || userRole.toLowerCase().includes('quản trị');

  // Reset to first page if classes array changes drastically
  useEffect(() => {
    setCurrentPage(1);
  }, [classes.length]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Recalculate student count based on actual student data for accuracy
  const getRealStudentCount = (classId: string, className: string) => {
    return students.filter(s => s.classId === classId || s.classId === className).length;
  };

  const handleDeleteClick = (e: React.MouseEvent, cls: ClassRoom) => {
    e.stopPropagation();
    setActiveMenuId(null);
    setClassToDelete(cls);
  };

  const confirmDelete = () => {
    if (classToDelete) {
      onDeleteClass(classToDelete.id);
      setClassToDelete(null);
    }
  };

  // --- ANALYTICS DATA ---
  const subjectDistribution = useMemo(() => {
    const stats: Record<string, number> = {};
    classes.forEach(c => {
      stats[c.subject] = (stats[c.subject] || 0) + 1;
    });
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [classes]);

  const capacityStats = useMemo(() => {
    const totalCapacity = classes.reduce((acc, c) => acc + c.maxCapacity, 0);
    const totalAssigned = students.filter(s => 
      classes.some(c => c.id === s.classId || c.name === s.classId)
    ).length;
    const percentage = totalCapacity > 0 ? Math.round((totalAssigned / totalCapacity) * 100) : 0;
    return { totalCapacity, totalAssigned, percentage };
  }, [classes, students]);
  // ----------------------

  // Pagination Logic
  const totalPages = Math.ceil(classes.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentClasses = classes.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <>
      <div className={`p-4 ${isMobile ? 'pb-24' : 'md:p-8 md:pb-20'} h-full overflow-y-auto animate-fade-in flex flex-col custom-scrollbar`}>
        <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-col md:flex-row justify-between items-start md:items-center'} mb-8 shrink-0`}>
          <div>
            <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-slate-900 dark:text-white mb-1`}>Quản lý Lớp học</h2>
            <p className="text-slate-500 dark:text-slate-400">Danh sách các lớp đang hoạt động</p>
          </div>
          
          {isAdmin && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="w-full md:w-auto bg-primary hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/25 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tạo lớp mới
            </button>
          )}
        </div>

        {/* --- SUMMARY VISUALIZATION SECTION --- */}
        {classes.length > 0 && (
          <div className={`grid grid-cols-1 ${isMobile ? '' : 'lg:grid-cols-3'} gap-6 mb-8 shrink-0`}>
            {/* Chart: Subject Distribution */}
            <div className={`${isMobile ? '' : 'lg:col-span-2'} bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wide">Phân bổ theo Môn học</h3>
              </div>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectDistribution} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.2} />
                     <XAxis type="number" hide />
                     <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={100} 
                        tick={{fill: '#94a3b8', fontSize: 11}} 
                        axisLine={false} 
                        tickLine={false} 
                     />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                     />
                     <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {subjectDistribution.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stats: Capacity Overview */}
            <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
               <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                  <PieChart className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wide">Công suất sử dụng</h3>
              </div>
              
              <div className="text-center mb-4">
                <div className="text-4xl font-black text-slate-900 dark:text-white">
                  {capacityStats.percentage}<span className="text-lg text-slate-400 font-medium">%</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Đã lấp đầy {capacityStats.totalAssigned} / {capacityStats.totalCapacity} chỗ
                </p>
              </div>

              <div className="w-full bg-slate-100 dark:bg-dark-900 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    capacityStats.percentage > 90 ? 'bg-rose-500' : 
                    capacityStats.percentage > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${capacityStats.percentage}%` }}
                />
              </div>
            </div>
          </div>
        )}
        {/* -------------------------------------- */}

        {classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-300 dark:border-dark-700 rounded-2xl bg-slate-50 dark:bg-dark-800/50">
             <Calendar className="w-16 h-16 mb-4 opacity-20" />
             <p className="text-lg font-medium">Chưa có lớp học nào</p>
             {isAdmin && <p className="text-sm opacity-60">Hãy tạo lớp học mới để bắt đầu quản lý.</p>}
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2 xl:grid-cols-3'} gap-6 mb-8`}>
              {currentClasses.map((cls) => {
                const realCount = getRealStudentCount(cls.id, cls.name);
                return (
                  <div key={cls.id} onClick={() => setSelectedClass(cls)} className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-2xl overflow-hidden group hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 flex flex-col relative cursor-pointer">
                    <div className="h-32 relative overflow-hidden">
                      {/* Interactive Dark Overlay */}
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors duration-300 z-10" />
                      
                      {/* Gradient for text visibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent z-10" />
                      
                      <img 
                        src={cls.image || PLACEHOLDER_IMAGE} 
                        alt={cls.name} 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                        }}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                      />
                      
                      {/* More Options Button */}
                      {isAdmin && (
                        <div className="absolute top-3 right-3 z-30" onClick={(e) => e.stopPropagation()}>
                          <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === cls.id ? null : cls.id);
                              }}
                              className={`p-1.5 backdrop-blur-md text-white rounded-lg transition-colors ${
                                activeMenuId === cls.id ? 'bg-primary' : 'bg-black/30 hover:bg-black/50'
                              }`}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeMenuId === cls.id && (
                              <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-600 rounded-xl shadow-2xl overflow-hidden animate-fade-in z-40">
                                <button 
                                  onClick={(e) => handleDeleteClick(e, cls)}
                                  className="w-full text-left px-4 py-3 text-sm text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 flex items-center gap-2 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" /> Xóa lớp
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="absolute bottom-3 left-4 z-20">
                        <span className="bg-primary/90 text-white text-xs font-bold px-2 py-1 rounded shadow-sm backdrop-blur-sm">
                          {cls.subject}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors line-clamp-1" title={cls.name}>{cls.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 truncate">GV: {cls.teacher}</p>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                          <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          <span className="truncate">{cls.schedule}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                          <Users className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          <div className="flex-1 bg-slate-200 dark:bg-dark-700 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-500 h-full rounded-full" 
                              style={{ width: `${Math.min((realCount / cls.maxCapacity) * 100, 100)}%` }} 
                            />
                          </div>
                          <span className="text-xs font-medium">{realCount}/{cls.maxCapacity}</span>
                        </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-dark-700 flex justify-between items-center">
                        <div className="flex -space-x-2">
                          {[1,2,3].map((i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-slate-200 dark:bg-dark-600 border border-white dark:border-dark-800" />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Chi tiết <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
               <div className="mt-auto pt-6 border-t border-slate-200 dark:border-dark-700 flex justify-center items-center gap-2">
                 <button
                   onClick={() => handlePageChange(1)}
                   disabled={currentPage === 1}
                   className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-700 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                 >
                   <ChevronsLeft className="w-5 h-5" />
                 </button>
                 <button
                   onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                   disabled={currentPage === 1}
                   className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-700 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                 >
                   <ChevronLeft className="w-5 h-5" />
                 </button>
                 
                 <div className="flex items-center gap-1 mx-2">
                   {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5) {
                         // Center the current page window
                         if (currentPage > 3) {
                           pageNum = currentPage - 2 + i;
                         }
                         // Adjust if near the end
                         if (pageNum > totalPages) {
                           pageNum = totalPages - 4 + i;
                         }
                      }
                      
                      // Safety check
                      if (pageNum <= 0 || pageNum > totalPages) return null;

                      return (
                         <button
                           key={pageNum}
                           onClick={() => handlePageChange(pageNum)}
                           className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                             currentPage === pageNum 
                               ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                               : 'bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-dark-700'
                           }`}
                         >
                           {pageNum}
                         </button>
                      );
                   })}
                 </div>

                 <button
                   onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                   disabled={currentPage === totalPages}
                   className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-700 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                 >
                   <ChevronRight className="w-5 h-5" />
                 </button>
                 <button
                   onClick={() => handlePageChange(totalPages)}
                   disabled={currentPage === totalPages}
                   className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-700 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                 >
                   <ChevronsRight className="w-5 h-5" />
                 </button>
               </div>
            )}
          </>
        )}
      </div>

      {isAddModalOpen && (
        <AddClassModal onClose={() => setIsAddModalOpen(false)} onSave={onAddClass} />
      )}

      {selectedClass && (
        <ClassDetailModal 
          classData={selectedClass} 
          allStudents={students}
          classes={classes} // Pass full list of classes for transfer functionality
          onClose={() => setSelectedClass(null)}
          onUpdateStudentClass={onUpdateStudentClass}
          onDeleteClass={onDeleteClass}
          onAddStudent={onAddStudent}
          userRole={userRole}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {classToDelete && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
           <div className="bg-dark-800 rounded-2xl border border-dark-600 shadow-2xl p-6 max-w-sm w-full animate-slide-up">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10 mb-6 mx-auto border border-rose-500/20">
                 <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Xóa Lớp học?</h3>
              <p className="text-slate-400 text-center text-sm mb-6 leading-relaxed">
                 Bạn có chắc muốn xóa lớp <b>{classToDelete.name}</b>? <br/>
                 <span className="text-rose-400 font-medium">Hành động này sẽ hủy lớp của tất cả học viên trong lớp.</span>
              </p>
              <div className="flex gap-3">
                 <button 
                    onClick={() => setClassToDelete(null)}
                    className="flex-1 py-2.5 rounded-xl border border-dark-600 text-slate-300 hover:bg-dark-700 transition-colors font-medium"
                 >
                    Hủy bỏ
                 </button>
                 <button 
                    onClick={confirmDelete}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all font-bold"
                 >
                    Xóa lớp
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default ClassManager;