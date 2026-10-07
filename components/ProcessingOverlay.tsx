import React from 'react';
import { ProcessingState } from '../types';

interface ProcessingOverlayProps {
  state: ProcessingState;
}

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ state }) => {
  if (state.status === 'idle' || state.status === 'completed' || state.status === 'error') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
      <div className="w-full max-w-md p-8 bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl">
        <div className="flex flex-col items-center">
          
          <div className="relative w-20 h-20 mb-6">
            <svg className="animate-spin w-full h-full text-blue-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white">{Math.round(state.progress || 0)}%</span>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-white mb-2">
            {state.status === 'extracting' && 'Extracting Audio...'}
            {state.status === 'transcribing' && 'AI Generating Captions...'}
          </h3>
          
          <p className="text-slate-400 text-center text-sm">
             {state.status === 'extracting' ? 'Analyzing video file structure.' : 'This may take a minute depending on video length.'}
          </p>

          <div className="w-full h-2 bg-slate-700 rounded-full mt-6 overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingOverlay;
