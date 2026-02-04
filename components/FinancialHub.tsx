
import React, { useState, useRef, useMemo } from 'react';
import { 
  Landmark, FileText, CreditCard, PieChart, Plus, Camera, X, Check, 
  ArrowUpRight, ArrowDownRight, RefreshCcw, Search, Download, Sparkles,
  Package, Building2, ChevronRight, Filter, MoreVertical, Wallet, ListTree, Edit2, Trash2
} from 'lucide-react';
import { Transaction, Invoice, BankAccount, Company, InventoryItem, ChartOfAccount } from '../types';
import { analyzeDocumentOCR } from '../services/geminiService';

const MOCK_COMPANIES: Company[] = [
  { id: 'c1', name: 'Ghana Logistics Ent.', industry: 'Logistics', currency: 'GHS', role: 'Owner' },
  { id: 'c2', name: 'Kumasi Tech Hub', industry: 'Software', currency: 'USD', role: 'Admin' },
];

const INITIAL_ACCOUNTS: ChartOfAccount[] = [
  { id: 'a1', code: '1000', name: 'Cash on Hand', type: 'Asset', balance: 5000 },
  { id: 'a2', code: '1100', name: 'GCB Bank Account', type: 'Asset', balance: 42500 },
  { id: 'a3', code: '2000', name: 'Accounts Payable', type: 'Liability', balance: 1200 },
  { id: 'a4', code: '3000', name: 'Owner Equity', type: 'Equity', balance: 35000 },
  { id: 'a5', code: '4000', name: 'Sales Revenue', type: 'Revenue', balance: 65000 },
  { id: 'a6', code: '5000', name: 'Cost of Goods Sold', type: 'Expense', balance: 21000 },
  { id: 'a7', code: '5100', name: 'Rent Expense', type: 'Expense', balance: 5000 },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2024-05-25', description: 'AWS Cloud Services', amount: 450.00, category: 'Utilities', status: 'Cleared', source: 'bank', accountId: 'a1', type: 'Credit' },
  { id: '2', date: '2024-05-24', description: 'Customer Payment - Acme Corp', amount: 3200.00, category: 'Sales', status: 'Cleared', source: 'bank', accountId: 'a2', type: 'Debit' },
  { id: '3', date: '2024-05-23', description: 'Office Supplies - Papaye', amount: 45.50, category: 'Office', status: 'Reconciled', source: 'scanned', accountId: 'a1', type: 'Credit' },
];

const INITIAL_INVENTOY: InventoryItem[] = [
  { id: 'i1', sku: 'LGT-001', name: 'Vehicle Tracker Pro', quantity: 24, unitPrice: 150, reorderLevel: 5 },
  { id: 'i2', sku: 'LGT-002', name: 'Asset Tags RFID', quantity: 1500, unitPrice: 0.5, reorderLevel: 200 },
];

