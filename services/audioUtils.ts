/**
 * Audio processing utilities to extract audio from video files 
 * and convert them to a format suitable for Gemini API (WAV/PCM).
 */

// Helper to convert Blob to ArrayBuffer
const blobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
};

// Helper to write string to DataView
const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

// Convert AudioBuffer to WAV Blob
const audioBufferToWav = (buffer: AudioBuffer): Blob => {
  const numOfChan = 1; // Force mono to save space
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArr = new ArrayBuffer(length);
  const view = new DataView(bufferArr);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  // Get the channel data
  const left = buffer.getChannelData(0);
  let right = null;
  if (buffer.numberOfChannels > 1) {
    right = buffer.getChannelData(1);
  }

  // write WAVE header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + buffer.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numOfChan, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, buffer.length * 2, true);

  // write interleaved data
  offset = 44;
  for (i = 0; i < buffer.length; i++) {
    // Mix down if stereo, otherwise just left
    let s = left[i];
    if (right) {
      s = (s + right[i]) / 2;
    }
    
    // Clamp
    sample = Math.max(-1, Math.min(1, s));
    
    // Sanity check for NaN/Infinity
    if (!isFinite(sample)) sample = 0;

    // scale to 16-bit signed int
    sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    view.setInt16(offset, sample, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
};

export const extractAudioFromVideo = async (
  videoFile: File,
  onProgress: (progress: number) => void
): Promise<string> => {
  try {
    const arrayBuffer = await blobToArrayBuffer(videoFile);
    
    // Create OfflineAudioContext if possible for faster non-realtime rendering, 
    // but regular AudioContext is safer for 'decodeAudioData' compatibility across browsers.
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    const audioContext = new AudioContextClass({
       sampleRate: 16000 // Attempt to request 16kHz
    });

    onProgress(10); // Started decoding

    // Decode audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    onProgress(50); // Decoded

    const wavBlob = audioBufferToWav(audioBuffer);
    onProgress(70); // Converted to WAV

    // Convert to Base64
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        const result = reader.result as string;
        // Handle case where result might be null
        if (!result) {
            reject(new Error("Failed to read blob"));
            return;
        }
        const base64data = result.split(',')[1];
        onProgress(100);
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(wavBlob);
    });
  } catch (error) {
    console.error("Error extracting audio", error);
    throw new Error("Failed to extract audio. Ensure the file is a valid video/audio format.");
  }
};

export const formatTime = (seconds: number): string => {
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours().toString().padStart(2, '0');
  const mm = date.getUTCMinutes().toString().padStart(2, '0');
  const ss = date.getUTCSeconds().toString().padStart(2, '0');
  const ms = date.getUTCMilliseconds().toString().padStart(3, '0');
  return `${hh}:${mm}:${ss},${ms}`;
};

export const parseTime = (timeStr: string): number => {
  if (!timeStr) return 0;
  
  // Supports HH:MM:SS,mmm (Comma) or HH:MM:SS.mmm (Dot)
  const parts = timeStr.split(/[:,\.]/);
  
  if (parts.length < 3) return 0;
  
  let h = 0, m = 0, s = 0, ms = 0;
  
  if (parts.length === 4) {
      h = parseInt(parts[0], 10) || 0;
      m = parseInt(parts[1], 10) || 0;
      s = parseInt(parts[2], 10) || 0;
      ms = parseInt(parts[3], 10) || 0;
  } else if (parts.length === 3) {
      h = parseInt(parts[0], 10) || 0;
      m = parseInt(parts[1], 10) || 0;
      s = parseInt(parts[2], 10) || 0;
  }
  
  return h * 3600 + m * 60 + s + ms / 1000;
};