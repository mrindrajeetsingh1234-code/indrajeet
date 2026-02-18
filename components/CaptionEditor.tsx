
import React from 'react';
import { Caption } from '../types';

interface CaptionEditorProps {
  captions: Caption[];
  currentTime: number;
  onJumpTo: (time: number) => void;
  onEdit: (id: string, text: string) => void;
  isLoading: boolean;
}

const CaptionEditor: React.FC<CaptionEditorProps> = ({ 
  captions, 
  currentTime, 
  onJumpTo, 
  onEdit,
  isLoading 
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full glass rounded-2xl p-4 overflow-hidden shadow-xl border border-white/5">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <i className="fa-solid fa-closed-captioning text-blue-400"></i>
          Transcripts
        </h2>
        <span className="text-xs text-slate-400 font-mono">
          {captions.length} sequences detected
        </span>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="animate-pulse">Gemini is transcribing...</p>
        </div>
      ) : captions.length > 0 ? (
        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
          {captions.map((caption) => {
            const isActive = currentTime >= caption.start && currentTime <= caption.end;
            return (
              <div 
                key={caption.id}
                onClick={() => onJumpTo(caption.start)}
                className={`
                  p-3 rounded-xl cursor-pointer transition-all duration-200 border
                  ${isActive 
                    ? 'bg-blue-600/20 border-blue-500/50 shadow-inner' 
                    : 'bg-white/5 border-transparent hover:bg-white/10'
                  }
                `}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>
                    {formatTime(caption.start)} - {formatTime(caption.end)}
                  </span>
                  {isActive && <i className="fa-solid fa-volume-high text-[10px] text-blue-400 animate-pulse"></i>}
                </div>
                <textarea
                  className="w-full bg-transparent border-none resize-none focus:ring-0 text-sm p-0 text-slate-200 leading-relaxed"
                  value={caption.text}
                  onChange={(e) => onEdit(caption.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  rows={2}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-500 italic px-8 text-center">
          <i className="fa-solid fa-keyboard text-3xl opacity-20 mb-2"></i>
          <p>Upload a video to see the magic happen</p>
        </div>
      )}
    </div>
  );
};

export default CaptionEditor;
