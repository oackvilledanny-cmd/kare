import React, { useState } from 'react';
import { ViewMode, AppRole, Center } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentRole: AppRole;
  activeView: ViewMode;
  onViewChange: (v: ViewMode) => void;
  centers: Center[];
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentRole, activeView, onViewChange, centers, onLogout }) => {
  const [activeCenter, setActiveCenter] = useState(centers[0]?.id);

  const menu = [
    { id: ViewMode.DASHBOARD, label: 'Overview', icon: '📊' },
    { id: ViewMode.CHILDREN, label: 'Registry', icon: '👶' },
    { id: ViewMode.STAFF, label: 'Educators', icon: '👤' },
    { id: ViewMode.CLASSROOMS, label: 'Classrooms', icon: '🏫' },
    { id: ViewMode.SHIFT_MANAGEMENT, label: 'Shift Management', icon: '📅' },
    { id: ViewMode.COMPLIANCE, label: 'Compliance', icon: '📋' },
    { id: ViewMode.FINANCE, label: 'Finance', icon: '💰' },
    { id: ViewMode.CENTERS, label: 'Campuses', icon: '🏢' },
    { id: ViewMode.BULLETIN, label: 'Bulletin', icon: '📢' },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col fixed h-full z-40">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm">K</div>
            <h1 className="text-lg font-black tracking-tighter">Daycare<span className="text-blue-600">OS</span></h1>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Management</p>
              <div className="space-y-1">
                {menu.map(item => (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${activeView === item.id
                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-100'
                        : 'text-slate-500 hover:bg-slate-50'
                      }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-bold">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-slate-50 space-y-4">
          <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-[2rem] text-white">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-xl">👤</div>
            <div>
              <p className="text-xs font-bold">Admin User</p>
              <p className="text-[10px] text-slate-400 uppercase font-black">{currentRole}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full text-center text-xs font-bold text-red-500 hover:text-red-600 p-2">Sign Out</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-12 bg-[#F8FAFC]">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {menu.find(m => m.id === activeView)?.label || 'Dashboard'}
            </h2>
            <p className="text-slate-500 font-medium">Monitoring {centers.find(c => c.id === activeCenter)?.name || 'Campus'}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm flex">
              {centers.slice(0, 2).map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveCenter(c.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeCenter === c.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <button className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-xl">🔔</button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;