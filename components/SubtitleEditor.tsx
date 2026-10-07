import React, { useEffect, useRef, useState } from 'react';
import { Subtitle, VideoMetadata } from '../types';
import Button from './Button';
import { parseTime } from '../services/audioUtils';

interface SubtitleEditorProps {
  videoUrl: string;
  metadata: VideoMetadata;
  subtitles: Subtitle[];
  onReset: () => void;
}

const SubtitleEditor: React.FC<SubtitleEditorProps> = ({ 
  videoUrl, 
  metadata, 
  subtitles: initialSubtitles,
  onReset
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const subtitleContainerRef = useRef<HTMLDivElement>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>(initialSubtitles);
  const [currentSubtitleId, setCurrentSubtitleId] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [showCaptions, setShowCaptions] = useState(true);
  
  // Style Settings State
  const [activeTab, setActiveTab] = useState<'transcript' | 'style'>('transcript');
  const [captionStyle, setCaptionStyle] = useState({
    fontSize: 24,
    color: '#ffffff',
    backgroundColor: '#000000',
    opacity: 0.6,
    bottom: 12, // % from bottom
  });

  // Generate VTT blob for native player support (accessibility & fullscreen)
  useEffect(() => {
    if (subtitles.length > 0 && videoRef.current) {
      const vttContent = 'WEBVTT\n\n' + subtitles.map(sub => {
          const start = sub.start.replace(',', '.');
          const end = sub.end.replace(',', '.');
          return `${start} --> ${end}\n${sub.text}`;
      }).join('\n\n');

      const blob = new Blob([vttContent], { type: 'text/vtt' });
      const trackUrl = URL.createObjectURL(blob);
      
      const trackElement = videoRef.current.querySelector('track');
      if (trackElement) {
          trackElement.src = trackUrl;
          if (trackElement.track) {
             trackElement.track.mode = 'hidden'; 
          }
      }

      return () => {
        URL.revokeObjectURL(trackUrl);
      };
    }
  }, [subtitles]);

  // Sync video time to state
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      const active = subtitles.find(sub => {
        const start = parseTime(sub.start);
        const end = parseTime(sub.end);
        return time >= start && time <= end;
      });

      if (active) {
        if (active.id !== currentSubtitleId) {
            setCurrentSubtitleId(active.id);
            if (activeTab === 'transcript') {
                scrollToSubtitle(active.id);
            }
        }
      } else {
        if (currentSubtitleId !== null) {
            setCurrentSubtitleId(null);
        }
      }
    }
  };

  const scrollToSubtitle = (id: number) => {
    if (subtitleContainerRef.current) {
      const element = document.getElementById(`subtitle-${id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const jumpToSubtitle = (startStr: string, autoPlay: boolean = true) => {
    if (videoRef.current) {
      videoRef.current.currentTime = parseTime(startStr);
      if (autoPlay) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleTextChange = (id: number, newText: string) => {
    setSubtitles(prev => prev.map(sub => 
        sub.id === id ? { ...sub, text: newText } : sub
    ));
  };

  const handleExport = (format: 'srt' | 'vtt') => {
    let content = '';
    if (format === 'srt') {
      content = subtitles.map((sub, i) => `${i + 1}\n${sub.start} --> ${sub.end}\n${sub.text}\n`).join('\n');
    } else {
      content = 'WEBVTT\n\n' + subtitles.map(sub => `${sub.start} --> ${sub.end}\n${sub.text}\n`).join('\n');
      content = content.replace(/,(\d{3})/g, '.$1');
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata.name.split('.')[0]}_captions.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper to convert hex to rgba
  const getBackgroundColor = () => {
    if (captionStyle.backgroundColor === 'transparent') return 'transparent';
    const hex = captionStyle.backgroundColor;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${captionStyle.opacity})`;
  };

  // Determine what text to show on overlay
  const overlayText = currentSubtitleId !== null 
    ? subtitles.find(s => s.id === currentSubtitleId)?.text
    : (activeTab === 'style' ? "Preview: This is how your captions will appear." : null);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-7xl mx-auto px-4 py-6 gap-6">
      
      {/* Header Toolbar */}
      <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onReset} className="!px-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back
          </Button>
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold truncate max-w-[200px] md:max-w-md text-white" title={metadata.name}>
                {metadata.name}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
                {subtitles.length} segments • {metadata.duration ? `${Math.floor(metadata.duration/60)}m ${Math.floor(metadata.duration%60)}s` : 'Unknown duration'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setShowCaptions(!showCaptions)}
                className={`p-2 rounded-lg transition-colors border ${showCaptions ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400 hover:text-white'}`}
                title={showCaptions ? "Hide Captions" : "Show Captions"}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    {showCaptions ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    )}
                </svg>
            </button>
          <div className="h-6 w-px bg-slate-700 mx-1"></div>
          <Button variant="secondary" onClick={() => handleExport('vtt')} className="hidden sm:flex text-sm">Export VTT</Button>
          <Button onClick={() => handleExport('srt')} className="text-sm">Export SRT</Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
        
        {/* Video Player */}
        <div className="flex-1 bg-black rounded-2xl overflow-hidden shadow-2xl relative flex items-center justify-center bg-slate-950 border border-slate-800 group">
            <video 
                ref={videoRef}
                src={videoUrl}
                className="max-h-full w-full h-full object-contain"
                controls
                onTimeUpdate={handleTimeUpdate}
                playsInline
                crossOrigin="anonymous"
            >
                <track 
                    kind="captions" 
                    srcLang="en" 
                    label="English"
                    default
                />
            </video>
            
            {/* Custom Overlay Captions */}
            {showCaptions && overlayText && (
                <div 
                  className="absolute left-4 right-4 flex justify-center pointer-events-none z-30 transition-all duration-300"
                  style={{ bottom: `${captionStyle.bottom}%` }}
                >
                     <div 
                        className="backdrop-blur-md px-6 py-4 rounded-2xl font-semibold text-center shadow-2xl transition-all duration-200 max-w-3xl leading-snug"
                        style={{ 
                          fontSize: `${captionStyle.fontSize}px`,
                          color: captionStyle.color,
                          backgroundColor: getBackgroundColor(),
                          textShadow: '0 2px 4px rgba(0,0,0,0.5)' 
                        }}
                     >
                        {overlayText}
                     </div>
                </div>
            )}
        </div>

        {/* Right Sidebar - Tabbed Interface */}
        <div className="lg:w-[400px] bg-slate-800/50 rounded-2xl border border-slate-700 flex flex-col h-[400px] lg:h-full backdrop-blur-sm overflow-hidden">
            
            {/* Sidebar Tabs */}
            <div className="flex border-b border-slate-700 bg-slate-800/80">
                <button 
                  onClick={() => setActiveTab('transcript')}
                  className={`flex-1 py-3 text-sm font-medium transition-all relative ${
                    activeTab === 'transcript' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Transcript
                  {activeTab === 'transcript' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('style')}
                  className={`flex-1 py-3 text-sm font-medium transition-all relative ${
                    activeTab === 'style' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Appearance
                  {activeTab === 'style' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>}
                </button>
            </div>
            
            {/* Sidebar Content */}
            <div className="flex-1 overflow-hidden relative">
              
              {/* Transcript View */}
              {activeTab === 'transcript' && (
                <div ref={subtitleContainerRef} className="absolute inset-0 overflow-y-auto custom-scrollbar p-3 space-y-2">
                    {subtitles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                            <p>No subtitles generated yet.</p>
                        </div>
                    ) : (
                        subtitles.map((sub) => (
                            <div 
                                key={sub.id}
                                id={`subtitle-${sub.id}`}
                                onClick={() => jumpToSubtitle(sub.start, true)}
                                className={`
                                    p-4 rounded-xl cursor-pointer transition-all duration-200 border group
                                    ${currentSubtitleId === sub.id 
                                        ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                                        : 'bg-slate-800/50 border-transparent hover:bg-slate-700/50 hover:border-slate-600'
                                    }
                                `}
                            >
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${currentSubtitleId === sub.id ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'}`}>
                                        {sub.start.split(',')[0]}
                                    </span>
                                </div>
                                <textarea
                                    value={sub.text}
                                    onChange={(e) => handleTextChange(sub.id, e.target.value)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        jumpToSubtitle(sub.start, false);
                                    }}
                                    className={`w-full bg-transparent border-none outline-none resize-none text-sm leading-relaxed p-0 focus:ring-0 ${currentSubtitleId === sub.id ? 'text-white font-medium' : 'text-slate-300'}`}
                                    rows={sub.text.length > 80 ? 3 : 2}
                                />
                            </div>
                        ))
                    )}
                </div>
              )}

              {/* Style View */}
              {activeTab === 'style' && (
                <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-6 space-y-8">
                    
                    {/* Font Size */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                           <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Font Size</label>
                           <span className="text-xs font-mono text-slate-500">{captionStyle.fontSize}px</span>
                        </div>
                        <input 
                            type="range" 
                            min="12" 
                            max="64" 
                            value={captionStyle.fontSize} 
                            onChange={(e) => setCaptionStyle({...captionStyle, fontSize: Number(e.target.value)})}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>

                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Text Color</label>
                           <div className="grid grid-cols-4 gap-2">
                              {['#ffffff', '#fbbf24', '#4ade80', '#22d3ee', '#f472b6', '#000000'].slice(0, 4).map(color => (
                                  <button 
                                    key={color} 
                                    onClick={() => setCaptionStyle({...captionStyle, color})}
                                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${captionStyle.color === color ? 'border-white scale-110 shadow-lg' : 'border-slate-600'}`}
                                    style={{ backgroundColor: color }}
                                  />
                              ))}
                              <input 
                                type="color" 
                                value={captionStyle.color}
                                onChange={(e) => setCaptionStyle({...captionStyle, color: e.target.value})}
                                className="w-8 h-8 rounded-full overflow-hidden border-none p-0 cursor-pointer opacity-50 hover:opacity-100"
                              />
                           </div>
                        </div>

                         <div className="space-y-3">
                           <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Background</label>
                           <div className="grid grid-cols-4 gap-2">
                              {['#000000', '#1e293b', '#ef4444'].map(color => (
                                  <button 
                                    key={color} 
                                    onClick={() => setCaptionStyle({...captionStyle, backgroundColor: color})}
                                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${captionStyle.backgroundColor === color ? 'border-white scale-110 shadow-lg' : 'border-slate-600'}`}
                                    style={{ backgroundColor: color }}
                                  />
                              ))}
                              <button 
                                    onClick={() => setCaptionStyle({...captionStyle, backgroundColor: 'transparent'})}
                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 ${captionStyle.backgroundColor === 'transparent' ? 'border-white scale-110 shadow-lg' : 'border-slate-600'}`}
                                    style={{ backgroundColor: 'transparent' }}
                                    title="Transparent"
                                  >
                                    <div className="w-0.5 h-full bg-red-500 rotate-45"></div>
                              </button>
                           </div>
                        </div>
                    </div>

                    {/* Opacity */}
                    {captionStyle.backgroundColor !== 'transparent' && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Background Opacity</label>
                                <span className="text-xs font-mono text-slate-500">{Math.round(captionStyle.opacity * 100)}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.05"
                                value={captionStyle.opacity} 
                                onChange={(e) => setCaptionStyle({...captionStyle, opacity: Number(e.target.value)})}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                    )}

                    {/* Vertical Position */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                           <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vertical Position</label>
                           <span className="text-xs font-mono text-slate-500">{captionStyle.bottom}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="5" 
                            max="80" 
                            value={captionStyle.bottom} 
                            onChange={(e) => setCaptionStyle({...captionStyle, bottom: Number(e.target.value)})}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <p className="text-[10px] text-slate-500 text-right">Offset from bottom</p>
                    </div>

                    <div className="pt-4 border-t border-slate-700">
                         <p className="text-xs text-slate-500 text-center">
                            Changes apply immediately to preview and export (if format supports styling).
                         </p>
                    </div>

                </div>
              )}

            </div>
        </div>
      </div>
    </div>
  );
};

export default SubtitleEditor;