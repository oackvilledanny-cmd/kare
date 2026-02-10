
import React from 'react';
import { Announcement, CenterEvent } from '../types';
import { MOCK_ANNOUNCEMENTS, MOCK_EVENTS } from '../constants';

const CenterBulletin: React.FC = () => {
  // Sort events by date
  const sortedEvents = [...MOCK_EVENTS].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Group events by month for better display
  const groupedEvents = sortedEvents.reduce((groups, event) => {
    const month = new Date(event.date).toLocaleDateString('en-CA', { month: 'long', year: 'numeric' });
    if (!groups[month]) groups[month] = [];
    groups[month].push(event);
    return groups;
  }, {} as Record<string, CenterEvent[]>);

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">Center Bulletin</h3>
          <p className="text-slate-500 font-medium max-w-2xl mt-2">
            Stay updated with the latest news, closures, and upcoming events at your center.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Announcements */}
        <div className="space-y-6">
           <h4 className="text-xl font-black text-slate-800 flex items-center gap-2">
             <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">📢</span> Announcements
           </h4>
           
           <div className="space-y-4">
             {MOCK_ANNOUNCEMENTS.map(announcement => (
               <div 
                 key={announcement.id} 
                 className={`relative p-6 rounded-[2rem] border-2 shadow-sm transition-all hover:shadow-md ${
                   announcement.priority === 'High' 
                     ? 'bg-gradient-to-br from-red-50 to-white border-red-100' 
                     : 'bg-white border-slate-100'
                 }`}
               >
                 {announcement.priority === 'High' && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-bl-2xl rounded-tr-[1.8rem]">
                      Urgent Alert
                    </div>
                 )}
                 
                 <div className="mb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      {new Date(announcement.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <h5 className={`text-xl font-black ${announcement.priority === 'High' ? 'text-red-700' : 'text-slate-800'}`}>
                      {announcement.title}
                    </h5>
                 </div>
                 
                 <p className="text-sm text-slate-600 leading-relaxed font-medium">
                   {announcement.content}
                 </p>
                 
                 <div className="mt-4 pt-4 border-t border-slate-100/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500">
                        {announcement.author.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-slate-500">{announcement.author}</span>
                    </div>
                    {announcement.priority === 'High' && (
                        <span className="text-red-500 text-lg">⚠️</span>
                    )}
                 </div>
               </div>
             ))}
           </div>
        </div>

        {/* Right Column: Calendar */}
        <div className="space-y-6">
            <h4 className="text-xl font-black text-slate-800 flex items-center gap-2">
             <span className="bg-purple-100 text-purple-600 p-2 rounded-lg">🗓️</span> Operations Calendar
            </h4>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8">
               {Object.keys(groupedEvents).map((month, idx) => (
                 <div key={month} className={`space-y-4 ${idx !== 0 ? 'mt-8 pt-8 border-t border-slate-100' : ''}`}>
                    <h5 className="text-xs font-black text-purple-600 uppercase tracking-widest sticky top-0 bg-white py-2">
                      {month}
                    </h5>
                    
                    <div className="space-y-3">
                      {groupedEvents[month].map(event => (
                        <div key={event.id} className="flex gap-4 items-start group">
                           <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 ${
                             event.type === 'Closure' 
                               ? 'bg-red-50 border-red-100 text-red-600' 
                               : event.type === 'Holiday'
                                 ? 'bg-orange-50 border-orange-100 text-orange-600'
                                 : 'bg-blue-50 border-blue-100 text-blue-600'
                           }`}>
                              <span className="text-[10px] font-black uppercase">
                                {new Date(event.date).toLocaleDateString('en-CA', { weekday: 'short' })}
                              </span>
                              <span className="text-lg font-black leading-none">
                                {new Date(event.date).getDate()}
                              </span>
                           </div>
                           
                           <div className="flex-1 py-1">
                              <h6 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                                {event.title}
                              </h6>
                              <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
                              <div className="mt-1">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    event.type === 'Closure' 
                                    ? 'bg-red-100 text-red-600' 
                                    : event.type === 'Holiday'
                                        ? 'bg-orange-100 text-orange-600'
                                        : 'bg-blue-100 text-blue-600'
                                }`}>
                                    {event.type}
                                </span>
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>
               ))}
               
               {sortedEvents.length === 0 && (
                   <div className="text-center py-10 text-slate-400 italic">
                       No upcoming events scheduled.
                   </div>
               )}
            </div>
            
            <div className="bg-blue-600 text-white p-6 rounded-[2rem] shadow-xl shadow-blue-500/30 flex items-center justify-between">
                <div>
                    <p className="font-black text-lg">Sync Calendar</p>
                    <p className="text-xs text-blue-200">Subscribe to updates on your device</p>
                </div>
                <button className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-xl transition-colors">
                    +
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CenterBulletin;
