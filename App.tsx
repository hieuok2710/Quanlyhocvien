import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentList from './components/StudentList';
import ClassManager from './components/ClassManager';
import AttendanceManager from './components/AttendanceManager';
import Settings from './components/Settings';
import FeedbackModal from './components/FeedbackModal';
import { Student, ClassRoom, ViewState, StudentStatus, SystemSettings, UserProfile } from './types';
import { MessageSquarePlus } from 'lucide-react';

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

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [data, setData] = useState<{ students: Student[], classes: ClassRoom[] }>({ students: [], classes: [] });
  
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

  // ROBUST STATE UPDATE FOR CLASS ASSIGNMENT
  const handleUpdateStudentClass = (studentId: string, newClassId: string) => {
    console.log(`Updating student ${studentId} to class: "${newClassId}"`);
    setData(prev => {
      // Create a fresh array copy to ensure React detects the change
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
        // Clean up student class references when a class is deleted
        students: prev.students.map(s => {
          if (s.classId === classId || (deletedClass && s.classId === deletedClass.name)) {
            return { ...s, classId: '' }; // Reset to free student
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

  // Restore Handler - UPDATED: Robust Atomic Update
  const handleRestoreData = (backupData: any) => {
    try {
      console.log("Restoring backup data:", backupData);
      
      // Update Data (Students & Classes) in one go
      setData(prev => ({
        students: Array.isArray(backupData.students) ? backupData.students : prev.students,
        classes: Array.isArray(backupData.classes) ? backupData.classes : prev.classes
      }));

      // Update Settings if available
      if (backupData.settings) {
        setSettings(prev => ({ ...prev, ...backupData.settings }));
      }

      // Update Profile if available
      if (backupData.profile) {
        setUserProfile(prev => ({ ...prev, ...backupData.profile }));
      }
    } catch (error) {
      console.error("Error restoring data in App:", error);
      alert("Đã xảy ra lỗi khi khôi phục dữ liệu. Vui lòng kiểm tra file backup.");
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard students={data.students} />;
      case 'STUDENTS':
        return (
          <StudentList 
            students={data.students} 
            itemsPerPage={settings.itemsPerPage} 
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            userRole={userProfile.role}
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
          />
        );
      case 'ATTENDANCE':
        return (
          <AttendanceManager 
            students={data.students} 
            classes={data.classes}
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
          />
        );
      default:
        return <Dashboard students={data.students} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        userProfile={userProfile}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white dark:from-indigo-900/10 dark:via-dark-950 dark:to-dark-950 transition-colors duration-300">
        {/* Optional decorative blur elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-50" />
        
        <div className="flex-1 overflow-hidden relative">
          {renderContent()}
        </div>

        {/* Global Feedback Button */}
        <button
          onClick={() => setIsFeedbackOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-full shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-110 hover:-rotate-12 transition-all duration-300 group"
          title="Gửi phản hồi / Báo lỗi"
        >
          <MessageSquarePlus className="w-6 h-6" />
        </button>
      </main>

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)}
        userEmail={userProfile.email}
      />
    </div>
  );
};

export default App;