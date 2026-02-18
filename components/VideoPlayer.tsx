
import React, { useRef, useEffect, useState } from 'react';
import { Caption, CaptionTheme } from '../types';

interface VideoPlayerProps {
  videoUrl: string;
  captions: Caption[];
  currentTheme: CaptionTheme;
  onTimeUpdate: (currentTime: number) => void;
  jumpToTime?: number | null;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  captions, 
  currentTheme, 
  onTimeUpdate,
  jumpToTime 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeCaption, setActiveCaption] = useState<Caption | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (jumpToTime !== null && jumpToTime !== undefined && videoRef.current) {
      videoRef.current.currentTime = jumpToTime;
      videoRef.current.play();
    }
  }, [jumpToTime]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    onTimeUpdate(time);

    const active = captions.find(c => time >= c.start && time <= c.end);
    setActiveCaption(active || null);
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group shadow-2xl border border-white/5">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        controls
      />
      
      {/* Caption Overlay */}
      {activeCaption && (
        <div className="absolute bottom-16 left-0 right-0 flex justify-center px-8 pointer-events-none transition-all duration-300">
          <div 
            className={`
              ${currentTheme.bgColor} 
              ${currentTheme.textColor} 
              ${currentTheme.fontFamily} 
              ${currentTheme.fontWeight} 
              ${currentTheme.fontSize} 
              ${currentTheme.borderRadius} 
              ${currentTheme.padding} 
              ${currentTheme.border || ''} 
              ${currentTheme.shadow || ''}
              text-center max-w-[80%] caption-shadow animate-in fade-in zoom-in duration-200
            `}
          >
            {activeCaption.text}
          </div>
        </div>
      )}

      {/* Upload Placeholder if no video */}
      {!videoUrl && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-900/50">
          <i className="fa-solid fa-film text-6xl mb-4 opacity-20"></i>
          <p className="text-lg">No video loaded</p>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
