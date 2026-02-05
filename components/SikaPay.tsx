import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Zap, ShieldCheck, Globe, Smartphone, Landmark, Hash, 
  Plus, Search, Filter, MoreVertical, Terminal, BarChart3, 
  Download, ArrowUpRight, ArrowDownRight, RefreshCcw, 
  Bell, CheckCircle2, X, Share2, Copy, Eye, QrCode, 
  MessageCircle, CreditCard, Mic, Volume2, AudioLines, 
  Cpu, Database, Activity, Lock, Layers, Receipt, FileText,
  Sparkles, Check, ChevronRight, Fingerprint, History, Printer,
  Network, Settings2, ShieldAlert, ArrowRight, Loader2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { translateText, generateSpeech } from '../services/geminiService';
import { ALL_LANGUAGES } from '../constants';
import { decode, decodeAudioData } from '../services/voiceService';

interface TransactionNode {
  id: string;
  ref: string;
  from: { name: string; wallet: string; provider: 'MTN' | 'Telecel' | 'GCB' | 'Absa' | 'Fintech-API' };
  to: { name: string; wallet: string; provider: 'MTN' | 'Telecel' | 'GCB' | 'Absa' | 'Fintech-API' };
  amount: number;
  currency: string;
  status: 'Success' | 'Processing' | 'Failed' | 'Settled' | 'Aborted';
  timestamp: string;
  isoStandard: string;
  qrCode?: string;
}

const MOCK_FLOW_DATA = [
  { name: '08:00', volume: 2100, success: 98 },
  { name: '09:00', volume: 4500, success: 98 },
  { name: '10:00', volume: 3200, success: 95 },
  { name: '11:00', volume: 6800, success: 99 },
  { name: '12:00', volume: 5400, success: 97 },
  { name: '13:00', volume: 8900, success: 100 },
  { name: '14:00', volume: 7200, success: 99 },
];

const INITIAL_NODES: TransactionNode[] = [
  { id: '1', ref: 'SW-MJ-9021', from: { name: 'Payroll Admin', wallet: '024...88', provider: 'MTN' }, to: { name: 'Logistics Vendor', wallet: '900...11', provider: 'GCB' }, amount: 1500, currency: 'GHS', status: 'Settled', timestamp: '2024-05-27 10:15', isoStandard: 'ISO 20022' },
  { id: '2', ref: 'SW-MJ-9022', from: { name: 'Elena R.', wallet: 'elena@pay', provider: 'Absa' }, to: { name: 'Abena D.', wallet: '050...44', provider: 'Telecel' }, amount: 450, currency: 'USD', status: 'Success', timestamp: '2024-05-27 11:22', isoStandard: 'ISO 20022' },
  { id: '3', ref: 'SW-MJ-9023', from: { name: 'Fintech Bridge', wallet: 'API-7721', provider: 'Fintech-API' }, to: { name: 'Bulk Recipient', wallet: '024...33', provider: 'MTN' }, amount: 12400, currency: 'GHS', status: 'Processing', timestamp: '2024-05-27 12:45', isoStandard: 'ISO 20022' },
];

