
import React, { useState, useEffect, useRef } from 'react';
import VideoPlayer from './components/VideoPlayer';
import CaptionEditor from './components/CaptionEditor';
import { generateCaptions, createVeoVideo, deepAnalyze, generateImagePro } from './services/geminiService';
import { Caption, CAPTION_THEMES, CaptionTheme } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'create' | 'lab'>('editor');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [currentTheme, setCurrentTheme] = useState<CaptionTheme>(CAPTION_THEMES.neon);
  const [currentTime, setCurrentTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [jumpToTime, setJumpToTime] = useState<number | null>(null);

  // Creative Studio State
  const [veoPrompt, setVeoPrompt] = useState('');
  const [isVeoing, setIsVeoing] = useState(false);
  const [veoResult, setVeoResult] = useState<string | null>(null);
  const [labPrompt, setLabPrompt] = useState('');
  const [labResult, setLabResult] = useState('');
  const [isLabbing, setIsLabbing] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setCaptions([]);
    }
  };

  const runTurboCaptions = async () => {
    if (!videoFile) return;
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const res = await generateCaptions(base64, videoFile.type);
        setCaptions(res);
        setIsProcessing(false);
      };
      reader.readAsDataURL(videoFile);
    } catch (e) {
      setIsProcessing(false);
    }
  };

  const handleVeoGen = async () => {
    setIsVeoing(true);
    try {
      const url = await createVeoVideo(veoPrompt);
      setVeoResult(url);
    } catch (e) { console.error(e); }
    setIsVeoing(false);
  };

  const handleLabAnalysis = async () => {
    setIsLabbing(true);
    try {
      let media: any = undefined;
      if (videoFile) {
        const b64 = await new Promise<string>(r => {
          const reader = new FileReader();
          reader.onload = () => r((reader.result as string).split(',')[1]);
          reader.readAsDataURL(videoFile);
        });
        media = { data: b64, mimeType: videoFile.type };
      }
      const res = await deepAnalyze(labPrompt, media);
      setLabResult(res || '');
    } catch (e) { console.error(e); }
    setIsLabbing(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0f19]">
      {/* Top Bar */}
      <div className="pt-10 pb-4 px-6 flex items-center justify-between border-b border-white/5 bg-[#0b0f19]/80 backdrop-blur-md sticky top-0 z-50">
        <div>
          <h1 className="text-xl font-extrabold tracking-tighter text-white flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-[10px]">L</span>
            LUMINA<span className="text-blue-500">ULTRA</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Turbo Engine Activated</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10 cursor-pointer">
            <i className="fa-solid fa-plus text-sm"></i>
            <input type="file" accept="video/*" onChange={handleFile} className="hidden" />
          </label>
          <button 
            onClick={runTurboCaptions} 
            disabled={!videoFile || isProcessing}
            className={`px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 transition-all ${isProcessing ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'}`}
          >
            {isProcessing ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-bolt"></i>}
            TURBO
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 overflow-y-auto custom-scroll pb-24">
        {/* Always visible video preview in Editor tab */}
        {activeTab === 'editor' && (
          <div className="p-4 flex flex-col gap-4">
            <div className="android-shadow rounded-3xl overflow-hidden border border-white/5">
              <VideoPlayer 
                videoUrl={videoUrl} 
                captions={captions} 
                currentTheme={currentTheme} 
                onTimeUpdate={setCurrentTime} 
                jumpToTime={jumpToTime} 
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="material-surface p-4 rounded-3xl">
                <h3 className="text-xs font-black text-slate-500 mb-3 tracking-widest">CAPTION STYLES</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scroll">
                  {Object.entries(CAPTION_THEMES).map(([key, theme]) => (
                    <button key={key} onClick={() => setCurrentTheme(theme)} className={`flex-shrink-0 px-4 py-2 rounded-2xl border text-[10px] font-bold transition-all ${currentTheme.name === theme.name ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-white/5 border-transparent text-slate-400'}`}>
                      {theme.name.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[400px]">
                <CaptionEditor 
                  captions={captions} 
                  currentTime={currentTime} 
                  onJumpTo={(t) => { setJumpToTime(t); setTimeout(() => setJumpToTime(null), 100); }} 
                  onEdit={(id, txt) => setCaptions(c => c.map(cp => cp.id === id ? {...cp, text: txt} : cp))} 
                  isLoading={isProcessing} 
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="material-surface p-6 rounded-3xl border-pink-500/20 shadow-xl shadow-pink-900/10">
              <h2 className="text-xl font-black mb-4 flex items-center gap-3"><i className="fa-solid fa-clapperboard text-pink-500"></i> Veo Creator</h2>
              <p className="text-xs text-slate-400 mb-4 font-medium">Generate cinema-quality 16:9 videos with text-to-video AI.</p>
              <textarea 
                value={veoPrompt} 
                onChange={e => setVeoPrompt(e.target.value)}
                placeholder="A futuristic cybernetic city in the rain, cinematic lighting, 4k..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 ring-pink-500 outline-none transition-all h-32"
              />
              <button onClick={handleVeoGen} disabled={isVeoing} className="w-full mt-4 py-4 bg-pink-600 rounded-2xl font-black text-sm hover:bg-pink-500 transition-all shadow-xl shadow-pink-900/30">
                {isVeoing ? <i className="fa-solid fa-spinner animate-spin mr-2"></i> : <i className="fa-solid fa-sparkles mr-2"></i>}
                {isVeoing ? 'GENERATING CINEMA...' : 'CREATE VIDEO'}
              </button>
            </div>
            {veoResult && (
              <div className="rounded-3xl overflow-hidden android-shadow border border-white/10 animate-in zoom-in duration-500">
                <video src={veoResult} controls autoPlay loop className="w-full" />
              </div>
            )}
          </div>
        )}

        {activeTab === 'lab' && (
          <div className="p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="material-surface p-6 rounded-3xl border-amber-500/20 shadow-xl shadow-amber-900/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black flex items-center gap-3"><i className="fa-solid fa-brain text-amber-500"></i> AI Intelligence</h2>
                <span className="px-2 py-1 bg-amber-500/20 text-amber-500 rounded-md text-[8px] font-black tracking-widest border border-amber-500/30 uppercase">Thinking Enabled</span>
              </div>
              <textarea 
                value={labPrompt} 
                onChange={e => setLabPrompt(e.target.value)}
                placeholder="Ask Pro to analyze the video, identify objects, or solve complex logic..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 ring-amber-500 outline-none transition-all h-24"
              />
              <button onClick={handleLabAnalysis} disabled={isLabbing} className="w-full mt-4 py-4 bg-amber-600 rounded-2xl font-black text-sm hover:bg-amber-500 transition-all shadow-xl shadow-amber-900/30">
                {isLabbing ? <i className="fa-solid fa-cog animate-spin mr-2"></i> : <i className="fa-solid fa-atom mr-2"></i>}
                {isLabbing ? 'PRO THINKING...' : 'DEEP ANALYZE'}
              </button>
            </div>
            {labResult && (
              <div className="material-surface p-5 rounded-3xl border-white/5 font-mono text-xs leading-relaxed text-amber-100/80 animate-in fade-in duration-500 overflow-hidden">
                <div className="flex items-center gap-2 mb-3 text-slate-500">
                   <i className="fa-solid fa-terminal"></i>
                   <span className="text-[10px] font-bold">GEMINI_PRO_OUTPUT_STREAM</span>
                </div>
                {labResult}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Android Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#0b0f19]/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4 z-[100]">
        <button onClick={() => setActiveTab('editor')} className="flex flex-col items-center gap-1 group relative flex-1">
          <i className={`fa-solid fa-photo-film text-lg transition-all ${activeTab === 'editor' ? 'text-blue-500 scale-110' : 'text-slate-500'}`}></i>
          <span className={`text-[9px] font-bold tracking-tighter ${activeTab === 'editor' ? 'text-blue-500' : 'text-slate-500'}`}>EDITOR</span>
          {activeTab === 'editor' && <div className="absolute -top-3 w-8 active-tab-indicator rounded-full"></div>}
        </button>
        <button onClick={() => setActiveTab('create')} className="flex flex-col items-center gap-1 group relative flex-1">
          <i className={`fa-solid fa-wand-magic-sparkles text-lg transition-all ${activeTab === 'create' ? 'text-pink-500 scale-110' : 'text-slate-500'}`}></i>
          <span className={`text-[9px] font-bold tracking-tighter ${activeTab === 'create' ? 'text-pink-500' : 'text-slate-500'}`}>CREATE</span>
          {activeTab === 'create' && <div className="absolute -top-3 w-8 h-[3px] bg-pink-500 shadow-[0_0_8px_#ec4899] rounded-full"></div>}
        </button>
        <div className="relative -top-6 flex-1 flex justify-center">
            <button className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-900/50 border-4 border-[#0b0f19] transform active:scale-90 transition-transform">
              <i className="fa-solid fa-microphone-lines text-2xl"></i>
            </button>
        </div>
        <button onClick={() => setActiveTab('lab')} className="flex flex-col items-center gap-1 group relative flex-1">
          <i className={`fa-solid fa-microchip text-lg transition-all ${activeTab === 'lab' ? 'text-amber-500 scale-110' : 'text-slate-500'}`}></i>
          <span className={`text-[9px] font-bold tracking-tighter ${activeTab === 'lab' ? 'text-amber-500' : 'text-slate-500'}`}>LAB</span>
          {activeTab === 'lab' && <div className="absolute -top-3 w-8 h-[3px] bg-amber-500 shadow-[0_0_8px_#f59e0b] rounded-full"></div>}
        </button>
        <button className="flex flex-col items-center gap-1 group flex-1">
          <i className="fa-solid fa-user-gear text-lg text-slate-500 group-hover:text-white transition-all"></i>
          <span className="text-[9px] font-bold tracking-tighter text-slate-500">PRO</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
