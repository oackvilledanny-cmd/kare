
import { Child, Staff, Classroom, Shift, AbsenceRequest, StaffAvailability, Center, AttendanceRecord, AppRole, ViewMode, Announcement, CenterEvent } from './types';

export const ROLE_CONFIG: Record<AppRole, { label: string; color: string; icon: string; description: string }> = {
  Owner: { label: 'Director / Owner', color: 'bg-purple-600', icon: '👑', description: 'Full access to financial reports, center management, and compliance.' },
  Admin: { label: 'Administrator', color: 'bg-blue-600', icon: '🛡️', description: 'Manage staff, rosters, shifts, and day-to-day operations.' },
  Staff: { label: 'Staff / Educator', color: 'bg-emerald-600', icon: '🍎', description: 'View shifts, manage classroom attendance, and log activities.' },
  Parent: { label: 'Parent / Guardian', color: 'bg-orange-500', icon: '🏡', description: 'View child updates, attendance, and pay invoices.' },
};

export const ROLE_MENUS: Record<AppRole, ViewMode[]> = {
  Owner: [
    ViewMode.DASHBOARD, ViewMode.CHILDREN, ViewMode.STAFF, ViewMode.CLASSROOMS, 
    ViewMode.SHIFT_MANAGEMENT, ViewMode.FINANCE, ViewMode.COMPLIANCE, ViewMode.CENTERS, ViewMode.BULLETIN
  ],
  Admin: [
    ViewMode.DASHBOARD, ViewMode.CHILDREN, ViewMode.STAFF, ViewMode.CLASSROOMS, 
    ViewMode.SHIFT_MANAGEMENT, ViewMode.FINANCE, ViewMode.COMPLIANCE, ViewMode.CENTERS, ViewMode.BULLETIN
  ],
  Staff: [
    ViewMode.CHILDREN, ViewMode.STAFF, ViewMode.CLASSROOMS, ViewMode.SHIFT_MANAGEMENT, ViewMode.BULLETIN
  ],
  Parent: [
    ViewMode.CHILDREN, ViewMode.BULLETIN, ViewMode.FINANCE
  ]
};

export const MOCK_CENTERS: Center[] = [
  { 
    id: 'center-1', 
    name: 'North York Campus', 
    address: '123 Finch Ave W, North York, ON', 
    licenseNumber: 'ON-99283-A', 
    totalCapacity: 120, 
    status: 'Active' 
  },
  { 
    id: 'center-2', 
    name: 'Markham Elite', 
    address: '88 Town Centre Blvd, Markham, ON', 
    licenseNumber: 'ON-44120-B', 
    totalCapacity: 80, 
    status: 'Active' 
  }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { 
    id: 'a1', 
    title: 'Registration for Summer Camp', 
    content: 'Registration for the 2024 Summer Program opens next Monday. Spots are limited!', 
    date: '2024-05-18', 
    priority: 'Normal', 
    author: 'Admin Team' 
  },
  { 
    id: 'a2', 
    title: 'Center Closure: Victoria Day', 
    content: 'Please be reminded that the center will be closed on Monday, May 20th for Victoria Day.', 
    date: '2024-05-15', 
    priority: 'High', 
    author: 'Director' 
  },
  {
    id: 'a3',
    title: 'New Parking Policy',
    content: 'For safety reasons, please do not idle your cars in the drop-off zone for more than 5 minutes.',
    date: '2024-05-10',
    priority: 'Normal',
    author: 'Admin Team'
  }
];

export const MOCK_EVENTS: CenterEvent[] = [
  { id: 'e1', title: 'Victoria Day', date: '2024-05-20', type: 'Closure', description: 'Statutory Holiday - Center Closed' },
  { id: 'e2', title: 'Spring Concert', date: '2024-05-24', type: 'Event', description: 'Preschool room performance at 4:00 PM' },
  { id: 'e3', title: 'Canada Day', date: '2024-07-01', type: 'Closure', description: 'Statutory Holiday - Center Closed' },
  { id: 'e4', title: 'Civic Holiday', date: '2024-08-05', type: 'Holiday', description: 'Center Closed' },
  { id: 'e5', title: 'Parent-Teacher Night', date: '2024-06-15', type: 'Event', description: 'Individual slots available for booking.' },
];

