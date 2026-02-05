import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, Smartphone, Landmark, Hash, Zap, ShieldCheck, 
  Fingerprint, Eye, Mic, ArrowRight, CheckCircle2, QrCode, 
  History, Wallet, Sparkles, Send, Download, Plus, Search,
  Lock, Settings, BarChart3, Globe, Tablet, Apple, PlayCircle,
  X, Printer, RefreshCcw, Bell, ExternalLink, ChevronRight,
  Lightbulb, ShieldAlert, Cpu, Database, TrendingUp, Info,
  Activity, CheckCircle, Clock, Copy, HelpCircle, Share2,
  MoreVertical, ShoppingCart, Filter, ArrowUpRight, MessageCircle,
  Globe2, Layers
} from 'lucide-react';

interface PaymentLink {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: 'GHS' | 'USD';
  status: 'active' | 'archived';
  type: 'simple' | 'product';
  slug: string;
  totalPayments: number;
  revenue: number;
}

const INITIAL_LINKS: PaymentLink[] = [
  { id: '1', title: 'Consultation Fee', description: 'Business strategy session (1hr)', amount: 500, currency: 'GHS', status: 'active', type: 'simple', slug: 'consult-kwame', totalPayments: 12, revenue: 6000 },
  { id: '2', title: 'Export License Kit', description: 'Full documentation for EU export', amount: 2500, currency: 'GHS', status: 'active', type: 'product', slug: 'eu-kit', totalPayments: 3, revenue: 7500 },
];

