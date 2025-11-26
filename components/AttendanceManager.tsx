
import React, { useState, useEffect } from 'react';
import { Check, X, Clock, Save, Search, Filter, AlertCircle, Calculator, Download } from 'lucide-react';
import { Student, ClassRoom } from '../types';

interface AttendanceManagerProps {
  students: Student[];
  classes: ClassRoom[];
}

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'NONE';

// Data structure: { studentId: { dateString: status } }
interface AttendanceHistory {
  [studentId: string]: {
    [date: string]: AttendanceStatus;
  };
}

const AttendanceManager: React.FC<AttendanceManagerProps> = ({ students, classes }) => {
  
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Set default selected class when classes data loads
  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].name);
    }
  }, [classes, selectedClass]);

  // Initialize 10 date columns (default to last 10 days)
  const [dateColumns, setDateColumns] = useState<string[]>(() => {
    const dates = [];
    for (let i = 9; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  });

  // State to store attendance matrix
  const [attendanceData, setAttendanceData] = useState<AttendanceHistory>({});

  // Filter students based on selected Class Name
  const filteredStudents = students.filter(student => 
    student.classId === selectedClass &&
    (student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     student.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle changing a specific date column
  const handleDateChange = (index: number, newDate: string) => {
    const newColumns = [...dateColumns];
    newColumns[index] = newDate;
    setDateColumns(newColumns);
  };

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

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT': return <Check className="w-5 h-5 text-emerald-400" />;
      case 'ABSENT': return <X className="w-5 h-5 text-rose-400" />;
      case 'LATE': return <Clock className="w-5 h-5 text-amber-400" />;
      default: return <div className="w-2 h-2 rounded-full bg-dark-700 group-hover:bg-dark-600" />;
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

  // Calculate stats for a student across the 10 columns
  const getStudentStats = (studentId: string) => {
    const record = attendanceData[studentId] || {};
    let present = 0;
    let totalMarked = 0;
    
    dateColumns.forEach(date => {
      const status = record[date];
      if (status && status !== 'NONE') {
        totalMarked++;
        if (status === 'PRESENT') present += 1;
        if (status === 'LATE') present += 0.5; // Late counts as half? Or full? Let's say 0.5 for calculation
      }
    });

    const percentage = totalMarked === 0 ? 0 : Math.round((present / totalMarked) * 100);
    return { percentage, totalMarked };
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert(`Đã lưu dữ liệu điểm danh cho ${filteredStudents.length} học viên.`);
    }, 1000);
  };

  const handleExport = () => {
    if (filteredStudents.length === 0) {
      alert("Không có dữ liệu để xuất.");
      return;
    }

    // CSV Header
    const headers = ["Họ và tên", "Mã Học viên", ...dateColumns.map((d, i) => `Ngày ${i + 1} (${d})`), "Tỉ lệ chuyên cần"];
    
    // CSV Rows
    const rows = filteredStudents.map(student => {
      const stats = getStudentStats(student.id);
      const studentRow = [
        `"${student.name}"`, 
        `"${student.id}"`
      ];

      // Add status for each date
      dateColumns.forEach(date => {
        const status = attendanceData[student.id]?.[date] || 'NONE';
        let statusText = '';
        switch (status) {
          case 'PRESENT': statusText = 'Có mặt'; break;
          case 'ABSENT': statusText = 'Vắng'; break;
          case 'LATE': statusText = 'Muộn'; break;
          default: statusText = '-';
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
    link.setAttribute("download", `Diem_Danh_${selectedClass.replace(/\s+/g, '_') || 'Lop'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 h-full flex flex-col animate-fade-in overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Sổ Điểm Danh</h2>
          <p className="text-slate-400">Quản lý chuyên cần theo 10 ngày gần nhất (Tùy chỉnh)</p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          <button 
             onClick={handleExport}
             className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/30 transition-all hover:-translate-y-1 active:scale-95"
          >
             <Download className="w-5 h-5" />
             <span className="hidden sm:inline">Xuất Excel</span>
          </button>
          <button 
             onClick={handleSave}
             disabled={isSaving}
             className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold shadow-lg shadow-violet-600/30 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
             {isSaving ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <Save className="w-5 h-5" />}
             {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-dark-800 p-5 rounded-2xl border border-dark-700 mb-6 shadow-xl flex flex-col md:flex-row gap-6 items-center">
         {/* Class Selector */}
         <div className="w-full md:w-1/3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Chọn lớp học</label>
            <div className="relative">
               <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
               <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-600 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500/50 outline-none appearance-none cursor-pointer hover:border-violet-500/50 transition-colors"
               >
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.name}>{cls.name}</option>
                  ))}
                  {classes.length === 0 && <option value="">Chưa có lớp học nào</option>}
               </select>
            </div>
         </div>

         {/* Search */}
         <div className="w-full md:w-1/3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tìm kiếm học viên</label>
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
               <input 
                  type="text" 
                  placeholder="Tên hoặc email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dark-950 border border-dark-600 text-slate-200 pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-violet-500/50 outline-none transition-all placeholder-slate-600"
               />
            </div>
         </div>

         {/* Legend */}
         <div className="w-full md:w-1/3 flex items-center justify-end gap-4 p-3 border border-dashed border-dark-600 rounded-xl">
             <div className="flex items-center gap-2 text-xs text-slate-400">
               <Check className="w-4 h-4 text-emerald-400" /> Có mặt
             </div>
             <div className="flex items-center gap-2 text-xs text-slate-400">
               <X className="w-4 h-4 text-rose-400" /> Vắng
             </div>
             <div className="flex items-center gap-2 text-xs text-slate-400">
               <Clock className="w-4 h-4 text-amber-400" /> Muộn
             </div>
         </div>
      </div>

      {/* Grid Table Container */}
      <div className="flex-1 bg-dark-800 rounded-2xl border border-dark-700 shadow-xl overflow-hidden flex flex-col relative">
         <style>{`
            .attendance-scroll::-webkit-scrollbar {
              width: 10px;
              height: 10px;
            }
            .attendance-scroll::-webkit-scrollbar-track {
              background: #1e293b; /* dark-800 */
              border-radius: 0 0 16px 0;
            }
            .attendance-scroll::-webkit-scrollbar-thumb {
              background-color: #475569; /* dark-600 */
              border-radius: 5px;
              border: 2px solid #1e293b; /* dark-800 */
            }
            .attendance-scroll::-webkit-scrollbar-thumb:hover {
              background-color: #64748b; /* dark-500 */
            }
            .attendance-scroll::-webkit-scrollbar-corner {
              background: #1e293b;
            }
         `}</style>
         
         {filteredStudents.length > 0 ? (
            <div className="overflow-auto attendance-scroll flex-1">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-20 bg-dark-900 shadow-md">
                  <tr>
                    {/* Sticky Student Column */}
                    <th className="sticky left-0 z-30 bg-dark-900 p-4 text-left min-w-[250px] border-b border-r border-dark-700 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thông tin học viên</span>
                    </th>
                    
                    {/* 10 Date Columns */}
                    {dateColumns.map((date, index) => (
                      <th key={index} className="p-2 min-w-[140px] border-b border-dark-700 bg-dark-900 text-center relative group">
                        <div className="flex flex-col items-center gap-1">
                           <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">Ngày {index + 1}</span>
                           <input 
                              type="date" 
                              value={date}
                              onChange={(e) => handleDateChange(index, e.target.value)}
                              className="bg-dark-800 border border-dark-600 text-white text-xs px-2 py-1 rounded cursor-pointer outline-none focus:border-violet-500 transition-colors w-full text-center"
                           />
                        </div>
                      </th>
                    ))}

                    {/* Stats Column */}
                    <th className="p-4 min-w-[100px] border-b border-l border-dark-700 bg-dark-900 text-center">
                       <Calculator className="w-4 h-4 text-slate-400 mx-auto" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {filteredStudents.map((student) => {
                    const stats = getStudentStats(student.id);
                    return (
                      <tr key={student.id} className="hover:bg-dark-700/30 transition-colors">
                        {/* Sticky Student Cell */}
                        <td className="sticky left-0 z-10 bg-dark-800 p-4 border-r border-dark-700 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">
                           <div className="flex items-center gap-3">
                              <img src={student.avatar} alt={student.name} className="w-9 h-9 rounded-full border border-dark-600 object-cover" />
                              <div className="min-w-0">
                                 <p className="font-medium text-white text-sm truncate">{student.name}</p>
                                 <p className="text-[10px] text-slate-500 truncate">{student.id}</p>
                              </div>
                           </div>
                        </td>

                        {/* 10 Status Cells */}
                        {dateColumns.map((date, index) => {
                           const status = attendanceData[student.id]?.[date] || 'NONE';
                           return (
                             <td key={index} className="p-2 text-center border-r border-dark-700/50">
                                <button
                                   onClick={() => toggleStatus(student.id, date)}
                                   className={`w-full h-10 rounded-lg flex items-center justify-center transition-all duration-200 border group active:scale-95 ${getStatusColor(status)}`}
                                   title={`Click to change status for ${date}`}
                                >
                                   {getStatusIcon(status)}
                                </button>
                             </td>
                           );
                        })}

                        {/* Stats Cell */}
                        <td className="p-4 border-l border-dark-700 text-center">
                           <div className="flex flex-col items-center justify-center">
                              <span className={`text-sm font-bold ${stats.percentage >= 80 ? 'text-emerald-400' : stats.percentage >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                                 {stats.percentage}%
                              </span>
                              <span className="text-[10px] text-slate-500">
                                 {stats.totalMarked > 0 ? 'Tỉ lệ' : 'Chưa ghi'}
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
         
         <div className="p-3 bg-dark-900/80 border-t border-dark-700 text-xs text-center text-slate-500 backdrop-blur-sm">
            Mẹo: Nhấn vào ô trạng thái để thay đổi (Trống → Có mặt → Vắng → Muộn)
         </div>
      </div>
    </div>
  );
};

export default AttendanceManager;
