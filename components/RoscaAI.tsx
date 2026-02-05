import React, { useState, useRef, useMemo } from 'react';
import { 
  Users, Plus, Search, Filter, ArrowRight, CheckCircle2, 
  X, Zap, Sparkles, TrendingUp, ShieldCheck, RefreshCcw, 
  RotateCcw, Trophy, UserPlus, Info, Smartphone, CreditCard, 
  Lock, ArrowUpRight, Copy, ChevronRight, MessageSquare, 
  Calendar, Award, Handshake, ShieldAlert, PieChart, Timer, 
  FileText, Camera, Upload, Loader2, Landmark, MessageCircle,
  Check, Share2, MoreVertical, Activity, Send, BellRing, QrCode
} from 'lucide-react';
import { translateText, getRoscaAdvice, analyzeDocumentOCR } from '../services/geminiService';
import { ALL_LANGUAGES } from '../constants';
import { RoscaGroup } from '../types';

// Add missing 'penalties' required property to initial groups
const INITIAL_GROUPS: RoscaGroup[] = [
  { id: 'g1', name: 'Makola Merchants Susu', contributionAmount: 200, frequency: 'Daily', members: ['Kwame', 'Zainab', 'Elena', 'You'], maxMembers: 10, currentCycle: 4, totalPooled: 800, status: 'Active', nextPayoutMember: 'Elena', description: 'Daily contributions for small business traders in Makola Market.', penalties: [] },
  { id: 'g2', name: 'Tech Infrastructure Pool', contributionAmount: 5000, frequency: 'Monthly', members: ['Kwame', 'Chen', 'You'], maxMembers: 5, currentCycle: 1, totalPooled: 15000, status: 'Active', nextPayoutMember: 'Kwame', description: 'High-stake monthly pooling for tech infrastructure upgrades and server acquisition.', penalties: [] },
  { id: 'g3', name: 'Artisans Savings Circle', contributionAmount: 50, frequency: 'Weekly', members: ['Yaw', 'Abena', 'Kofi'], maxMembers: 20, currentCycle: 0, totalPooled: 0, status: 'Open', description: 'Weekly pooling for local Kumasi tool maintenance and communal support.', penalties: [] },
];