const DEFAULT_AVAILABILITY: StaffAvailability = {
  Monday: { morning: true, afternoon: true, morningPreferred: true },
  Tuesday: { morning: true, afternoon: true },
  Wednesday: { morning: true, afternoon: true, afternoonPreferred: true },
  Thursday: { morning: true, afternoon: true },
  Friday: { morning: true, afternoon: true, morningPreferred: true },
  Saturday: { morning: false, afternoon: false },
  Sunday: { morning: false, afternoon: false },
};

const MOCK_CHILD_ATTENDANCE: AttendanceRecord[] = [
  { timestamp: '2024-05-15T08:15:00.000Z', type: 'IN' },
  { timestamp: '2024-05-14T17:30:00.000Z', type: 'OUT' },
  { timestamp: '2024-05-14T08:05:00.000Z', type: 'IN' },
  { timestamp: '2024-05-13T17:15:00.000Z', type: 'OUT' },
  { timestamp: '2024-05-13T07:55:00.000Z', type: 'IN' },
];

export const MOCK_CLASSROOMS: Classroom[] = [
  { id: 'c1', name: 'Infant A', capacity: 10, enrolled: 9, ratio: '1:3' },
  { id: 'c2', name: 'Infant B', capacity: 10, enrolled: 8, ratio: '1:3' },
  { id: 'c3', name: 'Toddler A', capacity: 15, enrolled: 14, ratio: '1:5' },
  { id: 'c4', name: 'Toddler B', capacity: 15, enrolled: 15, ratio: '1:5' },
  { id: 'c5', name: 'Preschool A', capacity: 24, enrolled: 22, ratio: '1:8' },
  { id: 'c6', name: 'Preschool B', capacity: 24, enrolled: 18, ratio: '1:8' },
  { id: 'c7', name: 'Kindergarten E', capacity: 26, enrolled: 20, ratio: '1:13' },
];