const FinancialHub: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'invoices' | 'banking' | 'inventory' | 'accounts' | 'reports'>('ledger');
  const [selectedCompany, setSelectedCompany] = useState<Company>(MOCK_COMPANIES[0]);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>(INITIAL_ACCOUNTS);
  const [inventory] = useState<InventoryItem[]>(INITIAL_INVENTOY);
  const [isScanning, setIsScanning] = useState(false);
  const [pendingTx, setPendingTx] = useState<any>(null);
  
  // Account Form State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(null);
  const [accountForm, setAccountForm] = useState({ name: '', code: '', type: 'Asset' as any });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScanClick = () => fileInputRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const data = await analyzeDocumentOCR(base64);
        setPendingTx({
          ...data,
          id: Math.random().toString(36).substr(2, 9),
          source: 'scanned',
          status: 'Pending',
          type: 'Credit'
        });
      } catch (err) {
        alert("OCR Scan failed. Please upload a clearer image.");
      } finally {
        setIsScanning(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const confirmPendingTx = () => {
    if (pendingTx) {
      setTransactions([{
        id: pendingTx.id,
        date: pendingTx.date,
        description: `${pendingTx.vendor}: ${pendingTx.description || 'Auto-extracted'}`,
        amount: pendingTx.amount,
        category: pendingTx.category,
        status: 'Cleared',
        source: 'scanned',
        accountId: 'a1',
        type: 'Credit'
      }, ...transactions]);
      setPendingTx(null);
    }
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount) {
      setAccounts(accounts.map(a => a.id === editingAccount.id ? { ...editingAccount, ...accountForm } : a));
    } else {
      const newAccount: ChartOfAccount = {
        id: Math.random().toString(36).substr(2, 9),
        ...accountForm,
        balance: 0
      };
      setAccounts([...accounts, newAccount]);
    }
    setIsAccountModalOpen(false);
    setEditingAccount(null);
    setAccountForm({ name: '', code: '', type: 'Asset' });
  };

  const deleteAccount = (id: string) => {
    if (window.confirm('Are you sure you want to delete this account? Transactions linked to it may lose context.')) {
      setAccounts(accounts.filter(a => a.id !== id));
    }
  };

  const openEditAccount = (account: ChartOfAccount) => {
    setEditingAccount(account);
    setAccountForm({ name: account.name, code: account.code, type: account.type });
    setIsAccountModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-24 max-w-7xl mx-auto space-y-6">
      {/* OCR Confirmation Modal */}
      {pendingTx && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-morphism border-amber-500/50 max-w-lg w-full p-6 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center">
                <Sparkles className="text-amber-500 mr-2" size={20} /> AI Ledger Review
              </h3>
              <button onClick={() => setPendingTx(null)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Extracted Vendor</p>
                <p className="text-lg font-bold text-amber-500">{pendingTx.vendor}</p>
                <div className="grid grid-cols-2 gap-4 mt-3">
                   <div>
                     <p className="text-[10px] text-slate-500 uppercase">Amount</p>
                     <p className="font-mono">{pendingTx.currency} {pendingTx.amount}</p>
                   </div>
                   <div>
                     <p className="text-[10px] text-slate-500 uppercase">Date</p>
                     <p>{pendingTx.date}</p>
                   </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Account</label>
                <select className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm focus:ring-1 focus:ring-amber-500 outline-none">
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8 flex space-x-3">
              <button 
                onClick={confirmPendingTx}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-transform active:scale-95"
              >
                <Check size={18} /> <span>Approve Entry</span>
              </button>
              <button 
                onClick={() => setPendingTx(null)}
                className="px-6 py-3 bg-slate-800 text-slate-300 rounded-xl border border-slate-700"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Management Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <form onSubmit={handleSaveAccount} className="glass-morphism border-slate-700 max-w-md w-full p-6 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{editingAccount ? 'Edit Account' : 'New Chart of Account'}</h3>
              <button type="button" onClick={() => setIsAccountModalOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Account Code</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 1000"
                  value={accountForm.code}
                  onChange={e => setAccountForm({...accountForm, code: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Account Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Cash in Bank"
                  value={accountForm.name}
                  onChange={e => setAccountForm({...accountForm, name: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Category</label>
                <select 
                  value={accountForm.type}
                  onChange={e => setAccountForm({...accountForm, type: e.target.value as any})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Asset">Asset</option>
                  <option value="Liability">Liability</option>
                  <option value="Equity">Equity</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
            </div>

            <div className="mt-8 flex space-x-3">
              <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 rounded-xl shadow-lg">
                {editingAccount ? 'Update Account' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Header & Company Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-900 shadow-xl shadow-amber-500/20">
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{selectedCompany.name}</h2>
            <div className="flex items-center space-x-2 text-slate-400 text-xs mt-0.5">
              <span className="bg-slate-800 px-2 py-0.5 rounded uppercase tracking-tighter font-bold border border-slate-700">{selectedCompany.industry}</span>
              <span>•</span>
              <span className="text-amber-500 font-semibold">{selectedCompany.role} Access</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 lg:pb-0">
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileChange} />
          <button 
            onClick={handleScanClick}
            disabled={isScanning}
            className="flex items-center space-x-2 bg-slate-900 border border-slate-800 hover:border-amber-500/50 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0"
          >
            <Camera size={18} className={isScanning ? 'animate-spin' : ''} />
            <span>{isScanning ? 'AI Processing...' : 'Scan Docyt OCR'}</span>
          </button>
          <button className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-transform active:scale-95 shrink-0">
            <Plus size={18} />
            <span>New Transaction</span>
          </button>
          <div className="w-px h-8 bg-slate-800 mx-2 shrink-0" />
          <select 
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold focus:ring-1 focus:ring-amber-500 outline-none shrink-0"
            onChange={(e) => setSelectedCompany(MOCK_COMPANIES.find(c => c.id === e.target.value)!)}
          >
            {MOCK_COMPANIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center space-x-1 bg-slate-900/50 p-1 rounded-2xl border border-slate-800 w-fit overflow-x-auto max-w-full">
        {[
          { id: 'ledger', label: 'General Ledger', icon: Landmark },
          { id: 'accounts', label: 'Chart of Accounts', icon: ListTree },
          { id: 'invoices', label: 'Invoices', icon: FileText },
          { id: 'inventory', label: 'Stock', icon: Package },
          { id: 'banking', label: 'Banking', icon: CreditCard },
          { id: 'reports', label: 'P&L', icon: PieChart },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeSubTab === tab.id 
                ? 'bg-amber-500 text-slate-900 shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <tab.icon size={16} />
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Dynamic Content Views */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeSubTab === 'accounts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Chart of Accounts Management</h3>
              <button 
                onClick={() => { setEditingAccount(null); setAccountForm({name:'', code:'', type:'Asset'}); setIsAccountModalOpen(true); }}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-4 py-2 rounded-xl text-sm flex items-center space-x-2"
              >
                <Plus size={16} /> <span>New Account</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].map(type => {
                const group = accounts.filter(a => a.type === type);
                if (group.length === 0) return null;
                return (
                  <div key={type} className="glass-morphism rounded-3xl overflow-hidden border border-slate-800">
                    <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center">
                      <h4 className="font-bold text-amber-500 uppercase tracking-widest text-xs">{type}s</h4>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                        {group.length} Accounts
                      </span>
                    </div>
                    <table className="w-full text-left">
                      <thead className="bg-slate-950/50 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                        <tr>
                          <th className="px-6 py-3 w-24">Code</th>
                          <th className="px-6 py-3">Account Name</th>
                          <th className="px-6 py-3 text-right">Balance</th>
                          <th className="px-6 py-3 text-center w-32">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 text-sm">
                        {group.map(acc => (
                          <tr key={acc.id} className="hover:bg-slate-800/30">
                            <td className="px-6 py-4 font-mono text-slate-400">{acc.code}</td>
                            <td className="px-6 py-4 font-bold text-slate-200">{acc.name}</td>
                            <td className="px-6 py-4 text-right font-mono font-bold text-slate-300">
                              {selectedCompany.currency} {acc.balance.toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center space-x-2">
                                <button onClick={() => openEditAccount(acc)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-amber-500 transition-colors">
                                  <Edit2 size={14} />
                                </button>
                                <button onClick={() => deleteAccount(acc.id)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-red-500 transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeSubTab === 'ledger' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-morphism p-5 rounded-2xl border-l-4 border-emerald-500">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Current Assets</p>
                <p className="text-2xl font-bold text-emerald-400">{selectedCompany.currency} 142,500</p>
              </div>
              <div className="glass-morphism p-5 rounded-2xl border-l-4 border-red-500">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Current Liabilities</p>
                <p className="text-2xl font-bold text-red-400">{selectedCompany.currency} 21,800</p>
              </div>
              <div className="glass-morphism p-5 rounded-2xl border-l-4 border-amber-500">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Equity (Retained)</p>
                <p className="text-2xl font-bold text-amber-500">{selectedCompany.currency} 120,700</p>
              </div>
              <div className="glass-morphism p-5 rounded-2xl border-l-4 border-blue-500">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Net Cash Flow</p>
                <p className="text-2xl font-bold text-blue-400">+{selectedCompany.currency} 12.4k</p>
              </div>
            </div>

            <div className="glass-morphism rounded-3xl overflow-hidden border border-slate-800">
              <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input placeholder="Search double-entry ledger..." className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 text-xs font-bold text-slate-400 bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800">
                    <Filter size={14} /> <span>Advanced Filter</span>
                  </button>
                  <button className="flex items-center space-x-2 text-xs font-bold text-slate-400 bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800">
                    <Download size={14} /> <span>Export XLS</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/50 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    <tr>
                      <th className="px-6 py-4">Ref #</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Chart of Account / Desc</th>
                      <th className="px-6 py-4 text-right">Debit</th>
                      <th className="px-6 py-4 text-right">Credit</th>
                      <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-sm">
                    {transactions.map(t => {
                      const linkedAccount = accounts.find(a => a.id === t.accountId);
                      return (
                        <tr key={t.id} className="hover:bg-slate-800/30 transition-colors group">
                          <td className="px-6 py-4 font-mono text-slate-500 text-xs">TXN-{t.id.slice(0,4).toUpperCase()}</td>
                          <td className="px-6 py-4 text-slate-400">{t.date}</td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-200">{linkedAccount ? linkedAccount.name : t.category}</p>
                            <p className="text-xs text-slate-500">{t.description}</p>
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-bold text-emerald-400">
                            {t.type === 'Debit' ? `${selectedCompany.currency} ${t.amount.toLocaleString()}` : '-'}
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-bold text-red-400">
                            {t.type === 'Credit' ? `${selectedCompany.currency} ${t.amount.toLocaleString()}` : '-'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-tighter ${
                              t.status === 'Reconciled' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                              'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-morphism rounded-3xl overflow-hidden border border-slate-800">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-bold">Real-time Inventory Tracking</h3>
                <button className="text-xs bg-amber-500 text-slate-900 px-4 py-2 rounded-xl font-bold">Audit Stock</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/50 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                    <tr>
                      <th className="px-6 py-4">SKU</th>
                      <th className="px-6 py-4">Item Name</th>
                      <th className="px-6 py-4 text-center">In Stock</th>
                      <th className="px-6 py-4 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-sm">
                    {inventory.map(item => (
                      <tr key={item.id} className="hover:bg-slate-800/30">
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.sku}</td>
                        <td className="px-6 py-4 font-bold">{item.name}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center">
                             <span className={`font-bold ${item.quantity <= item.reorderLevel ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
                               {item.quantity} units
                             </span>
                             {item.quantity <= item.reorderLevel && (
                               <span className="text-[8px] text-red-500 uppercase font-black">Low Stock</span>
                             )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold">
                          {selectedCompany.currency} {(item.quantity * item.unitPrice).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="space-y-6">
              <div className="glass-morphism p-6 rounded-3xl border border-slate-800">
                <h4 className="text-sm font-bold uppercase tracking-widest text-amber-500 mb-4 flex items-center">
                  <Package size={16} className="mr-2" /> Stock Alerts
                </h4>
                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl mb-4">
                  <p className="text-xs text-red-400 font-bold mb-1">Reorder Required</p>
                  <p className="text-xs text-slate-400 leading-relaxed">Vehicle Tracker Pro (SKU: LGT-001) has dropped below threshold level 5.</p>
                  <button className="mt-3 w-full bg-red-500/10 text-red-400 py-2 rounded-lg text-[10px] font-bold uppercase border border-red-500/20 hover:bg-red-500/20">Generate Purchase Order</button>
                </div>
              </div>
              <div className="glass-morphism p-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/5">
                <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-500 mb-4 flex items-center">
                  <Sparkles size={16} className="mr-2" /> AI Forecasting
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Based on historical trends, you'll likely need 40 additional units of "Asset Tags RFID" by the end of next month. Sika Wura suggests placing an order by June 10th to avoid logistics delays.
                </p>
              </div>
            </div>
          </div>
        )}

        {(activeSubTab === 'invoices' || activeSubTab === 'banking' || activeSubTab === 'reports') && (
          <div className="glass-morphism p-20 rounded-3xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 text-slate-700">
               <RefreshCcw size={32} className="animate-spin" />
             </div>
             <div>
               <h3 className="text-xl font-bold">Compiling Enterprise Reports</h3>
               <p className="text-sm text-slate-500 max-w-sm">Akaunting and BigCapital data streams are being unified for your {selectedCompany.name} dashboard. This ensures 100% tax and audit compliance.</p>
             </div>
             <button className="bg-amber-500 text-slate-900 px-6 py-2.5 rounded-xl font-bold transition-transform active:scale-95 shadow-lg">Refresh Sync Engine</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialHub;
