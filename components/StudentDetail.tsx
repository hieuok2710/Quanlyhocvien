
import React, { useState, useRef } from 'react';
import { X, Mail, Phone, Calendar, Award, BookOpen, Clock, Star, ShieldCheck, Zap, BarChart2, Printer, User } from 'lucide-react';
import { Student, StudentStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface StudentDetailProps {
  student: Student;
  allStudents: Student[];
  onClose: () => void;
}

const StudentDetail: React.FC<StudentDetailProps> = ({ student, allStudents, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transcript'>('overview');
  
  // Swipe Gesture State
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  const [touchEnd, setTouchEnd] = useState<{x: number, y: number} | null>(null);
  const minSwipeDistance = 50;
  
  // Refs for Parallax Effect & Scroll Navigation
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const gpaRef = useRef<HTMLParagraphElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const overviewRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Touch Handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontal) {
      // Swipe Left (Move Right -> Left) -> Next Tab
      if (distanceX > minSwipeDistance && activeTab === 'overview') {
        scrollToSection('transcript');
      }
      // Swipe Right (Move Left -> Right) -> Previous Tab
      if (distanceX < -minSwipeDistance && activeTab === 'transcript') {
        scrollToSection('overview');
      }
    } else {
      // Swipe Down (Move Top -> Bottom) -> Close Modal
      // Only allow closing if we are at the top of the scroll container to prevent accidental closing while reading
      if (distanceY < -minSwipeDistance && scrollContainerRef.current && scrollContainerRef.current.scrollTop <= 0) {
        onClose();
      }
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollTop = scrollContainerRef.current.scrollTop;
      
      // Parallax Effect for GPA
      if (gpaRef.current) {
        gpaRef.current.style.transform = `translateY(${scrollTop * 0.15}px)`;
      }

      // Parallax Effect for Avatar
      if (avatarRef.current) {
        // Moves slightly slower than the scroll for depth
        avatarRef.current.style.transform = `translateY(${scrollTop * 0.08}px)`;
      }

      // ScrollSpy: Update active tab based on scroll position
      if (transcriptRef.current && overviewRef.current) {
        const containerTop = scrollContainerRef.current.getBoundingClientRect().top;
        const transcriptTop = transcriptRef.current.getBoundingClientRect().top;
        const relativeTop = transcriptTop - containerTop;

        // Threshold: sticky header height (128px) + tab bar height (~50px) + buffer
        if (relativeTop < 220) { 
           if (activeTab !== 'transcript') setActiveTab('transcript');
        } else {
           if (activeTab !== 'overview') setActiveTab('overview');
        }
      }
    }
  };

  const scrollToSection = (section: 'overview' | 'transcript') => {
    setActiveTab(section);
    const container = scrollContainerRef.current;
    const targetRef = section === 'overview' ? overviewRef : transcriptRef;
    
    if (container && targetRef.current) {
        // Calculate offset relative to the container
        // The sticky header height is h-32 (128px) + tabs height (~48px) = ~176px.
        // We add a little padding for visual comfort.
        const headerOffset = 180; 
        const elementPosition = targetRef.current.offsetTop;
        const offsetPosition = elementPosition - headerOffset;

        container.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to ensure dd/mm/yyyy format
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Logic for Badges (Visual & Non-AI Content)
  const getBadges = () => {
    const badges = [];
    if (student.gpa >= 9.0) {
      badges.push({ 
        label: 'Xuất sắc', 
        icon: Star, 
        className: 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/30 hover:from-yellow-500/30 hover:to-amber-500/30 hover:border-yellow-400 hover:shadow-[0_0_15px_rgba(234,179,8,0.4)] hover:ring-1 hover:ring-yellow-500/50' 
      });
    } else if (student.gpa >= 8.0) {
      badges.push({ 
        label: 'Học viên Giỏi', 
        icon: Award, 
        className: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30 hover:from-emerald-500/30 hover:to-teal-500/30 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:ring-1 hover:ring-emerald-500/50' 
      });
    }
    
    if (student.attendance === 100) {
      badges.push({ 
        label: 'Chuyên cần 100%', 
        icon: ShieldCheck, 
        className: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30 hover:from-blue-500/30 hover:to-cyan-500/30 hover:border-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:ring-1 hover:ring-blue-500/50' 
      });
    }
    
    if (student.status === StudentStatus.ACTIVE && student.gpa > 7) {
      badges.push({ 
        label: 'Tích cực', 
        icon: Zap, 
        className: 'bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 text-purple-400 border-purple-500/30 hover:from-purple-500/30 hover:to-fuchsia-500/30 hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:ring-1 hover:ring-purple-500/50' 
      });
    }
    
    return badges;
  };

  const badges = getBadges();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        id="student-detail-content"
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="bg-dark-800 w-full max-w-4xl max-h-[90vh] rounded-2xl border border-dark-600 shadow-2xl overflow-y-auto custom-scrollbar relative scroll-smooth touch-pan-y"
      >
        <style>{`
          @keyframes subtle-vibrate {
            0%, 100% { transform: translate(0,0); }
            10% { transform: translate(-1px, -1px); }
            20% { transform: translate(1px, 1px); }
            30% { transform: translate(-1px, 1px); }
            40% { transform: translate(1px, -1px); }
            50% { transform: translate(0,0); }
          }
          .animate-vibrate-subtle {
            animation: subtle-vibrate 2.5s ease-in-out infinite;
            display: inline-block;
          }

          .hover-subtle-vibrate:hover {
            animation: subtle-vibrate 0.3s linear infinite;
          }

          @media print {
            body * {
              visibility: hidden;
            }
            #student-detail-content, #student-detail-content * {
              visibility: visible;
            }
            #student-detail-content {
              position: fixed;
              left: 0;
              top: 0;
              width: 100vw;
              height: 100vh;
              max-width: none;
              max-height: none;
              margin: 0;
              padding: 20px;
              overflow: visible;
              background: white !important;
              color: black !important;
              border: none;
              box-shadow: none;
              z-index: 9999;
            }
            .no-print {
              display: none !important;
            }
            /* Color Overrides for Print */
            .text-white, .text-slate-200, .text-slate-300, .text-slate-400 {
              color: #000 !important;
            }
            .bg-dark-800, .bg-dark-900, .bg-dark-950, .bg-dark-700 {
              background: #fff !important;
              border-color: #ddd !important;
            }
            .bg-gradient-to-r {
              background: #eee !important;
            }
          }
        `}</style>
        
        {/* Header - Sticky */}
        <div className="sticky top-0 z-40 h-32 bg-gradient-to-r from-primary to-secondary shrink-0 shadow-lg no-print">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
          <div className="absolute top-4 right-4 flex gap-2 z-50">
             <button 
              onClick={handlePrint}
              className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md group"
              title="In hồ sơ"
            >
              <Printer className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md group"
            >
              <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-6 -mt-10 mb-8 relative z-30">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative" ref={avatarRef}>
                <img 
                  src={student.avatar} 
                  alt={student.name} 
                  className="w-28 h-28 rounded-full border-4 border-dark-800 shadow-2xl object-cover bg-dark-800 transition-transform duration-500 hover-subtle-vibrate"
                />
                <span className={`absolute bottom-2 right-2 w-5 h-5 border-2 border-dark-800 rounded-full ${student.status === StudentStatus.ACTIVE ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
              </div>
              <div className="mt-3 text-center md:text-left">
                <h2 className="text-2xl font-bold text-white">{student.name}</h2>
                <p className="text-primary font-medium">{student.classId}</p>
              </div>
            </div>

            {/* Badges & Quick Stats */}
            <div className="flex-1 pt-14 md:pt-16">
               <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                 {badges.map((badge, idx) => {
                   const Icon = badge.icon;
                   return (
                     <span key={idx} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-default select-none shadow-sm ${badge.className}`}>
                       <Icon className="w-3.5 h-3.5" /> {badge.label}
                     </span>
                   )
                 })}
               </div>
               <div className="grid grid-cols-3 gap-4 border-t border-dark-700 pt-4">
                 <div className="text-center md:text-left group cursor-default hover:scale-105 transition-transform duration-300">
                   <p className="text-slate-400 text-xs uppercase tracking-wider">GPA</p>
                   {/* GPA Value with Parallax Ref and Conditional Vibration */}
                   <p 
                     ref={gpaRef}
                     className={`text-xl font-bold will-change-transform ${student.gpa >= 8 ? 'text-emerald-400' : 'text-white'}`}
                   >
                     <span className={activeTab === 'overview' ? 'animate-vibrate-subtle' : ''}>
                       {student.gpa}
                     </span>
                   </p>
                 </div>
                 <div className="text-center md:text-left group cursor-default hover:scale-105 transition-transform duration-300">
                   <p className="text-slate-400 text-xs uppercase tracking-wider">Chuyên cần</p>
                   <p className={`text-xl font-bold ${student.attendance >= 90 ? 'text-blue-400' : 'text-white'}`}>{student.attendance}%</p>
                 </div>
                 <div className="text-center md:text-left group cursor-default hover:scale-105 transition-transform duration-300">
                   <p className="text-slate-400 text-xs uppercase tracking-wider">Ngày tham gia</p>
                   <p className="text-xl font-bold text-white">{formatDate(student.joinDate)}</p>
                 </div>
               </div>
            </div>
          </div>

          {/* Contact Info Section - Visually Distinct */}
          <div className="mb-8 p-5 bg-gradient-to-br from-slate-50 to-white dark:from-dark-700/30 dark:to-dark-800/30 rounded-2xl border border-slate-200 dark:border-dark-700 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
                <User className="w-24 h-24 text-slate-500" />
             </div>
             
             <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2 relative z-10">
                <ShieldCheck className="w-4 h-4 text-primary" /> Thông tin cá nhân
             </h3>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="flex items-center gap-3 group">
                   <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-100 dark:border-blue-500/20 group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Email</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{student.email}</p>
                   </div>
                </div>

                <div className="flex items-center gap-3 group">
                   <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-100 dark:border-emerald-500/20 group-hover:scale-110 transition-transform">
                      <Phone className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Điện thoại</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{student.phone}</p>
                   </div>
                </div>

                <div className="flex items-center gap-3 group">
                   <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-100 dark:border-purple-500/20 group-hover:scale-110 transition-transform">
                      <Calendar className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ngày sinh</p>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatDate(student.dob)}</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex gap-6 border-b border-dark-700 mb-8 sticky top-32 z-20 bg-dark-800/95 backdrop-blur-sm pt-2 no-print">
            <button 
              onClick={() => scrollToSection('overview')}
              className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'overview' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Tổng quan
              {activeTab === 'overview' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full animate-fade-in"></span>}
            </button>
            <button 
              onClick={() => scrollToSection('transcript')}
              className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'transcript' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Bảng điểm chi tiết
              {activeTab === 'transcript' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full animate-fade-in"></span>}
            </button>
          </div>

          {/* Continuous Content Sections */}
          <div className="pb-20">
            
            {/* Overview Section */}
            <div ref={overviewRef} id="overview" className="scroll-mt-52 mb-12 animate-fade-in">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-dark-700/30 p-5 rounded-xl border border-dark-700 hover:border-primary/20 transition-colors">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" /> Các môn đã học
                    </h3>
                    <div className="space-y-3">
                      {student.scores.slice(0, 5).map((score) => (
                        <div key={score.id} className="flex justify-between items-center text-sm group/item hover:bg-white/5 p-1 rounded transition-colors">
                          <span className="text-slate-300">{score.subject}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${score.score >= 8 ? 'bg-emerald-500' : score.score >= 5 ? 'bg-primary' : 'bg-rose-500'}`}
                                style={{ width: `${score.score * 10}%` }}
                              />
                            </div>
                            <span className="font-bold text-white w-6 text-right group-hover/item:scale-110 transition-transform">{score.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
                 <div className="bg-dark-700/30 p-5 rounded-xl border border-dark-700 hover:border-primary/20 transition-colors">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" /> Ghi chú
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Học viên có thái độ học tập tốt, thường xuyên tham gia phát biểu xây dựng bài. 
                      Cần cải thiện thêm về kỹ năng làm việc nhóm trong các dự án cuối khóa. 
                      Tuy nhiên, điểm số các môn cơ sở rất vững chắc.
                    </p>
                    <div className="mt-4 pt-4 border-t border-dark-600 flex items-center gap-2 text-xs text-slate-500">
                       <span>Cập nhật lần cuối: 2 ngày trước</span>
                       <span>•</span>
                       <span>Bởi: Admin</span>
                    </div>
                 </div>
              </div>
            </div>

            {/* Transcript Section */}
            <div ref={transcriptRef} id="transcript" className="scroll-mt-52 animate-fade-in space-y-6">
                {/* Subject Scores Chart */}
                <div className="h-80 bg-dark-700/30 p-4 rounded-xl border border-dark-700 hover:border-primary/20 transition-colors">
                  <h3 className="text-slate-300 text-sm font-semibold mb-4 flex items-center gap-2">
                     <BarChart2 className="w-4 h-4 text-primary" /> Điểm thành phần
                  </h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={student.scores}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="subject" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} interval={0} />
                      <YAxis stroke="#94a3b8" domain={[0, 10]} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                      />
                      <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40}>
                        {student.scores.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.score >= 8 ? '#10b981' : entry.score >= 5 ? '#6366f1' : '#f43f5e'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Class GPA Comparison Chart */}
                <div className="h-80 bg-dark-700/30 p-4 rounded-xl border border-dark-700 hover:border-primary/20 transition-colors">
                  <h3 className="text-slate-300 text-sm font-semibold mb-4 flex items-center gap-2">
                     <Award className="w-4 h-4 text-secondary" /> So sánh GPA toàn khóa
                  </h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={allStudents}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis 
                         dataKey="name" 
                         hide={true} 
                      />
                      <YAxis stroke="#94a3b8" domain={[0, 10]} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        labelStyle={{color: '#94a3b8'}}
                      />
                      <Bar dataKey="gpa" radius={[4, 4, 0, 0]} barSize={allStudents.length > 20 ? 8 : 20}>
                        {allStudents.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.id === student.id ? '#ec4899' : '#334155'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
