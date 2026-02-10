
import React, { useState, useMemo } from 'react';
import { Staff, AttendanceRecord, AbsenceRequest, AbsenceCategory } from '../types';
import { MOCK_ABSENCE_REQUESTS } from '../constants';
import { isFirebaseEnabled, updateFirestoreDoc } from '../services/firebaseService';

interface StaffManagementProps {
  isMobile: boolean;
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
}

type UserRole = 'Teacher' | 'Assistant' | 'Admin';
type Permission = 'VIEW_PAYROLL' | 'VIEW_STAFF_FILES' | 'MANAGE_ATTENDANCE' | 'APPROVE_LEAVE' | 'RUN_AI_ANALYSIS' | 'VIEW_SENSITIVE_STATS' | 'MANAGE_STAFF_PROFILES';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  Admin: ['VIEW_PAYROLL', 'VIEW_STAFF_FILES', 'MANAGE_ATTENDANCE', 'APPROVE_LEAVE', 'RUN_AI_ANALYSIS', 'VIEW_SENSITIVE_STATS', 'MANAGE_STAFF_PROFILES'],
  Teacher: ['MANAGE_ATTENDANCE'],
  Assistant: [],
};

// Standard yearly quotas for the demo
const TOTAL_VACATION_DAYS = 15;
const TOTAL_SICK_DAYS = 10;

