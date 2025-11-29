import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import ClassManager from './components/ClassManager';
import AttendanceManager from './components/AttendanceManager';
import Settings from './components/Settings';
import FeedbackModal from './components/FeedbackModal';
import { Student, ClassRoom, ViewState, StudentStatus, SystemSettings, UserProfile } from './types';
import { MessageSquarePlus, Smartphone, Monitor } from 'lucide-react';

// Mock Data Generation
const generateMockData = () => {
  const subjects = ['ReactJS', 'NodeJS', 'Database', 'UI/UX', 'Git/Agile'];

  const students: Student[] = Array.from({ length: 45 }, (_, i) => {
    const gpa = parseFloat((Math.random() * (10 - 4) + 4).toFixed(1));
    // Generate scores that roughly average to GPA
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
      // NOTE: Mock data uses Class Names for linking, not Class IDs.
      classId: ['Frontend Master: React & NextJS', 'Backend NodeJS Microservices', 'Python for Data Science AI'][i % 3], 
      joinDate: '2023-09-15',
      status: i % 10 === 0 ? StudentStatus.DROPPED : i % 5 === 0 ? StudentStatus.INACTIVE : StudentStatus.ACTIVE,
      gpa: gpa,
      attendance: Math.floor(Math.random() * (100 - 60) + 60),
      tuitionPaid: Math.random() > 0.3, // 70% students paid
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

// APP WRAPPER: Handles Desktop vs Mobile Simulator Layouts
interface AppWrapperProps {
  children: React.ReactNode;
  isMobileMode: boolean;
}

const AppWrapper: React.FC<AppWrapperProps> = ({ children, isMobileMode }) => {
  if (isMobileMode) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="relative w-[375px] h-[812px] bg-white dark:bg-dark-950 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border-[8px] border-slate-800 overflow-hidden flex flex-col ring-4 ring-slate-700">
           {/* Notch */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-800 rounded-b-2xl z-50 flex items-center justify-center gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-600/50"></div>
              <div className="w-12 h-1.5 rounded-full bg-slate-600/50"></div>
           </div>
           
           {/* Status Bar Shim */}
           <div className="h-8 w-full bg-transparent shrink-0"></div>

           {/* Phone Content */}
           <div className="flex-1 flex flex-col overflow-hidden relative bg-slate-50 dark:bg-dark-950">
              {children}
           </div>

           {/* Home Indicator */}
           <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-900/20 dark:bg-white/20 rounded-full z-50"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300">
      {children}
    </div>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [data, setData] = useState<{ students: Student[], classes: ClassRoom[] }>({ students: [], classes: [] });
  
  // DEVICE SIMULATOR STATE
  const [isMobileMode, setIsMobileMode] = useState(false);

  // System Configuration State
  const [settings, setSettings] = useState<SystemSettings>({
    itemsPerPage: 10,
    enableNotifications: true,
    autoRefresh: false,
    themeMode: 'light',
    lastBackupDate: '2023-10-25 14:30'
  });

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Admin User',
    role: 'Super Administrator',
    email: 'admin@edunova.edu.vn',
    avatar: 'https://picsum.photos/100/100'
  });

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    const mockData = generateMockData();
    setData(mockData);
  }, []);

  // Theme Toggling Effect
  useEffect(() => {
    if (settings.themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.themeMode]);

  const handleSaveSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
  };

  const handleAddStudent = (newStudent: Student) => {
    setData(prev => ({
      ...prev,
      students: [newStudent, ...prev.students]
    }));
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setData(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === updatedStudent.id ? updatedStudent : s)
    }));
  };

  const handleAddClass = (newClass: ClassRoom) => {
    setData(prev => ({
      ...prev,
      classes: [newClass, ...prev.classes]
    }));
  };

  const handleUpdateStudentClass = (studentId: string, newClassId: string) => {
    console.log(`Updating student ${studentId} to class: "${newClassId}"`);
    setData(prev => {
      const newStudents = prev.students.map(s => {
        if (s.id === studentId) {
          return { ...s, classId: newClassId };
        }
        return s;
      });

      return {
        ...prev,
        students: newStudents
      };
    });
  };

  const handleDeleteClass = (classId: string) => {
    setData(prev => {
      const deletedClass = prev.classes.find(c => c.id === classId);
      return {
        ...prev,
        classes: prev.classes.filter(c => c.id !== classId),
        students: prev.students.map(s => {
          if (s.classId === classId || (deletedClass && s.classId === deletedClass.name)) {
            return { ...s, classId: '' };
          }
          return s;
        })
      };
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    setData(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== studentId)
    }));
  };

  const handleRestoreData = (backupData: any) => {
    try {
      console.log("Restoring backup data:", backupData);
      setData(prev => ({
        students: Array.isArray(backupData.students) ? backupData.students : prev.students,
        classes: Array.isArray(backupData.classes) ? backupData.classes : prev.classes
      }));

      if (backupData.settings) {
        setSettings(prev => ({ ...prev, ...backupData.settings }));
      }

      if (backupData.profile) {
        setUserProfile(prev => ({ ...prev, ...backupData.profile }));
      }
    } catch (error) {
      console.error("Error restoring data in App:", error);
      alert("Đã xảy ra lỗi khi khôi phục dữ liệu. Vui lòng kiểm tra file backup.");
    }
  };

  const renderContent = () => {
    const props = { isMobile: isMobileMode };
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard students={data.students} {...props} />;
      case 'STUDENTS':
        return (
          <StudentList 
            students={data.students} 
            itemsPerPage={settings.itemsPerPage} 
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            userRole={userProfile.role}
            {...props}
          />
        );
      case 'CLASSES':
        return (
          <ClassManager 
            classes={data.classes} 
            students={data.students}
            onAddClass={handleAddClass}
            onAddStudent={handleAddStudent}
            onUpdateStudentClass={handleUpdateStudentClass}
            onDeleteClass={handleDeleteClass}
            userRole={userProfile.role}
            {...props}
          />
        );
      case 'ATTENDANCE':
        return (
          <AttendanceManager 
            students={data.students} 
            classes={data.classes}
            {...props}
          />
        );
      case 'SETTINGS':
        return (
          <Settings 
            settings={settings} 
            onSave={handleSaveSettings} 
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            data={data}
            onRestore={handleRestoreData}
            {...props}
          />
        );
      default:
        return <Dashboard students={data.students} {...props} />;
    }
  };

  return (
    <>
      {/* Device Toggle Button (Fixed Position) */}
      <button
        onClick={() => setIsMobileMode(!isMobileMode)}
        className="fixed top-4 right-4 z-[9999] p-3 rounded-full bg-white dark:bg-dark-800 text-slate-700 dark:text-slate-200 shadow-xl border border-slate-200 dark:border-dark-700 hover:scale-110 transition-transform group"
        title={isMobileMode ? "Switch to Desktop View" : "Switch to Mobile App Simulator"}
      >
        {isMobileMode ? <Monitor className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-dark-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {isMobileMode ? "Giao diện Máy tính" : "Giao diện Mobile"}
        </span>
      </button>

      <AppWrapper isMobileMode={isMobileMode}>
        {/* SIDEBAR */}
        <Sidebar 
          currentView={currentView} 
          onChangeView={setCurrentView} 
          userProfile={userProfile}
          isMobile={isMobileMode} 
        />

        {/* MAIN CONTENT */}
        <main className={`flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white dark:from-indigo-900/10 dark:via-dark-950 dark:to-dark-950 transition-colors duration-300 ${isMobileMode ? 'pb-20' : 'pb-20 md:pb-0'}`}>
          {!isMobileMode && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-50" />}
          
          <div className="flex-1 overflow-hidden relative">
            {renderContent()}
          </div>
        </main>

        {/* FEEDBACK BUTTON */}
        <div className={`fixed z-[100] flex flex-col gap-3 ${isMobileMode ? 'bottom-20 right-4' : 'bottom-24 md:bottom-6 right-6'}`}>
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="p-3 md:p-4 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-full shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-110 hover:-rotate-12 transition-all duration-300 group border-2 border-white/20"
            title="Gửi phản hồi / Báo lỗi"
          >
            <MessageSquarePlus className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <FeedbackModal 
          isOpen={isFeedbackOpen} 
          onClose={() => setIsFeedbackOpen(false)}
          userEmail={userProfile.email}
        />
      </AppWrapper>
    </>
  );
};

export default App;