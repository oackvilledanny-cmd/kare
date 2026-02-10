
import React, { useState, useRef } from 'react';
import { Child, Activity, AIActivityReport } from '../types';
import { analyzeChildActivity } from '../services/geminiService';

interface ParentChildConnectProps {
  child: Child;
}

const VIDEO_CLIPS = [
  { 
    id: 'v1', 
    time: '10:00 AM', 
    label: 'Morning Circle & Story', 
    description: 'Sitting in a circle, listening to "The Very Hungry Caterpillar", raising hand to answer questions about the butterfly.',
    thumbnailGradient: 'from-amber-300 to-orange-500',
    emoji: '🦋',
    duration: '12:04'
  },
  { 
    id: 'v2', 
    time: '11:30 AM', 
    label: 'Outdoor Sensory Play', 
    description: 'Playing in the sandpit, filling buckets, sharing a shovel with a friend, and laughing while making sandcastles.',
    thumbnailGradient: 'from-emerald-300 to-teal-500',
    emoji: '🏰',
    duration: '08:30'
  },
  { 
    id: 'v3', 
    time: '03:00 PM', 
    label: 'Art & Creative Expression', 
    description: 'Using finger paints to draw a family portrait, focusing intensely on mixing colors, and proudly showing the result to the teacher.',
    thumbnailGradient: 'from-purple-400 to-indigo-500',
    emoji: '🎨',
    duration: '15:10'
  },
  { 
    id: 'v4', 
    time: '04:15 PM', 
    label: 'Music & Movement', 
    description: 'Dancing to the cleanup song, coordinating hand movements with the rhythm.',
    thumbnailGradient: 'from-pink-400 to-rose-500',
    emoji: '🎵',
    duration: '05:45'
  },
];