const StaffManagement: React.FC<StaffManagementProps> = ({ isMobile, staff, setStaff }) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'absences'>('roster');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'on-duty' | 'off-duty'>('all');

  const [requests, setRequests] = useState<AbsenceRequest[]>(MOCK_ABSENCE_REQUESTS);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');

  // Confirmation state for absence requests
  const [pendingAction, setPendingAction] = useState<{ id: string, status: 'Approved' | 'Denied' } | null>(null);

  const can = (permission: Permission) => ROLE_PERMISSIONS[currentUserRole].includes(permission);

  const calculateDays = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  };

  const handleUpdateAbsenceStatus = async (id: string, status: 'Approved' | 'Denied') => {
    if (!can('APPROVE_LEAVE')) return;

    const requestToUpdate = requests.find(r => r.id === id);
    if (!requestToUpdate || requestToUpdate.status !== 'Pending') return;

    if (status === 'Approved') {
      const days = calculateDays(requestToUpdate.startDate, requestToUpdate.endDate);

      const staffMember = staff.find(s => s.id === requestToUpdate.staffId);
      if (staffMember) {
        const updates: Partial<Staff> = {};
        if (requestToUpdate.type === 'Vacation') {
          updates.vacationDaysUsed = (staffMember.vacationDaysUsed || 0) + days;
        } else if (requestToUpdate.type === 'Sick') {
          updates.sickDaysUsed = (staffMember.sickDaysUsed || 0) + days;
        }

        if (isFirebaseEnabled()) {
          await updateFirestoreDoc('staff', staffMember.id, updates);
        } else {
          setStaff(prev => prev.map(s => s.id === requestToUpdate.staffId ? { ...s, ...updates } : s));
        }
      }
    }

    // In a real app, update request in Firestore
    setRequests(prev => prev.map(req =>
      req.id === id ? { ...req, status } : req
    ));
    setPendingAction(null);
  };

  const handleToggleDuty = async (staffId: string) => {
    if (!can('MANAGE_ATTENDANCE')) return;
    const timestamp = new Date().toISOString();

    const s = staff.find(st => st.id === staffId);
    if (!s) return;

    const newStatus = !s.isOnDuty;
    const updates = {
      isOnDuty: newStatus,
      lastStatusChange: timestamp,
      attendanceHistory: [{ timestamp, type: newStatus ? 'IN' : 'OUT' } as AttendanceRecord, ...s.attendanceHistory]
    };

    if (isFirebaseEnabled()) {
      await updateFirestoreDoc('staff', staffId, updates);
    } else {
      setStaff(prev => prev.map(staffMember => {
        if (staffMember.id === staffId) {
          return { ...staffMember, ...updates };
        }
        return staffMember;
      }));
    }
  };

  const filteredStaff = useMemo(() => {
    return staff.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'on-duty' && s.isOnDuty) || (statusFilter === 'off-duty' && !s.isOnDuty);
      return matchesSearch && matchesStatus;
    });
  }, [staff, searchQuery, statusFilter]);

  const onDutyCount = staff.filter(s => s.isOnDuty).length;
  const selectedStaff = staff.find(s => s.id === selectedStaffId);

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      {/* Role Access Indicator */}
      <div className="bg-slate-900 rounded-[2rem] p-6 flex flex-col md:flex-row justify-between items-center gap-6 border-b-4 border-blue-600 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center text-2xl border border-blue-500/30">🔐</div>
          <div>
            <h4 className="text-white font-black text-sm tracking-tight">Access Control</h4>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              Acting as: <span className="text-blue-400">{currentUserRole}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/10">
          {(['Admin', 'Teacher', 'Assistant'] as UserRole[]).map(role => (
            <button
              key={role}
              onClick={() => setCurrentUserRole(role)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentUserRole === role ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <div className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm inline-flex">
          <button onClick={() => setActiveTab('roster')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'roster' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Staff Roster</button>
          <button onClick={() => setActiveTab('absences')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'absences' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
            Absences
            {requests.filter(r => r.status === 'Pending').length > 0 && <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[9px]">{requests.filter(r => r.status === 'Pending').length}</span>}
          </button>
        </div>
      </div>

      {activeTab === 'roster' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl border border-emerald-100/50">🟢</div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Presence</p>
                <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{onDutyCount} In Center</h4>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl">🗓️</div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Requests</p>
                <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{requests.filter(r => r.status === 'Pending').length}</h4>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-6">Staff Profile</th>
                    <th className="px-8 py-6">Role</th>
                    <th className="px-8 py-6">Remaining Leave</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStaff.map(s => {
                    const remainingVacation = TOTAL_VACATION_DAYS - (s.vacationDaysUsed || 0);
                    const remainingSick = TOTAL_SICK_DAYS - (s.sickDaysUsed || 0);

                    return (
                      <tr key={s.id} className="group hover:bg-slate-50/50">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-sm font-black text-blue-600 border border-blue-100">
                              {s.name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-slate-800 text-sm">{s.name}</span>
                              <button
                                onClick={() => setSelectedStaffId(s.id)}
                                className="text-[10px] font-black uppercase text-blue-600 text-left"
                              >
                                View Full Profile
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{s.role}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-slate-400 uppercase w-4">V:</span>
                              <div className="flex-1 h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500"
                                  style={{ width: `${Math.min(100, (remainingVacation / TOTAL_VACATION_DAYS) * 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-700">{remainingVacation}d</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-slate-400 uppercase w-4">S:</span>
                              <div className="flex-1 h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-red-400"
                                  style={{ width: `${Math.min(100, (remainingSick / TOTAL_SICK_DAYS) * 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-700">{remainingSick}d</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <span className={`block w-3 h-3 rounded-full ${s.isOnDuty ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                            <span className={`text-[10px] font-black uppercase tracking-tight ${s.isOnDuty ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {s.isOnDuty ? 'On Duty' : 'Away'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <button
                            onClick={() => handleToggleDuty(s.id)}
                            disabled={!can('MANAGE_ATTENDANCE')}
                            className={`w-full max-w-[140px] py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] shadow-sm transition-all active:scale-95 disabled:opacity-30 ${s.isOnDuty ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white shadow-xl shadow-blue-500/20'
                              }`}
                          >
                            {s.isOnDuty ? 'Clock Out' : 'Clock In'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden p-8">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <span className="bg-slate-100 p-2 rounded-lg">📅</span> Leave Request Management
            </h3>
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${req.type === 'Sick' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                      {req.type === 'Sick' ? '🤒' : '✈️'}
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800">{req.staffName}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black uppercase text-slate-500">{req.type}</span>
                        <span className="text-xs text-slate-600">{req.startDate} — {req.endDate}</span>
                        <span className="text-xs text-blue-600 font-bold">({calculateDays(req.startDate, req.endDate)} Days)</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-2 italic">"{req.reason}"</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                    {req.status === 'Pending' ? (
                      can('APPROVE_LEAVE') ? (
                        <div className="flex gap-2">
                          <button onClick={() => setPendingAction({ id: req.id, status: 'Denied' })} className="px-6 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-colors">Deny</button>
                          <button onClick={() => setPendingAction({ id: req.id, status: 'Approved' })} className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200">Approve</button>
                        </div>
                      ) : (
                        <span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">Pending</span>
                      )
                    ) : (
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${req.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                        {req.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {pendingAction && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center border border-slate-100">
            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl mb-6 ${pendingAction.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              {pendingAction.status === 'Approved' ? '✓' : '!'}
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Confirm {pendingAction.status}</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Are you sure you want to <strong>{pendingAction.status.toLowerCase()}</strong> this absence request? This action will update the educator's leave balance.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setPendingAction(null)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateAbsenceStatus(pendingAction.id, pendingAction.status)}
                className={`flex-1 py-4 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl ${pendingAction.status === 'Approved' ? 'bg-emerald-600 shadow-emerald-100' : 'bg-red-600 shadow-red-100'
                  }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Detail Modal */}
      {selectedStaffId && selectedStaff && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl animate-in fade-in">
          <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] border border-white/20">
            <div className="flex-1 p-10 overflow-y-auto border-r border-slate-100">
              <div className="flex justify-between items-start mb-12">
                <div className="flex items-center gap-8">
                  <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-5xl font-black shadow-inner border-4 ${selectedStaff.isOnDuty ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                    {selectedStaff.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{selectedStaff.name}</h3>
                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest mt-2">{selectedStaff.role}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedStaffId(null)} className="p-4 hover:bg-slate-100 rounded-full transition-all text-2xl text-slate-300 hover:text-slate-600">✕</button>
              </div>

              <div className="space-y-12 pb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Vacation Days Balance</p>
                    <div className="flex items-end gap-3 mb-2">
                      <p className="text-5xl font-black text-slate-800 tracking-tighter">{TOTAL_VACATION_DAYS - (selectedStaff.vacationDaysUsed || 0)}</p>
                      <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Days Remaining</p>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${((TOTAL_VACATION_DAYS - (selectedStaff.vacationDaysUsed || 0)) / TOTAL_VACATION_DAYS) * 100}%` }}
                      />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 mt-3 uppercase tracking-widest">Quota: {TOTAL_VACATION_DAYS}d • Used: {selectedStaff.vacationDaysUsed || 0}d</p>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-red-400"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Sick Days Balance</p>
                    <div className="flex items-end gap-3 mb-2">
                      <p className="text-5xl font-black text-slate-800 tracking-tighter">{TOTAL_SICK_DAYS - (selectedStaff.sickDaysUsed || 0)}</p>
                      <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Days Remaining</p>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-400"
                        style={{ width: `${((TOTAL_SICK_DAYS - (selectedStaff.sickDaysUsed || 0)) / TOTAL_SICK_DAYS) * 100}%` }}
                      />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 mt-3 uppercase tracking-widest">Quota: {TOTAL_SICK_DAYS}d • Used: {selectedStaff.sickDaysUsed || 0}d</p>
                  </div>
                </div>

                {can('VIEW_PAYROLL') && (
                  <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                      <h5 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Ontario Holiday Pay Est.</h5>
                      <p className="text-3xl font-black text-white">${((selectedStaff.totalHours * selectedStaff.hourlyRate) / 20).toFixed(2)}</p>
                      <p className="text-[9px] mt-2 text-slate-400 italic">Based on standard 1/20th statutory rule</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="w-full md:w-80 bg-slate-50 p-10 flex flex-col h-full border-l border-slate-100">
              <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10">Supervisor Notes</h5>
              <div className="flex-1 space-y-4 overflow-y-auto mb-10">
                {selectedStaff.notes.map((note, i) => (
                  <div key={i} className="bg-white p-6 rounded-[1.5rem] border border-slate-200 text-sm italic">"{note}"</div>
                ))}
              </div>
              {can('VIEW_STAFF_FILES') && (
                <div className="space-y-4">
                  <textarea className="w-full p-4 text-xs bg-white border border-slate-200 rounded-2xl outline-none" placeholder="Add confidential note..." value={newNote} onChange={e => setNewNote(e.target.value)} />
                  <button onClick={() => { if (newNote.trim()) { setStaff(prev => prev.map(s => s.id === selectedStaffId ? { ...s, notes: [newNote, ...s.notes] } : s)); setNewNote(''); } }} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Add Note</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