export const MOCK_CHILDREN: Child[] = [
  { id: '1', name: 'Liam Smith', age: 3, classroom: 'Preschool A', status: 'Checked-in', parentName: 'Jane Smith', parentPhone: '416-555-0101', parentEmail: 'jane.smith@email.com', emergencyContact: { name: 'John Smith', phone: '416-555-9988', relation: 'Grandfather' }, allergies: ['Nuts'], lastActivity: 'Eating Lunch', attendanceHistory: [...MOCK_CHILD_ATTENDANCE] },
  { id: '2', name: 'Emma Wilson', age: 2, classroom: 'Toddler B', status: 'Checked-out', parentName: 'Mark Wilson', parentPhone: '647-555-0202', parentEmail: 'mark.w@company.ca', emergencyContact: { name: 'Alice Wilson', phone: '647-555-7766', relation: 'Aunt' }, allergies: [], lastActivity: 'Napping', attendanceHistory: [...MOCK_CHILD_ATTENDANCE.slice(1)] },
  { id: '3', name: 'Noah Brown', age: 4, classroom: 'Preschool A', status: 'Checked-in', parentName: 'Sarah Brown', parentPhone: '905-555-0303', parentEmail: 'sarah.brown@web.com', emergencyContact: { name: 'David Brown', phone: '905-555-4433', relation: 'Uncle' }, allergies: ['Egg'], lastActivity: 'Outdoor Play', attendanceHistory: [...MOCK_CHILD_ATTENDANCE] },
  { id: '4', name: 'Olivia Davis', age: 1, classroom: 'Infant A', status: 'Checked-in', parentName: 'Chris Davis', parentPhone: '289-555-0404', parentEmail: 'c.davis@service.com', emergencyContact: { name: 'Maria Davis', phone: '289-555-1122', relation: 'Grandmother' }, allergies: [], lastActivity: 'Diaper Change', attendanceHistory: [...MOCK_CHILD_ATTENDANCE] },
  { id: '5', name: 'Ethan Miller', age: 2, classroom: 'Toddler A', status: 'Checked-in', parentName: 'Laura Miller', parentPhone: '416-555-0505', parentEmail: 'laura.m@domain.com', emergencyContact: { name: 'George Miller', phone: '416-555-3344', relation: 'Grandpa' }, allergies: ['Dairy'], lastActivity: 'Morning Snack', attendanceHistory: [...MOCK_CHILD_ATTENDANCE] },
  { id: '6', name: 'Ava Garcia', age: 5, classroom: 'Kindergarten E', status: 'Checked-in', parentName: 'Sofia Garcia', parentPhone: '647-555-0606', parentEmail: 'sofia.g@webmail.com', emergencyContact: { name: 'Luis Garcia', phone: '647-555-2211', relation: 'Father' }, allergies: [], lastActivity: 'Reading Time', attendanceHistory: [...MOCK_CHILD_ATTENDANCE] },
  { id: '7', name: 'Lucas Martinez', age: 3, classroom: 'Preschool B', status: 'Checked-out', parentName: 'Ana Martinez', parentPhone: '905-555-0707', parentEmail: 'ana.mart@provider.ca', emergencyContact: { name: 'Elena Martinez', phone: '905-555-8877', relation: 'Sister' }, allergies: ['Strawberries'], lastActivity: 'Parent Pickup', attendanceHistory: [...MOCK_CHILD_ATTENDANCE.slice(1)] },
  { id: '8', name: 'Isabella Taylor', age: 1, classroom: 'Infant B', status: 'Checked-in', parentName: 'Robert Taylor', parentPhone: '289-555-0808', parentEmail: 'rob.t@email.com', emergencyContact: { name: 'Susan Taylor', phone: '289-555-6655', relation: 'Grandmother' }, allergies: [], lastActivity: 'Bottle Feeding', attendanceHistory: [...MOCK_CHILD_ATTENDANCE] },
  { id: '9', name: 'Mason Anderson', age: 2, classroom: 'Toddler B', status: 'Checked-in', parentName: 'Kelly Anderson', parentPhone: '416-555-0909', parentEmail: 'kelly.a@company.com', emergencyContact: { name: 'Jim Anderson', phone: '416-555-4422', relation: 'Uncle' }, allergies: ['Gluten'], lastActivity: 'Block Play', attendanceHistory: [...MOCK_CHILD_ATTENDANCE] },
  { id: '10', name: 'Sophia Thomas', age: 4, classroom: 'Preschool A', status: 'Checked-in', parentName: 'David Thomas', parentPhone: '647-555-1010', parentEmail: 'd.thomas@service.ca', emergencyContact: { name: 'Linda Thomas', phone: '647-555-3399', relation: 'Aunt' }, allergies: [], lastActivity: 'Art Project', attendanceHistory: [...MOCK_CHILD_ATTENDANCE] },
  { id: '11', name: 'Jacob Moore', age: 2, classroom: 'Toddler A', status: 'Absent', parentName: 'Megan Moore', parentPhone: '905-555-1111', parentEmail: 'm.moore@web.ca', emergencyContact: { name: 'Steve Moore', phone: '905-555-2288', relation: 'Grandfather' }, allergies: [], lastActivity: 'Sick at Home', attendanceHistory: [] },
  { id: '12', name: 'Charlotte Jackson', age: 3, classroom: 'Preschool B', status: 'Checked-in', parentName: 'Will Jackson', parentPhone: '289-555-1212', parentEmail: 'will.j@mail.com', emergencyContact: { name: 'Kate Jackson', phone: '289-555-1100', relation: 'Grandmother' }, allergies: ['Shellfish'], lastActivity: 'Story Time', attendanceHistory: [...MOCK_CHILD_ATTENDANCE] },
  { id: '13', name: 'James White', age: 1, classroom: 'Infant A', status: 'Checked-in', parentName: 'Emily White', parentPhone: '416-555-1313', parentEmail: 'e.white@domain.ca', emergencyContact: { name: 'Bill White', phone: '416-555-7722', relation: 'Grandfather' }, allergies: [], lastActivity: 'Napping', attendanceHistory: [...MOCK_CHILD_ATTENDANCE] },
  { id: '14', name: 'Amelia Harris', age: 5, classroom: 'Kindergarten E', status: 'Checked-in', parentName: 'Mark Harris', parentPhone: '647-555-1414', parentEmail: 'mark.h@corp.com', emergencyContact: { name: 'Alice Harris', phone: '647-555-6611', relation: 'Aunt' }, allergies: ['Latex'], lastActivity: 'Gym Session', attendanceHistory: [...MOCK_CHILD_ATTENDANCE] },
  { id: '15', name: 'Benjamin Martin', age: 2, classroom: 'Toddler B', status: 'Checked-in', parentName: 'Paula Martin', parentPhone: '905-555-1515', parentEmail: 'paula.m@service.ca', emergencyContact: { name: 'Frank Martin', phone: '905-555-5544', relation: 'Uncle' }, allergies: [], lastActivity: 'Lunch', attendanceHistory: [...MOCK_CHILD_ATTENDANCE] },
  { id: '16', name: 'Mia Thompson', age: 3, classroom: 'Preschool A', status: 'Checked-in', parentName: 'Gary Thompson', parentPhone: '289-555-1616', parentEmail: 'gary.t@webmail.ca', emergencyContact: { name: 'June Thompson', phone: '289-555-4488', relation: 'Grandmother' }, allergies: ['Cats'], lastActivity: 'Circle Time', attendanceHistory: [...MOCK_CHILD_ATTENDANCE] },
  { id: '17', name: 'Henry Robinson', age: 1, classroom: 'Infant B', status: 'Checked-in', parentName: 'Sara Robinson', parentPhone: '416-555-1717', parentEmail: 'sara.r@provider.com', emergencyContact: { name: 'Joe Robinson', phone: '416-555-3311', relation: 'Grandfather' }, allergies: [], lastActivity: 'Sensory Play', attendanceHistory: [...MOCK_CHILD_ATTENDANCE] },
  { id: '18', name: 'Evelyn Lewis', age: 4, classroom: 'Preschool B', status: 'Checked-in', parentName: 'Tom Lewis', parentPhone: '647-555-1818', parentEmail: 'tom.l@domain.ca', emergencyContact: { name: 'Nancy Lewis', phone: '647-555-2299', relation: 'Grandmother' }, allergies: ['Soy'], lastActivity: 'Nap Time', attendanceHistory: [...MOCK_CHILD_ATTENDANCE] },
  { id: '19', name: 'Alexander Walker', age: 2, classroom: 'Toddler A', status: 'Checked-in', parentName: 'Lisa Walker', parentPhone: '905-555-1919', parentEmail: 'lisa.w@company.ca', emergencyContact: { name: 'Paul Walker', phone: '905-555-1177', relation: 'Grandpa' }, allergies: [], lastActivity: 'Outdoor Play', attendanceHistory: [...MOCK_CHILD_ATTENDANCE] },
  { id: '20', name: 'Harper Young', age: 3, classroom: 'Preschool A', status: 'Checked-in', parentName: 'Ryan Young', parentPhone: '289-555-2020', parentEmail: 'ryan.y@mail.ca', emergencyContact: { name: 'Ruth Young', phone: '289-555-0011', relation: 'Grandmother' }, allergies: ['Eggs'], lastActivity: 'Music Class', attendanceHistory: [...MOCK_CHILD_ATTENDANCE] },
];