const ParentChildConnect: React.FC<ParentChildConnectProps> = ({ child }) => {
  const [selectedClip, setSelectedClip] = useState(VIDEO_CLIPS[0]);
  const [report, setReport] = useState<AIActivityReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showVideoOverlay, setShowVideoOverlay] = useState(false);
  
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setReport(null);
    try {
      const result = await analyzeChildActivity(child.name, selectedClip.description);
      setReport(result);
    } catch (error) {
      console.error("AI Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const changeClip = (clip: typeof VIDEO_CLIPS[0]) => {
    setSelectedClip(clip);
    setReport(null);
    setShowVideoOverlay(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-24">
      {/* Header */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-blue-100 flex items-center justify-center text-4xl md:text-6xl shadow-inner border-4 border-white ring-4 ring-blue-50">
            👶
          </div>
          <div className={`absolute bottom-2 right-2 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${child.status === 'Checked-in' ? 'bg-emerald-500' : 'bg-slate-300'}`}>
             {child.status === 'Checked-in' && <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>}
          </div>
        </div>
        <div className="text-center md:text-left relative z-10">
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">Hi, {child.parentName.split(' ')[0]}!</h2>
          <p className="text-slate-500 font-medium mt-2">Here is {child.name}'s journey today.</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
             <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">{child.classroom}</span>
             <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">Age {child.age}</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Moment Carousel */}
        <div>
           <h3 className="text-xl font-black text-slate-800 px-2 flex items-center gap-2 mb-4">
             <span className="text-blue-500 bg-blue-50 p-2 rounded-lg">📹</span> Today's Moments
           </h3>
           <div 
             ref={carouselRef}
             className="flex overflow-x-auto gap-5 pb-6 pt-2 px-2 scrollbar-hide snap-x"
             style={{ scrollBehavior: 'smooth' }}
           >
              {VIDEO_CLIPS.map(clip => {
                const isSelected = selectedClip.id === clip.id;
                return (
                  <button
                    key={clip.id}
                    onClick={() => changeClip(clip)}
                    className={`flex-shrink-0 relative group transition-all duration-300 snap-start text-left ${
                      isSelected ? 'scale-105 opacity-100' : 'opacity-70 hover:opacity-100 hover:scale-[1.02]'
                    }`}
                  >
                    <div className={`w-[240px] h-[140px] md:w-[280px] md:h-[160px] rounded-3xl bg-gradient-to-br ${clip.thumbnailGradient} shadow-lg relative overflow-hidden ring-offset-4 ring-offset-slate-50 transition-all ${isSelected ? 'ring-4 ring-blue-500 shadow-blue-200' : 'ring-0'}`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white text-xl border border-white/40 transition-transform ${isSelected ? 'scale-110' : 'scale-100'}`}>
                                ▶
                            </div>
                        </div>
                        <div className="absolute bottom-[-10px] right-[-10px] text-6xl opacity-20 transform rotate-12 select-none pointer-events-none">
                            {clip.emoji}
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-lg border border-white/20">
                            {clip.duration}
                        </div>
                    </div>
                    <div className="mt-3 px-2">
                        <p className={`font-bold text-sm truncate w-[240px] ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>{clip.label}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{clip.time}</p>
                    </div>
                  </button>
                )
              })}
           </div>
        </div>

        {/* Video & AI Report Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            <div className="xl:col-span-3 space-y-4">
                <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative aspect-video group">
                    <div className={`absolute inset-0 bg-gradient-to-br ${selectedClip.thumbnailGradient} opacity-20`}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-9xl opacity-20 select-none animate-pulse grayscale">{selectedClip.emoji}</span>
                    </div>
                    <div className="absolute inset-0 bg-black/10 flex flex-col justify-between p-6 md:p-10 transition-colors hover:bg-black/20">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <span className="bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg animate-pulse">Recorded</span>
                                <span className="bg-black/40 backdrop-blur-md text-white px-3 py-1.5 rounded-lg font-mono text-xs border border-white/10">{selectedClip.time}</span>
                            </div>
                        </div>
                        <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-4 border border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="text-white flex-1 w-full">
                                <p className="font-bold text-sm truncate">{selectedClip.label}</p>
                                <div className="w-full bg-white/20 h-1 rounded-full mt-2 overflow-hidden">
                                    <div className="w-1/3 h-full bg-blue-500 rounded-full"></div>
                                </div>
                            </div>
                            <button 
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="w-full md:w-auto bg-white text-slate-900 hover:bg-blue-50 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isAnalyzing ? "Analyzing..." : "✨ Analyze"}
                            </button>
                        </div>
                    </div>
                    {isAnalyzing && (
                        <div className="absolute inset-0 bg-slate-900/95 z-20 flex flex-col items-center justify-center text-center p-8 animate-in fade-in">
                            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-8"></div>
                            <h4 className="text-3xl font-black text-white mb-2">Processing Moment...</h4>
                            <p className="text-slate-400 text-sm max-w-md">Gemini AI is identifying pedagogical insights and milestones.</p>
                        </div>
                    )}
                </div>
                <div className="px-4 text-sm text-slate-500 font-medium italic">
                    "{selectedClip.description}"
                </div>
            </div>

            <div className="xl:col-span-2">
                {report ? (
                    <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl h-full animate-in slide-in-from-right-8 duration-500">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl shadow-lg">✨</div>
                            <div>
                                <h4 className="font-black text-slate-800 text-lg">Insight Report</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Powered by Gemini</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-[2rem]"></div>
                                <p className="text-slate-700 leading-relaxed font-medium text-sm">"{report.summary}"</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-purple-50 p-5 rounded-[2rem] border border-purple-100 text-center">
                                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Mood</p>
                                    <p className="text-lg font-black text-purple-700">{report.mood}</p>
                                </div>
                                <div className="bg-blue-50 p-5 rounded-[2rem] border border-blue-100 text-center">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Skill</p>
                                    <p className="text-lg font-black text-blue-700 truncate px-2">{report.skills[0] || 'Focus'}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Observed Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {report.skills.map((skill, i) => (
                                        <span key={i} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold">{skill}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-100 bg-emerald-50/50 -mx-8 -mb-8 p-8 rounded-b-[3rem]">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <span className="text-lg">🏡</span> Home Activity Recommendation
                                </p>
                                <p className="text-sm font-bold text-slate-700">{report.recommendation}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full min-h-[400px] bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-8 opacity-60">
                         <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-4xl mb-4 grayscale">✨</div>
                         <h4 className="font-black text-slate-400 text-lg uppercase tracking-widest">Waiting for Analysis</h4>
                         <p className="text-sm text-slate-400 mt-2 max-w-xs">Select a clip and click "Analyze" to see development progress.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ParentChildConnect;
