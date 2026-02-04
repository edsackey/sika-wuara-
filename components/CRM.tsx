
import React, { useState } from 'react';
import { Contact } from '../types';
// Added missing Sparkles import
import { 
  Users, Search, Plus, Filter, Mail, Phone, MoreHorizontal, TrendingUp, 
  MapPin, Calendar, Star, ShieldCheck, HeartPulse, UserPlus, Sparkles
} from 'lucide-react';

const INITIAL_CONTACTS: Contact[] = [
  { id: '1', name: 'Kwame Mensah', email: 'kwame@ghana-export.com', phone: '+233 24 123 4567', tags: ['High Value', 'Exporter'], lastInteraction: '2 hours ago', value: 15000, status: 'VIP', type: 'Customer' },
  { id: '2', name: 'Elena Rodriguez', email: 'elena@madrid-trade.es', phone: '+34 912 345 678', tags: ['International', 'Lead'], lastInteraction: '1 day ago', value: 4500, status: 'Lead', type: 'Partner' },
  { id: '3', name: 'Zainab Yusuf', email: 'z.yusuf@lagos-fintech.ng', phone: '+234 803 111 2222', tags: ['Tech', 'Customer'], lastInteraction: '3 days ago', value: 8900, status: 'Customer', type: 'Customer' },
  { id: '4', name: 'Chen Wei', email: 'wei@guangzhou-supply.cn', phone: '+86 20 8888 9999', tags: ['Wholesale', 'Partner'], lastInteraction: '5 mins ago', value: 25000, status: 'VIP', type: 'Vendor' },
];

const CRM: React.FC = () => {
  const [contacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-24 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relationship Hub</h2>
          <p className="text-slate-400 text-sm mt-1">Nurturing global connections with African intelligence.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-all">
            Import CSV
          </button>
          <button className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-transform active:scale-95 shadow-xl shadow-amber-500/20">
            <UserPlus size={20} /> <span>Add New Connection</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-morphism p-6 rounded-3xl border-b-4 border-amber-500">
          <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Network Value</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold">$1.24M</p>
            <span className="text-emerald-400 text-xs flex items-center font-bold mb-1"><TrendingUp size={12} className="mr-1"/> +12%</span>
          </div>
        </div>
        <div className="glass-morphism p-6 rounded-3xl border-b-4 border-emerald-500">
          <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Growth Index</p>
          <p className="text-3xl font-bold">8.4/10</p>
        </div>
        <div className="glass-morphism p-6 rounded-3xl border-b-4 border-blue-500">
          <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Active Deals</p>
          <p className="text-3xl font-bold">42</p>
        </div>
        <div className="glass-morphism p-6 rounded-3xl border-b-4 border-purple-500">
          <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Retention Rate</p>
          <p className="text-3xl font-bold">94%</p>
        </div>
      </div>

      <div className="glass-morphism rounded-3xl overflow-hidden border border-slate-800">
        <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center space-x-0 md:space-x-4 gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Filter by name, region, industry, or tag..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 text-sm font-bold text-slate-400 bg-slate-900 px-4 py-3 rounded-2xl border border-slate-800 hover:bg-slate-800 transition-colors">
              <Filter size={16} /> <span>Segment</span>
            </button>
            <button className="flex items-center justify-center w-12 h-12 text-slate-400 bg-slate-900 rounded-2xl border border-slate-800 hover:text-amber-500 transition-colors">
              <Star size={20} />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 text-slate-500 text-[10px] uppercase tracking-widest font-black">
                <th className="px-8 py-5">Global Professional</th>
                <th className="px-6 py-5">Segmentation</th>
                <th className="px-6 py-5">Relationship Health</th>
                <th className="px-6 py-5 text-right">Revenue Contrib.</th>
                <th className="px-8 py-5 text-center">Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm font-medium">
              {contacts
                .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))
                .map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-amber-500 font-bold border border-slate-800 shadow-inner group-hover:border-amber-500/50 transition-all">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-100 group-hover:text-amber-500 transition-colors">{c.name}</p>
                          <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                             <span className="flex items-center"><Mail size={10} className="mr-1" /> {c.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold uppercase tracking-tighter ${
                          c.status === 'VIP' ? 'border-amber-500/50 text-amber-500 bg-amber-500/5' :
                          c.status === 'Customer' ? 'border-emerald-500/50 text-emerald-500 bg-emerald-500/5' :
                          'border-blue-500/50 text-blue-500 bg-blue-500/5'
                        }`}>
                          {c.status}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-400 font-bold uppercase tracking-tighter">{c.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center space-x-2">
                          <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                             <div className={`h-full ${c.status === 'VIP' ? 'bg-amber-500 w-[95%]' : 'bg-emerald-500 w-[60%]'}`} />
                          </div>
                          <HeartPulse size={14} className={c.status === 'VIP' ? 'text-amber-500 animate-pulse' : 'text-emerald-500'} />
                       </div>
                       <p className="text-[10px] text-slate-600 mt-1">Interacted {c.lastInteraction}</p>
                    </td>
                    <td className="px-6 py-5 text-sm font-mono font-bold text-right text-slate-200">
                      ${c.value.toLocaleString()}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center space-x-2">
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-amber-500 transition-all hover:scale-110"><Mail size={16} /></button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-emerald-500 transition-all hover:scale-110"><Phone size={16} /></button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all"><MoreHorizontal size={16} /></button>
                      </div>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800/50 flex flex-col md:flex-row items-center gap-6">
         <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shrink-0 shadow-lg shadow-amber-500/5">
           <ShieldCheck size={32} />
         </div>
         <div className="flex-1">
           <h4 className="font-bold text-slate-100 flex items-center gap-2">Relationship Proactive Engine <Sparkles size={16} className="text-amber-500" /></h4>
           <p className="text-sm text-slate-400 mt-1 leading-relaxed">Sika Wura detected a decrease in engagement with your <strong>Kumasi Tech Hub</strong> leads. We recommend a "Tech-focused outreach" in Spanish for Elena Rodriguez to re-spark interest in your European export expansion.</p>
         </div>
         <button className="px-6 py-3 bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-2xl text-sm font-bold transition-all shrink-0">Draft Strategy</button>
      </div>
    </div>
  );
};

export default CRM;