export const MOCK_STAFF: Staff[] = [
  { id: 's1', name: 'Alice Johnson', role: 'Teacher', performanceScore: 92, performanceHistory: [{ date: 'Jan', score: 85 }, { date: 'Feb', score: 88 }, { date: 'Mar', score: 87 }, { date: 'Apr', score: 92 }, { date: 'May', score: 92 }], notes: ['Excellent engagement during circle time.', 'Highly recommended by several parents for her patience.'], hourlyRate: 25, totalHours: 160, bonusAmount: 250, vacationDaysUsed: 5, sickDaysUsed: 2, availability: { ...DEFAULT_AVAILABILITY }, isOnDuty: true, lastStatusChange: new Date(Date.now() - 3600000).toISOString(), attendanceHistory: [
    { timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'IN' },
    { timestamp: '2024-05-14T17:00:00.000Z', type: 'OUT' },
    { timestamp: '2024-05-14T08:00:00.000Z', type: 'IN' },
    { timestamp: '2024-05-13T17:15:00.000Z', type: 'OUT' },
    { timestamp: '2024-05-13T07:55:00.000Z', type: 'IN' },
  ], certifications: ['First Aid', 'CPR Level C', 'ECE Diploma', 'VSC Clean'] },
  { id: 's2', name: 'Bob Roberts', role: 'Assistant', performanceScore: 78, performanceHistory: [{ date: 'Jan', score: 70 }, { date: 'Feb', score: 72 }, { date: 'Mar', score: 75 }, { date: 'Apr', score: 78 }, { date: 'May', score: 78 }], notes: ['Improving consistency with reporting.', 'Needs to focus more on classroom cleanup protocols.'], hourlyRate: 18, totalHours: 145, bonusAmount: 0, vacationDaysUsed: 2, sickDaysUsed: 4, availability: { ...DEFAULT_AVAILABILITY, Monday: { morning: false, afternoon: true, afternoonPreferred: true } }, isOnDuty: false, lastStatusChange: new Date(Date.now() - 7200000).toISOString(), attendanceHistory: [
    { timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'OUT' }, 
    { timestamp: new Date(Date.now() - 14400000).toISOString(), type: 'IN' },
  ], certifications: ['First Aid', 'VSC Clean'] },
  { id: 's3', name: 'Charlie Kim', role: 'Teacher', performanceScore: 95, performanceHistory: [{ date: 'Jan', score: 90 }, { date: 'Feb', score: 92 }, { date: 'Mar', score: 94 }, { date: 'Apr', score: 95 }, { date: 'May', score: 95 }], notes: ['Lead teacher potential. Exceptional curriculum planning.'], hourlyRate: 26, totalHours: 155, bonusAmount: 500, vacationDaysUsed: 10, sickDaysUsed: 1, availability: { ...DEFAULT_AVAILABILITY, Friday: { morning: true, afternoon: false, morningPreferred: true } }, isOnDuty: true, lastStatusChange: new Date(Date.now() - 1800000).toISOString(), attendanceHistory: [{ timestamp: new Date(Date.now() - 1800000).toISOString(), type: 'IN' }], certifications: ['First Aid', 'CPR Level C', 'ECE Diploma', 'Food Handlers'] },
  { id: 's4', name: 'Diana Ross', role: 'Assistant', performanceScore: 82, performanceHistory: [{ date: 'Jan', score: 80 }, { date: 'Feb', score: 82 }], notes: ['Very dependable in the toddler room.'], hourlyRate: 19, totalHours: 140, vacationDaysUsed: 0, sickDaysUsed: 1, availability: { ...DEFAULT_AVAILABILITY }, isOnDuty: true, lastStatusChange: new Date(Date.now() - 2400000).toISOString(), attendanceHistory: [{ timestamp: new Date(Date.now() - 2400000).toISOString(), type: 'IN' }], certifications: ['First Aid', 'CPR Level C'] },
  { id: 's5', name: 'Edward Norton', role: 'Teacher', performanceScore: 88, performanceHistory: [{ date: 'Mar', score: 85 }, { date: 'Apr', score: 88 }], notes: ['Strong focus on STEM activities.'], hourlyRate: 24, totalHours: 150, vacationDaysUsed: 3, sickDaysUsed: 0, availability: { ...DEFAULT_AVAILABILITY }, isOnDuty: true, lastStatusChange: new Date(Date.now() - 5000000).toISOString(), attendanceHistory: [{ timestamp: new Date(Date.now() - 5000000).toISOString(), type: 'IN' }], certifications: ['First Aid', 'ECE Diploma', 'Forest School Certified'] },
  { id: 's6', name: 'Fiona Apple', role: 'Assistant', performanceScore: 75, performanceHistory: [{ date: 'Jan', score: 75 }], notes: ['Great with the infant group.'], hourlyRate: 17, totalHours: 130, vacationDaysUsed: 1, sickDaysUsed: 5, availability: { ...DEFAULT_AVAILABILITY, Wednesday: { morning: true, afternoon: false, morningPreferred: true } }, isOnDuty: false, lastStatusChange: new Date(Date.now() - 86400000).toISOString(), attendanceHistory: [], certifications: ['VSC Clean', 'Safe Sleep Training'] },
  { id: 's7', name: 'Garry Kasparov', role: 'Admin', performanceScore: 98, performanceHistory: [{ date: 'Jan', score: 98 }], notes: ['Expert in compliance and center management.'], hourlyRate: 35, totalHours: 160, vacationDaysUsed: 12, sickDaysUsed: 0, availability: { ...DEFAULT_AVAILABILITY }, isOnDuty: true, lastStatusChange: new Date(Date.now() - 10000).toISOString(), attendanceHistory: [{ timestamp: new Date(Date.now() - 10000).toISOString(), type: 'IN' }], certifications: ['First Aid', 'CPR Level C', 'Director Qualification'] },
  { id: 's8', name: 'Helen Mirren', role: 'Teacher', performanceScore: 91, performanceHistory: [{ date: 'Apr', score: 91 }], notes: ['Specializes in creative arts.'], hourlyRate: 23, totalHours: 148, vacationDaysUsed: 4, sickDaysUsed: 2, availability: { ...DEFAULT_AVAILABILITY }, isOnDuty: true, lastStatusChange: new Date(Date.now() - 4000000).toISOString(), attendanceHistory: [{ timestamp: new Date(Date.now() - 4000000).toISOString(), type: 'IN' }], certifications: ['ECE Diploma', 'First Aid'] },
  { id: 's9', name: 'Ian McKellen', role: 'Assistant', performanceScore: 80, performanceHistory: [{ date: 'May', score: 80 }], notes: ['Quick learner.'], hourlyRate: 18, totalHours: 152, vacationDaysUsed: 2, sickDaysUsed: 1, availability: { ...DEFAULT_AVAILABILITY }, isOnDuty: false, lastStatusChange: new Date(Date.now() - 9000000).toISOString(), attendanceHistory: [{ timestamp: new Date(Date.now() - 9000000).toISOString(), type: 'OUT' }], certifications: ['VSC Clean'] },
  { id: 's10', name: 'Julia Roberts', role: 'Teacher', performanceScore: 89, performanceHistory: [{ date: 'May', score: 89 }], notes: ['Excellent communication skills with parents.'], hourlyRate: 24, totalHours: 158, vacationDaysUsed: 6, sickDaysUsed: 3, availability: { ...DEFAULT_AVAILABILITY }, isOnDuty: true, lastStatusChange: new Date(Date.now() - 6000000).toISOString(), attendanceHistory: [{ timestamp: new Date(Date.now() - 6000000).toISOString(), type: 'IN' }], certifications: ['ECE Diploma', 'Montessori Certified'] },
];

