import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import SubtitleEditor from './components/SubtitleEditor';
import ProcessingOverlay from './components/ProcessingOverlay';
import { Subtitle, VideoMetadata, ProcessingState } from './types';
import { extractAudioFromVideo } from './services/audioUtils';
import { generateCaptions } from './services/geminiService';

function App() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [processingState, setProcessingState] = useState<ProcessingState>({ status: 'idle' });
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);

  // Clean up object URL when component unmounts or video changes
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const handleFileSelect = async (file: File, language: string) => {
    // Basic validation
    if (!file.type.startsWith('video/')) {
      alert("Please upload a valid video file.");
      return;
    }
    
    // Create URL for preview
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    
    // Get duration (simplified, normally we'd wait for metadata load)
    const videoEl = document.createElement('video');
    videoEl.preload = 'metadata';
    videoEl.src = url;
    
    videoEl.onloadedmetadata = async () => {
       setMetadata({
        name: file.name,
        duration: videoEl.duration,
        type: file.type,
        url: url
       });

       // Start processing automatically with selected language
       await processVideo(file, language);
    };
  };

  const processVideo = async (file: File, language: string) => {
    try {
      setProcessingState({ status: 'extracting', progress: 0 });

      // 1. Extract Audio
      const audioBase64 = await extractAudioFromVideo(file, (progress) => {
        setProcessingState({ status: 'extracting', progress });
      });

      // 2. Send to Gemini
      setProcessingState({ status: 'transcribing', progress: 10 });
      
      // Artificial progress for the API call since it doesn't support progress events yet
      const progressInterval = setInterval(() => {
        setProcessingState(prev => {
          if (prev.status !== 'transcribing') return prev;
          const newProgress = (prev.progress || 0) + (Math.random() * 5);
          return { ...prev, progress: Math.min(newProgress, 90) };
        });
      }, 500);

      const apiKey = process.env.API_KEY || '';
      if (!apiKey) {
        alert("API Key not found in environment variables.");
        clearInterval(progressInterval);
        setProcessingState({ status: 'idle' });
        return;
      }

      const captions = await generateCaptions(audioBase64, apiKey, language);
      
      clearInterval(progressInterval);
      setProcessingState({ status: 'completed', progress: 100 });
      setSubtitles(captions);

    } catch (error) {
      console.error(error);
      setProcessingState({ status: 'error', message: "Failed to process video." });
      alert("Error: " + (error as Error).message);
      setVideoFile(null); // Reset on error
    }
  };

  const handleReset = () => {
    setVideoFile(null);
    setVideoUrl(null);
    setSubtitles([]);
    setProcessingState({ status: 'idle' });
    setMetadata(null);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-blue-500/30">
      <nav className="border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3.75h9m-9 3.75h9m-9 3.75h9m1.5-13.5v2.25H21a2.25 2.25 0 012.25 2.25V21a2.25 2.25 0 01-2.25 2.25H2.25A2.25 2.25 0 010 21V6.75A2.25 2.25 0 012.25 4.5H4.5v2.25" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              CaptionAI
            </span>
          </div>
          <a 
            href="https://ai.google.dev" 
            target="_blank" 
            rel="noreferrer"
            className="text-xs font-medium px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-600 transition-colors"
          >
            Powered by Gemini 2.0 Flash
          </a>
        </div>
      </nav>

      <main className="relative">
        <ProcessingOverlay state={processingState} />
        
        {!videoFile ? (
          <Hero onFileSelect={handleFileSelect} />
        ) : (
          metadata && (
            <SubtitleEditor 
              videoUrl={videoUrl!} 
              metadata={metadata}
              subtitles={subtitles}
              onReset={handleReset}
            />
          )
        )}
      </main>
    </div>
  );
}

export default App;