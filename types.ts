

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