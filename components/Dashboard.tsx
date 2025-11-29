
import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, GraduationCap, AlertTriangle, Crown, Trophy, Clock, ArrowRight, CalendarDays } from 'lucide-react';
import { Student, MonthlyPerformance } from '../types';

interface DashboardProps {
  students: Student[];
  isMobile?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ students, isMobile = false }) => {
  // Clock State
  const [currentTime, setCurrentTime] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mouse Move Logic for Dynamic Background
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scrollTop = containerRef.current.scrollTop;
    
    // Calculate mouse position relative to the container content
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top + scrollTop;
    
    containerRef.current.style.setProperty('--mouse-x', `${x}px`);
    containerRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  // Time of Day Color Logic - Refined for subtlety and atmosphere
  const getThemeColor = (date: Date) => {
    const hour = date.getHours();
    // Adjusted opacities for a modern, subtle glow that isn't distracting
    if (hour >= 5 && hour < 11) return 'rgba(14, 165, 233, 0.12)'; // Morning - Sky Blue (Cyan-500)
    if (hour >= 11 && hour < 17) return 'rgba(245, 158, 11, 0.1)';  // Afternoon - Amber (Amber-500)
    if (hour >= 17 && hour < 20) return 'rgba(236, 72, 153, 0.12)'; // Evening - Pink (Pink-500)
    return 'rgba(99, 102, 241, 0.12)'; // Night - Indigo (Indigo-500)
  };

  const glowColor = getThemeColor(currentTime);

  // Format helpers
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Mock Data for Charts
  const performanceData: MonthlyPerformance[] = [
    { month: 'T1', avgScore: 6.5, attendance: 85 },
    { month: 'T2', avgScore: 6.8, attendance: 82 },
    { month: 'T3', avgScore: 7.2, attendance: 88 },
    { month: 'T4', avgScore: 7.1, attendance: 87 },
    { month: 'T5', avgScore: 7.5, attendance: 90 },
    { month: 'T6', avgScore: 7.8, attendance: 92 },
  ];

  const statusData = [
    { name: 'Đang học', value: students.filter(s => s.status === 'Đang học').length, color: '#6366f1' },
    { name: 'Tốt nghiệp', value: students.filter(s => s.status === 'Tốt nghiệp').length, color: '#10b981' },
    { name: 'Cảnh báo', value: students.filter(s => s.gpa < 5).length, color: '#f43f5e' },
  ];

  // Top 4 Students Logic
  const topStudents = [...students].sort((a, b) => b.gpa - a.gpa).slice(0, 4);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative h-full overflow-y-auto custom-scrollbar group ${isMobile ? 'pb-24' : 'pb-20'}`}
      style={{'--mouse-x': '50%', '--mouse-y': '50%'} as React.CSSProperties}
    >
      {/* Dynamic Background Glow - Multi-layered for depth */}
      <div 
        className="pointer-events-none absolute inset-0 transition-all duration-1000 ease-in-out z-0 hidden dark:block"
        style={{
          background: `
            radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), ${glowColor}, transparent 40%),
            radial-gradient(1000px circle at 50% 0%, ${glowColor.replace(/[\d.]+\)$/, '0.05)')}, transparent 60%)
          `,
        }}
      />

      {/* Content Wrapper */}
      <div className={`relative z-10 space-y-4 ${isMobile ? 'p-3' : 'p-6 space-y-5'}`}>
        <header className={`flex ${isMobile ? 'flex-col gap-2' : 'flex-col md:flex-row justify-between items-start md:items-end'} border-b border-slate-200 dark:border-dark-700 pb-2 md:pb-4`}>
          <div>
            <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-slate-900 dark:text-white mb-0.5`}>Tổng Quan</h2>
            {!isMobile && <p className={`text-slate-500 dark:text-slate-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>Báo cáo hiệu suất và thống kê hệ thống</p>}
          </div>
          <div className={`flex items-center gap-4 bg-white dark:bg-dark-800/50 px-3 py-1.5 md:p-2 rounded-lg border border-slate-200 dark:border-dark-700/50 backdrop-blur-sm shadow-sm ${isMobile ? 'w-full justify-between' : ''}`}>
            {isMobile && <span className="text-[10px] font-bold uppercase text-primary">Live Stats</span>}
            <div className="text-right flex items-center gap-3">
              <div className={`flex items-center justify-end gap-1.5 text-primary font-bold ${isMobile ? 'text-base' : 'text-lg'} font-mono tracking-widest`}>
                  <Clock className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} mb-0.5`} />
                  {formatTime(currentTime)}
              </div>
              <div className="h-4 w-px bg-slate-200 dark:bg-dark-600"></div>
              <div className={`flex items-center justify-end gap-1.5 text-slate-500 dark:text-slate-400 ${isMobile ? 'text-[10px]' : 'text-xs'} uppercase font-medium tracking-wider mt-0.5`}>
                  <CalendarDays className="w-3 h-3" />
                  {formatDate(currentTime)}
              </div>
            </div>
          </div>
        </header>

        {/* Stat Cards - Compact */}
        <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 ${isMobile ? 'gap-2' : 'gap-4'}`}>
          <StatCard
            title="Tổng số HV"
            value={students.length}
            change="+12%"
            icon={Users}
            color="bg-blue-500"
            isMobile={isMobile}
          />
          <StatCard
            title="GPA Trung Bình"
            value={performanceData[performanceData.length - 1].avgScore}
            change="+0.3"
            icon={TrendingUp}
            color="bg-emerald-500"
            isMobile={isMobile}
          />
          <StatCard
            title="Đã Tốt nghiệp"
            value={124}
            change="+5%"
            icon={GraduationCap}
            color="bg-purple-500"
            isMobile={isMobile}
          />
          <StatCard
            title="Cần Chú ý"
            value={statusData[2].value}
            change="-2%"
            isNegative
            icon={AlertTriangle}
            color="bg-rose-500"
            isMobile={isMobile}
          />
        </div>

        {/* Visual Feature: Leaderboard & Timeline - Compact */}
        <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'xl:grid-cols-3 gap-4'}`}>
          
          {/* Top Performers (Leaderboard) */}
          <div className={`${isMobile ? '' : 'xl:col-span-2'} bg-white dark:bg-gradient-to-br dark:from-dark-800 dark:to-dark-900 border border-slate-200 dark:border-dark-700 rounded-xl ${isMobile ? 'p-3' : 'p-4'} shadow-md relative overflow-hidden group/card hover:border-primary/20 transition-colors`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/card:opacity-20 transition-opacity duration-500">
              <Trophy className={`${isMobile ? 'w-20 h-20' : 'w-24 h-24'} text-yellow-500`} />
            </div>
            
            <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2 relative z-10`}>
              <Crown className="w-4 h-4 text-yellow-400" /> Bảng vàng thành tích
            </h3>

            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 relative z-10 ${isMobile ? 'grid-cols-2' : ''}`}>
              {topStudents.map((student, index) => (
                <div key={student.id} className={`bg-slate-50 dark:bg-dark-700/50 backdrop-blur-md border border-slate-200 dark:border-white/5 ${isMobile ? 'p-2' : 'p-3'} rounded-lg flex flex-col items-center text-center hover:shadow-lg dark:hover:bg-dark-700 hover:border-primary/30 transition-all group cursor-default`}>
                  <div className="relative mb-1.5">
                    <img src={student.avatar} alt={student.name} className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-full border-2 border-slate-300 dark:border-dark-600 object-cover shadow-lg group-hover:scale-105 transition-transform`} />
                    <div className={`absolute -top-1 -right-1 ${isMobile ? 'w-4 h-4 text-[9px]' : 'w-5 h-5 text-[10px]'} rounded-full flex items-center justify-center font-bold shadow-lg border border-white dark:border-dark-800 ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                      index === 1 ? 'bg-slate-300 text-slate-800' : 
                      index === 2 ? 'bg-amber-600 text-amber-100' : 'bg-slate-600 text-slate-200'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <h4 className={`font-bold text-slate-800 dark:text-white ${isMobile ? 'text-[10px]' : 'text-xs'} truncate w-full mb-0.5`}>{student.name}</h4>
                  <div className="mt-auto px-1.5 py-0.5 bg-white dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/5">
                    <span className={`font-bold text-primary ${isMobile ? 'text-[10px]' : 'text-xs'}`}>{student.gpa}</span> <span className="text-[8px] md:text-[9px] text-slate-500">GPA</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Timeline - Compact */}
          <div className={`bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl ${isMobile ? 'p-3' : 'p-4'} shadow-md flex flex-col hover:border-primary/20 transition-colors`}>
            <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2`}>
              <Clock className="w-4 h-4 text-primary" /> Hoạt động mới
            </h3>
            
            <div className={`relative pl-3 border-l border-slate-200 dark:border-dark-700 ${isMobile ? 'space-y-4' : 'space-y-4'}`}>
              {[
                { title: "Đăng ký khóa học mới", desc: "Lớp ReactJS Advanced - K15", time: "2h trước", type: "primary" },
                { title: "Hoàn thành kiểm tra", desc: "Môn Database Design", time: "5h trước", type: "secondary" },
                { title: "Cập nhật điểm số", desc: "Node.js Final", time: "1d trước", type: "emerald" },
              ].map((item, i) => (
                <div key={i} className="relative group cursor-pointer">
                  <div className={`absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full border-2 border-slate-100 dark:border-dark-800 ${
                    item.type === 'primary' ? 'bg-primary' : item.type === 'secondary' ? 'bg-secondary' : 'bg-emerald-500'
                  } group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(99,102,241,0.5)]`}></div>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors ${isMobile ? 'text-[11px]' : 'text-xs'}`}>{item.title}</h4>
                      <p className={`text-slate-500 dark:text-slate-400 mt-0.5 ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>{item.desc}</p>
                    </div>
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-700 text-slate-500 dark:text-slate-400 whitespace-nowrap ml-2">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Area - Compact */}
        <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'lg:grid-cols-3 gap-4'}`}>
          {/* Main Area Chart */}
          <div className={`${isMobile ? '' : 'lg:col-span-2'} bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl ${isMobile ? 'p-3' : 'p-4'} shadow-md hover:border-primary/20 transition-colors`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-slate-900 dark:text-white`}>Hiệu suất Học tập</h3>
            </div>
            <div className={isMobile ? 'h-40' : 'h-64'}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} fontSize={10} />
                  <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} domain={[0, 10]} fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', fontSize: '12px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="avgScore" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className={`bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl ${isMobile ? 'p-3' : 'p-4'} shadow-md flex flex-col hover:border-primary/20 transition-colors`}>
            <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-slate-900 dark:text-white mb-2`}>Phân bổ</h3>
            <div className={`flex-1 relative ${isMobile ? 'min-h-[160px]' : 'min-h-[200px]'}`}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 40 : 50}
                    outerRadius={isMobile ? 60 : 70}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-slate-900 dark:text-white`}>{students.length}</span>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              {statusData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-[10px] md:text-xs group">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full transition-transform group-hover:scale-125" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number | string; change: string; icon: any; color: string; isNegative?: boolean; isMobile?: boolean }> = ({
  title,
  value,
  change,
  icon: Icon,
  color,
  isNegative = false,
  isMobile = false
}) => (
  <div className={`bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl ${isMobile ? 'p-2 py-3' : 'p-4'} shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden`}>
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${color.replace('bg-', 'from-')}/10 to-transparent -mr-6 -mt-6 rounded-full blur-2xl transition-opacity group-hover:opacity-70`}></div>
    
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className={`text-slate-500 dark:text-slate-400 ${isMobile ? 'text-[10px]' : 'text-xs'} font-bold uppercase tracking-wider mb-0.5`}>{title}</p>
        <h4 className={`${isMobile ? 'text-xl' : 'text-xl'} font-bold text-slate-900 dark:text-white`}>{value}</h4>
      </div>
      <div className={`${isMobile ? 'p-1.5' : 'p-1.5'} rounded-lg bg-opacity-20 ${color.replace('bg-', 'bg-opacity-20 ')}`}>
        <Icon className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
    <div className={`mt-2 md:mt-2 flex items-center gap-1.5 md:gap-2 relative z-10 ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>
      <span className={`font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${isNegative ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
        {change.startsWith('+') || change.startsWith('-') ? change : `+${change}`}
        {isNegative ? <TrendingUp className="w-2.5 h-2.5 rotate-180" /> : <TrendingUp className="w-2.5 h-2.5" />}
      </span>
      {!isMobile && <span className="text-slate-500">so với tháng trước</span>}
    </div>
  </div>
);

export default Dashboard;
