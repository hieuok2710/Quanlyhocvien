import React from 'react';
import { LayoutDashboard, Users, BookOpen, Settings, LogOut, Hexagon, ClipboardCheck } from 'lucide-react';
import { ViewState, UserProfile } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  userProfile: UserProfile;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, userProfile }) => {
  
  // Define distinct color themes for each menu item
  const menuConfig: Record<string, { 
    color: string; 
    activeBg: string; 
    activeBorder: string; 
    activeShadow: string;
    hoverText: string;
  }> = {
    DASHBOARD: { 
      color: 'text-cyan-600 dark:text-cyan-400', 
      activeBg: 'bg-cyan-50 dark:bg-cyan-500/10', 
      activeBorder: 'border-cyan-200 dark:border-cyan-500/20', 
      activeShadow: 'shadow-cyan-500/20',
      hoverText: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400'
    },
    CLASSES: { 
      color: 'text-emerald-600 dark:text-emerald-400', 
      activeBg: 'bg-emerald-50 dark:bg-emerald-500/10', 
      activeBorder: 'border-emerald-200 dark:border-emerald-500/20', 
      activeShadow: 'shadow-emerald-500/20',
      hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
    },
    STUDENTS: { 
      color: 'text-pink-600 dark:text-pink-400', 
      activeBg: 'bg-pink-50 dark:bg-pink-500/10', 
      activeBorder: 'border-pink-200 dark:border-pink-500/20', 
      activeShadow: 'shadow-pink-500/20',
      hoverText: 'group-hover:text-pink-600 dark:group-hover:text-pink-400'
    },
    ATTENDANCE: { 
      color: 'text-violet-600 dark:text-violet-400', 
      activeBg: 'bg-violet-50 dark:bg-violet-500/10', 
      activeBorder: 'border-violet-200 dark:border-violet-500/20', 
      activeShadow: 'shadow-violet-500/20',
      hoverText: 'group-hover:text-violet-600 dark:group-hover:text-violet-400'
    },
    SETTINGS: { 
      color: 'text-amber-600 dark:text-amber-400', 
      activeBg: 'bg-amber-50 dark:bg-amber-500/10', 
      activeBorder: 'border-amber-200 dark:border-amber-500/20', 
      activeShadow: 'shadow-amber-500/20',
      hoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400'
    },
  };

  const menuItems = [
    { id: 'DASHBOARD', label: 'Thống kê', icon: LayoutDashboard },
    { id: 'CLASSES', label: 'Lớp học', icon: BookOpen },
    { id: 'STUDENTS', label: 'Học viên', icon: Users },
    { id: 'ATTENDANCE', label: 'Điểm danh', icon: ClipboardCheck },
    { id: 'SETTINGS', label: 'Cấu hình', icon: Settings },
  ];

  return (
    <div className="hidden md:flex h-screen w-60 bg-white dark:bg-[#0B1121] flex-col shadow-2xl z-20 relative overflow-hidden border-r border-slate-200 dark:border-white/5 transition-colors duration-300">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-50 to-transparent dark:from-indigo-900/20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-50 dark:bg-pink-900/20 blur-3xl pointer-events-none" />

      {/* Header - Compact */}
      <div className="p-5 flex items-center gap-3 relative z-10">
        <div className="relative">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Hexagon className="text-white w-5 h-5 fill-white/20" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#0B1121] rounded-full animate-pulse"></div>
        </div>
        <div>
          <h1 className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400 tracking-tight">
            EduNova
          </h1>
          <span className="text-[9px] text-slate-500 font-medium tracking-wider uppercase">Management</span>
        </div>
      </div>

      {/* Navigation - Compact */}
      <nav className="flex-1 px-2.5 space-y-1 mt-1 overflow-y-auto custom-scrollbar relative z-10">
        <p className="px-3 text-[10px] font-bold text-slate-500 dark:text-slate-600 uppercase tracking-wider mb-2">Menu Chính</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const theme = menuConfig[item.id];

          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? `${theme.activeBg} ${theme.color} shadow-sm dark:shadow-lg ${theme.activeShadow} border ${theme.activeBorder}`
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'
              }`}
            >
              {/* Active Indicator Line */}
              {isActive && (
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-current opacity-50`} />
              )}

              <Icon 
                className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? theme.color : `text-slate-400 dark:text-slate-500 ${theme.hoverText}`
                }`} 
              />
              <span className={`text-xs font-medium tracking-wide ${isActive ? '' : `text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200`}`}>
                {item.label}
              </span>
              
              {isActive && (
                <div className="ml-auto">
                  <div className="w-1 h-1 rounded-full bg-current animate-pulse shadow-[0_0_8px_currentColor]" />
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer - Compact */}
      <div className="p-3 mx-2 mb-3 mt-auto relative z-10">
        <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 border border-slate-200 dark:border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2">
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
            />
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{userProfile.name}</span>
              <span className="text-[10px] text-slate-500 truncate">{userProfile.role}</span>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-slate-500 dark:text-slate-400 hover:text-white bg-slate-200 dark:bg-black/20 hover:bg-rose-500 dark:hover:bg-rose-500/80 transition-all rounded-lg text-[10px] font-bold uppercase tracking-wide group">
            <LogOut className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;