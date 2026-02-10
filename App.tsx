
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ChildManagement from './components/ChildManagement';
import StaffManagement from './components/StaffManagement';
import ComplianceAudit from './components/ComplianceAudit';
import FinanceManagement from './components/FinanceManagement';
import CenterManagement from './components/CenterManagement';
import ClassroomManagement from './components/ClassroomManagement';
import ShiftManagement from './components/ShiftManagement';
import CenterBulletin from './components/CenterBulletin';
import { ViewMode, AppRole, Center, Child, Staff, Classroom, Announcement, CenterEvent } from './types';
import { isFirebaseEnabled, subscribeToCollection, seedInitialData, setFirestoreDoc } from './services/firebaseService';

const App: React.FC = () => {
  const [role, setRole] = useState<AppRole | null>(null);
  const [view, setView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [centers, setCenters] = useState<Center[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<CenterEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCenterId, setActiveCenterId] = useState<string>('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isFirebaseEnabled()) {
      setLoading(false);
      return;
    }

    const init = async () => {
      await seedInitialData();

      const unsubs = [
        subscribeToCollection('centers', (data) => {
          setCenters(data);
          if (data.length > 0 && !activeCenterId) {
            setActiveCenterId(data[0].id);
          }
        }),
        subscribeToCollection('children', setChildren),
        subscribeToCollection('staff', setStaff),
        subscribeToCollection('classrooms', setClassrooms),
        subscribeToCollection('announcements', setAnnouncements),
        subscribeToCollection('events', setEvents)
      ];

      setLoading(false);
      return () => unsubs.forEach(u => u());
    };

    init();
  }, [activeCenterId]);

  const handleLogin = (selectedRole: AppRole) => {
    setRole(selectedRole);
    setView(ViewMode.DASHBOARD);
  };

  const handleAddCenter = async (newCenter: Omit<Center, 'id'>) => {
    const id = `center-${Date.now()}`;
    const centerWithId = { ...newCenter, id } as Center;
    if (isFirebaseEnabled()) {
      await setFirestoreDoc('centers', id, centerWithId);
    } else {
      setCenters(prev => [...prev, centerWithId]);
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_50%_50%,#3B82F6_0%,transparent_50%)]"></div>

        <div className="relative z-10 text-center max-w-4xl">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-blue-500/30 mx-auto mb-10 rotate-3">K</div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-4">K-Daycare<span className="text-blue-500">OS</span></h1>
          <p className="text-slate-400 text-lg mb-12">The Next-Generation SaaS Operating System for Childcare in Ontario.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(['Owner', 'Admin', 'Staff', 'Parent'] as AppRole[]).map((r) => (
              <button
                key={r}
                onClick={() => handleLogin(r)}
                className="group p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] hover:bg-white/10 hover:border-blue-500/50 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {r === 'Owner' ? '👑' : r === 'Admin' ? '🛡️' : r === 'Staff' ? '🍎' : '🏡'}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{r}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Access the {r.toLowerCase()} workspace and management tools.</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout
      currentRole={role}
      activeView={view}
      onViewChange={setView}
      centers={centers}
      onLogout={() => setRole(null)}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold animate-pulse">Synchronizing Cloud Data...</p>
        </div>
      ) : (
        <>
          {view === ViewMode.DASHBOARD && <Dashboard childrenData={children} staffData={staff} classroomsData={classrooms} />}
          {view === ViewMode.CHILDREN && <ChildManagement children={children} setChildren={setChildren} classrooms={classrooms} />}
          {view === ViewMode.STAFF && <StaffManagement staff={staff} setStaff={setStaff} isMobile={isMobile} />}
          {view === ViewMode.COMPLIANCE && <ComplianceAudit />}
          {view === ViewMode.FINANCE && <FinanceManagement />}
          {view === ViewMode.CENTERS && (
            <CenterManagement
              centers={centers}
              onAddCenter={handleAddCenter}
              onSelectCenter={setActiveCenterId}
              activeCenterId={activeCenterId}
            />
          )}
          {view === ViewMode.CLASSROOMS && (
            <ClassroomManagement
              classrooms={classrooms}
              setClassrooms={setClassrooms}
              childrenData={children}
            />
          )}
          {view === ViewMode.SHIFT_MANAGEMENT && (
            <ShiftManagement
              staff={staff}
              classrooms={classrooms}
              isMobile={isMobile}
              currentRole={role}
            />
          )}
          {view === ViewMode.BULLETIN && (
            <CenterBulletin />
          )}
        </>
      )}
    </Layout>
  );
};

export default App;
