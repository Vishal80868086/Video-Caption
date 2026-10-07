import React, { useRef, useState } from 'react';

interface HeroProps {
  onFileSelect: (file: File, language: string) => void;
}

type SceneType = 'subtitle' | 'transcript' | 'meeting';

const Hero: React.FC<HeroProps> = ({ onFileSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [scene, setScene] = useState<SceneType>('subtitle');
  const [language, setLanguage] = useState('English');
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        onFileSelect(file, language);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0], language);
    }
  };

  const languages = [
    { code: 'English', label: 'English' },
    { code: 'Hindi', label: 'Hindi' },
    { code: 'Spanish', label: 'Spanish' },
    { code: 'French', label: 'French' },
    { code: 'German', label: 'German' },
    { code: 'Japanese', label: 'Japanese' },
    { code: 'Chinese', label: 'Chinese' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] py-12 px-4">
      <div className="w-full max-w-2xl">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Select Scene
          </h2>
          <span className="text-orange-500 text-xs font-medium">Selected</span>
        </div>

        {/* Cards Stack */}
        <div className="flex flex-col gap-4 mb-8">
          
          {/* Subtitle Card */}
          <div 
            onClick={() => setScene('subtitle')}
            className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 group flex items-start gap-4
              ${scene === 'subtitle' 
                ? 'bg-slate-800/40 border-orange-500' 
                : 'bg-slate-800/20 border-slate-700 hover:border-slate-600'
              }`}
          >
            <div className={`p-3 rounded-xl ${scene === 'subtitle' ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12h.01" />
               </svg>
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-lg mb-1 ${scene === 'subtitle' ? 'text-orange-500' : 'text-slate-200'}`}>Subtitle</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Auto-generate multi-language subtitles for your videos</p>
            </div>
            {scene === 'subtitle' && (
              <div className="text-orange-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Transcript Card */}
          <div 
            onClick={() => setScene('transcript')}
            className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 group flex items-start gap-4
              ${scene === 'transcript' 
                ? 'bg-slate-800/40 border-orange-500' 
                : 'bg-slate-800/20 border-slate-700 hover:border-slate-600'
              }`}
          >
            <div className={`p-3 rounded-xl ${scene === 'transcript' ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
               </svg>
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-lg mb-1 ${scene === 'transcript' ? 'text-orange-500' : 'text-slate-200'}`}>Transcript</h3>
              <p className="text-sm text-slate-400 leading-relaxed">1:1 reproduction of dialogue with speaker identification</p>
            </div>
            {scene === 'transcript' && (
              <div className="text-orange-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Meeting Card */}
          <div 
            onClick={() => setScene('meeting')}
            className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 group flex items-start gap-4
              ${scene === 'meeting' 
                ? 'bg-slate-800/40 border-orange-500' 
                : 'bg-slate-800/20 border-slate-700 hover:border-slate-600'
              }`}
          >
            <div className="absolute -top-2.5 right-4 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg shadow-orange-500/20">
              POPULAR
            </div>
            <div className={`p-3 rounded-xl ${scene === 'meeting' ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
               </svg>
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold text-lg mb-1 ${scene === 'meeting' ? 'text-orange-500' : 'text-slate-200'}`}>Meeting</h3>
              <p className="text-sm text-slate-400 leading-relaxed">AI generates full transcript with summary, key decisions and action items</p>
            </div>
             {scene === 'meeting' && (
              <div className="text-orange-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Scene Settings */}
        <div className="mb-4">
          <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Scene Settings
          </h2>
        </div>

        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 space-y-6">
          
          {/* Source Language */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex items-start gap-3">
               <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 mt-1">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S12 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S12 3 12 3m0-18a9 9 0 018.716 6.747M12 3a9 9 0 00-8.716 6.747M12 3c2.485 0 4.5 4.03 4.5 9s-2.015 9-4.5 9m0 9h.008v.008H12V21s-.008-.008.008-.008h-.008V21zm.008-18h-.008v-.008h.008V3z" />
                 </svg>
               </div>
               <div>
                 <p className="font-medium text-slate-200">Source Language <span className="text-red-500">*</span></p>
                 <p className="text-xs text-slate-500">Language spoken in the media</p>
               </div>
             </div>
             
             <div className="relative min-w-[200px]">
               <select 
                 value={language}
                 onChange={(e) => setLanguage(e.target.value)}
                 className="w-full appearance-none bg-slate-900 border border-slate-700 rounded-lg py-2.5 px-4 pr-10 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
               >
                 {languages.map(lang => (
                   <option key={lang.code} value={lang.code}>{lang.label}</option>
                 ))}
               </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                 <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                 </svg>
               </div>
             </div>
          </div>

          <div className="h-px bg-slate-800 w-full" />

          {/* Additional Languages (Mock UI) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 opacity-75">
             <div className="flex items-start gap-3">
               <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 mt-1">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S12 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S12 3 12 3m0-18a9 9 0 018.716 6.747M12 3a9 9 0 00-8.716 6.747M12 3c2.485 0 4.5 4.03 4.5 9s-2.015 9-4.5 9m0 9h.008v.008H12V21s-.008-.008.008-.008h-.008V21zm.008-18h-.008v-.008h.008V3z" />
                 </svg>
               </div>
               <div>
                 <p className="font-medium text-slate-200">Add Additional Translation Languages</p>
                 <p className="text-xs text-slate-500">Select up to 3 languages</p>
               </div>
             </div>
             
             <div className="relative min-w-[200px]">
                <div className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 px-4 text-slate-500 cursor-not-allowed flex justify-between items-center">
                  Select languages
                   <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                 </svg>
                </div>
             </div>
          </div>

        </div>

        {/* Upload Action */}
        <div 
            className={`mt-8 border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer
              ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/50'}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
             <input
              type="file"
              ref={inputRef}
              className="hidden"
              accept="video/mp4,video/quicktime,video/x-matroska,video/webm"
              onChange={handleFileChange}
            />
            <div className="bg-blue-600 rounded-full p-4 mb-4 shadow-lg shadow-blue-500/20">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
               </svg>
            </div>
            <p className="text-lg font-medium text-white mb-1">Upload Video</p>
            <p className="text-sm text-slate-400">Drag & Drop or Click to Browse</p>
        </div>

      </div>
    </div>
  );
};

export default Hero;