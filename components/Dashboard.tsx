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
      <div className={`relative z-10 space-y-8 ${isMobile ? 'p-4' : 'p-8'}`}>
        <header className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-col md:flex-row justify-between items-start md:items-end'} border-b border-slate-200 dark:border-dark-700 pb-6`}>
          <div>
            <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-slate-900 dark:text-white mb-1`}>Tổng Quan</h2>
            <p className="text-slate-500 dark:text-slate-400">Báo cáo hiệu suất và thống kê hệ thống</p>
          </div>
          <div className={`flex items-center gap-4 bg-white dark:bg-dark-800/50 p-3 rounded-xl border border-slate-200 dark:border-dark-700/50 backdrop-blur-sm shadow-lg ${isMobile ? 'w-full justify-between' : ''}`}>
            {isMobile && <span className="text-xs font-bold uppercase text-primary">Thời gian thực</span>}
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 text-primary font-bold text-xl font-mono tracking-widest">
                  <Clock className="w-5 h-5 mb-0.5" />
                  {formatTime(currentTime)}
              </div>
              <div className="flex items-center justify-end gap-2 text-slate-500 dark:text-slate-400 text-xs uppercase font-medium tracking-wider mt-1">
                  <CalendarDays className="w-3 h-3" />
                  {formatDate(currentTime)}
              </div>
            </div>
          </div>
        </header>

        {/* Stat Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${isMobile ? 'gap-4' : ''}`}>
          <StatCard
            title="Tổng học viên"
            value={students.length}
            change="+12%"
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="GPA Trung bình"
            value={performanceData[performanceData.length - 1].avgScore}
            change="+0.3"
            icon={TrendingUp}
            color="bg-emerald-500"
          />
          <StatCard
            title="Tốt nghiệp"
            value={124}
            change="+5%"
            icon={GraduationCap}
            color="bg-purple-500"
          />
          <StatCard
            title="Cảnh báo học tập"
            value={statusData[2].value}
            change="-2%"
            isNegative
            icon={AlertTriangle}
            color="bg-rose-500"
          />
        </div>

        {/* Visual Feature: Leaderboard & Timeline */}
        <div className={`grid grid-cols-1 ${isMobile ? '' : 'xl:grid-cols-3'} gap-8`}>
          
          {/* Top Performers (Leaderboard) */}
          <div className={`${isMobile ? '' : 'xl:col-span-2'} bg-white dark:bg-gradient-to-br dark:from-dark-800 dark:to-dark-900 border border-slate-200 dark:border-dark-700 rounded-2xl p-6 shadow-xl relative overflow-hidden group/card hover:border-primary/20 transition-colors`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/card:opacity-20 transition-opacity duration-500">
              <Trophy className="w-32 h-32 text-yellow-500" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 relative z-10">
              <Crown className="w-5 h-5 text-yellow-400" /> Bảng vàng thành tích
            </h3>

            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 ${isMobile ? 'grid-cols-2 gap-3' : ''}`}>
              {topStudents.map((student, index) => (
                <div key={student.id} className="bg-slate-50 dark:bg-dark-700/50 backdrop-blur-md border border-slate-200 dark:border-white/5 p-4 rounded-xl flex flex-col items-center text-center hover:shadow-lg dark:hover:bg-dark-700 hover:border-primary/30 transition-all group cursor-default">
                  <div className="relative mb-3">
                    <img src={student.avatar} alt={student.name} className="w-16 h-16 rounded-full border-2 border-slate-300 dark:border-dark-600 object-cover shadow-lg group-hover:scale-105 transition-transform" />
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border border-white dark:border-dark-800 ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                      index === 1 ? 'bg-slate-300 text-slate-800' : 
                      index === 2 ? 'bg-amber-600 text-amber-100' : 'bg-slate-600 text-slate-200'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate w-full mb-1">{student.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 truncate w-full">{student.classId}</p>
                  <div className="mt-auto px-3 py-1 bg-white dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/5">
                    <span className="text-sm font-bold text-primary">{student.gpa}</span> <span className="text-[10px] text-slate-500">GPA</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-2xl p-6 shadow-xl flex flex-col hover:border-primary/20 transition-colors">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Hoạt động gần đây
            </h3>
            
            <div className="relative pl-4 border-l border-slate-200 dark:border-dark-700 space-y-8">
              {[
                { title: "Đăng ký khóa học mới", desc: "Lớp ReactJS Advanced - K15", time: "2 giờ trước", type: "primary" },
                { title: "Hoàn thành kiểm tra", desc: "Kết thúc môn Database Design", time: "5 giờ trước", type: "secondary" },
                { title: "Cập nhật điểm số", desc: "Đã nhập điểm thi cuối kỳ Node.js", time: "1 ngày trước", type: "emerald" },
              ].map((item, i) => (
                <div key={i} className="relative group cursor-pointer">
                  <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-slate-100 dark:border-dark-800 ${
                    item.type === 'primary' ? 'bg-primary' : item.type === 'secondary' ? 'bg-secondary' : 'bg-emerald-500'
                  } group-hover:scale-125 transition-transform shadow-[0_0_10px_rgba(99,102,241,0.5)]`}></div>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">{item.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-1 rounded bg-slate-100 dark:bg-dark-700 text-slate-500 dark:text-slate-400">{item.time}</span>
                  </div>
                </div>
              ))}
              
              <button className="w-full mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-primary py-2 border border-dashed border-slate-300 dark:border-dark-600 rounded-lg hover:bg-slate-50 dark:hover:bg-dark-700 transition-all">
                Xem tất cả hoạt động <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Charts Area */}
        <div className={`grid grid-cols-1 ${isMobile ? '' : 'lg:grid-cols-3'} gap-6`}>
          {/* Main Area Chart */}
          <div className={`${isMobile ? '' : 'lg:col-span-2'} bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-2xl p-6 shadow-xl hover:border-primary/20 transition-colors`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Hiệu suất Học tập</h3>
              <select className="bg-slate-100 dark:bg-dark-900 border border-slate-300 dark:border-dark-600 text-xs text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1 outline-none focus:border-primary">
                <option>6 tháng qua</option>
                <option>Năm nay</option>
              </select>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} domain={[0, 10]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="avgScore" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-2xl p-6 shadow-xl flex flex-col hover:border-primary/20 transition-colors">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Phân bổ Học viên</h3>
            <div className="flex-1 min-h-[300px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{students.length}</span>
                <span className="text-xs text-slate-500">Tổng số</span>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {statusData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm group">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full transition-transform group-hover:scale-125" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-white">{item.value}</span>
                    <span className="text-xs text-slate-500">({Math.round((item.value / students.length) * 100)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number | string; change: string; icon: any; color: string; isNegative?: boolean }> = ({
  title,
  value,
  change,
  icon: Icon,
  color,
  isNegative = false
}) => (
  <div className="bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-2xl p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${color.replace('bg-', 'from-')}/10 to-transparent -mr-6 -mt-6 rounded-full blur-2xl transition-opacity group-hover:opacity-70`}></div>
    
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h4>
      </div>
      <div className={`p-2 rounded-xl bg-opacity-20 ${color.replace('bg-', 'bg-opacity-20 ')}`}>
        <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2 relative z-10">
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${isNegative ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
        {change.startsWith('+') || change.startsWith('-') ? change : `+${change}`}
        {isNegative ? <TrendingUp className="w-3 h-3 rotate-180" /> : <TrendingUp className="w-3 h-3" />}
      </span>
      <span className="text-xs text-slate-500">so với tháng trước</span>
    </div>
  </div>
);

export default Dashboard;