
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
// Added missing imports: RefreshCcw, ChevronRight
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Award, Sparkles, PieChart, Activity, RefreshCcw, ChevronRight } from 'lucide-react';

const data = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4500 },
  { name: 'May', value: 6000 },
  { name: 'Jun', value: 5500 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="p-4 md:p-8 pt-20 md:pt-24 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} className="text-amber-500" /> Sika Wura AI Monitoring Active
          </p>
          <h1 className="text-4xl font-bold mt-1 tracking-tight">Enterprise Portfolio</h1>
        </div>
        <div className="flex items-center space-x-6">
           <div className="text-right">
             <span className="text-emerald-400 font-black text-lg flex items-center">
               <TrendingUp size={20} className="mr-1" /> +12.5%
             </span>
             <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Growth Forecast</p>
           </div>
           <button className="bg-slate-900 border border-slate-800 p-3 rounded-2xl hover:border-amber-500/50 transition-all text-amber-500">
             <RefreshCcw size={20} />
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-morphism p-6 rounded-3xl border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center space-x-3 mb-6 text-slate-500">
            <Wallet size={20} className="group-hover:text-amber-500 transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest">Global Liquidity</span>
          </div>
          <p className="text-3xl font-bold font-mono">$1,244,500</p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-12 -mt-12 blur-3xl transition-all group-hover:bg-amber-500/10" />
        </div>
        <div className="glass-morphism p-6 rounded-3xl border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center space-x-3 mb-6 text-slate-500">
            <ArrowUpRight size={20} className="group-hover:text-emerald-500 transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest">Monthly Ops Income</span>
          </div>
          <p className="text-3xl font-bold font-mono">$18,230</p>
        </div>
        <div className="glass-morphism p-6 rounded-3xl border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center space-x-3 mb-6 text-slate-500">
            <ArrowDownRight size={20} className="group-hover:text-red-500 transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest">Enterprise Burn</span>
          </div>
          <p className="text-3xl font-bold font-mono">$4,120</p>
        </div>
        <div className="glass-morphism p-6 rounded-3xl border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center space-x-3 mb-6 text-slate-500">
            <PieChart size={20} className="group-hover:text-blue-500 transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest">Inventory Assets</span>
          </div>
          <p className="text-3xl font-bold font-mono">$324,900</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-morphism p-8 rounded-[40px] border border-slate-800 h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold">Revenue Projections</h3>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest">BigCapital Unified Stream</p>
            </div>
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-400">
               <span>6 Months</span>
               <ChevronRight size={14} />
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', fontSize: '12px' }}
                itemStyle={{ color: '#f59e0b' }}
              />
              <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-6">
          <div className="glass-morphism p-8 rounded-[40px] border border-amber-500/20 bg-amber-500/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2"><Sparkles className="text-amber-500" size={20} /> AI Wealth Partner</h3>
                <Award size={20} className="text-amber-500" />
              </div>
              <p className="text-slate-300 text-sm leading-relaxed font-medium">
                Your current liquidity ratio is optimized for a seed investment in West African logistics. 
                The Sika Wura model suggests reallocating <span className="text-amber-500 font-bold underline">15% of your German export revenue</span> into Twi-speaking retail partners to hedge against currency fluctuations.
              </p>
            </div>
            <button className="mt-8 w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3.5 rounded-2xl shadow-lg transition-transform active:scale-95">Execute Allocation Strategy</button>
          </div>
          
          <div className="glass-morphism p-6 rounded-3xl border border-slate-800">
             <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Enterprise Health</h4>
             <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                   <span className="font-bold">Akaunting Sync</span>
                   <span className="text-emerald-500 font-bold">STABLE</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                   <span className="font-bold">Docyt OCR Latency</span>
                   <span className="text-emerald-500 font-bold">850ms</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
