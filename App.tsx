
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import ClassManager from './components/ClassManager';
import AttendanceManager from './components/AttendanceManager';
import Settings from './components/Settings';
import FeedbackModal from './components/FeedbackModal';
import { Student, ClassRoom, ViewState, StudentStatus, SystemSettings, UserProfile, UserAccount } from './types';
import { MessageSquarePlus, Hexagon, ArrowRight, UserCircle, Mail, Lock, UserPlus, Eye, EyeOff, LogIn, BarChart2, Users, CalendarCheck, ShieldCheck, CheckCircle2 } from 'lucide-react';

// --- STORAGE KEY HELPERS ---
const getStorageKey = (prefix: string, email: string) => `${prefix}_${email}`;

const BASE_KEYS = {
  DATA: 'edunova_data',
  SETTINGS: 'edunova_settings',
  PROFILE: 'edunova_profile',
  USERS: 'edunova_users_db' // Global user database
};

// --- MOCK DATA GENERATION ---
const generateMockData = () => {
  const subjects = ['ReactJS', 'NodeJS', 'Database', 'UI/UX', 'Git/Agile'];

  const students: Student[] = Array.from({ length: 45 }, (_, i) => {
    const gpa = parseFloat((Math.random() * (10 - 4) + 4).toFixed(1));
    const scores = subjects.map((subj, idx) => ({
      id: `SCORE-${i}-${idx}`,
      subject: subj,
      score: Math.min(10, Math.max(0, parseFloat((gpa + (Math.random() * 3 - 1.5)).toFixed(1)))),
      date: '2023-10-15'
    }));

    return {
      id: `ST-${1000 + i}`,
      name: ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E', 'Đỗ Thị F'][i % 6] + ` ${i + 1}`,
      email: `student${i + 1}@edunova.edu.vn`,
      phone: `09${Math.floor(Math.random()*90000000 + 10000000)}`,
      dob: `200${Math.floor(Math.random()*5)}-${Math.floor(Math.random()*11)+1}-${Math.floor(Math.random()*28)+1}`,
      avatar: `https://picsum.photos/seed/${i}/200`,
      classId: ['Frontend Master: React & NextJS', 'Backend NodeJS Microservices', 'Python for Data Science AI'][i % 3], 
      joinDate: '2023-09-15',
      status: i % 10 === 0 ? StudentStatus.DROPPED : i % 5 === 0 ? StudentStatus.INACTIVE : StudentStatus.ACTIVE,
      gpa: gpa,
      attendance: Math.floor(Math.random() * (100 - 60) + 60),
      tuitionPaid: Math.random() > 0.3, 
      attendanceRecord: {},
      tuitionRecord: {},
      scores: scores
    };
  });

  const classes: ClassRoom[] = [
    {
      id: 'C1',
      name: 'Frontend Master: React & NextJS',
      teacher: 'Trần Minh Tuấn',
      schedule: 'T2 - T4 - T6 (18:30 - 21:00)',
      subject: 'Frontend',
      studentCount: 24,
      maxCapacity: 30,
      image: 'https://picsum.photos/seed/react/400/300'
    },
    {
      id: 'C2',
      name: 'Backend NodeJS Microservices',
      teacher: 'Lê Hoàng Nam',
      schedule: 'T3 - T5 - T7 (19:00 - 21:30)',
      subject: 'Backend',
      studentCount: 18,
      maxCapacity: 25,
      image: 'https://picsum.photos/seed/node/400/300'
    },
    {
      id: 'C3',
      name: 'Python for Data Science AI',
      teacher: 'Nguyễn Thị Lan',
      schedule: 'Cuối tuần (09:00 - 12:00)',
      subject: 'Data Science',
      studentCount: 28,
      maxCapacity: 30,
      image: 'https://picsum.photos/seed/python/400/300'
    },
    {
      id: 'C4',
      name: 'UI/UX Design Fundamentals',
      teacher: 'Phạm Hương Giang',
      schedule: 'T2 - T6 (18:00 - 20:30)',
      subject: 'Design',
      studentCount: 15,
      maxCapacity: 20,
      image: 'https://picsum.photos/seed/uiux/400/300'
    }
  ];

  return { students, classes };
};

