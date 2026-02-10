import React from 'react';
import { Child, Staff, Classroom } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  childrenData: Child[];
  staffData: Staff[];
  classroomsData: Classroom[];
}

const Dashboard: React.FC<Props> = ({ childrenData, staffData, classroomsData }) => {
  const stats = [
    { label: 'Checked In', value: childrenData.filter(c => c.status === 'Checked-in').length, color: 'text-blue-600', icon: '👶' },
    { label: 'On Duty', value: staffData.filter(s => s.isOnDuty).length, color: 'text-emerald-600', icon: '🍎' },
    { label: 'Waitlist', value: 12, color: 'text-purple-600', icon: '⏳' },
    { label: 'Daily Rev', value: '$4,250', color: 'text-slate-900', icon: '💰' },
  ];

  const chartData = classroomsData.map(room => ({
    name: room.name,
    enrolled: childrenData.filter(c => c.classroom === room.name).length,
    capacity: room.capacity
  }));

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="grid grid-cols-4 gap-6">
        {stats.map(s => (
          <div key={s.label} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all">
             <div className="flex justify-between items-start mb-4">
                <span className="text-3xl">{s.icon}</span>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{s.label}</span>
             </div>
             <h3 className={`text-4xl font-black ${s.color}`}>{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <h4 className="text-xl font-black mb-8 flex items-center gap-2">
            <span className="text-blue-600">📊</span> Classroom Utilization
          </h4>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="enrolled" fill="#3B82F6" radius={[8, 8, 0, 0]} barSize={40} />
                <Bar dataKey="capacity" fill="#E2E8F0" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
           <div className="relative z-10 h-full flex flex-col">
              <h4 className="text-xl font-black mb-6">CCEYA Ratio Alert</h4>
              <div className="space-y-6 flex-1">
                 {classroomsData.map(room => {
                   const enrolled = childrenData.filter(c => c.classroom === room.name).length;
                   const isWarning = enrolled >= room.capacity;
                   return (
                     <div key={room.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div>
                           <p className="font-bold text-sm">{room.name}</p>
                           <p className="text-[10px] text-slate-400 font-black uppercase">{room.ratio} Ratio</p>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-xs font-black ${isWarning ? 'bg-red-500' : 'bg-emerald-500'}`}>
                           {enrolled}/{room.capacity}
                        </div>
                     </div>
                   )
                 })}
              </div>
              <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest mt-8 hover:bg-blue-700 transition-all">Optimize Staffing</button>
           </div>
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;