
import React, { useState, useMemo, useEffect } from 'react';
import { Staff, Classroom, Shift, DayOfWeek, AppRole } from '../types';
import { getShiftSuggestions } from '../services/geminiService';
import { isFirebaseEnabled, updateFirestoreDoc, subscribeToCollection } from '../services/firebaseService';

interface ShiftManagementProps {
  staff: Staff[];
  classrooms: Classroom[];
  isMobile: boolean;
  currentRole: AppRole;
}

interface Bid { 
  id: string;
  staffId: string; 
  staffName: string; 
  amount: number; 
  timestamp: string;
}

interface ShiftAssignment extends Shift {
  staffId: string;
  type: 'Morning' | 'Afternoon';
  isVacant?: boolean;
  bids: Bid[];
}

interface OpenShift {
  id: string;
  classroom: string;
  date: string;
  startTime: string;
  endTime: string;
  bonusAmount: number;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  currentBids: number;
  userHasBid: boolean;
  bidHistory: Bid[];
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ShiftManagement: React.FC<ShiftManagementProps> = ({ staff, classrooms, isMobile, currentRole }) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'availability' | 'bidding'>(
    currentRole === 'Staff' || isMobile ? 'bidding' : 'schedule'
  );
  
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [draggedStaff, setDraggedStaff] = useState<Staff | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [expandedShiftId, setExpandedShiftId] = useState<string | null>(null);
  const [bidInputs, setBidInputs] = useState<Record<string, string>>({});
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    staffId: '',
    classroom: classrooms[0]?.name || '',
    startTime: '09:00',
    endTime: '17:00'
  });

  const [openShifts, setOpenShifts] = useState<OpenShift[]>([]);

  // Firestore에서 오픈 시프트 실시간 데이터 구독
  useEffect(() => {
    if (!isFirebaseEnabled()) {
      // 오프라인인 경우 기본 데이터 로드
      setOpenShifts([
        { 
          id: 'os1', 
          classroom: 'Infant A', 
          date: 'Tomorrow', 
          startTime: '08:00', 
          endTime: '16:00', 
          bonusAmount: 50, 
          urgency: 'Critical', 
          currentBids: 2, 
          userHasBid: false,
          bidHistory: [
            { id: 'b1', staffId: 's2', staffName: 'Bob Roberts', amount: 135, timestamp: new Date(Date.now() - 3600000).toISOString() },
            { id: 'b2', staffId: 's6', staffName: 'Fiona Apple', amount: 140, timestamp: new Date(Date.now() - 7200000).toISOString() }
          ]
        }
      ]);
      return;
    }

    const unsub = subscribeToCollection('openShifts', (data) => {
      if (data.length) setOpenShifts(data as OpenShift[]);
    });

    return () => unsub();
  }, []);

  const handlePlaceBid = async (shiftId: string) => {
    const amount = parseFloat(bidInputs[shiftId]);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid bid amount.");
      return;
    }

    const shift = openShifts.find(s => s.id === shiftId);
    if (!shift) return;

    const newBid: Bid = {
      id: `bid-${Date.now()}`,
      staffId: 'current-user',
      staffName: 'You',
      amount: amount,
      timestamp: new Date().toISOString()
    };

    const updatedBidHistory = [newBid, ...shift.bidHistory];
    const updateData = {
      userHasBid: true,
      currentBids: shift.currentBids + 1,
      bidHistory: updatedBidHistory
    };

    if (isFirebaseEnabled()) {
      await updateFirestoreDoc('openShifts', shiftId, updateData);
    } else {
      setOpenShifts(prev => prev.map(s => s.id === shiftId ? { ...s, ...updateData } : s));
    }
    
    setBidInputs(prev => ({ ...prev, [shiftId]: '' }));
    setExpandedShiftId(shiftId);
  };

  const handleCancelBid = async (shiftId: string) => {
    const shift = openShifts.find(s => s.id === shiftId);
    if (!shift) return;

    const updateData = {
      userHasBid: false,
      currentBids: shift.currentBids - 1,
      bidHistory: shift.bidHistory.filter(b => b.staffId !== 'current-user')
    };

    if (isFirebaseEnabled()) {
      await updateFirestoreDoc('openShifts', shiftId, updateData);
    } else {
      setOpenShifts(prev => prev.map(s => s.id === shiftId ? { ...s, ...updateData } : s));
    }
  };

  // 나머지 렌더링 로직은 기존과 동일... (생략 가능하지만 context를 위해 유지)
  const toggleBidHistory = (id: string) => setExpandedShiftId(prev => prev === id ? null : id);

  const coverageHeatmap = useMemo(() => {
    const map: Record<string, { morning: Staff[]; afternoon: Staff[] }> = {};
    DAYS.forEach(day => {
      map[day] = {
        morning: staff.filter(s => s.availability[day].morning),
        afternoon: staff.filter(s => s.availability[day].afternoon)
      };
    });
    return map;
  }, [staff]);

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-red-50 text-red-500 border-red-100 ring-4 ring-red-50/50';
    if (count < 3) return 'bg-orange-50 text-orange-600 border-orange-100';
    if (count < 6) return 'bg-blue-50 text-blue-600 border-blue-100';
    return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 ${isMobile ? 'rounded-b-[2.5rem] rounded-t-none -mx-4 -mt-4 p-8' : ''}`}>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Shift Marketplace</h2>
                <p className="text-slate-500 font-medium text-xs mt-1">CCEYA staffing compliance & open shift bidding</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl shadow-inner w-full md:w-auto overflow-x-auto">
          <button onClick={() => setActiveTab('bidding')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 md:flex-none text-center ${activeTab === 'bidding' ? 'bg-white text-blue-600 shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}>
            Open Shifts <span className="bg-red-500 text-white ml-2 px-1.5 rounded-full text-[8px]">{openShifts.length}</span>
          </button>
          {currentRole !== 'Staff' && (
            <>
              <button onClick={() => setActiveTab('schedule')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 md:flex-none text-center ${activeTab === 'schedule' ? 'bg-white text-blue-600 shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}>Schedule</button>
              <button onClick={() => setActiveTab('availability')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 md:flex-none text-center ${activeTab === 'availability' ? 'bg-white text-blue-600 shadow-lg shadow-blue-100' : 'text-slate-400 hover:text-slate-600'}`}>Availability</button>
            </>
          )}
        </div>
      </div>

      {activeTab === 'bidding' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {/* Your Wallet Balance Card */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Your Wallet Balance</p>
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-4xl font-black">$250.00</h3>
                <p className="text-xs font-medium text-blue-100 mt-1">Pending from {openShifts.filter(s => s.userHasBid).length} active bids</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {openShifts.map(shift => {
              const highestBid = shift.bidHistory.length > 0 ? Math.max(...shift.bidHistory.map(b => b.amount)) : 0;
              const isUserHighest = shift.userHasBid && shift.bidHistory[0]?.staffId === 'current-user' && shift.bidHistory[0]?.amount === highestBid;
              
              return (
                <div key={shift.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                  {shift.bonusAmount > 0 && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-6 py-1.5 rounded-bl-2xl">
                      Bonus Applied
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner border-2 ${shift.classroom.includes('Infant') ? 'bg-pink-50 border-pink-100' : 'bg-blue-50 border-blue-100'}`}>
                        {shift.classroom.includes('Infant') ? '🍼' : '🎨'}
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-800">{shift.classroom}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            shift.urgency === 'Critical' ? 'bg-red-100 text-red-600' : 
                            shift.urgency === 'High' ? 'bg-orange-100 text-orange-600' : 
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {shift.urgency} Coverage
                          </span>
                          {isUserHighest && <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">🏆 Highest Bid</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Shift Date</p>
                      <p className="text-sm font-bold text-slate-700">{shift.date}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Hours</p>
                      <p className="text-sm font-bold text-slate-700">{shift.startTime} - {shift.endTime}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="w-full md:w-auto">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Payout</p>
                      <div className="flex items-center gap-2">
                         <span className="text-2xl font-black text-slate-900">$120</span>
                         {shift.bonusAmount > 0 && <span className="text-xs font-bold text-emerald-500">+ ${shift.bonusAmount} Bonus</span>}
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 mt-1">{shift.currentBids} Active Competitors</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      {shift.userHasBid ? (
                        <button 
                          onClick={() => handleCancelBid(shift.id)}
                          className="flex-1 md:flex-none px-6 py-4 bg-white border border-slate-200 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all shadow-sm"
                        >
                          Cancel My Bid
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto">
                           <span className="text-slate-400 font-bold pl-2">$</span>
                           <input 
                              type="number"
                              placeholder="Your Bid"
                              className="w-24 bg-transparent outline-none font-bold text-slate-800 text-sm"
                              value={bidInputs[shift.id] || ''}
                              onChange={(e) => setBidInputs({ ...bidInputs, [shift.id]: e.target.value })}
                           />
                           <button 
                              onClick={() => handlePlaceBid(shift.id)}
                              className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                           >
                              Bid
                           </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100">
                     <button onClick={() => toggleBidHistory(shift.id)} className="w-full flex items-center justify-between text-slate-400 hover:text-blue-600 transition-colors group/history">
                        <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          📜 Full Bid History 
                          <span className="bg-slate-100 text-slate-500 px-1.5 rounded-full">{shift.bidHistory.length}</span>
                        </span>
                        <span className={`text-xs transform transition-transform ${expandedShiftId === shift.id ? 'rotate-180' : ''}`}>▼</span>
                     </button>
                     
                     {expandedShiftId === shift.id && (
                       <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4">
                          <div className="overflow-hidden rounded-3xl border border-slate-100">
                            <table className="w-full text-left bg-slate-50/30">
                              <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <tr>
                                  <th className="px-5 py-3">Educator</th>
                                  <th className="px-5 py-3">Amount</th>
                                  <th className="px-5 py-3 text-right">Time</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {shift.bidHistory.map((bid, idx) => (
                                  <tr key={bid.id} className={`group hover:bg-white transition-colors ${idx === 0 ? 'bg-emerald-50/30' : ''}`}>
                                    <td className="px-5 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${bid.staffId === 'current-user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}>
                                          {bid.staffName.charAt(0)}
                                        </div>
                                        <span className={`text-xs font-bold ${bid.staffId === 'current-user' ? 'text-blue-600' : 'text-slate-700'}`}>
                                          {bid.staffName} {bid.staffId === 'current-user' && '(You)'}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-5 py-4">
                                      <span className="text-xs font-black text-slate-800">${bid.amount.toFixed(2)}</span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                      <span className="text-[9px] text-slate-400 font-black uppercase">
                                        {new Date(bid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                       </div>
                     )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftManagement;
