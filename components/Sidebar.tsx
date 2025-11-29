import React from 'react';
import { LayoutDashboard, Users, BookOpen, Settings, LogOut, Hexagon, ClipboardCheck } from 'lucide-react';
import { ViewState, UserProfile } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  userProfile: UserProfile;
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, userProfile, isMobile = false }) => {
  
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

  // MOBILE BOTTOM NAVIGATION
  if (isMobile) {
    return (
      <div className="bg-white dark:bg-dark-900 border-t border-slate-200 dark:border-dark-700 px-4 pb-4 pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-30 shrink-0">
        <div className="flex justify-between items-end">
           {menuItems.map((item) => {
             const Icon = item.icon;
             const isActive = currentView === item.id;
             const theme = menuConfig[item.id];
             
             return (
               <button
                 key={item.id}
                 onClick={() => onChangeView(item.id as ViewState)}
                 className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative ${isActive ? '-translate-y-2' : ''}`}
               >
                 <div className={`p-2 rounded-xl transition-all ${
                    isActive 
                      ? `${theme.activeBg} ${theme.color} shadow-lg ${theme.activeShadow} ring-1 ${theme.activeBorder}` 
                      : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-dark-800'
                 }`}>
                    <Icon className="w-5 h-5" />
                 </div>
                 <span className={`text-[10px] font-bold tracking-wide transition-colors ${
                    isActive ? theme.color : 'text-slate-400 dark:text-slate-500'
                 }`}>
                   {item.label}
                 </span>
               </button>
             );
           })}
        </div>
      </div>
    );
  }

  // DESKTOP SIDEBAR
  return (
    <div className="h-screen w-72 bg-white dark:bg-[#0B1121] flex flex-col shadow-2xl z-20 relative overflow-hidden border-r border-slate-200 dark:border-white/5 transition-colors duration-300">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-50 to-transparent dark:from-indigo-900/20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-50 dark:bg-pink-900/20 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="p-8 flex items-center gap-3 relative z-10">
        <div className="relative">
           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Hexagon className="text-white w-6 h-6 fill-white/20" />
           </div>
           <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#0B1121] rounded-full animate-pulse"></div>
        </div>
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400 tracking-tight">
            EduNova
          </h1>
          <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Management</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto custom-scrollbar relative z-10">
        <p className="px-4 text-xs font-bold text-slate-500 dark:text-slate-600 uppercase tracking-wider mb-2">Menu Chính</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const theme = menuConfig[item.id];

          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? `${theme.activeBg} ${theme.color} shadow-sm dark:shadow-lg ${theme.activeShadow} border ${theme.activeBorder}`
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'
              }`}
            >
              {/* Active Indicator Line */}
              {isActive && (
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-current opacity-50`} />
              )}

              <Icon 
                className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? theme.color : `text-slate-400 dark:text-slate-500 ${theme.hoverText}`
                }`} 
              />
              <span className={`font-medium tracking-wide ${isActive ? '' : `text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200`}`}>
                {item.label}
              </span>
              
              {isActive && (
                <div className="ml-auto">
                  <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shadow-[0_0_8px_currentColor]" />
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 mx-4 mb-6 mt-auto relative z-10">
        <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 object-cover"
            />
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{userProfile.name}</span>
              <span className="text-sm text-slate-500 truncate">{userProfile.role}</span>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-white bg-slate-200 dark:bg-black/20 hover:bg-rose-500 dark:hover:bg-rose-500/80 transition-all rounded-xl text-xs font-bold uppercase tracking-wide group">
            <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;