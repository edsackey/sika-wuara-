import React, { useState, useRef, useEffect } from 'react';
import { getBusinessAdvice } from '../services/geminiService';
import { Send, Sparkles, User, ShieldCheck, Copy, Check } from 'lucide-react';

interface Message {
  role: 'user' | 'ai' | 'system';
  content: string;
}

const Advisor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'ai', 
      content: 'Greeting, Wealth-Maker. I am Sika Wura AI. How can I assist you in optimizing your cross-continental capital today?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const OPTIMIZED_PROMPT = `"Design a complete open-source payment platform that clones all key features of Mojaloop, the interoperable instant payment system for emerging markets backed by the Gates Foundation. Ensure the clone supports real-time digital financial services, including account-to-account transfers, mobile wallet interoperability, merchant payments, bulk disbursements, and cross-border remittances, with a focus on low-income users in regions like Africa (e.g., integrating with local banks, mobile money like MTN MoMo or Vodafone Cash, and APIs for providers like Flutterwave or Paystack). Add advanced voice AI control as the primary user interface: Users interact entirely via voice commands (e.g., 'Send 50 GHS to John via MoMo' or 'Check my balance') using natural language processing powered by models like Google Speech-to-Text and Dialogflow for intent recognition. Include built-in receipt and invoice generation... The system must be fully open-source, compliant with ISO 20022, PCI DSS..."`;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const advice = await getBusinessAdvice(userMsg);
      setMessages(prev => [...prev, { role: 'ai', content: advice || 'I am processing the global markets. Please stand by.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Connection to the central financial hub lost. Reconnecting...' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(OPTIMIZED_PROMPT);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-24 max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center space-x-3">
          <Sparkles className="text-amber-500" />
          <h2 className="text-2xl font-bold">Strategic AI Coach</h2>
        </div>
        <div className="hidden md:block">
           <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest bg-slate-900 px-3 py-1 rounded-full border border-slate-800">Gemini 3 Pro Active</span>
        </div>
      </div>

      {/* User's optimized prompt recommendation card */}
      <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-[32px] mb-6 relative overflow-hidden group">
         <div className="relative z-10">
            <h4 className="text-xs font-black uppercase text-amber-500 tracking-[0.2em] mb-2 flex items-center gap-2">
              <Sparkles size={14} /> Global Switch Prompt
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed italic mb-4">
              Use this optimized prompt to generate a detailed voice-controlled Mojaloop clone concept in Gemini.
            </p>
            <button 
              onClick={handleCopyPrompt}
              className="flex items-center gap-2 bg-amber-500 text-slate-950 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all active:scale-95 shadow-lg shadow-amber-500/10"
            >
              {hasCopied ? <Check size={14} /> : <Copy size={14} />}
              {hasCopied ? 'Copied to Clipboard' : 'Copy Optimized Prompt'}
            </button>
         </div>
         <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-125 transition-transform">
            <ShieldCheck size={120} className="text-amber-500" />
         </div>
      </div>

      <div ref={scrollRef} className="flex-1 glass-morphism rounded-[40px] p-8 overflow-y-auto space-y-6 mb-4 custom-scrollbar shadow-inner border-slate-800/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] space-x-4 ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 border border-slate-800 ${m.role === 'user' ? 'bg-slate-700' : 'bg-amber-500'}`}>
                {m.role === 'user' ? <User size={18} /> : <Sparkles size={18} className="text-slate-950" />}
              </div>
              <div className={`p-5 rounded-[28px] text-sm leading-relaxed shadow-xl ${m.role === 'user' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 border border-slate-800 text-slate-200'}`}>
                {m.content}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-[20px] animate-pulse text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
              Synthesizing Global Market Intelligence...
            </div>
          </div>
        )}
      </div>

      <div className="relative shrink-0 no-print">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask for strategic business guidance or market projections..." 
          className="w-full bg-slate-900 border-2 border-slate-800 rounded-full pl-8 pr-16 py-5 text-slate-100 focus:outline-none focus:border-amber-500 transition-all shadow-2xl placeholder:text-slate-600 font-medium"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-amber-500 text-slate-950 p-3 rounded-full hover:bg-amber-400 transition-all shadow-lg active:scale-90 disabled:opacity-30 disabled:scale-100"
        >
          <Send size={20} />
        </button>
      </div>
      
      <div className="mt-4 flex items-center justify-center space-x-2 text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">
        <ShieldCheck size={10} />
        <span>Authoritative End-to-End Encrypted Advisory Rail</span>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 20px; }
      `}} />
    </div>
  );
};

export default Advisor;