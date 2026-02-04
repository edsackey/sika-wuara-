
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality, Type, LiveServerMessage } from '@google/genai';
import { Mic, MicOff, Volume2, Sparkles, Navigation, AlertCircle, RefreshCcw } from 'lucide-react';
import { encode, decode, decodeAudioData } from '../services/voiceService';
import { AppTab } from '../types';

interface VoiceOverlayProps {
  onNavigate: (tab: AppTab) => void;
  activeTab: AppTab;
}

const VoiceOverlay: React.FC<VoiceOverlayProps> = ({ onNavigate, activeTab }) => {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState('');
  const [aiTranscription, setAiTranscription] = useState('');
  
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Manual downsampling helper to convert hardware sample rate to 16000Hz required by Gemini
  const downsample = (buffer: Float32Array, inputSampleRate: number, outputSampleRate: number) => {
    if (inputSampleRate === outputSampleRate) return buffer;
    const sampleRateRatio = inputSampleRate / outputSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0;
      let count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = accum / count;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  };

  const startSession = async () => {
    setError(null);
    try {
      // Initialize Audio Contexts
      if (!audioContextInRef.current) {
        audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (!audioContextOutRef.current) {
        audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      // Browser policy: Resume context on user gesture
      await audioContextInRef.current.resume();
      await audioContextOutRef.current.resume();

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputSampleRate = audioContextInRef.current.sampleRate;
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            const source = audioContextInRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextInRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              // Ensure we only send if session is still the active one
              if (!isActive && !sessionRef.current) return;

              const inputData = e.inputBuffer.getChannelData(0);
              const downsampledData = downsample(inputData, inputSampleRate, 16000);
              
              const int16 = new Int16Array(downsampledData.length);
              for (let i = 0; i < downsampledData.length; i++) {
                const s = Math.max(-1, Math.min(1, downsampledData[i]));
                int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
              }
              
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then(session => {
                try {
                  session.sendRealtimeInput({ media: pcmBlob });
                } catch (e) {
                  // Ignore send errors if session closed mid-process
                }
              }).catch(() => {});
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextInRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              setTranscription(prev => prev + message.serverContent!.inputTranscription!.text);
            }
            if (message.serverContent?.outputTranscription) {
              setAiTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
            }
            if (message.serverContent?.turnComplete) {
              setTranscription('');
              setAiTranscription('');
            }

            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'navigateTo') {
                  const target = (fc.args as any).tab as AppTab;
                  onNavigate(target);
                  sessionPromise.then(s => s.sendToolResponse({
                    functionResponses: { id: fc.id, name: fc.name, response: { result: `Navigated to ${target}` } }
                  })).catch(() => {});
                }
              }
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextOutRef.current) {
              const ctx = audioContextOutRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Sika Wura Voice Error:', e);
            setError("Network connectivity issue. Please check your connection or API key.");
            stopSession();
          },
          onclose: () => {
            setIsActive(false);
            sessionRef.current = null;
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: `You are Sika Wura AI, the elite business voice assistant. 
          Respond to the user with proactive business advice and help them navigate the app. 
          Current Tab: ${activeTab}.`,
          tools: [{
            functionDeclarations: [{
              name: 'navigateTo',
              parameters: {
                type: Type.OBJECT,
                description: 'Navigate to a specific tab.',
                properties: {
                  tab: { type: Type.STRING, enum: Object.values(AppTab), description: 'Tab ID' }
                },
                required: ['tab']
              }
            }]
          }]
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error('Failed to initialize Sika Wura Voice:', err);
      setError(err.message || "Failed to establish voice session.");
      setIsActive(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch(e) {}
    }
    sessionRef.current = null;
    setIsActive(false);
    
    // Cleanup sources
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  return (
    <div className="fixed top-24 right-6 z-[100] flex flex-col items-end space-y-4">
      {error && (
        <div className="glass-morphism p-4 rounded-2xl w-64 border-red-500/50 bg-red-950/20 text-red-200 animate-in slide-in-from-top-4">
          <div className="flex items-center space-x-2 mb-2 text-red-400">
            <AlertCircle size={16} />
            <span className="text-xs font-bold uppercase tracking-tight">Connection Failed</span>
          </div>
          <p className="text-[11px] mb-3">{error}</p>
          <button 
            onClick={startSession}
            className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-[10px] font-bold uppercase flex items-center justify-center space-x-2"
          >
            <RefreshCcw size={12} />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {isActive && (
        <div className="glass-morphism p-4 rounded-2xl w-64 shadow-2xl border-amber-500/50 animate-in slide-in-from-right-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Sparkles size={16} className="text-amber-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Sika Wura Live</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          
          <div className="space-y-3 min-h-[60px]">
            {transcription && (
              <p className="text-xs text-slate-400 italic">User: {transcription}</p>
            )}
            {aiTranscription && (
              <p className="text-sm text-slate-100 font-medium">Sika Wura: {aiTranscription}</p>
            )}
            {!transcription && !aiTranscription && (
              <p className="text-xs text-slate-500 italic">Listening for business directives...</p>
            )}
          </div>
        </div>
      )}

      <button
        onClick={isActive ? stopSession : startSession}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl group relative ${
          isActive ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-amber-500 border border-slate-700 hover:border-amber-500/50'
        }`}
      >
        {isActive ? <Mic size={24} /> : <MicOff size={24} />}
        {isActive && (
          <span className="absolute inset-0 rounded-full bg-amber-500 animate-ping opacity-20" />
        )}
        <div className="absolute right-16 scale-0 group-hover:scale-100 transition-transform bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap border border-slate-800 uppercase tracking-tighter shadow-2xl">
          {isActive ? 'Stop Voice AI' : 'Wake Sika Wura'}
        </div>
      </button>
    </div>
  );
};

export default VoiceOverlay;
