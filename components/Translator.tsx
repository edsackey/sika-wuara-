
import React, { useState } from 'react';
import { ALL_LANGUAGES } from '../constants';
import { translateText } from '../services/geminiService';
import { Mic, Send, Repeat, Volume2, Globe2, Sparkles } from 'lucide-react';

const Translator: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [fromLang, setFromLang] = useState('en');
  const [toLang, setToLang] = useState('ak');
  const [isLoading, setIsLoading] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    try {
      const from = ALL_LANGUAGES.find(l => l.code === fromLang)?.name || 'English';
      const to = ALL_LANGUAGES.find(l => l.code === toLang)?.name || 'Akan';
      const result = await translateText(inputText, from, to);
      setTranslatedText(result || '');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const swapLanguages = () => {
    setFromLang(toLang);
    setToLang(fromLang);
  };

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-24 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Globe2 className="text-amber-500" />
          <h2 className="text-2xl font-bold">Linguistics Engine</h2>
        </div>
        <div className="flex items-center space-x-2 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
          <Sparkles size={14} className="text-amber-500" />
          <span className="text-[10px] uppercase font-bold text-amber-500 tracking-tighter">Voice AI Active</span>
        </div>
      </div>

      <div className="glass-morphism p-6 rounded-3xl space-y-6 shadow-2xl">
        <div className="flex items-center justify-between space-x-4">
          <select 
            value={fromLang}
            onChange={(e) => setFromLang(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          >
            {ALL_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
          <button onClick={swapLanguages} className="p-3 text-amber-500 hover:bg-slate-800 rounded-full transition-colors shrink-0">
            <Repeat size={20} />
          </button>
          <select 
            value={toLang}
            onChange={(e) => setToLang(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
          >
            {ALL_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </div>

        <div className="relative group">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or use Voice AI to translate business documents..."
            className="w-full h-40 bg-slate-900 border border-slate-700 rounded-2xl p-4 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-600"
          />
          <div className="absolute bottom-4 right-4">
             <div className="flex items-center space-x-2 text-[10px] text-slate-500">
               <Mic size={12} />
               <span>Auto-listening via Sika Wura</span>
             </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleTranslate}
            disabled={isLoading || !inputText}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold py-3 px-10 rounded-full flex items-center space-x-2 transition-all shadow-lg active:scale-95"
          >
            {isLoading ? <span className="animate-pulse">Analyzing...</span> : <><Send size={18} /><span>Strategic Translate</span></>}
          </button>
        </div>

        {translatedText && (
          <div className="mt-8 p-6 bg-slate-800/50 border border-amber-500/20 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase tracking-[0.2em] text-amber-500 font-bold">Linguistic Result</span>
              <button className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-700"><Volume2 size={16} /></button>
            </div>
            <p className="text-xl text-slate-100 font-medium leading-relaxed">{translatedText}</p>
          </div>
        )}
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex items-start space-x-4">
        <div className="bg-amber-500/20 p-2.5 rounded-xl text-amber-500 shrink-0">
          <Sparkles size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-200 mb-1">Conversation Proxy Mode</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sika Wura AI acts as an invisible bridge. Enable the voice icon on the right to start a fluid bilingual conversation. The AI will translate both speakers in real-time without intervention.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Translator;
