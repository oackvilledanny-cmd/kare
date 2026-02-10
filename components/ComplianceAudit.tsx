import React, { useState } from 'react';
import { checkCCEYACompliance } from '../services/geminiService';

const ComplianceAudit: React.FC = () => {
  const [log, setLog] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAudit = async () => {
    if (!log.trim()) return;
    setLoading(true);
    try {
      const res = await checkCCEYACompliance(log);
      setResult(res);
    } catch (e) {
      setResult("Error analyzing logs. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
      <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-6 mb-12">
           <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-4xl shadow-inner">🍁</div>
           <div>
              <h3 className="text-3xl font-black text-slate-900">Ontario CCEYA Inspector</h3>
              <p className="text-slate-500 font-medium">Ministry of Education Audit Preparedness & Real-time Verification</p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded-lg font-black">AI AUDITOR</span>
              <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Input Daily Log for Review</label>
            </div>
            <textarea
              className="w-full h-80 p-8 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none focus:border-blue-500 transition-all font-medium text-slate-700 leading-relaxed"
              placeholder="Example: Infant room ratio 1:3 maintained. Sanitization completed. No medical incidents today. 10:30 AM Playground session followed safety protocol..."
              value={log}
              onChange={(e) => setLog(e.target.value)}
            />
            <button
              onClick={handleAudit}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-black disabled:opacity-50 transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              {loading ? 'AI Inspecting...' : '🔍 Analyze for Audit Readiness'}
            </button>
          </div>

          <div className="flex flex-col">
            <div className="flex-1 bg-slate-900 rounded-[2.5rem] p-10 text-white font-mono text-sm overflow-y-auto leading-relaxed border-t-8 border-blue-500 shadow-2xl">
              <h4 className="text-blue-400 font-black mb-6 uppercase text-xs tracking-[0.2em] flex items-center gap-2">
                <span>🤖</span> Gemini Inspector Report
              </h4>
              {result ? (
                <div className="whitespace-pre-wrap opacity-90">{result}</div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 italic text-center">
                   <p className="mb-4 text-4xl opacity-20">📋</p>
                   <p>Paste daily incident or operations logs on the left to receive an automated compliance assessment based on current Ontario regulations.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-600 p-10 rounded-[3rem] text-white flex justify-between items-center shadow-xl shadow-blue-200">
         <div>
            <h4 className="text-2xl font-black mb-2">Next Licensing Inspection Window</h4>
            <p className="text-blue-100 font-medium">Estimated timeframe based on your last renewal: <span className="font-black text-white px-2 py-1 bg-white/20 rounded-lg ml-2">Aug 15 - Sept 30, 2024</span></p>
         </div>
         <button className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-50 transition-all">Export Bundle (.PDF)</button>
      </div>
    </div>
  );
};

export default ComplianceAudit;