const RoscaAI: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'builder' | 'group_detail' | 'draw' | 'ai_matching' | 'whatsapp_hub'>('dashboard');
  const [groups, setGroups] = useState<RoscaGroup[]>(INITIAL_GROUPS);
  const [selectedGroup, setSelectedGroup] = useState<RoscaGroup | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [targetLang, setTargetLang] = useState('ak');

  // WhatsApp simulation state
  const [waMessage, setWaMessage] = useState('');
  const [waRecipient, setWaRecipient] = useState('');

  // Builder State
  const [newGroup, setNewGroup] = useState<Partial<RoscaGroup>>({
    name: '',
    contributionAmount: 0,
    frequency: 'Weekly',
    maxMembers: 10,
    description: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Payment State (Simulation)
  const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; group: RoscaGroup | null }>({ isOpen: false, group: null });
  const [paymentStep, setPaymentStep] = useState<'method' | 'processing' | 'success'>('method');

  const handleCreateGroup = () => {
    // Add missing 'penalties' required property when creating a new group
    const group: RoscaGroup = {
      ...(newGroup as RoscaGroup),
      id: Math.random().toString(36).substr(2, 9),
      members: ['You'],
      currentCycle: 0,
      totalPooled: 0,
      status: 'Open',
      penalties: []
    };
    setGroups([group, ...groups]);
    setView('dashboard');
  };

  const handleTranslateDescription = async () => {
    if (!newGroup.description) return;
    setIsTranslating(true);
    try {
      const langName = ALL_LANGUAGES.find(l => l.code === targetLang)?.name || 'Akan';
      const result = await translateText(newGroup.description, 'English', langName);
      setNewGroup(prev => ({ ...prev, description: result }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranslating(false);
    }
  };

  const openGroupDetail = (group: RoscaGroup) => {
    setSelectedGroup(group);
    setView('group_detail');
    fetchAiAdvice(group);
  };

  const fetchAiAdvice = async (group: RoscaGroup) => {
    setIsAnalyzing(true);
    try {
      const advice = await getRoscaAdvice(group, "Merchant with consistent daily revenue, based in Accra. Trust score: A+.");
      setAiAdvice(advice || "AI evaluation complete. Risk profile: Low. Payout efficiency: High.");
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendWhatsAppMsg = (type: 'invite' | 'reminder') => {
    if (!selectedGroup) return;
    let msg = '';
    if (type === 'invite') {
      msg = `Hello! I'm inviting you to join our Sika Wura ROSCA circle: "${selectedGroup.name}". Daily contribution is GHS ${selectedGroup.contributionAmount}. Join us for smart communal savings!`;
    } else {
      msg = `Reminder: Your contribution of GHS ${selectedGroup.contributionAmount} for the "${selectedGroup.name}" circle is due. Please use Sika Pay for secure deposit.`;
    }
    const url = `https://wa.me/${waRecipient.replace(/\+/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const startAiMatching = async (file?: File) => {
    setIsMatching(true);
    try {
      if (file) {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const data = await analyzeDocumentOCR(base64);
          setIsMatching(false);
          alert(`Analysis complete. We recommend the ${groups[0].name} for your income profile.`);
        };
        reader.readAsDataURL(file);
      } else {
        setTimeout(() => setIsMatching(false), 2000);
      }
    } catch (err) {
      setIsMatching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 md:pb-0 pt-20 md:pt-24 font-['Inter']">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
        
        {view === 'dashboard' && (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-white italic">Sika ROSCA <span className="text-emerald-500">.</span></h1>
                <p className="text-slate-500 font-medium text-sm">Strategic Savings Management with AI & WhatsApp Automation.</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setView('builder')} className="bg-emerald-500 text-slate-950 font-bold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl hover:bg-emerald-600 transition-all active:scale-95">
                  <Plus size={20} /> New Savings Circle
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-morphism p-8 rounded-[32px] border border-slate-800 flex flex-col justify-between h-52 group hover:border-emerald-500/30 transition-all shadow-lg">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Net Pool Exposure</p>
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500"><TrendingUp size={20}/></div>
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tighter">GHS 25,800.00</h3>
                  <p className="text-xs text-emerald-500 font-bold mt-1">Unified ledger active</p>
                </div>
              </div>
              <div className="glass-morphism p-8 rounded-[32px] border border-slate-800 flex flex-col justify-between h-52">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Reputation Index</p>
                  <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500"><ShieldCheck size={20}/></div>
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tighter">98.4 / 100</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">Excellent Payer History</p>
                </div>
              </div>
              <div className="glass-morphism p-8 rounded-[32px] border border-slate-800 flex flex-col justify-between h-52">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">WhatsApp Bot Status</p>
                  <div className="p-2 bg-green-500/10 rounded-xl text-green-500"><MessageCircle size={20}/></div>
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tighter text-green-500 uppercase italic">ACTIVE</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">24 Automations Pending</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tight uppercase italic">Active Susu Networks</h2>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                  <RefreshCcw size={12} className="animate-spin-slow" /> Real-time Sync
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groups.map(group => (
                  <div key={group.id} onClick={() => openGroupDetail(group)} className="glass-morphism border border-slate-800 rounded-[32px] p-8 hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col justify-between h-72 cursor-pointer active:scale-95">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity">
                      <RotateCcw size={160} />
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-2xl font-black text-white italic tracking-tight group-hover:text-emerald-500 transition-colors">{group.name}</h4>
                        <p className="text-sm text-slate-500 font-medium line-clamp-2 max-w-[240px] italic">{group.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] px-2 py-1 rounded font-black uppercase tracking-widest border ${
                          group.status === 'Open' ? 'border-blue-500 text-blue-500' : 'border-emerald-500 text-emerald-500'
                        }`}>
                          {group.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 italic">Total Pool</p>
                        <p className="text-2xl font-black text-white font-mono">GHS {group.totalPooled.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 italic">Members</p>
                        <p className="text-2xl font-black text-emerald-500">{group.members.length}<span className="text-slate-500">/{group.maxMembers}</span></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp Hub CTA */}
            <div className="bg-emerald-500/10 p-10 rounded-[48px] border border-emerald-500/20 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden group">
               <div className="absolute -right-10 -bottom-10 opacity-[0.05] group-hover:scale-110 transition-transform">
                  <MessageCircle size={300} className="text-emerald-500" />
               </div>
               <div className="w-20 h-20 bg-emerald-500 rounded-[32px] flex items-center justify-center text-slate-950 shadow-xl shrink-0">
                  <MessageCircle size={40} />
               </div>
               <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-black italic tracking-tighter uppercase">WhatsApp Communication Hub</h3>
                  <p className="text-slate-400 font-medium text-sm mt-2 italic">Automate member invites, contribution reminders, and lucky draw announcements directly to your members' WhatsApp.</p>
               </div>
               <button onClick={() => setView('whatsapp_hub')} className="px-8 py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">Launch Comm Hub</button>
            </div>
          </>
        )}

        {view === 'builder' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-10">
            <button onClick={() => setView('dashboard')} className="text-xs font-black uppercase text-slate-500 hover:text-white flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 transition-all">
              <X size={16} /> Cancel Circle Build
            </button>
            
            <div className="space-y-2">
              <h2 className="text-5xl font-black tracking-tight italic">Design Your <span className="text-emerald-500">Circle</span></h2>
              <p className="text-slate-500 font-medium text-lg italic">Configure a trust-based Susu collective with AI validation.</p>
            </div>

            <div className="glass-morphism p-12 rounded-[56px] border border-slate-800 shadow-2xl space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2 italic">Circle Identity</label>
                <input 
                  type="text" 
                  placeholder="e.g. Osu Creative Collective" 
                  className="w-full bg-slate-900 border-none px-8 py-5 rounded-[32px] text-xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-inner"
                  value={newGroup.name}
                  onChange={e => setNewGroup({...newGroup, name: e.target.value})}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Vision & Trust Charter</label>
                  <div className="flex items-center gap-3">
                    <select 
                      value={targetLang}
                      onChange={e => setTargetLang(e.target.value)}
                      className="bg-transparent text-[10px] font-black border-none p-0 focus:ring-0 cursor-pointer text-emerald-500"
                    >
                      {ALL_LANGUAGES.filter(l => l.isAfrican).map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                    </select>
                    <button onClick={handleTranslateDescription} disabled={isTranslating} className="text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1">
                      {isTranslating ? <RefreshCcw size={10} className="animate-spin" /> : <Sparkles size={10} />}
                      AI Multilingual Reach
                    </button>
                  </div>
                </div>
                <textarea 
                  placeholder="Define the purpose and trust requirements..." 
                  className="w-full bg-slate-900 border-none px-8 py-5 rounded-[32px] h-40 font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none shadow-inner italic"
                  value={newGroup.description}
                  onChange={e => setNewGroup({...newGroup, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2 italic">Contribution Amount (GHS)</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    className="w-full bg-slate-900 border-none px-8 py-5 rounded-[32px] text-xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none shadow-inner font-mono"
                    value={newGroup.contributionAmount}
                    onChange={e => setNewGroup({...newGroup, contributionAmount: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2 italic">Payout Frequency</label>
                  <select 
                    className="w-full bg-slate-900 border-none px-8 py-5 rounded-[32px] font-bold focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer shadow-inner text-lg"
                    value={newGroup.frequency}
                    onChange={e => setNewGroup({...newGroup, frequency: e.target.value as any})}
                  >
                    <option value="Daily">Daily Payouts</option>
                    <option value="Weekly">Weekly Rotation</option>
                    <option value="Monthly">Monthly Liquidity</option>
                  </select>
                </div>
              </div>

              <button onClick={handleCreateGroup} className="w-full bg-emerald-500 text-slate-950 font-black py-6 rounded-[32px] shadow-2xl hover:bg-emerald-600 transition-all text-xl active:scale-[0.98] uppercase tracking-tighter italic">
                Initialize Susu Smart Circle
              </button>
            </div>
          </div>
        )}

        {view === 'group_detail' && selectedGroup && (
          <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <button onClick={() => setView('dashboard')} className="text-xs font-black uppercase text-slate-500 hover:text-white flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 transition-all">
                <ChevronRight size={16} className="rotate-180" /> Circle Dashboard
              </button>
              <div className="flex items-center gap-3">
                 <button onClick={() => setView('whatsapp_hub')} className="flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-2 rounded-xl border border-green-500/20 text-xs font-black uppercase tracking-widest hover:bg-green-500/20 transition-all">
                    <MessageCircle size={16} /> WA Hub
                 </button>
                 <button className="p-3 bg-slate-900 rounded-2xl text-slate-400 hover:text-white border border-slate-800"><MoreVertical size={18}/></button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
               <div className="lg:col-span-2 space-y-10">
                  <div className="glass-morphism p-12 rounded-[56px] border border-slate-800 space-y-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                       <Handshake size={240} />
                    </div>
                    <div className="flex justify-between items-start">
                      <div className="space-y-3">
                        <h2 className="text-5xl font-black text-white italic tracking-tighter">{selectedGroup.name}</h2>
                        <p className="text-slate-400 font-medium text-xl mt-2 italic leading-relaxed max-w-2xl">{selectedGroup.description}</p>
                      </div>
                      <div className="w-20 h-20 bg-emerald-500 rounded-[32px] flex items-center justify-center text-slate-950 shadow-[0_20px_60px_rgba(16,185,129,0.2)] shrink-0">
                        <Handshake size={40} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-10 pt-10 border-t border-slate-800/50">
                       <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Periodic Share</p>
                         <p className="text-3xl font-black text-white tracking-tight font-mono">GHS {selectedGroup.contributionAmount.toLocaleString()}</p>
                       </div>
                       <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Cycle Scale</p>
                         <p className="text-3xl font-black text-white tracking-tight italic">{selectedGroup.frequency}</p>
                       </div>
                       <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Scheduled Payout</p>
                         <p className="text-3xl font-black text-emerald-500 italic tracking-tighter">{selectedGroup.nextPayoutMember || 'Lucky Draw'}</p>
                       </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 pt-8">
                       <button className="flex-1 bg-emerald-500 text-slate-950 font-black py-6 rounded-[32px] shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-4 text-xl italic uppercase tracking-tighter active:scale-95">
                          Deposit Current Share <ArrowRight size={24} />
                       </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                     <div className="flex items-center justify-between px-4">
                        <h3 className="text-xl font-black uppercase tracking-widest italic text-slate-300">Circle Collective</h3>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{selectedGroup.members.length} / {selectedGroup.maxMembers} Nodes Active</span>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedGroup.members.map((member, i) => (
                          <div key={i} className="glass-morphism p-6 rounded-[32px] border border-slate-800 flex items-center justify-between hover:border-emerald-500/20 transition-all group shadow-sm">
                             <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-500 font-black text-lg border border-slate-800 shadow-inner group-hover:border-emerald-500/50 transition-all">
                                   {member.charAt(0)}
                                </div>
                                <div>
                                   <p className="text-base font-black text-white tracking-tight italic">{member === 'You' ? 'You (Admin)' : member}</p>
                                   <div className="flex items-center gap-1.5 mt-0.5">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Trust: Excellent</p>
                                   </div>
                                </div>
                             </div>
                             <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2.5 bg-slate-900 text-green-500 rounded-xl hover:bg-slate-800 transition-all shadow-sm border border-slate-800"><MessageCircle size={16} /></button>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="glass-morphism rounded-[40px] border border-emerald-500/20 bg-emerald-500/5 overflow-hidden shadow-2xl">
                     <div className="p-6 bg-emerald-500/10 border-b border-emerald-500/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Sparkles size={18} className="text-emerald-500" />
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 italic tracking-tighter">Sika AI Risk Engine</h4>
                        </div>
                     </div>
                     <div className="p-8 space-y-6">
                        {isAnalyzing ? (
                          <div className="space-y-4 animate-pulse">
                             <div className="h-4 bg-emerald-500/10 rounded-lg w-full" />
                             <div className="h-4 bg-emerald-500/10 rounded-lg w-5/6" />
                          </div>
                        ) : (
                          <p className="text-sm text-slate-300 leading-relaxed font-medium italic">
                            "{aiAdvice || 'Synthesizing circle dynamics with regional liquidity indices...'}"
                          </p>
                        )}
                        <div className="pt-6 border-t border-emerald-500/10 flex flex-col gap-4">
                           <div className="flex justify-between items-center text-[10px] font-black uppercase text-emerald-600 tracking-widest italic">
                              <span>Liquidity Health</span>
                              <span className="text-emerald-500">RESILIENT</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="glass-morphism p-10 rounded-[48px] border border-slate-800 flex flex-col items-center justify-center gap-6 text-center shadow-xl group">
                     <div className="w-20 h-20 bg-slate-900 rounded-[32px] flex items-center justify-center text-emerald-500 border border-slate-800 shadow-2xl group-hover:scale-110 transition-transform">
                        <Trophy size={40} />
                     </div>
                     <div className="space-y-2">
                        <h4 className="text-lg font-black uppercase tracking-tight italic">Lucky Draw Sequence</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed italic">The fairness algorithm will select the next recipient in 3 days. Winner gets the full pooled amount.</p>
                     </div>
                     <button className="w-full py-4 bg-slate-950 border border-slate-800 text-emerald-500 rounded-[28px] font-black uppercase text-[10px] tracking-[0.2em] hover:border-emerald-500/50 hover:bg-slate-900 transition-all shadow-2xl">Initialize Draw Sequence</button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {view === 'whatsapp_hub' && (
          <div className="max-w-4xl mx-auto space-y-12 animate-in zoom-in-95">
             <div className="flex items-center justify-between">
                <button onClick={() => setView(selectedGroup ? 'group_detail' : 'dashboard')} className="text-xs font-black uppercase text-slate-500 hover:text-white flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-800 transition-all">
                  <X size={16} /> Close WA Hub
                </button>
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-1.5 rounded-full">
                   <MessageCircle size={14} className="text-green-500" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-green-500 italic">WhatsApp Cloud Hub</span>
                </div>
             </div>

             <div className="text-center space-y-4">
                <h2 className="text-5xl font-black tracking-tight italic uppercase">Communicate <span className="text-green-500">Fast</span></h2>
                <p className="text-slate-400 font-medium text-lg italic max-w-2xl mx-auto opacity-70">Strategic communication automation for your savings circles.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div onClick={() => sendWhatsAppMsg('invite')} className="glass-morphism p-10 rounded-[48px] border border-slate-800 flex flex-col items-center justify-center text-center space-y-6 hover:border-green-500/30 transition-all cursor-pointer group shadow-lg">
                   <div className="w-20 h-20 bg-slate-900 rounded-[28px] flex items-center justify-center text-blue-500 border border-slate-800 shadow-2xl group-hover:scale-110 transition-transform">
                      <UserPlus size={32} />
                   </div>
                   <div>
                      <h4 className="text-xl font-black uppercase tracking-tight italic">Send Invite</h4>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Pre-filled member invite</p>
                   </div>
                </div>
                <div onClick={() => sendWhatsAppMsg('reminder')} className="glass-morphism p-10 rounded-[48px] border border-slate-800 flex flex-col items-center justify-center text-center space-y-6 hover:border-green-500/30 transition-all cursor-pointer group shadow-lg">
                   <div className="w-20 h-20 bg-slate-900 rounded-[28px] flex items-center justify-center text-amber-500 border border-slate-800 shadow-2xl group-hover:scale-110 transition-transform">
                      <BellRing size={32} />
                   </div>
                   <div>
                      <h4 className="text-xl font-black uppercase tracking-tight italic">Remind All</h4>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Automated debt check</p>
                   </div>
                </div>
                <div className="glass-morphism p-10 rounded-[48px] border border-slate-800 flex flex-col items-center justify-center text-center space-y-6 hover:border-green-500/30 transition-all cursor-pointer group shadow-lg">
                   <div className="w-20 h-20 bg-slate-900 rounded-[28px] flex items-center justify-center text-emerald-500 border border-slate-800 shadow-2xl group-hover:scale-110 transition-transform">
                      <QrCode size={32} />
                   </div>
                   <div>
                      <h4 className="text-xl font-black uppercase tracking-tight italic">Circle QR</h4>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Printable WA link</p>
                   </div>
                </div>
             </div>

             <div className="glass-morphism p-12 rounded-[56px] border border-slate-800 space-y-8 shadow-2xl">
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2 italic">Recipient Number</label>
                      <input 
                        type="tel" 
                        placeholder="e.g. +233244555666" 
                        className="w-full bg-slate-900 border-none px-8 py-5 rounded-[32px] text-xl font-bold focus:ring-2 focus:ring-green-500 outline-none transition-all shadow-inner font-mono"
                        value={waRecipient}
                        onChange={e => setWaRecipient(e.target.value)}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2 italic">Custom WhatsApp Broadcast Message</label>
                      <textarea 
                        placeholder="Type your strategic message here..." 
                        className="w-full bg-slate-900 border-none px-8 py-5 rounded-[32px] h-32 font-medium focus:ring-2 focus:ring-green-500 outline-none resize-none shadow-inner italic"
                        value={waMessage}
                        onChange={e => setWaMessage(e.target.value)}
                      />
                   </div>
                </div>
                <button 
                  onClick={() => {
                     const url = `https://wa.me/${waRecipient.replace(/\+/g, '')}?text=${encodeURIComponent(waMessage)}`;
                     window.open(url, '_blank');
                  }} 
                  className="w-full bg-green-500 text-slate-950 font-black py-6 rounded-[32px] shadow-2xl hover:bg-green-600 transition-all text-xl italic uppercase tracking-tighter active:scale-[0.98] flex items-center justify-center gap-4"
                >
                  <Send size={24} /> Broadcast via WhatsApp
                </button>
             </div>
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-spin-slow { animation: spin 15s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 20px; }
      `}} />
    </div>
  );
};

export default RoscaAI;