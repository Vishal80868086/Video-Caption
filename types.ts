export interface Subtitle {
  id: number;
  start: string; // "HH:MM:SS,mmm"
  end: string;   // "HH:MM:SS,mmm"
  text: string;
}

export interface ProcessingState {
  status: 'idle' | 'extracting' | 'transcribing' | 'completed' | 'error';
  message?: string;
  progress?: number; // 0-100
}

export interface VideoMetadata {
  name: string;
  duration: number;
  url: string;
  type: string;
}
