
import React, { useState } from 'react';
import { Center } from '../types';

interface CenterManagementProps {
  centers: Center[];
  onAddCenter: (center: Omit<Center, 'id'>) => void;
  onSelectCenter: (id: string) => void;
  activeCenterId: string;
}

const CenterManagement: React.FC<CenterManagementProps> = ({ 
  centers, 
  onAddCenter, 
  onSelectCenter, 
  activeCenterId 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    licenseNumber: '',
    totalCapacity: 50
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCenter({
      ...formData,
      status: 'Active'
    });
    setFormData({ name: '', address: '', licenseNumber: '', totalCapacity: 50 });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">Center Registry</h3>
          <p className="text-slate-500 font-medium max-w-2xl mt-2 leading-relaxed">
            Manage and audit multi-site daycare operations across Ontario. Track CCEYA compliance and licensing status for all your active locations.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center gap-3"
        >
          <span className="text-xl">＋</span> Add New Location
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {centers.map(center => {
          const isActive = center.status === 'Active';
          const isSelected = activeCenterId === center.id;

          return (
            <div 
              key={center.id}
              onClick={() => onSelectCenter(center.id)}
              className={`group bg-white p-8 rounded-[3rem] border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full ${
                isSelected 
                  ? 'border-blue-600 shadow-2xl shadow-blue-100 ring-8 ring-blue-50' 
                  : 'border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              {/* Top Bar with Status and Active Badge */}
              <div className="flex justify-between items-start mb-8">
                <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-3xl shadow-inner border-2 transition-transform group-hover:scale-110 ${
                  isSelected ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'
                }`}>
                  🏢
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                    isActive 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                      : 'bg-orange-50 border-orange-100 text-orange-600'
                  }`}>
                    {isActive && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                    <span className="text-[10px] font-black uppercase tracking-widest">{center.status}</span>
                  </div>
                  {isSelected && (
                    <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20">
                      Active Context
                    </span>
                  )}
                </div>
              </div>

              {/* Center Details */}
              <div className="flex-1">
                <h4 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {center.name}
                </h4>
                <div className="flex items-start gap-2 mb-8">
                  <span className="text-lg opacity-40">📍</span>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    {center.address}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">License ID</p>
                    <p className="text-xs font-black text-slate-800 font-mono">{center.licenseNumber}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Max Cap</p>
                    <p className="text-xs font-black text-slate-800">{center.totalCapacity} kids</p>
                  </div>
                </div>
              </div>
              
              {/* Footer Actions */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                <button 
                  className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-md active:scale-95 ${
                    isSelected 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20' 
                      : 'bg-slate-900 text-white hover:bg-black'
                  }`}
                >
                  View Details
                </button>
                <div className="flex -space-x-2">
                  <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white shadow-sm"></div>
                  <div className="w-9 h-9 rounded-full bg-slate-300 border-2 border-white shadow-sm"></div>
                  <div className="w-9 h-9 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-blue-600 shadow-sm">+4</div>
                </div>
              </div>
            </div>
          );
        })}

        {/* New Center Placeholder */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-50 border-4 border-dashed border-slate-200 rounded-[3rem] p-10 flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-500 transition-all h-full min-h-[420px] group"
        >
          <div className="w-20 h-20 rounded-[2rem] bg-white shadow-sm flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform">
            ＋
          </div>
          <p className="font-black uppercase tracking-[0.3em] text-xs">Register Campus</p>
          <p className="text-[10px] mt-2 font-medium opacity-60">Provision new licensing profile</p>
        </button>
      </div>

      {/* Add Center Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[4rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 border border-white/20">
            <div className="p-12 border-b flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">Add New Center</h3>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span> Ontario Licensing Provision
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center hover:bg-slate-200 rounded-full transition-all text-slate-400 hover:text-slate-600 text-2xl">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-12 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Campus / Location Name</label>
                <input 
                  required
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-100 transition-all font-black text-slate-800 placeholder:text-slate-300"
                  placeholder="e.g. Richmond Hill Campus"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Service Address</label>
                <input 
                  required
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-100 transition-all font-medium text-slate-600"
                  placeholder="Street, City, Province, Postal Code"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">CCEYA License #</label>
                  <input 
                    required
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-100 transition-all font-mono font-bold text-slate-800"
                    placeholder="ON-XXXXX"
                    value={formData.licenseNumber}
                    onChange={e => setFormData({...formData, licenseNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Approved Capacity</label>
                  <input 
                    required
                    type="number"
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-100 transition-all font-black text-slate-800"
                    value={formData.totalCapacity}
                    onChange={e => setFormData({...formData, totalCapacity: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="pt-8 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-6 bg-slate-100 text-slate-600 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-2 bg-slate-900 text-white px-12 py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-2xl shadow-slate-300 active:scale-95"
                >
                  Register Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CenterManagement;
