
import React, { useState, useEffect, useMemo } from 'react';
import { Check, X, Clock, Save, Search, Filter, AlertCircle, Calculator, Download, CalendarDays, CheckSquare, CircleDollarSign, ChevronLeft, ChevronRight, Calendar, GripVertical } from 'lucide-react';
import { Student, ClassRoom } from '../types';

interface AttendanceManagerProps {
  students: Student[];
  classes: ClassRoom[];
  isMobile?: boolean; // New prop
}

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'NONE';

// Data structure: { studentId: { dateString: status } }
interface AttendanceHistory {
  [studentId: string]: {
    [date: string]: AttendanceStatus;
  };
}

// Data structure: { studentId: { monthString: boolean } }
interface TuitionHistory {
  [studentId: string]: {
    [month: string]: boolean; // true = Paid, false = Unpaid
  };
}

const AttendanceManager: React.FC<AttendanceManagerProps> = ({ students, classes, isMobile = false }) => {
  
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [highlightedStudentId, setHighlightedStudentId] = useState<string | null>(null);

  // VIEW MODE: 'daily' (Mobile preferred) or 'monthly' (Desktop preferred)
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>(isMobile ? 'daily' : 'monthly');

  // Month Selection (For Monthly Grid)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Day Selection (For Daily List View)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Set default selected class when classes data loads
  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].name);
    }
  }, [classes, selectedClass]);

  // Sync selectedMonth when selectedDate changes (for Daily view compatibility)
  useEffect(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${year}-${month}`);
  }, [selectedDate]);

  // Calculate days in the selected month
  const daysInMonth = useMemo(() => {
    if (!selectedMonth) return [];
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 0); // Last day of the month
    const daysCount = date.getDate();
    
    const days = [];
    for (let i = 1; i <= daysCount; i++) {
      const d = new Date(year, month - 1, i);
      const dateString = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      
      // Get day of week (0 = Sunday, 1 = Monday...)
      const dayOfWeek = d.getDay();
      // Convert to Vietnamese short format
      const dayLabel = dayOfWeek === 0 ? 'CN' : `T${dayOfWeek + 1}`;
      
      days.push({
        fullDate: dateString,
        day: i,
        label: dayLabel,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6
      });
    }
    return days;
  }, [selectedMonth]);

  // State to store attendance matrix
  const [attendanceData, setAttendanceData] = useState<AttendanceHistory>({});
  
  // State to store tuition status per month
  const [tuitionData, setTuitionData] = useState<TuitionHistory>({});

  // Filter students based on selected Class Name
  const filteredStudents = students.filter(student => 
    student.classId === selectedClass &&
    (student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     student.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Initialize tuition data based on student's current global status (for demo purposes)
  useEffect(() => {
    setTuitionData(prev => {
      const newState = { ...prev };
      filteredStudents.forEach(s => {
        if (!newState[s.id]) newState[s.id] = {};
        // If data for this month doesn't exist, default to the student's global status or false
        if (newState[s.id][selectedMonth] === undefined) {
           newState[s.id][selectedMonth] = s.tuitionPaid; 
        }
      });
      return newState;
    });
  }, [selectedMonth, filteredStudents]);

  // --- ACTIONS ---

  // Set specific status (For Daily View)
  const setStatus = (studentId: string, date: string, status: AttendanceStatus) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [date]: status
      }
    }));
  };

  // Toggle Cycle (For Grid View)
  const toggleStatus = (studentId: string, date: string) => {
    setAttendanceData(prev => {
      const studentRecord = prev[studentId] || {};
      const currentStatus = studentRecord[date] || 'NONE';
      
      let nextStatus: AttendanceStatus = 'PRESENT';
      if (currentStatus === 'PRESENT') nextStatus = 'ABSENT';
      else if (currentStatus === 'ABSENT') nextStatus = 'LATE';
      else if (currentStatus === 'LATE') nextStatus = 'NONE';
      
      return {
        ...prev,
        [studentId]: {
          ...studentRecord,
          [date]: nextStatus
        }
      };
    });
  };

  // Toggle Tuition Status
  const toggleTuition = (studentId: string) => {
    setTuitionData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [selectedMonth]: !prev[studentId]?.[selectedMonth]
      }
    }));
  };

  // Quick Attendance: Mark whole class for a day
  const handleQuickAttendance = (date: string, specificStatus?: AttendanceStatus) => {
    if (filteredStudents.length === 0) return;

    setAttendanceData(prev => {
      const nextState = { ...prev };
      const studentIds = filteredStudents.map(s => s.id);
      
      // If specific status provided, use it. Otherwise toggle logic.
      let targetStatus: AttendanceStatus = 'PRESENT';
      
      if (specificStatus) {
        targetStatus = specificStatus;
      } else {
        const allPresent = studentIds.every(id => prev[id]?.[date] === 'PRESENT');
        const allAbsent = studentIds.every(id => prev[id]?.[date] === 'ABSENT');
        if (allPresent) targetStatus = 'ABSENT';
        else if (allAbsent) targetStatus = 'NONE';
      }

      studentIds.forEach(id => {
        if (!nextState[id]) nextState[id] = {};
        nextState[id][date] = targetStatus;
      });

      return nextState;
    });
  };

  // Helper for Date Navigation
  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };
  
  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT': return <Check className="w-3.5 h-3.5 text-emerald-400" />;
      case 'ABSENT': return <X className="w-3.5 h-3.5 text-rose-400" />;
      case 'LATE': return <Clock className="w-3.5 h-3.5 text-amber-400" />;
      default: return <div className="w-1 h-1 rounded-full bg-dark-700 group-hover:bg-dark-600" />;
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT': return 'bg-emerald-500/10 border-emerald-500/30';
      case 'ABSENT': return 'bg-rose-500/10 border-rose-500/30';
      case 'LATE': return 'bg-amber-500/10 border-amber-500/30';
      default: return 'hover:bg-white/5 border-transparent';
    }
  };

  // Calculate stats for a student across the MONTH
  const getStudentStats = (studentId: string) => {
    const record = attendanceData[studentId] || {};
    let present = 0;
    let totalMarked = 0;
    
    daysInMonth.forEach(({ fullDate }) => {
      const status = record[fullDate];
      if (status && status !== 'NONE') {
        totalMarked++;
        if (status === 'PRESENT') present += 1;
        if (status === 'LATE') present += 0.5;
      }
    });

    const percentage = totalMarked === 0 ? 0 : Math.round((present / totalMarked) * 100);
    return { percentage, totalMarked };
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert(`Đã lưu dữ liệu điểm danh và học phí tháng ${selectedMonth} cho ${filteredStudents.length} học viên.`);
    }, 1000);
  };

  const handleExport = () => {
    if (filteredStudents.length === 0) {
      alert("Không có dữ liệu để xuất.");
      return;
    }
    const headers = ["Họ và tên", "Mã Học viên", "Trạng thái Học phí", ...daysInMonth.map(d => `${d.day}/${selectedMonth.split('-')[1]} (${d.label})`), "Tỉ lệ chuyên cần"];
    const rows = filteredStudents.map(student => {
      const stats = getStudentStats(student.id);
      const isPaid = tuitionData[student.id]?.[selectedMonth];
      const studentRow = [
        `"${student.name}"`, 
        `"${student.id}"`,
        `"${isPaid ? 'Đã đóng' : 'Chưa đóng'}"`
      ];
      daysInMonth.forEach(({ fullDate }) => {
        const status = attendanceData[student.id]?.[fullDate] || 'NONE';
        let statusText = '';
        switch (status) {
          case 'PRESENT': statusText = 'x'; break; 
          case 'ABSENT': statusText = 'v'; break;
          case 'LATE': statusText = 'm'; break;
          default: statusText = '';
        }
        studentRow.push(`"${statusText}"`);
      });
      studentRow.push(`"${stats.percentage}%"`);
      return studentRow.join(",");
    });
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Diem_Danh_${selectedClass.replace(/\s+/g, '_') || 'Lop'}_Thang_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- RENDERERS ---

  // MOBILE DAILY VIEW RENDERER (ULTRA COMPACT)
  const renderMobileDailyView = () => {
    const dateStr = formatDateString(selectedDate);
    const displayDate = selectedDate.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });

    return (
      <div className="flex flex-col h-full">
        {/* Compact Date Navigation */}
        <div className="bg-white dark:bg-dark-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm mb-2 flex items-center justify-between gap-2 shrink-0">
           <button onClick={() => changeDate(-1)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-dark-700 active:bg-slate-200"><ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" /></button>
           <div className="flex-1 flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hôm nay</span>
              <span className="text-sm font-bold text-slate-800 dark:text-white capitalize leading-tight">{displayDate}</span>
           </div>
           <button onClick={() => changeDate(1)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-dark-700 active:bg-slate-200"><ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" /></button>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex gap-2 mb-2 shrink-0">
             <button 
               onClick={() => handleQuickAttendance(dateStr, 'PRESENT')}
               className="flex-1 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-700/30 active:scale-95 transition-transform"
             >
               Tất cả Có mặt
             </button>
             <button 
               onClick={() => setSelectedDate(new Date())}
               className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-dark-600 active:scale-95 transition-transform"
             >
               Về Hôm nay
             </button>
        </div>

        {/* Compact Student List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pb-20">
          {filteredStudents.length > 0 ? (
             filteredStudents.map(student => {
               const status = attendanceData[student.id]?.[dateStr] || 'NONE';
               const isPaid = tuitionData[student.id]?.[selectedMonth];

               return (
                 <div key={student.id} className="bg-white dark:bg-dark-800 px-2 py-2 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm flex items-center justify-between gap-2">
                    {/* Left: Info */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                       <div className="relative">
                          <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full border border-slate-200 dark:border-dark-600 object-cover" />
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleTuition(student.id); }}
                            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white dark:border-dark-800 ${
                              isPaid ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                            }`}
                          >
                            <CircleDollarSign className="w-2.5 h-2.5" />
                          </button>
                       </div>
                       <div className="min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{student.name}</h4>
                          <p className="text-[9px] text-slate-400">{student.id}</p>
                       </div>
                    </div>

                    {/* Right: Segmented Control */}
                    <div className="flex items-center bg-slate-100 dark:bg-dark-900 p-0.5 rounded-lg shrink-0">
                       <button
                          onClick={() => setStatus(student.id, dateStr, 'PRESENT')}
                          className={`w-8 h-7 rounded-md flex items-center justify-center transition-all ${
                             status === 'PRESENT' 
                               ? 'bg-white dark:bg-dark-700 text-emerald-500 shadow-sm' 
                               : 'text-slate-400 hover:text-emerald-500'
                          }`}
                       >
                          <Check className="w-4 h-4" />
                       </button>
                       <div className="w-px h-3 bg-slate-200 dark:bg-dark-700 mx-0.5"></div>
                       <button
                          onClick={() => setStatus(student.id, dateStr, 'ABSENT')}
                          className={`w-8 h-7 rounded-md flex items-center justify-center transition-all ${
                             status === 'ABSENT' 
                               ? 'bg-white dark:bg-dark-700 text-rose-500 shadow-sm' 
                               : 'text-slate-400 hover:text-rose-500'
                          }`}
                       >
                          <X className="w-4 h-4" />
                       </button>
                       <div className="w-px h-3 bg-slate-200 dark:bg-dark-700 mx-0.5"></div>
                       <button
                          onClick={() => setStatus(student.id, dateStr, 'LATE')}
                          className={`w-8 h-7 rounded-md flex items-center justify-center transition-all ${
                             status === 'LATE' 
                               ? 'bg-white dark:bg-dark-700 text-amber-500 shadow-sm' 
                               : 'text-slate-400 hover:text-amber-500'
                          }`}
                       >
                          <Clock className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
               );
             })
          ) : (
             <div className="text-center py-8 text-slate-500">
                <p className="text-xs">Không có dữ liệu</p>
             </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`p-4 ${isMobile ? 'pb-24 pt-3' : 'md:p-6 md:pb-6'} h-full flex flex-col animate-fade-in overflow-hidden`}>
      {/* Header Section */}
      <div className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-col md:flex-row justify-between items-start md:items-center gap-4'} mb-2 shrink-0`}>
        <div className="flex justify-between items-center w-full">
          <div>
            <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-slate-900 dark:text-white`}>Điểm Danh</h2>
            {!isMobile && <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý chuyên cần và học phí</p>}
          </div>
          {isMobile && (
             <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center justify-center gap-1 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-bold shadow-md active:scale-95"
             >
                <Save className="w-3.5 h-3.5" /> Lưu
             </button>
          )}
        </div>
        
        {/* Desktop Actions */}
        {!isMobile && (
          <div className="flex gap-2">
            <button onClick={handleExport} className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-lg shadow-emerald-600/30 transition-all text-xs">
               <Download className="w-3.5 h-3.5" /> Excel
            </button>
            <button onClick={handleSave} disabled={isSaving} className="flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-bold shadow-lg shadow-violet-600/30 transition-all text-xs">
               {isSaving ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <Save className="w-3.5 h-3.5" />}
               {isSaving ? 'Đang lưu' : 'Lưu'}
            </button>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className={`bg-white dark:bg-dark-800 p-2 md:p-3 rounded-lg border border-slate-200 dark:border-dark-700 mb-2 md:mb-3 shadow-sm flex ${isMobile ? 'flex-col gap-2' : 'flex-col md:flex-row gap-4'} items-stretch md:items-center shrink-0`}>
         {/* Class Selector */}
         <div className={`w-full ${isMobile ? '' : 'md:w-1/4'}`}>
            <div className="relative">
               <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-violet-400" />
               <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className={`w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-600 text-slate-900 dark:text-white pl-8 pr-4 ${isMobile ? 'py-1.5 text-xs' : 'py-2 pl-9 text-xs'} rounded-lg focus:ring-1 focus:ring-violet-500/50 outline-none appearance-none cursor-pointer font-medium`}
               >
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.name}>{cls.name}</option>
                  ))}
                  {classes.length === 0 && <option value="">Chưa có lớp học nào</option>}
               </select>
            </div>
         </div>

         {/* Month/Search Selector - Only visible in Monthly View or Desktop */}
         {(viewMode === 'monthly' || !isMobile) && (
           <>
             {/* Month Selector */}
             <div className={`w-full ${isMobile ? '' : 'md:w-1/4'}`}>
                <div className="relative">
                   <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary" />
                   <input 
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className={`w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-600 text-slate-900 dark:text-white pl-8 pr-4 ${isMobile ? 'py-1.5 text-xs' : 'py-1.5 pl-9 text-xs'} rounded-lg focus:ring-1 focus:ring-primary/50 outline-none cursor-pointer transition-colors font-medium`}
                   />
                </div>
             </div>

             {/* Search */}
             <div className={`w-full ${isMobile ? '' : 'md:w-1/4'}`}>
                <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                   <input 
                      type="text" 
                      placeholder="Tìm kiếm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-600 text-slate-900 dark:text-slate-200 pl-8 pr-4 ${isMobile ? 'py-1.5 text-xs' : 'py-2 pl-9 text-xs'} rounded-lg focus:ring-1 focus:ring-violet-500/50 outline-none transition-all placeholder-slate-400`}
                   />
                </div>
             </div>
           </>
         )}
      </div>

      {/* View Switcher Mobile Only */}
      {isMobile && (
          <div className="flex bg-slate-100 dark:bg-dark-800 p-0.5 rounded-lg mb-2 shrink-0">
             <button 
               onClick={() => setViewMode('daily')}
               className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${viewMode === 'daily' ? 'bg-white dark:bg-dark-700 shadow text-primary' : 'text-slate-500'}`}
             >
                Theo ngày
             </button>
             <button 
               onClick={() => setViewMode('monthly')}
               className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all ${viewMode === 'monthly' ? 'bg-white dark:bg-dark-700 shadow text-primary' : 'text-slate-500'}`}
             >
                Lịch sử tháng
             </button>
          </div>
       )}

      {/* CONDITIONAL CONTENT RENDERING */}
      {isMobile && viewMode === 'daily' ? (
         // MOBILE: DAILY LIST VIEW
         renderMobileDailyView()
      ) : (
         // DESKTOP/GRID VIEW (Existing Table Logic)
         <div className="flex-1 bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700 shadow-lg overflow-hidden flex flex-col relative">
           <style>{`
              .attendance-scroll::-webkit-scrollbar {
                width: 8px;
                height: 8px;
              }
              .attendance-scroll::-webkit-scrollbar-track {
                background: #f1f5f9;
                border-radius: 0 0 16px 0;
              }
              :is(.dark) .attendance-scroll::-webkit-scrollbar-track {
                background: #1e293b;
              }
              .attendance-scroll::-webkit-scrollbar-thumb {
                background-color: #cbd5e1;
                border-radius: 4px;
                border: 2px solid #f1f5f9;
              }
              :is(.dark) .attendance-scroll::-webkit-scrollbar-thumb {
                background-color: #475569;
                border: 2px solid #1e293b;
              }
           `}</style>
           
           {filteredStudents.length > 0 ? (
              <div className="overflow-auto attendance-scroll flex-1">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-20 bg-slate-50 dark:bg-dark-900 shadow-md">
                    <tr>
                      {/* Sticky Student Column */}
                      <th className={`sticky left-0 z-30 bg-slate-50 dark:bg-dark-900 p-2 text-left ${isMobile ? 'min-w-[120px]' : 'min-w-[140px] md:min-w-[200px]'} border-b border-r border-slate-200 dark:border-dark-700 shadow-[4px_0_10px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_10px_rgba(0,0,0,0.3)]`}>
                         <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Học viên</span>
                      </th>
                      
                      {/* Tuition Column */}
                      <th className={`sticky ${isMobile ? 'left-[120px] min-w-[60px]' : 'left-[140px] md:left-[200px] min-w-[80px] md:min-w-[90px]'} z-30 bg-slate-50 dark:bg-dark-900 p-2 border-b border-r border-slate-200 dark:border-dark-700 text-center shadow-[4px_0_10px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_10px_rgba(0,0,0,0.3)]`}>
                        <span className="text-[10px] md:text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center justify-center gap-1">
                           <CircleDollarSign className="w-3 h-3 md:w-3.5 md:h-3.5" /> <span className={isMobile ? 'hidden' : 'hidden md:inline'}>Học phí</span>
                        </span>
                      </th>

                      {/* Days of Month Columns */}
                      {daysInMonth.map((d, index) => (
                        <th 
                          key={index}
                          onClick={() => handleQuickAttendance(d.fullDate)} 
                          className={`p-1 min-w-[32px] border-b border-slate-200 dark:border-dark-700 bg-slate-50 dark:bg-dark-900 text-center relative group cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors ${
                            d.isWeekend ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''
                          }`}
                          title="Click để điểm danh nhanh toàn bộ lớp"
                        >
                          <div className="flex flex-col items-center justify-center h-10 group/header">
                             <span className={`text-[9px] font-bold uppercase tracking-wider ${d.isWeekend ? 'text-amber-600 dark:text-amber-500' : 'text-slate-500 dark:text-slate-400'}`}>
                               {d.label}
                             </span>
                             <span className={`text-[10px] font-semibold ${d.isWeekend ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                               {d.day}
                             </span>
                          </div>
                        </th>
                      ))}

                      {/* Stats Column */}
                      <th className="p-2 min-w-[60px] border-b border-l border-slate-200 dark:border-dark-700 bg-slate-50 dark:bg-dark-900 text-center">
                         <Calculator className="w-3.5 h-3.5 text-slate-400 mx-auto" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                    {filteredStudents.map((student) => {
                      const stats = getStudentStats(student.id);
                      const isHighlighted = highlightedStudentId === student.id;
                      const isTuitionPaid = tuitionData[student.id]?.[selectedMonth];

                      return (
                        <tr 
                          key={student.id} 
                          className={`transition-colors duration-200 ${isHighlighted ? 'bg-indigo-50 dark:bg-indigo-500/20' : 'hover:bg-slate-50 dark:hover:bg-dark-700/30'}`}
                        >
                          {/* Sticky Student Cell */}
                          <td 
                            onClick={() => setHighlightedStudentId(prev => prev === student.id ? null : student.id)}
                            className={`sticky left-0 z-10 p-1.5 md:p-2 border-r border-slate-200 dark:border-dark-700 shadow-[4px_0_10px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_10px_rgba(0,0,0,0.3)] cursor-pointer transition-colors duration-200 ${
                              isHighlighted ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-200 dark:border-indigo-700' : 'bg-white dark:bg-dark-800'
                            }`}
                          >
                             <div className="flex items-center gap-2 md:gap-2">
                                <img src={student.avatar} alt={student.name} className={`w-7 h-7 md:w-8 md:h-8 rounded-full border object-cover transition-colors ${isHighlighted ? 'border-indigo-400' : 'border-slate-200 dark:border-dark-600'}`} />
                                <div className="min-w-0">
                                   <p className={`font-medium text-[10px] md:text-xs truncate transition-colors ${isMobile ? 'max-w-[70px]' : 'max-w-[90px] md:max-w-none'} ${isHighlighted ? 'text-indigo-700 dark:text-indigo-200' : 'text-slate-900 dark:text-white'}`}>{student.name}</p>
                                </div>
                             </div>
                          </td>

                          {/* Tuition Status Cell */}
                          <td 
                            className={`sticky ${isMobile ? 'left-[120px]' : 'left-[140px] md:left-[200px]'} z-10 p-1 md:p-1.5 text-center border-r border-slate-200 dark:border-dark-700 transition-colors duration-200 ${
                              isHighlighted ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-200 dark:border-indigo-700' : 'bg-white dark:bg-dark-800'
                            }`}
                          >
                             <button
                               onClick={() => toggleTuition(student.id)}
                               className={`w-full py-1 px-1 md:px-1.5 rounded-lg text-[10px] md:text-[10px] font-bold border transition-all active:scale-95 flex items-center justify-center gap-1 ${
                                 isTuitionPaid 
                                   ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                                   : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                               }`}
                             >
                               <CircleDollarSign className="w-3 h-3 md:w-3.5 md:h-3.5" />
                               {isTuitionPaid ? <span className={isMobile ? 'hidden' : 'hidden md:inline'}>Đã đóng</span> : <span className={isMobile ? 'hidden' : 'hidden md:inline'}>Chưa đóng</span>}
                             </button>
                          </td>

                          {/* Date Status Cells */}
                          {daysInMonth.map((d, index) => {
                             const status = attendanceData[student.id]?.[d.fullDate] || 'NONE';
                             return (
                               <td 
                                 key={index} 
                                 className={`p-0.5 text-center border-r border-slate-100 dark:border-dark-700/50 ${d.isWeekend ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''}`}
                               >
                                  <button
                                     onClick={() => toggleStatus(student.id, d.fullDate)}
                                     className={`w-full h-7 rounded flex items-center justify-center transition-all duration-200 border group active:scale-95 ${getStatusColor(status)}`}
                                  >
                                     {getStatusIcon(status)}
                                  </button>
                               </td>
                             );
                          })}

                          {/* Stats Cell */}
                          <td className="p-1 md:p-2 border-l border-slate-200 dark:border-dark-700 text-center">
                             <div className="flex flex-col items-center justify-center">
                                <span className={`text-[10px] md:text-xs font-bold ${stats.percentage >= 80 ? 'text-emerald-500 dark:text-emerald-400' : stats.percentage >= 50 ? 'text-amber-500 dark:text-amber-400' : 'text-rose-500 dark:text-rose-400'}`}>
                                   {stats.percentage}%
                                </span>
                             </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
           ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-slate-500">
                 <AlertCircle className="w-10 h-10 mb-3 opacity-50" />
                 <p className="text-sm">Không tìm thấy học viên nào trong lớp này.</p>
              </div>
           )}
         </div>
      )}
    </div>
  );
};

export default AttendanceManager;
