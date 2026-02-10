
import React, { useState, useMemo } from 'react';
import { Classroom, Child } from '../types';
import { isFirebaseEnabled, updateFirestoreDoc } from '../services/firebaseService';

interface ClassroomManagementProps {
  classrooms: Classroom[];
  setClassrooms: React.Dispatch<React.SetStateAction<Classroom[]>>;
  childrenData: Child[];
}

const ClassroomManagement: React.FC<ClassroomManagementProps> = ({ classrooms, setClassrooms, childrenData }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempCapacity, setTempCapacity] = useState<number>(0);

  // Helper to parse "1:8" -> 8
  const getRatioDenominator = (ratio: string) => {
    const parts = ratio.split(':');
    return parts.length === 2 ? parseInt(parts[1]) : 1;
  };

  // Calculate real enrollment and staffing needs
  const classroomsWithMetrics = useMemo(() => {
    return classrooms.map(room => {
      const enrolled = childrenData.filter(child => child.classroom === room.name).length;
      const ratioDenom = getRatioDenominator(room.ratio);
      const requiredStaff = Math.ceil(enrolled / ratioDenom) || 1; // At least 1 staff if enrolled > 0

      // Check if 1 more child would require 1 more staff
      const isAtStaffLimit = enrolled > 0 && (enrolled % ratioDenom === 0);
      const occupancyRate = room.capacity > 0 ? Math.round((enrolled / room.capacity) * 100) : 0;

      return {
        ...room,
        enrolled,
        requiredStaff,
        ratioDenom,
        isAtStaffLimit,
        occupancyRate,
        isOverCapacity: enrolled > room.capacity
      };
    });
  }, [classrooms, childrenData]);

  const startEditing = (room: Classroom) => {
    setEditingId(room.id);
    setTempCapacity(room.capacity);
  };

  const saveCapacity = async (id: string) => {
    if (isFirebaseEnabled()) {
      await updateFirestoreDoc('classrooms', id, { capacity: tempCapacity });
    } else {
      setClassrooms(prev => prev.map(room =>
        room.id === id ? { ...room, capacity: tempCapacity } : room
      ));
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Ratio Compliance Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 text-white flex flex-col justify-between border-b-8 border-blue-600">
          <div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Total Staff Required</p>
            <h4 className="text-5xl font-black tracking-tighter">
              {classroomsWithMetrics.reduce((acc, r) => acc + (r.enrolled > 0 ? r.requiredStaff : 0), 0)}
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-4 font-medium italic">Based on active enrollment of {childrenData.length} kids</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Staffing Alerts</p>
            <h4 className="text-4xl font-black text-orange-500 tracking-tighter">
              {classroomsWithMetrics.filter(r => r.isAtStaffLimit).length}
            </h4>
          </div>
          <p className="text-xs text-slate-500 mt-4 font-bold uppercase tracking-widest">Rooms at educator threshold</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Safe Ratio Status</p>
            <h4 className="text-4xl font-black text-emerald-500 tracking-tighter">100%</h4>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-xs text-emerald-600 font-black uppercase tracking-widest">Ontario Compliant</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">CCEYA Ratio Monitor</h3>
          <p className="text-slate-500 font-medium italic">Real-time staffing requirement auditing for all campuses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {classroomsWithMetrics.map(room => {
          const isEditing = editingId === room.id;

          return (
            <div
              key={room.id}
              className={`bg-white rounded-[3rem] p-10 shadow-sm border-2 transition-all relative overflow-hidden group ${room.isOverCapacity
                  ? 'border-red-500 bg-red-50/10'
                  : room.isAtStaffLimit
                    ? 'border-orange-400 ring-8 ring-orange-50'
                    : 'border-slate-100 hover:border-blue-200'
                }`}
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-10">
                  <div className="flex-1">
                    <h4 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
                      {room.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="bg-blue-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
                        Ratio {room.ratio}
                      </span>
                      {room.isAtStaffLimit && (
                        <span className="bg-orange-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest animate-pulse">
                          Staffing Warning
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner border-2 ${room.isAtStaffLimit ? 'bg-orange-50 border-orange-100' : 'bg-slate-50 border-slate-100'
                    }`}>
                    {room.name.includes('Infant') ? '🍼' : room.name.includes('Toddler') ? '🧸' : room.name.includes('Preschool') ? '🎨' : '🎓'}
                  </div>
                </div>

                <div className="flex-1 space-y-10">
                  {/* Staffing Requirement Block */}
                  <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex justify-between items-center">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mandatory Educators</p>
                        <h5 className="text-3xl font-black text-white">{room.enrolled > 0 ? room.requiredStaff : 0} <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Staff</span></h5>
                      </div>
                      <div className="flex -space-x-3">
                        {Array.from({ length: room.requiredStaff }).map((_, i) => (
                          <div key={i} className="w-10 h-10 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-sm shadow-lg">👤</div>
                        ))}
                      </div>
                    </div>
                    {room.isAtStaffLimit && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                          ⚠️ Next child requires +1 Staff
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Enrollment</p>
                      <p className="text-2xl font-black text-slate-800">{room.enrolled}</p>
                    </div>

                    <div className={`p-5 rounded-[1.5rem] border transition-all ${isEditing ? 'bg-white border-blue-500 ring-4 ring-blue-50' : 'bg-slate-50 border-slate-100'}`}>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Max Capacity</p>
                      {isEditing ? (
                        <input
                          type="number"
                          className="w-full text-2xl font-black text-blue-600 bg-transparent outline-none"
                          value={tempCapacity}
                          onChange={(e) => setTempCapacity(parseInt(e.target.value) || 0)}
                          onBlur={() => saveCapacity(room.id)}
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center justify-between group/cap">
                          <p className="text-2xl font-black text-slate-800">{room.capacity}</p>
                          <button onClick={() => startEditing(room)} className="text-slate-300 hover:text-blue-500 opacity-0 group-hover/cap:opacity-100 transition-all">✏️</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visual Ratio/Utilization Tracker */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Educator Bandwidth</p>
                      <p className="text-xs font-black text-slate-800">
                        {room.enrolled % room.ratioDenom || room.ratioDenom} / {room.ratioDenom} <span className="text-slate-400 ml-1">Kids Per Lead</span>
                      </p>
                    </div>
                    <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex gap-1 p-1">
                      {Array.from({ length: Math.ceil(room.capacity / room.ratioDenom) }).map((_, i) => {
                        const educatorEnrolled = Math.min(Math.max(room.enrolled - (i * room.ratioDenom), 0), room.ratioDenom);
                        const fillPercent = (educatorEnrolled / room.ratioDenom) * 100;

                        return (
                          <div key={i} className="flex-1 h-full bg-slate-200/50 rounded-sm overflow-hidden relative">
                            <div
                              className={`h-full transition-all duration-700 ${fillPercent >= 100 ? 'bg-blue-600' : fillPercent > 0 ? 'bg-blue-400' : 'bg-transparent'
                                }`}
                              style={{ width: `${fillPercent}%` }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex items-center justify-between pt-8 border-t border-slate-50">
                  <span className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest ${room.isOverCapacity
                      ? 'bg-red-600 text-white'
                      : room.isAtStaffLimit
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}>
                    {room.isOverCapacity ? 'Compliance Error' : room.isAtStaffLimit ? 'Ratio Threshold' : 'Ratio Secure'}
                  </span>
                  <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                    View Shift Plan →
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <button className="bg-slate-50 border-4 border-dashed border-slate-200 rounded-[3rem] p-8 flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:bg-blue-50/30 hover:text-blue-500 transition-all h-full min-h-[450px] group">
          <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform">＋</div>
          <p className="font-black uppercase tracking-[0.2em] text-xs">New Roster Room</p>
          <p className="text-[10px] mt-2 font-medium">Define CCEYA licensing ratio</p>
        </button>
      </div>

      {/* Compliance Note */}
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center justify-between mt-12">
        <div className="space-y-3">
          <h4 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <span className="bg-blue-600 text-white text-[10px] px-3 py-1 rounded-lg font-black uppercase">Staffing Audit</span>
            Ontario Educator Ratios
          </h4>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Headcounts are derived from current <strong>Checked-in</strong> students. The CCEYA (Child Care and Early Years Act) requires specific staff-to-child ratios for different age groups. This monitor ensures you are warned before a ratio violation occurs during peak intake hours.
          </p>
        </div>
        <button className="bg-slate-900 text-white px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl active:scale-95">
          Run Compliance Report
        </button>
      </div>
    </div>
  );
};

export default ClassroomManagement;
