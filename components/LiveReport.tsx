
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { X, Mic, Video, Radio, Loader2, StopCircle, Zap, Activity } from 'lucide-react';
import { User } from '../types';

interface LiveReportProps {
  user: User;
  onEnd: () => void;
}

const LiveReport: React.FC<LiveReportProps> = ({ user, onEnd }) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState("Ready to Initialize");
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Audio helpers
  const floatTo16BitPCM = (input: Float32Array) => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  };

  const base64ToUint8Array = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const startSession = async () => {
    setError(null);
    setStatus("Requesting Hardware Access...");
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true
        }, 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15 }
        } 
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setStatus("Connecting to City Grid (Gemini)...");

      const apiKey = (process.env.API_KEY || '').trim();
      if (!apiKey || apiKey === 'YOUR_API_KEY') {
        throw new Error("Invalid API Key. Cannot start live session.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Setup Audio Contexts
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 }); // Gemini 2.5 Native Audio output is 24kHz
      
      inputContextRef.current = inputCtx;
      outputContextRef.current = outputCtx;

      // Connect to Gemini Live
      const session = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are FixMyCity AI, a live civic issue reporting assistant for Solapur. 
          The user is streaming video. Identify road damage, garbage, or civic issues.
          - Be brief and professional.
          - Ask clarifying questions if the visual is unclear.
          - Confirm when you have identified an issue (e.g., "Pothole detected, logging location.").
          - Keep responses under 2 sentences mostly.`,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          }
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsStreaming(true);
            setStatus("Live - Monitoring Environment");
            
            // Start Audio Streaming
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmData = floatTo16BitPCM(inputData);
              const base64Audio = arrayBufferToBase64(pcmData.buffer);
              
              session.sendRealtimeInput({
                media: {
                  mimeType: 'audio/pcm;rate=16000',
                  data: base64Audio
                }
              });
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);
            
            sourceNodeRef.current = source;
            processorRef.current = processor;

            // Start Video Streaming (2 FPS is sufficient for analysis)
            intervalRef.current = window.setInterval(() => {
              if (canvasRef.current && videoRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                  canvasRef.current.width = videoRef.current.videoWidth / 2; // Downscale for bandwidth
                  canvasRef.current.height = videoRef.current.videoHeight / 2;
                  ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                  
                  const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
                  session.sendRealtimeInput({
                    media: {
                      mimeType: 'image/jpeg',
                      data: base64Image
                    }
                  });
                }
              }
            }, 500);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputContextRef.current) {
              const audioBytes = base64ToUint8Array(audioData);
              
              // Decode raw PCM
              const audioBuffer = outputContextRef.current.createBuffer(1, audioBytes.length / 2, 24000);
              const channelData = audioBuffer.getChannelData(0);
              const dataView = new DataView(audioBytes.buffer);
              
              for (let i = 0; i < audioBytes.length / 2; i++) {
                channelData[i] = dataView.getInt16(i * 2, true) / 32768.0;
              }

              const source = outputContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputContextRef.current.destination);
              
              const currentTime = outputContextRef.current.currentTime;
              if (nextStartTimeRef.current < currentTime) {
                nextStartTimeRef.current = currentTime;
              }
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
            }
          },
          onclose: () => {
            setIsConnected(false);
            setStatus("Disconnected");
          },
          onerror: (err) => {
            console.error(err);
            setError("Connection Error. Please retry.");
            stopSession();
          }
        }
      });
      
      sessionRef.current = session;

    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to initialize hardware");
      setIsStreaming(false);
    }
  };

  const stopSession = () => {
    if (processorRef.current && sourceNodeRef.current) {
      processorRef.current.disconnect();
      sourceNodeRef.current.disconnect();
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (inputContextRef.current) inputContextRef.current.close();
    if (outputContextRef.current) outputContextRef.current.close();
    
    // There isn't a direct close method on the session object exposed easily in the types sometimes, 
    // but disconnecting the stream and clearing refs is key.
    sessionRef.current = null;
    
    setIsStreaming(false);
    setIsConnected(false);
    setStatus("Session Ended");
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full animate-pulse ${isConnected ? 'bg-red-500' : 'bg-slate-500'}`} />
          <div>
             <h3 className="text-white font-bold text-lg flex items-center gap-2">
               LIVE REPORT
               {isConnected && <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/50 rounded text-[10px] text-red-400">ON AIR</span>}
             </h3>
             <p className="text-slate-300 text-xs font-mono">{status}</p>
          </div>
        </div>
        <button 
          onClick={onEnd}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
        {/* Video Feed */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover ${!isStreaming ? 'opacity-0' : 'opacity-100'}`} 
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Start / Placeholder UI */}
        {!isStreaming && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-900">
             <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 rounded-full border border-sky-500/30 animate-ping" />
                <Video size={40} className="text-slate-400" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-4">Initialize Field Stream</h2>
             <p className="text-slate-400 max-w-sm mb-12">
               Connect directly to the Municipal AI Grid. 
               Stream visual data of potholes, garbage, or civic hazards for instant analysis.
             </p>
             <button 
               onClick={startSession}
               className="group relative px-10 py-5 bg-sky-500 hover:bg-sky-400 text-white font-black tracking-widest rounded-3xl overflow-hidden transition-all shadow-[0_0_40px_rgba(14,165,233,0.3)]"
             >
               <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
               <span className="relative flex items-center gap-3">
                 <Radio size={24} className="animate-pulse" />
                 ESTABLISH UPLINK
               </span>
             </button>
          </div>
        )}

        {/* Error UI */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-950/90 z-20">
             <Activity size={48} className="text-red-500 mb-4" />
             <p className="text-red-400 font-bold mb-6 text-center">{error}</p>
             <div className="flex gap-4">
                <button 
                  onClick={() => { setError(null); setStatus("Ready"); }} 
                  className="px-6 py-3 bg-slate-800 text-white rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  onClick={startSession} 
                  className="px-6 py-3 bg-red-600 text-white rounded-xl"
                >
                  Retry Connection
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      {isStreaming && (
        <div className="absolute bottom-0 left-0 right-0 p-8 flex items-center justify-center gap-8 bg-gradient-to-t from-black/90 to-transparent">
          <div className="flex-1 text-center">
             <p className="text-sky-400 text-xs font-bold animate-pulse mb-1">AI LISTENING</p>
             <div className="h-1 bg-slate-800 rounded-full overflow-hidden w-full max-w-[100px] mx-auto">
                <div className="h-full bg-sky-500 animate-[pulse_1s_ease-in-out_infinite] w-[60%]" />
             </div>
          </div>
          
          <button 
            onClick={stopSession}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-red-900 transition-all transform hover:scale-105"
          >
            <StopCircle size={32} fill="currentColor" />
          </button>
          
          <div className="flex-1 text-center">
             <p className="text-emerald-400 text-xs font-bold mb-1">DATA STABLE</p>
             <p className="text-slate-500 text-[10px] font-mono">16kHz / 24FPS</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveReport;
