import React, { useState, useEffect, useMemo } from 'react';
import { Check, X, Clock, Save, Search, Filter, AlertCircle, Calculator, Download, CalendarDays, CheckSquare, CircleDollarSign } from 'lucide-react';
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

  // Default to current month (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Set default selected class when classes data loads
  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].name);
    }
  }, [classes, selectedClass]);

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
  // In a real app, this would fetch from an API based on the month
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

  // Handle clicking a cell to cycle status
  // NONE -> PRESENT -> ABSENT -> LATE -> NONE
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

  // Quick Attendance: Toggle entire column
  const handleQuickAttendance = (date: string) => {
    if (filteredStudents.length === 0) return;

    setAttendanceData(prev => {
      const nextState = { ...prev };
      const studentIds = filteredStudents.map(s => s.id);
      
      // Check current state of this column
      // If ALL currently visible students are PRESENT, switch to ABSENT
      // If ALL are ABSENT, switch to NONE (Clear)
      // Otherwise (mixed or empty), switch to PRESENT
      
      const allPresent = studentIds.every(id => prev[id]?.[date] === 'PRESENT');
      const allAbsent = studentIds.every(id => prev[id]?.[date] === 'ABSENT');

      let targetStatus: AttendanceStatus = 'PRESENT';
      if (allPresent) targetStatus = 'ABSENT';
      else if (allAbsent) targetStatus = 'NONE';

      studentIds.forEach(id => {
        if (!nextState[id]) nextState[id] = {};
        nextState[id][date] = targetStatus;
      });

      return nextState;
    });
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT': return <Check className="w-4 h-4 text-emerald-400" />;
      case 'ABSENT': return <X className="w-4 h-4 text-rose-400" />;
      case 'LATE': return <Clock className="w-4 h-4 text-amber-400" />;
      default: return <div className="w-1.5 h-1.5 rounded-full bg-dark-700 group-hover:bg-dark-600" />;
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

    // CSV Header
    const headers = ["Họ và tên", "Mã Học viên", "Trạng thái Học phí", ...daysInMonth.map(d => `${d.day}/${selectedMonth.split('-')[1]} (${d.label})`), "Tỉ lệ chuyên cần"];
    
    // CSV Rows
    const rows = filteredStudents.map(student => {
      const stats = getStudentStats(student.id);
      const isPaid = tuitionData[student.id]?.[selectedMonth];
      
      const studentRow = [
        `"${student.name}"`, 
        `"${student.id}"`,
        `"${isPaid ? 'Đã đóng' : 'Chưa đóng'}"`
      ];

      // Add status for each date
      daysInMonth.forEach(({ fullDate }) => {
        const status = attendanceData[student.id]?.[fullDate] || 'NONE';
        let statusText = '';
        switch (status) {
          case 'PRESENT': statusText = 'x'; break; // x for present in Excel usually
          case 'ABSENT': statusText = 'v'; break;
          case 'LATE': statusText = 'm'; break;
          default: statusText = '';
        }
        studentRow.push(`"${statusText}"`);
      });

      // Add stats
      studentRow.push(`"${stats.percentage}%"`);

      return studentRow.join(",");
    });

    // Combine header and rows with BOM for Excel UTF-8 support
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Diem_Danh_${selectedClass.replace(/\s+/g, '_') || 'Lop'}_Thang_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`p-4 ${isMobile ? 'pb-24' : 'md:p-8 md:pb-8'} h-full flex flex-col animate-fade-in overflow-hidden`}>
      {/* Header Section */}
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-col md:flex-row justify-between items-start md:items-center'} gap-4 mb-6`}>
        <div>
          <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-slate-900 dark:text-white mb-1`}>Sổ Điểm Danh</h2>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">Quản lý chuyên cần và học phí chi tiết theo tháng</p>
        </div>
        
        {/* Actions */}
        <div className={`flex gap-2 ${isMobile ? 'w-full' : 'w-full md:w-auto'}`}>
          <button 
             onClick={handleExport}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30 transition-all hover:-translate-y-1 active:scale-95 text-sm"
          >
             <Download className="w-4 h-4" />
             <span className="">Excel</span>
          </button>
          <button 
             onClick={handleSave}
             disabled={isSaving}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold shadow-lg shadow-violet-600/30 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
          >
             {isSaving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <Save className="w-4 h-4" />}
             {isSaving ? 'Đang lưu' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </div>

      {/* Control Bar - Mobile Optimized */}
      <div className={`bg-white dark:bg-dark-800 p-4 rounded-2xl border border-slate-200 dark:border-dark-700 mb-6 shadow-xl flex ${isMobile ? 'flex-col' : 'flex-col md:flex-row'} gap-4 items-stretch md:items-center`}>
         {/* Class Selector */}
         <div className={`w-full ${isMobile ? '' : 'md:w-1/4'}`}>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Chọn lớp học</label>
            <div className="relative">
               <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
               <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-600 text-slate-900 dark:text-white pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-violet-500/50 outline-none appearance-none cursor-pointer hover:border-violet-500/50 transition-colors text-sm font-medium"
               >
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.name}>{cls.name}</option>
                  ))}
                  {classes.length === 0 && <option value="">Chưa có lớp học nào</option>}
               </select>
            </div>
         </div>

         {/* Month Selector */}
         <div className={`w-full ${isMobile ? '' : 'md:w-1/4'}`}>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Chọn Tháng</label>
            <div className="relative">
               <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
               <input 
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-600 text-slate-900 dark:text-white pl-10 pr-4 py-2 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none cursor-pointer transition-colors font-medium text-sm"
               />
            </div>
         </div>

         {/* Search */}
         <div className={`w-full ${isMobile ? '' : 'md:w-1/4'}`}>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tìm kiếm học viên</label>
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
               <input 
                  type="text" 
                  placeholder="Tên hoặc email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-600 text-slate-900 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-violet-500/50 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-600 text-sm"
               />
            </div>
         </div>
      </div>

      {/* Grid Table Container */}
      <div className="flex-1 bg-white dark:bg-dark-800 rounded-2xl border border-slate-200 dark:border-dark-700 shadow-xl overflow-hidden flex flex-col relative">
         <style>{`
            .attendance-scroll::-webkit-scrollbar {
              width: 10px;
              height: 10px;
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
              border-radius: 5px;
              border: 2px solid #f1f5f9;
            }
            :is(.dark) .attendance-scroll::-webkit-scrollbar-thumb {
              background-color: #475569;
              border: 2px solid #1e293b;
            }
            .attendance-scroll::-webkit-scrollbar-thumb:hover {
              background-color: #94a3b8;
            }
            :is(.dark) .attendance-scroll::-webkit-scrollbar-thumb:hover {
              background-color: #64748b;
            }
            .attendance-scroll::-webkit-scrollbar-corner {
              background: transparent;
            }
         `}</style>
         
         {filteredStudents.length > 0 ? (
            <div className="overflow-auto attendance-scroll flex-1">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-20 bg-slate-50 dark:bg-dark-900 shadow-md">
                  <tr>
                    {/* Sticky Student Column - Resizes on Mobile */}
                    <th className={`sticky left-0 z-30 bg-slate-50 dark:bg-dark-900 p-4 text-left ${isMobile ? 'min-w-[140px]' : 'min-w-[140px] md:min-w-[250px]'} border-b border-r border-slate-200 dark:border-dark-700 shadow-[4px_0_10px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_10px_rgba(0,0,0,0.3)]`}>
                       <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Học viên</span>
                    </th>
                    
                    {/* Tuition Column */}
                    <th className={`sticky ${isMobile ? 'left-[140px] min-w-[80px]' : 'left-[140px] md:left-[250px] min-w-[80px] md:min-w-[100px]'} z-30 bg-slate-50 dark:bg-dark-900 p-2 border-b border-r border-slate-200 dark:border-dark-700 text-center shadow-[4px_0_10px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_10px_rgba(0,0,0,0.3)]`}>
                      <span className="text-[10px] md:text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center justify-center gap-1">
                         <CircleDollarSign className="w-3 h-3 md:w-3.5 md:h-3.5" /> <span className={isMobile ? 'hidden' : 'hidden md:inline'}>Học phí</span>
                      </span>
                    </th>

                    {/* Days of Month Columns */}
                    {daysInMonth.map((d, index) => (
                      <th 
                        key={index}
                        onClick={() => handleQuickAttendance(d.fullDate)} 
                        className={`p-1 min-w-[40px] border-b border-slate-200 dark:border-dark-700 bg-slate-50 dark:bg-dark-900 text-center relative group cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors ${
                          d.isWeekend ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''
                        }`}
                        title="Click để điểm danh nhanh toàn bộ lớp (Có mặt -> Vắng -> Xóa)"
                      >
                        <div className="flex flex-col items-center justify-center h-12 group/header">
                           <span className={`text-[10px] font-bold uppercase tracking-wider ${d.isWeekend ? 'text-amber-600 dark:text-amber-500' : 'text-slate-500 dark:text-slate-400'}`}>
                             {d.label}
                           </span>
                           <span className={`text-xs font-semibold ${d.isWeekend ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                             {d.day}
                           </span>
                           
                           {/* Hover Indicator */}
                           <div className="absolute top-0 right-0 p-0.5 opacity-0 group-hover/header:opacity-100 transition-opacity">
                              <CheckSquare className="w-2.5 h-2.5 text-primary" />
                           </div>
                        </div>
                      </th>
                    ))}

                    {/* Stats Column */}
                    <th className="p-4 min-w-[80px] border-b border-l border-slate-200 dark:border-dark-700 bg-slate-50 dark:bg-dark-900 text-center">
                       <Calculator className="w-4 h-4 text-slate-400 mx-auto" />
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
                          className={`sticky left-0 z-10 p-2 md:p-4 border-r border-slate-200 dark:border-dark-700 shadow-[4px_0_10px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_10px_rgba(0,0,0,0.3)] cursor-pointer transition-colors duration-200 ${
                            isHighlighted ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-200 dark:border-indigo-700' : 'bg-white dark:bg-dark-800'
                          }`}
                        >
                           <div className="flex items-center gap-2 md:gap-3">
                              <img 
                                src={student.avatar} 
                                alt={student.name} 
                                className={`w-8 h-8 md:w-9 md:h-9 rounded-full border object-cover transition-colors ${isHighlighted ? 'border-indigo-400' : 'border-slate-200 dark:border-dark-600'}`} 
                              />
                              <div className="min-w-0">
                                 <p className={`font-medium text-xs md:text-sm truncate transition-colors ${isMobile ? 'max-w-[80px]' : 'max-w-[90px] md:max-w-none'} ${isHighlighted ? 'text-indigo-700 dark:text-indigo-200' : 'text-slate-900 dark:text-white'}`}>{student.name}</p>
                                 <p className={`text-[10px] text-slate-500 truncate ${isMobile ? 'hidden' : 'hidden md:block'}`}>{student.id}</p>
                              </div>
                           </div>
                        </td>

                        {/* Tuition Status Cell */}
                        <td 
                          className={`sticky ${isMobile ? 'left-[140px]' : 'left-[140px] md:left-[250px]'} z-10 p-1 md:p-2 text-center border-r border-slate-200 dark:border-dark-700 transition-colors duration-200 ${
                            isHighlighted ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-200 dark:border-indigo-700' : 'bg-white dark:bg-dark-800'
                          }`}
                        >
                           <button
                             onClick={() => toggleTuition(student.id)}
                             className={`w-full py-1.5 px-1 md:px-2 rounded-lg text-[10px] md:text-xs font-bold border transition-all active:scale-95 flex items-center justify-center gap-1 ${
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
                               className={`p-1 text-center border-r border-slate-100 dark:border-dark-700/50 ${d.isWeekend ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''}`}
                             >
                                <button
                                   onClick={() => toggleStatus(student.id, d.fullDate)}
                                   className={`w-full h-8 rounded flex items-center justify-center transition-all duration-200 border group active:scale-95 ${getStatusColor(status)}`}
                                   title={`${d.day}/${selectedMonth} - Click to change status`}
                                >
                                   {getStatusIcon(status)}
                                </button>
                             </td>
                           );
                        })}

                        {/* Stats Cell */}
                        <td className="p-2 md:p-4 border-l border-slate-200 dark:border-dark-700 text-center">
                           <div className="flex flex-col items-center justify-center">
                              <span className={`text-xs md:text-sm font-bold ${stats.percentage >= 80 ? 'text-emerald-500 dark:text-emerald-400' : stats.percentage >= 50 ? 'text-amber-500 dark:text-amber-400' : 'text-rose-500 dark:text-rose-400'}`}>
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
               <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
               <p>Không tìm thấy học viên nào trong lớp này.</p>
               {classes.length === 0 && <p className="text-sm mt-2 text-rose-400">Hệ thống chưa có lớp học nào.</p>}
            </div>
         )}
         
         <div className="p-3 bg-white/80 dark:bg-dark-900/80 border-t border-slate-200 dark:border-dark-700 text-[10px] md:text-xs text-center text-slate-500 backdrop-blur-sm">
            Mẹo: Nhấn vào tên học viên để làm nổi bật dòng • Nhấn vào tiêu đề ngày để điểm danh nhanh cả lớp
         </div>
      </div>
    </div>
  );
};

export default AttendanceManager;