const SikaPay: React.FC = () => {
  const [view, setView] = useState<'switch' | 'voice' | 'ledger' | 'receipts' | 'architecture'>('switch');
  const [nodes, setNodes] = useState<TransactionNode[]>(INITIAL_NODES);
  const [commandInput, setCommandInput] = useState('');
  const [isProcessingCommand, setIsProcessingCommand] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<TransactionNode | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [commandFeedback, setCommandFeedback] = useState('');

  const audioContextOutRef = useRef<AudioContext | null>(null);

  const stats = useMemo(() => {
    const totalVolume = nodes.reduce((sum, n) => sum + n.amount, 0);
    const successRate = (nodes.filter(n => n.status === 'Success' || n.status === 'Settled').length / nodes.length) * 100;
    return { totalVolume, successRate };
  }, [nodes]);

  const handleVoiceIntent = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessingCommand(true);
    setCommandFeedback('Parsing financial intent via Gemini 3...');

    // Simulate Natural Language Parsing Logic
    setTimeout(async () => {
      let responseText = "";
      if (text.toLowerCase().includes('send') || text.toLowerCase().includes('disburse')) {
        const newNode: TransactionNode = {
          id: Math.random().toString(36).substr(2, 9),
          ref: `SW-MJ-${Math.floor(1000 + Math.random() * 9000)}`,
          from: { name: 'Voice Auth User', wallet: '024...XX', provider: 'MTN' },
          to: { name: 'Target Endpoint', wallet: '901...XX', provider: 'GCB' },
          amount: 500, 
          currency: 'GHS',
          status: 'Success',
          timestamp: new Date().toLocaleString(),
          isoStandard: 'ISO 20022'
        };
        setNodes([newNode, ...nodes]);
        setActiveReceipt(newNode);
        responseText = `Interoperable transfer of 500 GHS successful. ISO 20022 record generated.`;
      } else if (text.toLowerCase().includes('invoice') || text.toLowerCase().includes('bill')) {
        responseText = `Merchant invoice for 100 GHS generated and sent to recipient via SMS link.`;
      } else {
        responseText = `Financial switch status: All rails operational. Liquidity is healthy.`;
      }
      
      setCommandFeedback(responseText);
      setIsProcessingCommand(false);
      triggerVoiceResponse(responseText);
    }, 2500);
  };

  const triggerVoiceResponse = async (text: string) => {
    try {
      if (!audioContextOutRef.current) {
        audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const base64Audio = await generateSpeech(text, 'Zephyr');
      if (base64Audio) {
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextOutRef.current, 24000, 1);
        const source = audioContextOutRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextOutRef.current.destination);
        source.start();
      }
    } catch (e) { console.error('Audio response failed', e); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 md:pb-0 pt-20 md:pt-24 font-['Inter']">
      
      {/* Sika Pay Expert Switch Nav */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 md:top-14 z-[40]">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center font-black text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)]">SP</div>
              <div className="flex flex-col">
                <span className="font-black tracking-tighter text-lg uppercase italic leading-none">SIKA SWITCH</span>
                <span className="text-[10px] font-black text-amber-500/60 uppercase tracking-[0.2em]">Mojaloop Native Rail</span>
              </div>
            </div>
            <nav className="hidden lg:flex items-center space-x-6">
              {[
                { id: 'switch', label: 'Nodes', icon: Cpu },
                { id: 'voice', label: 'Voice Terminal', icon: Mic },
                { id: 'ledger', label: 'ISO Ledger', icon: Database },
                { id: 'architecture', label: 'Architecture', icon: Network },
              ].map(item => (
                <button 
                  key={item.id} 
                  onClick={() => setView(item.id as any)}
                  className={`flex items-center space-x-2 text-xs font-black uppercase tracking-widest transition-all px-1 py-2 border-b-2 ${view === item.id ? 'text-amber-500 border-amber-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                >
                  <item.icon size={14} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase text-emerald-500 tracking-tighter">Rails Online</span>
            </div>
            <button onClick={() => setView('voice')} className="p-2.5 bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 transition-all shadow-lg active:scale-95">
              <Mic size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
        
        {view === 'switch' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Financial Interoperability Hub</h1>
                <p className="text-slate-500 font-medium">Real-time digital financial services switch for emerging markets.</p>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => setNodes(INITIAL_NODES)} className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all">
                  <RefreshCcw size={14} />
                  <span>Restart Hub</span>
                </button>
                <button onClick={() => setView('voice')} className="bg-amber-500 text-slate-950 px-6 py-2.5 rounded-xl text-xs font-black shadow-xl shadow-amber-500/10 flex items-center space-x-2 transition-transform active:scale-95">
                  <Zap size={16} /> <span>Voice Command</span>
                </button>
              </div>
            </div>

            {/* Hub Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] flex flex-col justify-between h-44 group hover:border-amber-500/50 transition-all">
                  <div className="flex items-center justify-between">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Aggregate Throughput</p>
                     <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500"><BarChart3 size={18} /></div>
                  </div>
                  <div>
                     <h3 className="text-2xl font-mono font-black text-white">GHS {stats.totalVolume.toLocaleString()}</h3>
                     <div className="flex items-center gap-1.5 mt-1 text-emerald-500 font-bold text-[10px]">
                        <ArrowUpRight size={12} /> 12.8% 24h
                     </div>
                  </div>
               </div>
               <div className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] flex flex-col justify-between h-44">
                  <div className="flex items-center justify-between">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Settlement Success</p>
                     <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500"><ShieldCheck size={18} /></div>
                  </div>
                  <div>
                     <h3 className="text-2xl font-mono font-black text-emerald-500">{stats.successRate.toFixed(1)}%</h3>
                     <p className="text-[10px] text-slate-500 font-bold mt-1">Cross-Rail Settled</p>
                  </div>
               </div>
               <div className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] flex flex-col justify-between h-44">
                  <div className="flex items-center justify-between">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Rails</p>
                     <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500"><Layers size={18} /></div>
                  </div>
                  <div>
                     <h3 className="text-2xl font-mono font-black text-white">8 Protocols</h3>
                     <p className="text-[10px] text-slate-500 font-bold mt-1">MoMo, Banks, Card, USSD</p>
                  </div>
               </div>
               <div className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] flex flex-col justify-between h-44">
                  <div className="flex items-center justify-between">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Infrastructure Health</p>
                     <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500"><Cpu size={18} /></div>
                  </div>
                  <div>
                     <h3 className="text-2xl font-mono font-black text-white">99.998%</h3>
                     <p className="text-[10px] text-slate-500 font-bold mt-1">Cluster: AWS Labeled</p>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Traffic Visualization */}
               <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-8 rounded-[40px] h-[400px] relative overflow-hidden group shadow-2xl">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
                     <Globe size={180} className="text-amber-500" />
                  </div>
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <h4 className="text-lg font-black tracking-tight uppercase italic">Switch Telemetry</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Instant Payment Volume Analysis</p>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-amber-500">Real-time Switch Stats</span>
                     </div>
                  </div>
                  <ResponsiveContainer width="100%" height="80%">
                    <AreaChart data={MOCK_FLOW_DATA}>
                      <defs>
                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px' }} />
                      <Area type="monotone" dataKey="volume" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>

               {/* Real-time Switch Event Log */}
               <div className="bg-slate-900 border border-slate-800 rounded-[40px] flex flex-col shadow-2xl overflow-hidden">
                  <div className="p-6 border-b border-slate-800 bg-slate-950/30 flex items-center justify-between">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Terminal size={14} className="text-amber-500" /> Switch Event Ledger
                     </h4>
                     <button className="p-1 hover:text-white transition-colors"><MoreVertical size={14}/></button>
                  </div>
                  <div className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar max-h-[310px]">
                     {nodes.map(node => (
                        <div key={node.id} className="flex gap-4 group cursor-pointer hover:bg-slate-800/20 p-2 rounded-xl transition-all" onClick={() => setActiveReceipt(node)}>
                           <div className={`w-1 h-10 rounded-full shrink-0 ${node.status === 'Success' ? 'bg-emerald-500' : node.status === 'Processing' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
                           <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                 <p className="text-[11px] font-black text-white truncate italic uppercase tracking-tighter">{node.from.provider} <ArrowRight size={8} className="inline mx-1"/> {node.to.provider}</p>
                                 <span className="text-[10px] font-mono text-amber-500 font-bold">{node.amount} {node.currency}</span>
                              </div>
                              <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold tracking-widest">ISO: {node.ref} • {node.status}</p>
                           </div>
                        </div>
                     ))}
                  </div>
                  <div className="p-4 bg-slate-950/50 text-center">
                     <button onClick={() => setView('ledger')} className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 hover:underline flex items-center justify-center gap-2 mx-auto">
                       Full Audit Trail <ChevronRight size={12}/>
                     </button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {view === 'voice' && (
          <div className="max-w-4xl mx-auto space-y-12 animate-in zoom-in-95 duration-500 py-12">
             <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-amber-500 rounded-3xl flex items-center justify-center text-slate-950 mx-auto shadow-[0_0_60px_rgba(245,158,11,0.25)] animate-pulse group cursor-pointer">
                   <Mic size={48} className="group-hover:scale-110 transition-transform"/>
                </div>
                <h2 className="text-5xl font-black tracking-tight italic uppercase">AI Voice <span className="text-amber-500">Terminal</span></h2>
                <p className="text-slate-400 font-medium text-lg italic max-w-xl mx-auto opacity-80">"Send 500 GHS to Logistics via MoMo" — Zero-touch interoperable capital management.</p>
             </div>

             <div className="bg-slate-900 border border-slate-800 p-12 rounded-[56px] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:rotate-12 transition-transform">
                   <Sparkles size={250} className="text-amber-500" />
                </div>
                
                <div className="space-y-8 relative">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-4">Financial Intent Input</label>
                      <div className="relative">
                         <input 
                           type="text"
                           placeholder="Type or use Voice: 'Pay Abena 200 GHS via Telecel'"
                           className="w-full bg-slate-950 border-2 border-slate-800 px-8 py-7 rounded-[32px] text-xl font-bold focus:border-amber-500 outline-none transition-all shadow-inner placeholder:text-slate-800 italic"
                           value={commandInput}
                           onChange={e => setCommandInput(e.target.value)}
                           onKeyDown={e => e.key === 'Enter' && handleVoiceIntent(commandInput)}
                         />
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                            {isListening ? (
                               <div className="flex gap-1.5 px-4 h-12 items-center bg-amber-500/10 rounded-2xl border border-amber-500/20">
                                  <div className="w-1.5 h-6 bg-amber-500 animate-bounce" style={{ animationDelay: '0s' }} />
                                  <div className="w-1.5 h-10 bg-amber-500 animate-bounce" style={{ animationDelay: '0.1s' }} />
                                  <div className="w-1.5 h-8 bg-amber-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                               </div>
                            ) : (
                               <button onClick={() => setIsListening(true)} className="p-5 bg-slate-900 hover:bg-slate-800 rounded-3xl text-amber-500 transition-all border border-slate-800 shadow-xl"><Mic size={24} /></button>
                            )}
                         </div>
                      </div>
                   </div>

                   {commandFeedback && (
                      <div className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-3xl animate-in slide-in-from-top-4">
                         <div className="flex items-center gap-3 text-amber-500 mb-3">
                            <CheckCircle2 size={18} />
                            <h4 className="text-[10px] font-black uppercase tracking-widest">Sika Switch Insight</h4>
                         </div>
                         <p className="text-lg font-bold italic text-slate-200">"{commandFeedback}"</p>
                      </div>
                   )}

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-950/50 border border-slate-800 p-8 rounded-[32px] space-y-4">
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                           <History size={14}/> Recent Voice Intents
                         </h4>
                         <div className="space-y-3">
                            <button onClick={() => setCommandInput("Send 500 GHS to the vendor pool via MTN")} className="w-full text-left p-4 rounded-2xl bg-slate-900/50 hover:bg-slate-800 text-xs font-bold flex items-center justify-between group transition-all border border-transparent hover:border-amber-500/30">
                               <span className="italic truncate">"Send 500 GHS to vendor pool..."</span>
                               <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                            </button>
                            <button onClick={() => setCommandInput("Check my MoMo balance for GCB account")} className="w-full text-left p-4 rounded-2xl bg-slate-900/50 hover:bg-slate-800 text-xs font-bold flex items-center justify-between group transition-all border border-transparent hover:border-amber-500/30">
                               <span className="italic truncate">"Check my MoMo balance..."</span>
                               <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                            </button>
                         </div>
                      </div>
                      <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[32px] flex flex-col justify-center space-y-4">
                         <div className="flex items-center gap-3 text-emerald-500 mb-1">
                            <ShieldAlert size={20} />
                            <h4 className="text-xs font-black uppercase tracking-widest">Voice Authentication</h4>
                         </div>
                         <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                           Secure biometric voice recognition is active. High-value switches (GHS > 10,000) trigger a mandatory Voice-PIN challenge.
                         </p>
                         <div className="flex gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500" />
                           <div className="w-2 h-2 rounded-full bg-emerald-500 opacity-30" />
                           <div className="w-2 h-2 rounded-full bg-emerald-500 opacity-30" />
                         </div>
                      </div>
                   </div>

                   <button 
                     onClick={() => handleVoiceIntent(commandInput)}
                     disabled={!commandInput || isProcessingCommand}
                     className="w-full bg-amber-500 text-slate-950 font-black py-7 rounded-[40px] text-2xl shadow-[0_25px_60px_rgba(245,158,11,0.25)] hover:bg-amber-400 transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-40 uppercase italic tracking-tighter"
                   >
                     {isProcessingCommand ? <Loader2 size={32} className="animate-spin" /> : <Zap size={32} />}
                     {isProcessingCommand ? 'Executing Switch...' : 'Initiate Expert Switch'}
                   </button>
                </div>
             </div>
          </div>
        )}

        {view === 'ledger' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-500">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-3">
                    <History className="text-amber-500" /> ISO 20022 Audit Rail
                  </h2>
                  <p className="text-slate-500 font-medium">Authoritative cross-network financial records for regulatory compliance.</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                      <input placeholder="Search Switch ID..." className="bg-slate-900 border border-slate-800 pl-10 pr-4 py-3 rounded-2xl text-sm outline-none focus:border-amber-500 w-72 shadow-inner" />
                   </div>
                   <button className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"><Printer size={18}/></button>
                   <button className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all"><Download size={18}/></button>
                </div>
             </div>

             <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                   <thead className="bg-slate-950 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800">
                      <tr>
                         <th className="px-8 py-6">Transaction ID</th>
                         <th className="px-6 py-6">Source Rails</th>
                         <th className="px-6 py-6">Destination Rails</th>
                         <th className="px-6 py-6">Settlement Value</th>
                         <th className="px-6 py-6">Protocol</th>
                         <th className="px-8 py-6 text-right">Captured</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800/50">
                      {nodes.map(node => (
                        <tr key={node.id} className="hover:bg-slate-800/20 transition-colors group cursor-pointer" onClick={() => setActiveReceipt(node)}>
                           <td className="px-8 py-6">
                              <span className="font-mono font-bold text-amber-500 group-hover:underline">#{node.ref}</span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'Settled' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                <span className="text-[9px] text-slate-600 uppercase font-black">{node.status}</span>
                              </div>
                           </td>
                           <td className="px-6 py-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-white transition-colors border border-slate-800 shadow-inner">
                                    {node.from.provider === 'MTN' ? <Smartphone size={16}/> : <Landmark size={16}/>}
                                 </div>
                                 <div>
                                    <p className="text-xs font-black uppercase text-white">{node.from.provider}</p>
                                    <p className="text-[9px] text-slate-500 font-mono italic">{node.from.wallet}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-white transition-colors border border-slate-800 shadow-inner">
                                    {node.to.provider === 'GCB' || node.to.provider === 'Absa' ? <Landmark size={16}/> : <Smartphone size={16}/>}
                                 </div>
                                 <div>
                                    <p className="text-xs font-black uppercase text-white">{node.to.provider}</p>
                                    <p className="text-[9px] text-slate-500 font-mono italic">{node.to.wallet}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-6">
                              <p className="text-sm font-black text-white">{node.currency} {node.amount.toLocaleString()}</p>
                              <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tight mt-1">Verified via SikaHub</p>
                           </td>
                           <td className="px-6 py-6">
                              <span className="text-[9px] font-black text-slate-500 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 uppercase tracking-widest">{node.isoStandard}</span>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <p className="text-[11px] font-bold text-slate-400">{node.timestamp}</p>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {view === 'architecture' && (
          <div className="space-y-8 animate-in fade-in duration-700">
             <div className="text-center space-y-3 mb-12">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Microservices <span className="text-amber-500">Topology</span></h2>
                <p className="text-slate-500 max-w-2xl mx-auto font-medium">A Mojaloop-inspired open-source financial architecture for the next billion users.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-morphism p-10 rounded-[48px] border border-slate-800 space-y-6 hover:border-amber-500/30 transition-all shadow-xl">
                   <div className="w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 shadow-inner">
                      <Layers size={32} />
                   </div>
                   <h4 className="text-xl font-black uppercase tracking-tight italic">Financial Rails</h4>
                   <p className="text-xs text-slate-400 leading-relaxed italic">
                     Interoperable connectors for MTN MoMo, Telecel Cash, and GCB ISO-8583 interfaces. 
                     Uses the <strong>Open Settlement Engine</strong> for finality.
                   </p>
                </div>
                <div className="glass-morphism p-10 rounded-[48px] border border-slate-800 space-y-6 hover:border-amber-500/30 transition-all shadow-xl">
                   <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-500 shadow-inner">
                      <Cpu size={32} />
                   </div>
                   <h4 className="text-xl font-black uppercase tracking-tight italic">AI Intent Engine</h4>
                   <p className="text-xs text-slate-400 leading-relaxed italic">
                     Gemini-powered NLP cluster deployed on Kubernetes. 
                     Parses voice intents into signed ISO 20022 payloads with 99.4% confidence.
                   </p>
                </div>
                <div className="glass-morphism p-10 rounded-[48px] border border-slate-800 space-y-6 hover:border-amber-500/30 transition-all shadow-xl">
                   <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500 shadow-inner">
                      <Lock size={32} />
                   </div>
                   <h4 className="text-xl font-black uppercase tracking-tight italic">Security Protocol</h4>
                   <p className="text-xs text-slate-400 leading-relaxed italic">
                     Zero-trust architecture. PCI-DSS Level 1 compliance. 
                     Voice biometric encryption and ML-based fraud detection rails.
                   </p>
                </div>
             </div>

             <div className="bg-slate-900 border border-slate-800 p-12 rounded-[56px] text-center shadow-2xl">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-6">Database Infrastructure</p>
                <div className="flex flex-wrap justify-center gap-12 opacity-40">
                   <div className="flex flex-col items-center gap-2">
                      <Database size={32} />
                      <span className="text-[10px] font-black">PostgreSQL</span>
                   </div>
                   <div className="flex flex-col items-center gap-2">
                      <Network size={32} />
                      <span className="text-[10px] font-black">Redis Switch</span>
                   </div>
                   <div className="flex flex-col items-center gap-2">
                      <Layers size={32} />
                      <span className="text-[10px] font-black">Kubernetes</span>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Expert Digital Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-[500] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-300 no-print">
           <div className="bg-white text-slate-950 rounded-[56px] w-full max-w-md overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-12 duration-500 relative">
              <div className="p-10 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-slate-950 rounded-[28px] flex items-center justify-center text-amber-500 font-black text-2xl shadow-2xl">SP</div>
                    <div>
                       <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Interoperable Sika Hub</h4>
                       <p className="text-xl font-black tracking-tighter italic uppercase text-slate-900 leading-none">Receipt Captured</p>
                    </div>
                 </div>
                 <button onClick={() => setActiveReceipt(null)} className="p-3 text-slate-300 hover:text-red-500 bg-white rounded-2xl border border-slate-100 transition-colors"><X size={24}/></button>
              </div>

              <div className="p-10 space-y-10">
                 <div className="text-center space-y-3">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.4em] italic">Total Switch Value</p>
                    <h3 className="text-6xl font-black tracking-tighter italic text-slate-950">{activeReceipt.currency} {activeReceipt.amount.toLocaleString()}</h3>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 w-fit mx-auto px-5 py-2 rounded-full mt-6 shadow-sm">
                       <ShieldCheck size={14} /> Settlement Finalized
                    </div>
                 </div>

                 <div className="space-y-6 pt-4">
                    <div className="flex justify-between items-center text-sm font-medium">
                       <span className="text-slate-400 italic">Financial Origin</span>
                       <span className="font-black uppercase tracking-tighter text-slate-900">{activeReceipt.from.provider} Rail</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium">
                       <span className="text-slate-400 italic">Financial Target</span>
                       <span className="font-black uppercase tracking-tighter text-slate-900">{activeReceipt.to.provider} Rail</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium border-t border-slate-50 pt-6">
                       <span className="text-slate-400 italic">Interoperable ID</span>
                       <span className="font-mono font-black text-slate-950">#{activeReceipt.ref}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium">
                       <span className="text-slate-400 italic">Compliance Standard</span>
                       <span className="font-black text-[10px] uppercase text-amber-600 border border-amber-200 bg-amber-50 px-3 py-1 rounded-lg">{activeReceipt.isoStandard}</span>
                    </div>
                 </div>

                 <div className="flex flex-col items-center gap-8 pt-6 grayscale opacity-90">
                    <div className="p-4 bg-slate-50 rounded-[32px] border border-slate-100 shadow-inner">
                       <QrCode size={110} className="text-slate-800" />
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-2 h-2 rounded-full bg-slate-900" />
                       <div className="w-2 h-2 rounded-full bg-slate-900 opacity-30" />
                       <div className="w-2 h-2 rounded-full bg-slate-900 opacity-10" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-5">
                    <button onClick={() => window.print()} className="bg-slate-950 text-white font-black py-6 rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-tighter italic active:scale-[0.98]">
                       <Printer size={18} /> Print Record
                    </button>
                    <button className="bg-slate-50 border border-slate-200 text-slate-900 font-black py-6 rounded-[32px] hover:bg-white transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-tighter italic active:scale-[0.98]">
                       <Share2 size={18} /> Distribute
                    </button>
                 </div>
              </div>

              <div className="p-6 bg-slate-950 text-white flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] italic">
                   <Lock size={12} /> Secure Interoperability Switch
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Global Theme Overrides for expert Switch experience */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 20px; }
        .text-glow { text-shadow: 0 0 20px rgba(245,158,11,0.2); }
        @media print {
           body { background: white !important; }
           .no-print { display: none !important; }
        }
      `}} />
    </div>
  );
};

export default SikaPay;