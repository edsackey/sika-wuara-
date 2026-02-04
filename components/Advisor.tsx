
import React, { useState, useRef, useEffect } from 'react';
import { getBusinessAdvice } from '../services/geminiService';
import { Send, Sparkles, User, ShieldCheck } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const Advisor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Greeting, Wealth-Maker. I am Sika Wura AI. How can I assist you in optimizing your cross-continental capital today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-24 max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center space-x-3 mb-6 shrink-0">
        <Sparkles className="text-amber-500" />
        <h2 className="text-2xl font-bold">Proactive Strategy Hub</h2>
      </div>

      <div ref={scrollRef} className="flex-1 glass-morphism rounded-3xl p-6 overflow-y-auto space-y-6 mb-4 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] space-x-3 ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-slate-700' : 'bg-amber-500'}`}>
                {m.role === 'user' ? <User size={16} /> : <Sparkles size={16} className="text-slate-900" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-amber-500 text-slate-900 font-medium' : 'bg-slate-800 text-slate-200'}`}>
                {m.content}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-4 rounded-2xl animate-pulse text-xs text-slate-400">
              Analyzing global datasets and Google LM indices...
            </div>
          </div>
        )}
      </div>

      <div className="relative shrink-0">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask for investment advice or market projections..." 
          className="w-full bg-slate-900 border border-slate-700 rounded-full pl-6 pr-14 py-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xl"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 text-slate-900 p-2.5 rounded-full hover:bg-amber-600 transition-all"
        >
          <Send size={20} />
        </button>
      </div>
      
      <div className="mt-3 flex items-center justify-center space-x-2 text-[10px] text-slate-500 uppercase tracking-widest">
        <ShieldCheck size={12} />
        <span>End-to-End Encrypted Financial Advice</span>
      </div>
    </div>
  );
};

export default Advisor;