const CediPay: React.FC = () => {
  const [view, setView] = useState<'merchant' | 'builder' | 'customer'>('merchant');
  const [links, setLinks] = useState<PaymentLink[]>(INITIAL_LINKS);
  const [activeLink, setActiveLink] = useState<PaymentLink | null>(null);
  
  // Builder State
  const [newLink, setNewLink] = useState<Partial<PaymentLink>>({
    title: '',
    description: '',
    amount: 0,
    currency: 'GHS',
    type: 'simple',
    slug: ''
  });

  // Customer View State
  const [customerForm, setCustomerForm] = useState({ name: '', email: '', phone: '' });
  const [paymentStep, setPaymentStep] = useState<'info' | 'method' | 'processing' | 'success'>('info');
  const [selectedCarrier, setSelectedCarrier] = useState<'mtn' | 'telecel' | 'airteltigo' | 'card' | null>(null);

  const handleCreateLink = () => {
    const link: PaymentLink = {
      ...(newLink as PaymentLink),
      id: Math.random().toString(36).substr(2, 9),
      status: 'active',
      totalPayments: 0,
      revenue: 0,
      slug: newLink.title?.toLowerCase().replace(/ /g, '-') || 'link-' + Math.random().toString(36).substr(2, 5)
    };
    setLinks([link, ...links]);
    setView('merchant');
  };

  const openCustomerView = (link: PaymentLink) => {
    setActiveLink(link);
    setView('customer');
    setPaymentStep('info');
  };

  const triggerPayment = () => {
    setPaymentStep('processing');
    setTimeout(() => {
      setPaymentStep('success');
      // Logic to update merchant link stats
      setLinks(prev => prev.map(l => l.id === activeLink?.id ? { ...l, totalPayments: l.totalPayments + 1, revenue: l.revenue + l.amount } : l));
    }, 3000);
  };

  const getCarrierIcon = (phone: string) => {
    if (phone.startsWith('024') || phone.startsWith('054') || phone.startsWith('055')) return 'MTN';
    if (phone.startsWith('020') || phone.startsWith('050')) return 'Telecel';
    return 'MoMo';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-0 pt-20 md:pt-24 font-['Inter']">
      {view === 'merchant' && (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
          {/* Merchant Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Sika Lomi <span className="text-amber-500">.</span></h1>
              <p className="text-slate-500 font-medium text-sm">Accept payments anywhere in Africa with custom links.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setView('builder')} className="bg-slate-900 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl hover:bg-slate-800 transition-all active:scale-95">
                <Plus size={20} /> Create New Link
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between h-48 group hover:border-amber-500/30 transition-all">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Collected</p>
                <div className="p-2 bg-amber-50 rounded-xl text-amber-500"><TrendingUp size={20}/></div>
              </div>
              <div>
                <h3 className="text-3xl font-black">GHS {links.reduce((s, l) => s + l.revenue, 0).toLocaleString()}</h3>
                <p className="text-xs text-emerald-500 font-bold mt-1">+12% from last week</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between h-48">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Links</p>
                <div className="p-2 bg-blue-50 rounded-xl text-blue-500"><Layers size={20}/></div>
              </div>
              <div>
                <h3 className="text-3xl font-black">{links.length}</h3>
                <p className="text-xs text-slate-400 font-bold mt-1">Live in Market</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between h-48">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Merchant Health</p>
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500"><ShieldCheck size={20}/></div>
              </div>
              <div>
                <h3 className="text-3xl font-black text-emerald-500">OPTIMAL</h3>
                <p className="text-xs text-slate-400 font-bold mt-1">PCI-DSS Compliant</p>
              </div>
            </div>
          </div>

          {/* Links List */}
          <div className="space-y-4">
            <h2 className="text-xl font-black tracking-tight">Your Payment Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {links.map(link => (
                <div key={link.id} className="bg-white border border-slate-100 rounded-[32px] p-8 hover:shadow-2xl transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                      <Zap size={120} />
                   </div>
                   <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-xl font-black text-slate-900">{link.title}</h4>
                        <p className="text-sm text-slate-400 font-medium truncate max-w-[200px]">{link.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openCustomerView(link)} className="p-3 bg-slate-50 text-slate-400 hover:text-amber-500 rounded-xl transition-all"><ExternalLink size={18} /></button>
                        <button className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl transition-all"><Share2 size={18} /></button>
                      </div>
                   </div>
                   <div className="flex items-center justify-between mt-12">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Volume</p>
                        <p className="text-xl font-black text-amber-500">GHS {link.revenue.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Successful Sales</p>
                        <p className="text-xl font-black text-slate-900">{link.totalPayments}</p>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'builder' && (
        <div className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-12 animate-in slide-in-from-bottom-10">
          <div className="flex-1 space-y-8">
            <button onClick={() => setView('merchant')} className="text-sm font-black uppercase text-slate-400 hover:text-slate-900 flex items-center gap-2">
              <X size={16} /> Close Builder
            </button>
            <h2 className="text-4xl font-black tracking-tight">Create a Payment Link</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Link Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Premium Consulting" 
                  className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl text-lg font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm"
                  value={newLink.title}
                  onChange={e => setNewLink({...newLink, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                <textarea 
                  placeholder="Tell your customers what they are paying for..." 
                  className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl h-32 font-medium focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm resize-none"
                  value={newLink.description}
                  onChange={e => setNewLink({...newLink, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Currency</label>
                  <select 
                    className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                    value={newLink.currency}
                    onChange={e => setNewLink({...newLink, currency: e.target.value as any})}
                  >
                    <option value="GHS">GHS (Cedi)</option>
                    <option value="USD">USD (Global)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    className="w-full bg-white border border-slate-200 px-6 py-4 rounded-2xl text-lg font-bold focus:ring-2 focus:ring-amber-500 outline-none shadow-sm"
                    value={newLink.amount}
                    onChange={e => setNewLink({...newLink, amount: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <button onClick={handleCreateLink} className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl shadow-2xl hover:bg-slate-800 transition-all text-lg active:scale-[0.98]">
                Deploy Live Link
              </button>
            </div>
          </div>

          {/* Builder Preview - Phone Frame */}
          <div className="hidden lg:flex flex-1 justify-center items-start sticky top-32">
            <div className="w-80 h-[600px] bg-slate-900 rounded-[50px] p-3 border-[10px] border-slate-800 shadow-[0_50px_100px_rgba(0,0,0,0.1)] relative">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-10" />
               <div className="w-full h-full bg-white rounded-[38px] overflow-hidden flex flex-col p-6 space-y-6">
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h5 className="text-xl font-black text-slate-900 leading-tight">{newLink.title || 'Untitled Link'}</h5>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Powered by Sika Wura</p>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="text-2xl font-black text-slate-900">{newLink.currency} {newLink.amount?.toLocaleString()}</p>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed italic">{newLink.description || 'No description provided.'}</p>
                  </div>
                  <div className="bg-slate-900 text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-sm">
                    Continue to Pay <ArrowRight size={16} />
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {view === 'customer' && activeLink && (
        <div className="fixed inset-0 z-[200] bg-white animate-in slide-in-from-right duration-500 overflow-y-auto font-['Inter']">
          <div className="max-w-md mx-auto min-h-screen p-8 flex flex-col justify-between py-12">
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <Zap size={24} />
                </div>
                <button onClick={() => setView('merchant')} className="text-slate-400 hover:text-red-500 transition-colors">
                  <X size={24} />
                </button>
              </div>

              {paymentStep === 'info' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black tracking-tight">{activeLink.title}</h2>
                    <p className="text-slate-500 font-medium">{activeLink.description}</p>
                  </div>

                  <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 text-center">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">You are paying</p>
                    <h3 className="text-5xl font-black text-slate-900">{activeLink.currency} {activeLink.amount.toLocaleString()}</h3>
                  </div>

                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      className="w-full bg-slate-50 border-none px-6 py-5 rounded-3xl font-bold outline-none focus:ring-2 focus:ring-amber-500"
                      value={customerForm.name}
                      onChange={e => setCustomerForm({...customerForm, name: e.target.value})}
                    />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      className="w-full bg-slate-50 border-none px-6 py-5 rounded-3xl font-bold outline-none focus:ring-2 focus:ring-amber-500"
                      value={customerForm.email}
                      onChange={e => setCustomerForm({...customerForm, email: e.target.value})}
                    />
                    <button 
                      onClick={() => setPaymentStep('method')}
                      disabled={!customerForm.name || !customerForm.email}
                      className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                      Continue to Payment <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === 'method' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-6">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setPaymentStep('info')} className="p-2 bg-slate-50 rounded-xl text-slate-400"><ChevronRight size={20} className="rotate-180" /></button>
                    <h2 className="text-2xl font-black tracking-tight">Payment Method</h2>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Phone Number</label>
                       <div className="relative">
                        <input 
                          type="tel" 
                          placeholder="024 XXX XXXX" 
                          className="w-full bg-slate-50 border-none px-6 py-5 rounded-3xl font-bold outline-none focus:ring-2 focus:ring-amber-500"
                          value={customerForm.phone}
                          onChange={e => setCustomerForm({...customerForm, phone: e.target.value})}
                        />
                        {customerForm.phone.length > 3 && (
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-[10px] font-black uppercase text-amber-500">
                            {getCarrierIcon(customerForm.phone)}
                          </div>
                        )}
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={triggerPayment} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col items-center gap-3 hover:border-amber-500 hover:bg-amber-50 transition-all group">
                        <Smartphone size={24} className="text-slate-400 group-hover:text-amber-500" />
                        <span className="text-xs font-black uppercase tracking-tighter">Mobile Money</span>
                      </button>
                      <button onClick={triggerPayment} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col items-center gap-3 hover:border-amber-500 hover:bg-amber-50 transition-all group">
                        <CreditCard size={24} className="text-slate-400 group-hover:text-amber-500" />
                        <span className="text-xs font-black uppercase tracking-tighter">Debit Card</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {paymentStep === 'processing' && (
                <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in zoom-in-95">
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-slate-100 rounded-full animate-spin border-t-amber-500" />
                    <Sparkles size={24} className="text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black">Connecting Rails...</h3>
                    <p className="text-slate-400 font-medium">Authorizing via Paystack x Medusa Engine</p>
                  </div>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in slide-in-from-bottom-10">
                  <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20">
                    <CheckCircle2 size={48} />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-3xl font-black">Payment Successful</h3>
                    <p className="text-slate-500 font-medium">Thank you for your business, {customerForm.name.split(' ')[0]}!</p>
                  </div>
                  <div className="w-full bg-slate-50 p-6 rounded-[32px] border border-slate-100 space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-medium">Transaction ID</span>
                      <span className="font-mono font-bold">SW-{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-medium">Payment Method</span>
                      <span className="font-bold">{customerForm.phone ? 'Mobile Money' : 'Card'}</span>
                    </div>
                  </div>
                  <button onClick={() => setView('merchant')} className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl shadow-xl hover:bg-slate-800 transition-all">
                    Finish
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-4 opacity-40">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">PCI-DSS SECURE GATEWAY</span>
              </div>
              <div className="flex gap-4 grayscale">
                <Apple size={16} />
                <PlayCircle size={16} />
                <CreditCard size={16} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shared Nav styles adjustment to white theme */}
      <style dangerouslySetInnerHTML={{ __html: `
        nav { background: rgba(255, 255, 255, 0.8) !important; border-color: #f1f5f9 !important; }
        nav .text-slate-400 { color: #94a3b8 !important; }
        nav .text-amber-500 { color: #f59e0b !important; }
        body { background: #f8fafc !important; color: #0f172a !important; }
      `}} />
    </div>
  );
};

export default CediPay;