// --- AUTH SCREEN COMPONENT ---
interface AuthScreenProps {
  onLogin: (email: string, pass: string) => Promise<boolean>;
  onRegister: (email: string, pass: string, name: string) => Promise<boolean>;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onRegister }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Feature Slider State
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      title: "Thống kê & Báo cáo Thông minh",
      desc: "Theo dõi hiệu suất đào tạo với biểu đồ trực quan realtime.",
      icon: BarChart2,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10"
    },
    {
      title: "Quản lý Học viên Toàn diện",
      desc: "Lưu trữ hồ sơ chi tiết, lịch sử điểm số và quá trình phát triển.",
      icon: Users,
      color: "text-purple-400",
      bg: "bg-purple-500/10"
    },
    {
      title: "Điểm danh & Học phí",
      desc: "Điểm danh nhanh chóng theo lịch học. Theo dõi trạng thái đóng học phí.",
      icon: CalendarCheck,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Phân quyền & Bảo mật",
      desc: "Hệ thống phân quyền chi tiết cho Admin và Giáo viên.",
      icon: ShieldCheck,
      color: "text-rose-400",
      bg: "bg-rose-500/10"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'LOGIN') {
        const success = await onLogin(formData.email, formData.password);
        if (!success) setError("Email hoặc mật khẩu không chính xác.");
      } else {
        // Validation
        if (formData.password !== formData.confirmPassword) {
          setError("Mật khẩu xác nhận không khớp.");
          setIsLoading(false);
          return;
        }
        if (formData.password.length < 6) {
           setError("Mật khẩu phải có ít nhất 6 ký tự.");
           setIsLoading(false);
           return;
        }
        const success = await onRegister(formData.email, formData.password, formData.name || formData.email.split('@')[0]);
        if (!success) setError("Email này đã được sử dụng.");
        else setMode('LOGIN'); 
      }
    } catch (err) {
      setError("Đã xảy ra lỗi hệ thống.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 lg:p-0 relative overflow-hidden font-sans">
      
      {/* GLOBAL BACKGROUND EFFECTS (Full Screen) */}
      <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      {/* CENTERED CARD CONTAINER */}
      <div className="relative z-10 w-full max-w-5xl h-auto lg:h-[600px] flex rounded-3xl shadow-2xl">
         
         {/* THE GLOWING/BLINKING FRAME EFFECT */}
         <div className="absolute -inset-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-75 blur-md animate-pulse"></div>
         
         {/* INNER CARD CONTENT */}
         <div className="relative flex flex-col lg:flex-row w-full h-full bg-white dark:bg-slate-950 rounded-3xl overflow-hidden border border-slate-700/50">
            
            {/* LEFT SIDE: BANNER */}
            <div className="hidden lg:flex w-5/12 relative bg-slate-900 overflow-hidden flex-col justify-between p-10 border-r border-slate-800">
              {/* Background for Banner part */}
              <div className="absolute inset-0 bg-slate-900/50 z-0"></div>

              {/* Logo Area */}
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <Hexagon className="text-white w-6 h-6 fill-white/20" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">EduNova</h1>
                    <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Management System</p>
                </div>
              </div>

              {/* Feature Slider */}
              <div className="relative z-10 flex-1 flex flex-col justify-center py-8">
                {features.map((feature, idx) => (
                  <div 
                    key={idx}
                    className={`transition-all duration-700 absolute w-full ${
                      idx === currentFeature 
                        ? 'opacity-100 translate-x-0 relative' 
                        : 'opacity-0 -translate-x-8 absolute pointer-events-none'
                    }`}
                  >
                      <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 border border-white/5`}>
                        <feature.icon className={`w-6 h-6 ${feature.color}`} />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-3 leading-tight">{feature.title}</h2>
                      <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>

              {/* Indicators */}
              <div className="relative z-10 flex gap-2">
                {features.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentFeature(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentFeature ? 'w-6 bg-indigo-500' : 'w-1.5 bg-slate-700 hover:bg-slate-600'}`}
                    />
                ))}
              </div>
            </div>

            {/* RIGHT SIDE: FORM */}
            <div className="w-full lg:w-7/12 flex items-center justify-center p-8 sm:p-12 relative bg-white dark:bg-slate-950">
              <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {mode === 'LOGIN' ? 'Đăng nhập hệ thống' : 'Tạo tài khoản mới'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {mode === 'LOGIN' ? 'Chào mừng bạn quay trở lại EduNova' : 'Đăng ký để quản lý lớp học hiệu quả'}
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-lg flex items-center gap-3 animate-slide-up">
                    <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0" />
                    <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'REGISTER' && (
                    <div className="space-y-1 animate-slide-up">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email đăng nhập</label>
                      <div className="relative group">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="name@company.com"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white pl-10 pr-4 py-2.5 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {mode === 'REGISTER' && (
                    <div className="space-y-1 animate-slide-up">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Mật khẩu</label>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                          type={showPass ? "text" : "password"} 
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white pl-10 pr-10 py-2.5 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                          required
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                        >
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {mode === 'REGISTER' && (
                    <div className="space-y-1 animate-slide-up">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Xác nhận mật khẩu</label>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                          type={showPass ? "text" : "password"} 
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white pl-10 pr-4 py-2.5 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {mode === 'REGISTER' && (
                    <div className="space-y-1 animate-slide-up">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tên hiển thị (Tùy chọn)</label>
                      <div className="relative group">
                        <UserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Nguyễn Văn A"
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white pl-10 pr-4 py-2.5 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {mode === 'LOGIN' && (
                    <>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email</label>
                          <div className="relative group">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input 
                              type="email" 
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              placeholder="admin@gmail.com"
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white pl-10 pr-4 py-2.5 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Mật khẩu</label>
                            <button type="button" className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">Quên mật khẩu?</button>
                          </div>
                          <div className="relative group">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input 
                              type={showPass ? "text" : "password"} 
                              value={formData.password}
                              onChange={(e) => setFormData({...formData, password: e.target.value})}
                              placeholder="••••••••"
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white pl-10 pr-10 py-2.5 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                              required
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowPass(!showPass)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                            >
                              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                    </>
                  )}

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        {mode === 'LOGIN' ? 'Đăng nhập' : 'Tạo tài khoản'} <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-white dark:bg-slate-950 px-2 text-slate-400">Hoặc</span></div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {mode === 'LOGIN' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                    <button 
                      onClick={() => {
                        setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN');
                        setError(null);
                        setFormData({ email: '', password: '', confirmPassword: '', name: '' });
                      }}
                      className="text-indigo-600 dark:text-indigo-400 font-bold ml-1 hover:underline transition-all"
                    >
                      {mode === 'LOGIN' ? 'Đăng ký ngay' : 'Đăng nhập'}
                    </button>
                  </p>
                </div>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};

// --- APP COMPONENT ---
const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const savedUser = localStorage.getItem('edunova_current_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Global Users State (Simulating DB)
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);

  // Data States
  const [data, setData] = useState<{ students: Student[], classes: ClassRoom[] } | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    // Load users from local storage or initialize default Admin
    const savedUsers = localStorage.getItem(BASE_KEYS.USERS);
    if (savedUsers) {
      setAllUsers(JSON.parse(savedUsers));
    } else {
      const adminUser: UserAccount = {
        id: 'ADMIN-001',
        name: 'Super Admin',
        email: 'admin@gmail.com',
        password: 'admin##', // Plaintext for demo only
        role: 'Quản trị viên cấp cao',
        avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=6366f1&color=fff&bold=true',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      const initialUsers = [adminUser];
      setAllUsers(initialUsers);
      localStorage.setItem(BASE_KEYS.USERS, JSON.stringify(initialUsers));
    }
  }, []);

  // Sync users to storage whenever they change
  useEffect(() => {
    if (allUsers.length > 0) {
      localStorage.setItem(BASE_KEYS.USERS, JSON.stringify(allUsers));
    }
  }, [allUsers]);

  // --- AUTH LOGIC ---
  const handleRegister = async (email: string, pass: string, name: string): Promise<boolean> => {
    // Check if email exists
    if (allUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return false;
    }

    const newUser: UserAccount = {
      id: `USER-${Date.now()}`,
      name: name,
      email: email,
      password: pass,
      role: 'Giáo viên', // Default role
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setAllUsers(prev => [...prev, newUser]);
    alert("Đăng ký thành công! Vui lòng đăng nhập.");
    return true;
  };

  const handleLogin = async (email: string, pass: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
    
    if (user) {
      if (!user.isActive) {
        alert("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.");
        return false;
      }
      localStorage.setItem('edunova_current_user', JSON.stringify(user));
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    // 1. Clear Local Storage Session
    localStorage.removeItem('edunova_current_user');

    // 2. Clear All App States immediately to force re-render to AuthScreen
    // This is more reliable than window.location.reload() in many environments
    setCurrentUser(null);
    setData(null);
    setSettings(null);
    setCurrentView('DASHBOARD');
  };

  // --- ADMIN USER MANAGEMENT LOGIC ---
  const handleAddUser = (user: UserAccount) => {
    if (allUsers.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
      alert("Email đã tồn tại!");
      return;
    }
    setAllUsers(prev => [...prev, user]);
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    // If Admin updates themselves, update session
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem('edunova_current_user', JSON.stringify(updatedUser));
    }
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = allUsers.find(u => u.id === userId);
    if (userToDelete?.email === 'admin@gmail.com') {
      alert("Không thể xóa tài khoản Admin mặc định!");
      return;
    }
    setAllUsers(prev => prev.filter(u => u.id !== userId));
  };

  // --- DATA LOADING & SYNC LOGIC ---
  // When currentUser changes, load THEIR data
  useEffect(() => {
    if (currentUser) {
      const email = currentUser.email;

      // 1. Load Data
      const dataKey = getStorageKey(BASE_KEYS.DATA, email);
      const savedData = localStorage.getItem(dataKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // --- DATA CLEANUP SCRIPT ---
        // Yêu cầu: Xóa học viên "Ngô Thị Lệ 19"
        // Kiểm tra và xóa nếu tồn tại trong dữ liệu đã lưu
        const targetName = "Ngô Thị Lệ 19";
        if (parsedData.students && parsedData.students.some((s: any) => s.name === targetName)) {
            parsedData.students = parsedData.students.filter((s: any) => s.name !== targetName);
            localStorage.setItem(dataKey, JSON.stringify(parsedData)); // Cập nhật lại kho lưu trữ
        }
        // ---------------------------

        setData(parsedData);
      } else {
        // First time for this user? Generate Mock Data
        const mock = generateMockData();
        setData(mock);
        localStorage.setItem(dataKey, JSON.stringify(mock));
      }

      // 2. Load Settings
      const settingsKey = getStorageKey(BASE_KEYS.SETTINGS, email);
      const savedSettings = localStorage.getItem(settingsKey);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      } else {
        // Default settings
        const defaultSettings: SystemSettings = {
          itemsPerPage: 10,
          enableNotifications: true,
          autoRefresh: false,
          themeMode: 'light',
          lastBackupDate: ''
        };
        setSettings(defaultSettings);
        localStorage.setItem(settingsKey, JSON.stringify(defaultSettings));
      }
      
      // 3. Update Profile from Storage (in case they changed avatar in settings)
      const profileKey = getStorageKey(BASE_KEYS.PROFILE, email);
      const savedProfile = localStorage.getItem(profileKey);
      if (savedProfile) {
        const fullProfile = JSON.parse(savedProfile);
        // Merge with current session info just in case
        setCurrentUser(prev => ({ ...prev!, ...fullProfile }));
      }

    } else {
      // No user, reset theme
      document.documentElement.classList.remove('dark');
    }
  }, [currentUser?.email]); // Only re-run if email changes (login/switch user)

  // --- DATA PERSISTENCE ---
  // Save Data whenever it changes (only if user logged in)
  useEffect(() => {
    if (currentUser && data) {
      const key = getStorageKey(BASE_KEYS.DATA, currentUser.email);
      localStorage.setItem(key, JSON.stringify(data));
    }
  }, [data, currentUser]);

  // Save Settings & Theme
  useEffect(() => {
    if (currentUser && settings) {
      const key = getStorageKey(BASE_KEYS.SETTINGS, currentUser.email);
      localStorage.setItem(key, JSON.stringify(settings));
      
      // Apply Theme
      if (settings.themeMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings, currentUser]);

  // Save Profile Changes
  useEffect(() => {
    if (currentUser) {
      const key = getStorageKey(BASE_KEYS.PROFILE, currentUser.email);
      localStorage.setItem(key, JSON.stringify(currentUser));
      // Also update session storage
      localStorage.setItem('edunova_current_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);


  // --- HANDLERS ---
  const handleSaveSettings = (newSettings: SystemSettings) => setSettings(newSettings);
  const handleUpdateProfile = (newProfile: UserProfile) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...newProfile };
      setCurrentUser(updatedUser);
      // Also update in the global user list
      setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    }
  };
  
  const handleAddStudent = (newStudent: Student) => {
    setData(prev => prev ? ({ ...prev, students: [newStudent, ...prev.students] }) : prev);
  };
  const handleUpdateStudent = (updatedStudent: Student) => {
    setData(prev => prev ? ({ ...prev, students: prev.students.map(s => s.id === updatedStudent.id ? updatedStudent : s) }) : prev);
  };
  const handleDeleteStudent = (studentId: string) => {
    setData(prev => prev ? ({ ...prev, students: prev.students.filter(s => s.id !== studentId) }) : prev);
  };
  const handleBatchUpdateStudents = (updatedStudents: Student[]) => {
    setData(prev => {
      if (!prev) return prev;
      const updatesMap = new Map(updatedStudents.map(s => [s.id, s]));
      const newStudents = prev.students.map(s => updatesMap.has(s.id) ? updatesMap.get(s.id)! : s);
      return { ...prev, students: newStudents };
    });
  };
  const handleAddClass = (newClass: ClassRoom) => {
    setData(prev => prev ? ({ ...prev, classes: [newClass, ...prev.classes] }) : prev);
  };
  const handleDeleteClass = (classId: string) => {
    setData(prev => {
      if (!prev) return prev;
      const deletedClass = prev.classes.find(c => c.id === classId);
      return {
        ...prev,
        classes: prev.classes.filter(c => c.id !== classId),
        students: prev.students.map(s => (s.classId === classId || (deletedClass && s.classId === deletedClass.name)) ? { ...s, classId: '' } : s)
      };
    });
  };
  const handleUpdateStudentClass = (studentId: string, newClassId: string) => {
    setData(prev => prev ? ({ ...prev, students: prev.students.map(s => s.id === studentId ? { ...s, classId: newClassId } : s) }) : prev);
  };

  const handleRestoreData = (backupData: any) => {
    try {
      const newData = {
        students: Array.isArray(backupData.students) ? backupData.students : (data?.students || []),
        classes: Array.isArray(backupData.classes) ? backupData.classes : (data?.classes || [])
      };
      setData(newData);
      if (backupData.settings) setSettings(prev => ({ ...prev!, ...backupData.settings }));
      if (backupData.profile) setCurrentUser(prev => ({ ...prev!, ...backupData.profile }));
    } catch (error) {
      alert("Khôi phục thất bại.");
    }
  };

  // --- RENDER ---
  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} />;
  }

  // Show loading if logged in but data fetching is pending
  if (!data || !settings) {
     return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <span className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
     </div>;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD': return <Dashboard students={data.students} />;
      case 'STUDENTS': return <StudentList students={data.students} itemsPerPage={settings.itemsPerPage} onAddStudent={handleAddStudent} onUpdateStudent={handleUpdateStudent} onDeleteStudent={handleDeleteStudent} userRole={currentUser.role} />;
      case 'CLASSES': return <ClassManager classes={data.classes} students={data.students} onAddClass={handleAddClass} onAddStudent={handleAddStudent} onUpdateStudentClass={handleUpdateStudentClass} onDeleteClass={handleDeleteClass} userRole={currentUser.role} />;
      case 'ATTENDANCE': return <AttendanceManager students={data.students} classes={data.classes} onSave={handleBatchUpdateStudents} />;
      case 'SETTINGS': return (
        <Settings 
          settings={settings} 
          onSave={handleSaveSettings} 
          userProfile={currentUser} 
          onUpdateProfile={handleUpdateProfile} 
          data={data} 
          onRestore={handleRestoreData}
          // Admin Props
          allUsers={allUsers}
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          onLogout={handleLogout}
        />
      );
      default: return <Dashboard students={data.students} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300">
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        userProfile={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white dark:from-indigo-900/10 dark:via-dark-950 dark:to-dark-950 transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-50" />
        <div className="flex-1 overflow-hidden relative pb-20 md:pb-0">
          {renderContent()}
        </div>
      </main>

      <div className="fixed z-[100] flex flex-col gap-3 bottom-24 md:bottom-6 right-6">
        <button
          onClick={() => setIsFeedbackOpen(true)}
          className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-full shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-110 hover:-rotate-12 transition-all duration-300 group border-2 border-white/20"
        >
          <MessageSquarePlus className="w-5 h-5" />
        </button>
      </div>

      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)}
        userEmail={currentUser.email}
      />
    </div>
  );
};

export default App;
