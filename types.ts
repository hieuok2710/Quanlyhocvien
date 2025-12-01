
export enum StudentStatus {
  ACTIVE = 'Đang học',
  INACTIVE = 'Bảo lưu',
  GRADUATED = 'Tốt nghiệp',
  DROPPED = 'Thôi học'
}

export interface SubjectScore {
  id: string;
  subject: string;
  score: number;
  date: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'NONE';

export interface AttendanceRecord {
  [date: string]: AttendanceStatus;
}

export interface TuitionRecord {
  [month: string]: boolean; // Format "YYYY-MM"
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  avatar: string;
  classId: string;
  joinDate: string;
  status: StudentStatus;
  gpa: number;
  attendance: number; // Percentage
  attendanceRecord?: AttendanceRecord; // Detailed history
  tuitionPaid: boolean; // Current status
  tuitionRecord?: TuitionRecord; // Monthly history
  scores: SubjectScore[];
}

export interface ClassRoom {
  id: string;
  name: string;
  teacher: string;
  schedule: string;
  subject: string;
  studentCount: number;
  maxCapacity: number;
  image: string;
}

export type ViewState = 'DASHBOARD' | 'CLASSES' | 'STUDENTS' | 'ATTENDANCE' | 'SETTINGS';

export interface ChartData {
  name: string;
  value: number;
}

export interface MonthlyPerformance {
  month: string;
  avgScore: number;
  attendance: number;
}

export interface SystemSettings {
  itemsPerPage: number;
  enableNotifications: boolean;
  autoRefresh: boolean;
  themeMode: 'dark' | 'light';
  lastBackupDate?: string;
}

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  avatar: string;
}

// NEW: Interface for User Accounts (Auth)
export interface UserAccount extends UserProfile {
  id: string;
  password: string; // In a real app, this should be hashed. Storing plain for demo.
  isActive: boolean;
  createdAt: string;
}