export const MOCK_ABSENCE_REQUESTS: AbsenceRequest[] = [
  { id: 'req1', staffId: 's1', staffName: 'Alice Johnson', type: 'Vacation', startDate: '2024-06-10', endDate: '2024-06-14', reason: 'Family wedding in Ottawa', status: 'Pending' },
  { id: 'req2', staffId: 's2', staffName: 'Bob Roberts', type: 'Sick', startDate: '2024-05-14', endDate: '2024-05-14', reason: 'Sudden fever', status: 'Approved' },
  { id: 'req3', staffId: 's6', staffName: 'Fiona Apple', type: 'Personal', startDate: '2024-05-25', endDate: '2024-05-25', reason: 'Home appointment', status: 'Pending' },
];

export const MOCK_SHIFTS: Shift[] = [
  { id: 'sh1', staffId: 's1', staffName: 'Alice Johnson', classroom: 'Preschool A', startTime: '08:00', endTime: '16:00' },
  { id: 'sh2', staffId: 's2', staffName: 'Bob Roberts', classroom: 'Infant A', startTime: '09:00', endTime: '17:00' },
  { id: 'sh3', staffId: 's3', staffName: 'Charlie Kim', classroom: 'Preschool B', startTime: '08:00', endTime: '16:00' },
  { id: 'sh4', staffId: 's4', staffName: 'Diana Ross', classroom: 'Toddler A', startTime: '07:30', endTime: '15:30' },
  { id: 'sh5', staffId: 's5', staffName: 'Edward Norton', classroom: 'Kindergarten E', startTime: '08:30', endTime: '16:30' },
];
