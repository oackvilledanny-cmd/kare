
export interface Center {
  id: string;
  name: string;
  address: string;
  licenseNumber: string;
  totalCapacity: number;
  status: 'Active' | 'Under Review' | 'Closed';
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface AttendanceRecord {
  timestamp: string;
  type: 'IN' | 'OUT';
}

export interface Child {
  id: string;
  name: string;
  age: number;
  classroom: string;
  status: 'Checked-in' | 'Checked-out' | 'Absent';
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  emergencyContact: EmergencyContact;
  allergies: string[];
  lastActivity?: string;
  attendanceHistory: AttendanceRecord[];
}

export interface PerformanceSnapshot {
  date: string;
  score: number;
}

export type AbsenceStatus = 'Pending' | 'Approved' | 'Denied';
export type AbsenceCategory = 'Sick' | 'Vacation' | 'Personal' | 'Other';

export interface AbsenceRequest {
  id: string;
  staffId: string;
  staffName: string;
  type: AbsenceCategory;
  startDate: string;
  endDate: string;
  reason: string;
  status: AbsenceStatus;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface DayAvailability {
  morning: boolean;
  afternoon: boolean;
  morningPreferred?: boolean;
  afternoonPreferred?: boolean;
}

export type StaffAvailability = Record<DayOfWeek, DayAvailability>;

export interface Staff {
  id: string;
  name: string;
  role: 'Teacher' | 'Assistant' | 'Admin';
  performanceScore: number;
  performanceHistory: PerformanceSnapshot[];
  notes: string[];
  hourlyRate: number;
  totalHours: number;
  bonusAmount?: number;
  vacationDaysUsed: number;
  sickDaysUsed: number;
  availability: StaffAvailability;
  isOnDuty: boolean;
  lastStatusChange?: string;
  attendanceHistory: AttendanceRecord[];
  certifications: string[];
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  enrolled: number;
  ratio: string;
}

export interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  classroom: string;
  startTime: string;
  endTime: string;
}

export interface Activity {
  id: string;
  childId: string;
  childName: string;
  type: 'Meal' | 'Nap' | 'Diaper' | 'Learning';
  description: string;
  timestamp: string;
}

export interface Financials {
  revenue: number;
  expenses: number;
  netProfit: number;
  pendingInvoices: number;
}

export interface AIActivityReport {
  summary: string;
  mood: string;
  skills: string[];
  socialInteractions: string[];
  recommendation: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'High' | 'Normal';
  author: string;
}

export interface CenterEvent {
  id: string;
  title: string;
  date: string;
  type: 'Closure' | 'Holiday' | 'Event';
  description?: string;
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  CHILDREN = 'CHILDREN',
  STAFF = 'STAFF',
  CLASSROOMS = 'CLASSROOMS',
  SHIFT_MANAGEMENT = 'SHIFT_MANAGEMENT',
  FINANCE = 'FINANCE',
  COMPLIANCE = 'COMPLIANCE',
  CENTERS = 'CENTERS',
  BULLETIN = 'BULLETIN'
}

export type AppRole = 'Owner' | 'Admin' | 'Staff' | 'Parent';
