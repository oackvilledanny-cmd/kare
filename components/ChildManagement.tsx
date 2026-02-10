import React, { useState, useMemo } from 'react';
import { Child, Activity, Classroom, AttendanceRecord } from '../types';
import { isFirebaseEnabled, updateFirestoreDoc, setFirestoreDoc } from '../services/firebaseService';

interface ChildManagementProps {
  children: Child[];
  setChildren: React.Dispatch<React.SetStateAction<Child[]>>;
  classrooms: Classroom[];
}

const ChildManagement: React.FC<ChildManagementProps> = ({ children, setChildren, classrooms }) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Local activities state (usually would be on a per-child basis in a DB)
  const [activities, setActivities] = useState<Activity[]>([
    { id: 'act1', childId: '1', childName: 'Liam Smith', type: 'Meal', description: 'Finished whole apple and crackers.', timestamp: '2024-05-15T12:30' },
    { id: 'act2', childId: '1', childName: 'Liam Smith', type: 'Learning', description: 'Participated in finger painting session.', timestamp: '2024-05-15T10:15' },
    { id: 'act3', childId: '2', childName: 'Emma Wilson', type: 'Nap', description: 'Slept well for 1.5 hours.', timestamp: '2024-05-15T13:00' },
  ]);

  const [viewedChildId, setViewedChildId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<'journal' | 'attendance'>('journal');
  const [timelineTypeFilter, setTimelineTypeFilter] = useState<string>('All');
  const [timelineStartFilter, setTimelineStartFilter] = useState<string>('');
  const [timelineEndFilter, setTimelineEndFilter] = useState<string>('');

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedChildForLog, setSelectedChildForLog] = useState<Child | null>(null);
  const [activityType, setActivityType] = useState<Activity['type']>('Learning');
  const [description, setDescription] = useState('');
  const [timestamp, setTimestamp] = useState(new Date().toISOString().slice(0, 16));
  const [isSuccess, setIsSuccess] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [newChildForm, setNewChildForm] = useState({
    name: '', age: '', classroom: classrooms[0]?.name || '',
    parentName: '', parentPhone: '', parentEmail: '',
    emergencyName: '', emergencyPhone: '', emergencyRelation: '',
    allergies: '', doctorName: '', doctorPhone: '',
    immunizationOnFile: false, authorizedPickups: ''
  });

  const toggleStatus = async (id: string) => {
    const timestamp = new Date().toISOString();

    // Find child to get current status
    const child = children.find(c => c.id === id);
    if (!child) return;

    const newStatus = child.status === 'Checked-in' ? 'Checked-out' : 'Checked-in';
    const recordType: 'IN' | 'OUT' = newStatus === 'Checked-in' ? 'IN' : 'OUT';
    const newRecord: AttendanceRecord = { timestamp, type: recordType };

    const updatedData = {
      status: newStatus,
      attendanceHistory: [newRecord, ...(child.attendanceHistory || [])]
    };

    if (isFirebaseEnabled()) {
      await updateFirestoreDoc('children', id, updatedData);
    } else {
      setChildren(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
    }
  };

  const handleBulkStatusChange = async (newStatus: 'Checked-in' | 'Checked-out') => {
    const timestamp = new Date().toISOString();

    if (isFirebaseEnabled()) {
      // Process sequentially or Promise.all (simplified here)
      for (const id of Array.from(selectedIds)) {
        const child = children.find(c => c.id === id);
        if (child) {
          const recordType: 'IN' | 'OUT' = newStatus === 'Checked-in' ? 'IN' : 'OUT';
          const newRecord: AttendanceRecord = { timestamp, type: recordType };
          const updatedData = {
            status: newStatus,
            attendanceHistory: [newRecord, ...(child.attendanceHistory || [])]
          };
          await updateFirestoreDoc('children', id, updatedData);
        }
      }
      setSelectedIds(new Set());
    } else {
      setChildren(prev => prev.map(c => {
        if (selectedIds.has(c.id)) {
          const recordType: 'IN' | 'OUT' = newStatus === 'Checked-in' ? 'IN' : 'OUT';
          const newRecord: AttendanceRecord = { timestamp, type: recordType };
          return {
            ...c,
            status: newStatus,
            attendanceHistory: [newRecord, ...(c.attendanceHistory || [])]
          };
        }
        return c;
      }));
      setSelectedIds(new Set());
    }
  };

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(c => c.id)));
    }
  };

  const handleOpenLogModal = (child: Child, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedChildForLog(child);
    setActivityType('Learning');
    setDescription('');
    setTimestamp(new Date().toISOString().slice(0, 16));
    setIsActivityModalOpen(true);
    setIsSuccess(false);
  };

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildForLog) return;
    const newActivity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      childId: selectedChildForLog.id,
      childName: selectedChildForLog.name,
      type: activityType,
      description,
      timestamp,
    };

    // In a real app we'd save the activity to a collection
    // For now we just update local state or console log
    setActivities(prev => [newActivity, ...prev]);

    if (isFirebaseEnabled()) {
      await updateFirestoreDoc('children', selectedChildForLog.id, { lastActivity: description });
    } else {
      setChildren(prev => prev.map(c =>
        c.id === selectedChildForLog.id ? { ...c, lastActivity: description } : c
      ));
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsActivityModalOpen(false);
      setIsSuccess(false);
    }, 1500);
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = Math.random().toString(36).substr(2, 9);
    const newChild: Child = {
      id,
      name: newChildForm.name,
      age: parseInt(newChildForm.age) || 0,
      classroom: newChildForm.classroom,
      status: 'Absent',
      parentName: newChildForm.parentName,
      parentPhone: newChildForm.parentPhone,
      parentEmail: newChildForm.parentEmail,
      emergencyContact: {
        name: newChildForm.emergencyName,
        phone: newChildForm.emergencyPhone,
        relation: newChildForm.emergencyRelation
      },
      allergies: newChildForm.allergies.split(',').map(s => s.trim()).filter(Boolean),
      lastActivity: 'New Enrollment',
      attendanceHistory: []
    };

    if (isFirebaseEnabled()) {
      await setFirestoreDoc('children', id, newChild);
    } else {
      setChildren([newChild, ...children]);
    }

    setIsAddModalOpen(false);
    setFormStep(1);
    setNewChildForm({
      name: '', age: '', classroom: classrooms[0].name,
      parentName: '', parentPhone: '', parentEmail: '',
      emergencyName: '', emergencyPhone: '', emergencyRelation: '',
      allergies: '', doctorName: '', doctorPhone: '',
      immunizationOnFile: false, authorizedPickups: ''
    });
  };

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return children.filter(c =>
      c.name.toLowerCase().includes(s) ||
      c.parentName.toLowerCase().includes(s) ||
      c.classroom.toLowerCase().includes(s) ||
      c.status.toLowerCase().includes(s)
    );
  }, [children, search]);

  const activityIcons: Record<Activity['type'], string> = {
    Meal: '🍱', Nap: '😴', Diaper: '🧼', Learning: '📚'
  };

  const viewedChild = useMemo(() => children.find(c => c.id === viewedChildId), [children, viewedChildId]);

  const viewedActivities = useMemo<Activity[]>(() => {
    let list = activities.filter(a => a.childId === viewedChildId);
    if (timelineTypeFilter !== 'All') list = list.filter(a => a.type === timelineTypeFilter);
    if (timelineStartFilter) list = list.filter(a => a.timestamp.split('T')[0] >= timelineStartFilter);
    if (timelineEndFilter) list = list.filter(a => a.timestamp.split('T')[0] <= timelineEndFilter);
    return list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [activities, viewedChildId, timelineTypeFilter, timelineStartFilter, timelineEndFilter]);

  const groupedAttendance = useMemo<Record<string, AttendanceRecord[]>>(() => {
    if (!viewedChild) return {};
    const groups: Record<string, AttendanceRecord[]> = {};
    (viewedChild.attendanceHistory || []).forEach(record => {
      const date = new Date(record.timestamp).toLocaleDateString(undefined, {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(record);
    });
    return groups;
  }, [viewedChild]);

  if (viewedChild) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
        <button onClick={() => { setViewedChildId(null); setTimelineTypeFilter('All'); setDetailTab('journal'); }} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold transition-colors">
          <span>←</span> Back to Registry
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-5xl shadow-inner">👶</div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <h2 className="text-3xl font-extrabold text-slate-800">{viewedChild.name}</h2>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow-sm self-center md:self-auto ${viewedChild.status === 'Checked-in' ? 'bg-green-100 text-green-600' : viewedChild.status === 'Absent' ? 'bg-red-50 text-red-400' : 'bg-slate-100 text-slate-400'}`}>{viewedChild.status}</span>
                </div>
                <p className="text-lg text-slate-500 font-medium">{viewedChild.classroom} • {viewedChild.age} Years Old</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                  {viewedChild.allergies.map((allergy, i) => (
                    <span key={i} className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-sm font-bold border border-red-100">⚠️ {allergy}</span>
                  ))}
                </div>
              </div>
              <button onClick={(e) => handleOpenLogModal(viewedChild, e)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">Log New Activity</button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-2 border-b bg-slate-50/50 flex gap-1">
                <button
                  onClick={() => setDetailTab('journal')}
                  className={`px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${detailTab === 'journal' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Activity Journal
                </button>
                <button
                  onClick={() => setDetailTab('attendance')}
                  className={`px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${detailTab === 'attendance' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Attendance Log
                </button>
              </div>

              <div className="p-6">
                {detailTab === 'journal' ? (
                  viewedActivities.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 italic">No activities match your filters.</div>
                  ) : (
                    <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                      {viewedActivities.map((act) => (
                        <div key={act.id} className="relative pl-12">
                          <div className="absolute left-2.5 top-1.5 w-5 h-5 bg-white border-4 border-blue-500 rounded-full z-10"></div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-blue-100 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-slate-800 flex items-center gap-2">{activityIcons[act.type]} {act.type}</span>
                              <span className="text-xs text-slate-400 font-medium">{new Date(act.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">{act.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="space-y-10">
                    {Object.keys(groupedAttendance).length === 0 ? (
                      <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <span className="text-4xl block mb-4">📅</span>
                        <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">No Attendance History Recorded</p>
                      </div>
                    ) : (
                      (Object.entries(groupedAttendance) as [string, AttendanceRecord[]][]).map(([date, records]) => (
                        <div key={date} className="space-y-4">
                          <h6 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] sticky top-0 bg-white py-2 z-10 border-b-2 border-slate-100">
                            {date}
                          </h6>
                          <div className="space-y-3">
                            {records.map((record, idx) => (
                              <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-blue-300 hover:shadow-xl transition-all group">
                                <div className="flex items-center gap-6">
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm border-2 ${record.type === 'IN' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-200 text-slate-500 border-slate-300'}`}>
                                    {record.type}
                                  </div>
                                  <div>
                                    <p className="text-lg font-black text-slate-800 tracking-tight">{record.type === 'IN' ? 'Check-In' : 'Check-Out'}</p>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Verified Parent Signature</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl font-black text-slate-900 tracking-tighter leading-none">
                                    {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-2 flex items-center justify-end gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Recorded
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><span className="text-blue-600">👨‍👩‍👦</span> Primary Contacts</h3>
              <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Parent / Guardian</p>
                <p className="font-extrabold text-slate-800 text-lg mb-4">{viewedChild.parentName}</p>
                <div className="space-y-3">
                  <span className="flex items-center gap-3 text-sm text-slate-600">📞 {viewedChild.parentPhone}</span>
                  <span className="flex items-center gap-3 text-sm text-slate-600">✉️ {viewedChild.parentEmail}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Emergency Protocol</h3>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{viewedChild.emergencyContact.relation}</p>
                  <p className="font-bold text-sm">{viewedChild.emergencyContact.name}</p>
                  <p className="text-xs text-slate-400 mt-2">{viewedChild.emergencyContact.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative pb-24">
      <button onClick={() => setIsAddModalOpen(true)} className="fixed bottom-24 right-8 z-50 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl lg:hidden hover:bg-blue-700 transition-all">＋</button>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 flex-1 w-full">
          <button onClick={handleSelectAll} className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${selectedIds.size === filtered.length && filtered.length > 0 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-blue-300'}`}>{selectedIds.size === filtered.length && filtered.length > 0 ? '✓' : '⬜'}</button>
          <div className="relative flex-1 max-w-sm">
            <input type="text" placeholder="Search registry..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
            <span className="absolute left-3.5 top-3 opacity-30">🔍</span>
          </div>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl active:scale-95">＋ Add New Child</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(child => {
          const isSelected = selectedIds.has(child.id);
          return (
            <div key={child.id} onClick={() => setViewedChildId(child.id)} className={`bg-white p-6 rounded-[2.5rem] shadow-sm border transition-all cursor-pointer h-[280px] flex flex-col justify-between ${isSelected ? 'border-blue-500 bg-blue-50/20' : 'border-slate-100 hover:border-blue-200'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${isSelected ? 'bg-white' : 'bg-blue-50'}`}>👶</div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-lg leading-tight">{child.name}</h4>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">{child.classroom}</p>
                </div>
              </div>
              <div className="flex-1 mt-4 space-y-3">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Parent: <span className="text-slate-800">{child.parentName}</span></p>
                <div className="flex flex-wrap gap-2">
                  {child.allergies.length > 0 && <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-[9px] font-black uppercase">⚠️ Allergy</span>}
                  <span className="bg-slate-50 text-slate-400 px-2 py-1 rounded text-[9px] font-black uppercase">Age {child.age}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <button onClick={(e) => { e.stopPropagation(); toggleStatus(child.id); }} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${child.status === 'Checked-in' ? 'bg-emerald-600 text-white' : child.status === 'Absent' ? 'bg-red-50 text-red-400' : 'bg-slate-100 text-slate-400'}`}>{child.status}</button>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Profile →</span>
              </div>
            </div>
          );
        })}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-10 py-8 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-800">Enroll Child</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddChild} className="overflow-y-auto p-10 space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="Full Name" value={newChildForm.name} onChange={e => setNewChildForm({ ...newChildForm, name: e.target.value })} />
                <input required type="number" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="Age" value={newChildForm.age} onChange={e => setNewChildForm({ ...newChildForm, age: e.target.value })} />
                <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newChildForm.classroom} onChange={e => setNewChildForm({ ...newChildForm, classroom: e.target.value })}>
                  {classrooms.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="Parent Name" value={newChildForm.parentName} onChange={e => setNewChildForm({ ...newChildForm, parentName: e.target.value })} />
                <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="Parent Phone" value={newChildForm.parentPhone} onChange={e => setNewChildForm({ ...newChildForm, parentPhone: e.target.value })} />
                <input required type="email" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" placeholder="Parent Email" value={newChildForm.parentEmail} onChange={e => setNewChildForm({ ...newChildForm, parentEmail: e.target.value })} />
              </div>
              <div className="pt-6 border-t mt-auto">
                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-xl">Complete Enrollment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildManagement;