import React, { useState, useRef, useMemo } from 'react';
import { 
  Landmark, FileText, CreditCard, PieChart, Plus, Camera, X, Check, 
  ArrowUpRight, ArrowDownRight, RefreshCcw, Search, Download, Sparkles,
  Package, Building2, ChevronRight, Filter, MoreVertical, Wallet, ListTree, Edit2, Trash2,
  ChevronDown, CornerDownRight, Calendar as CalendarIcon, Paperclip, Loader2, AlertCircle,
  ThumbsUp, Zap, BookOpen, Receipt, User, DollarSign, Calendar, Printer
} from 'lucide-react';
import { Transaction, Company, InventoryItem, ChartOfAccount, BankStatementEntry, Invoice } from '../types';
import { analyzeDocumentOCR } from '../services/geminiService';

const MOCK_COMPANIES: Company[] = [
  { id: 'c1', name: 'Ghana Logistics Ent.', industry: 'Logistics', currency: 'GHS', role: 'Owner' },
  { id: 'c2', name: 'Kumasi Tech Hub', industry: 'Software', currency: 'USD', role: 'Admin' },
];

const INITIAL_ACCOUNTS: ChartOfAccount[] = [
  { id: 'a1', code: '1000', name: 'Current Assets', type: 'Asset', balance: 5000 },
  { id: 'a2', code: '1100', name: 'GCB Bank Account', type: 'Asset', balance: 42500, parentId: 'a1' },
  { id: 'a3', code: '2000', name: 'Accounts Payable', type: 'Liability', balance: 1200 },
  { id: 'a4', code: '3000', name: 'Owner Equity', type: 'Equity', balance: 35000 },
  { id: 'a5', code: '4000', name: 'Sales Revenue', type: 'Revenue', balance: 65000 },
  { id: 'a6', code: '5000', name: 'Cost of Goods Sold', type: 'Expense', balance: 21000 },
  { id: 'a7', code: '6000', name: 'Operating Expenses', type: 'Expense', balance: 5000 },
  { id: 'a8', code: '6100', name: 'Utilities', type: 'Expense', balance: 1200, parentId: 'a7' },
  { id: 'a9', code: '6110', name: 'Electricity', type: 'Expense', balance: 800, parentId: 'a8' },
  { id: 'a10', code: '6120', name: 'Water', type: 'Expense', balance: 400, parentId: 'a8' },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2024-05-25', description: 'AWS Cloud Services', amount: 450.00, category: 'Utilities', status: 'Cleared', source: 'bank', accountId: 'a9', type: 'Credit' },
  { id: 't2', date: '2024-05-24', description: 'Customer Payment - Acme Corp', amount: 3200.00, category: 'Sales', status: 'Cleared', source: 'bank', accountId: 'a5', type: 'Debit' },
  { id: 't3', date: '2024-05-23', description: 'Office Supplies - Papaye', amount: 45.50, category: 'Office', status: 'Cleared', source: 'scanned', accountId: 'a1', type: 'Credit' },
];

const INITIAL_INVOICES: Invoice[] = [
  { id: 'inv-1', invoiceNumber: 'INV-2024-001', customerName: 'Kwame Mensah', customerId: '1', amount: 15000, dueDate: '2024-06-20', issueDate: '2024-05-20', status: 'Paid', type: 'Sales', items: [{ description: 'Logistics Consultation', quantity: 1, price: 15000 }] },
  { id: 'inv-2', invoiceNumber: 'INV-2024-002', customerName: 'Elena Rodriguez', customerId: '2', amount: 4500, dueDate: '2024-06-15', issueDate: '2024-05-15', status: 'Unpaid', type: 'Sales', items: [{ description: 'Export Licensing', quantity: 1, price: 4500 }] },
  { id: 'inv-3', invoiceNumber: 'PUR-2024-010', customerName: 'Server Depot', customerId: 'v1', amount: 1200, dueDate: '2024-05-30', issueDate: '2024-05-10', status: 'Overdue', type: 'Purchase', items: [{ description: 'Rack Mount Servers', quantity: 1, price: 1200 }] },
];

const INITIAL_BANK_STATEMENTS: BankStatementEntry[] = [
  { id: 'b1', date: '2024-05-25', description: 'AMZN MKTP US*AM900', amount: -450.00, reference: 'REF-8892', reconciled: false },
  { id: 'b2', date: '2024-05-24', description: 'INWARD TRANSFER ACME', amount: 3200.00, reference: 'BNK-1022', reconciled: false },
  { id: 'b3', date: '2024-05-26', description: 'STATIONERY DEPOT KESI', amount: -65.00, reference: 'CSH-9921', reconciled: false },
];

const FinancialHub: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'accounts' | 'invoices' | 'banking' | 'reports'>('ledger');
  const [selectedCompany] = useState<Company>(MOCK_COMPANIES[0]);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>(INITIAL_ACCOUNTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [bankStatements, setBankStatements] = useState<BankStatementEntry[]>(INITIAL_BANK_STATEMENTS);
  const [isScanning, setIsScanning] = useState(false);
  
  // Account Form State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(null);
  const [accountForm, setAccountForm] = useState({ 
    name: '', 
    code: '', 
    type: 'Asset' as ChartOfAccount['type'], 
    parentId: '' 
  });

  // Transaction Form State
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'Credit' as 'Debit' | 'Credit',
    accountId: INITIAL_ACCOUNTS[0].id,
    category: 'General',
    attachmentUrl: ''
  });

  // Invoice Form State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    customerName: '',
    amount: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'Unpaid' as Invoice['status'],
    type: 'Sales' as Invoice['type'],
    items: [{ description: '', quantity: 1, price: 0 }]
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleScanClick = () => fileInputRef.current?.click();

  const sortedAccounts = useMemo(() => {
    const result: ChartOfAccount[] = [];
    const addChildren = (parentId: string | undefined) => {
      accounts
        .filter(a => a.parentId === parentId)
        .sort((a, b) => a.code.localeCompare(b.code))
        .forEach(acc => {
          result.push(acc);
          addChildren(acc.id);
        });
    };
    
    ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].forEach(type => {
      accounts
        .filter(a => a.type === type && !a.parentId)
        .sort((a, b) => a.code.localeCompare(b.code))
        .forEach(root => {
          result.push(root);
          addChildren(root.id);
        });
    });
    
    return result;
  }, [accounts]);

  const getAccountDepth = (accountId: string, depth = 0): number => {
    const acc = accounts.find(a => a.id === accountId);
    if (acc?.parentId) return getAccountDepth(acc.parentId, depth + 1);
    return depth;
  };

  const getAccountPath = (accountId: string): string => {
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return '';
    if (acc.parentId) return `${getAccountPath(acc.parentId)} / ${acc.name}`;
    return acc.name;
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      try {
        const data = await analyzeDocumentOCR(base64, accounts);
        
        let mappedAccountId = accounts.find(a => a.id === data.suggestedAccountId)?.id;

        if (!mappedAccountId) {
          const categoryTerm = data.category?.toLowerCase() || '';
          const vendorTerm = data.vendor?.toLowerCase() || '';
          
          const bestAccountMatch = accounts.find(a => {
            const accName = a.name.toLowerCase();
            return accName.includes(categoryTerm) || 
                   categoryTerm.includes(accName) ||
                   accName.includes(vendorTerm) ||
                   vendorTerm.includes(accName);
          });
          mappedAccountId = bestAccountMatch?.id;
        }

        if (!mappedAccountId) {
          mappedAccountId = accounts.find(a => a.type === 'Expense')?.id;
        }

        if (!mappedAccountId) {
           mappedAccountId = accounts[0]?.id;
        }

        setTransactionForm({
          date: data.date || new Date().toISOString().split('T')[0],
          description: data.vendor ? `${data.vendor}: ${data.description || 'AI Extracted Receipt'}` : 'Scanned Receipt Transaction',
          amount: data.amount?.toString() || '0',
          type: 'Credit',
          accountId: mappedAccountId || '',
          category: data.category || 'General',
          attachmentUrl: dataUrl
        });
        setIsTransactionModalOpen(true);
      } catch (err) {
        console.error('OCR Error:', err);
        alert("Sika Wura AI could not process the receipt. Please try a clearer photo or enter details manually.");
      } finally {
        setIsScanning(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount) {
      setAccounts(prev => prev.map(a => a.id === editingAccount.id ? { ...a, ...accountForm, parentId: accountForm.parentId || undefined } : a));
    } else {
      const newAcc: ChartOfAccount = {
        id: Math.random().toString(36).substr(2, 9),
        ...accountForm,
        parentId: accountForm.parentId || undefined,
        balance: 0
      };
      setAccounts(prev => [...prev, newAcc]);
    }
    setIsAccountModalOpen(false);
    setEditingAccount(null);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: transactionForm.date,
      description: transactionForm.description,
      amount: parseFloat(transactionForm.amount),
      category: transactionForm.category,
      status: 'Cleared',
      source: transactionForm.attachmentUrl ? 'scanned' : 'manual',
      accountId: transactionForm.accountId,
      type: transactionForm.type,
      attachmentUrl: transactionForm.attachmentUrl || undefined
    };
    setTransactions(prev => [newTx, ...prev]);
    setAccounts(prev => prev.map(a => 
      a.id === newTx.accountId 
        ? { ...a, balance: a.balance + (newTx.type === 'Debit' ? newTx.amount : -newTx.amount) } 
        : a
    ));
    setIsTransactionModalOpen(false);
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const newInvoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      invoiceNumber: invoiceForm.invoiceNumber,
      customerName: invoiceForm.customerName,
      customerId: 'temp',
      amount: totalAmount,
      issueDate: invoiceForm.issueDate,
      dueDate: invoiceForm.dueDate,
      status: invoiceForm.status,
      type: invoiceForm.type,
      items: invoiceForm.items
    };
    setInvoices(prev => [newInvoice, ...prev]);
    setIsInvoiceModalOpen(false);
  };

  const handleReconcile = (statementId: string, transactionId: string) => {
    setTransactions(prev => prev.map(tx => tx.id === transactionId ? { ...tx, status: 'Reconciled' } : tx));
    setBankStatements(prev => prev.map(stmt => stmt.id === statementId ? { ...stmt, reconciled: true } : stmt));
  };

  const suggestedBankMatches = useMemo(() => {
    return bankStatements.map(stmt => {
      const match = transactions.find(tx => 
        tx.status !== 'Reconciled' && 
        tx.amount === Math.abs(stmt.amount) &&
        Math.abs(new Date(tx.date).getTime() - new Date(stmt.date).getTime()) < 86400000 * 5
      );
      return { 
        ...stmt, 
        suggestedMatchId: match?.id,
        matchConfidence: match ? 98 : 0 
      };
    });
  }, [bankStatements, transactions]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-24 max-w-7xl mx-auto space-y-6">
      {/* Account Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <form onSubmit={handleSaveAccount} className="glass-morphism border-slate-700 max-w-md w-full p-6 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <ListTree className="text-amber-500" size={20} />
                <h3 className="text-xl font-bold">{editingAccount ? 'Edit Account' : 'New Strategic Account'}</h3>
              </div>
              <button type="button" onClick={() => setIsAccountModalOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Code</label>
                  <input required placeholder="e.g. 1000" value={accountForm.code} onChange={e => setAccountForm({...accountForm, code: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Account Name</label>
                  <input required placeholder="e.g. Cash in Bank" value={accountForm.name} onChange={e => setAccountForm({...accountForm, name: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
              </div>
              
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Account Type</label>
                <select value={accountForm.type} onChange={e => setAccountForm({...accountForm, type: e.target.value as any})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-amber-500">
                  <option value="Asset">Asset</option>
                  <option value="Liability">Liability</option>
                  <option value="Equity">Equity</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Parent Category</label>
                <select value={accountForm.parentId} onChange={e => setAccountForm({...accountForm, parentId: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-amber-500">
                  <option value="">No Parent (Root Account)</option>
                  {accounts
                    .filter(a => a.type === accountForm.type && a.id !== editingAccount?.id)
                    .map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)
                  }
                </select>
              </div>
            </div>

            <button type="submit" className="mt-8 w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3.5 rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-2">
              <Check size={18} /> <span>{editingAccount ? 'Save Changes' : 'Append to COA'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Transaction Entry Modal */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <form onSubmit={handleSaveTransaction} className="glass-morphism border-slate-700 max-w-lg w-full p-6 my-auto rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Sparkles className="text-amber-500" size={24} />
                <h3 className="text-xl font-bold">{transactionForm.attachmentUrl ? 'Validate AI Extraction' : 'Strategic Ledger Entry'}</h3>
              </div>
              <button type="button" onClick={() => setIsTransactionModalOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transactionForm.attachmentUrl && (
                <div className="md:col-span-2 relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 mb-2 aspect-video">
                   <img src={transactionForm.attachmentUrl} alt="Source Document" className="w-full h-full object-contain p-2"/>
                   <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest bg-slate-900/80 px-4 py-2 rounded-full border border-amber-500/30">AI Insight active</span>
                   </div>
                </div>
              )}
              <div className="md:col-span-2">
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Description</label>
                <input required value={transactionForm.description} onChange={e => setTransactionForm({...transactionForm, description: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-amber-500" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Extracted Category</label>
                <input placeholder="e.g. Travel, Software" value={transactionForm.category} onChange={e => setTransactionForm({...transactionForm, category: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-amber-500" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Amount ({selectedCompany.currency})</label>
                <input type="number" step="0.01" required value={transactionForm.amount} onChange={e => setTransactionForm({...transactionForm, amount: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-amber-500 font-mono" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Type</label>
                <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-xl">
                  <button type="button" onClick={() => setTransactionForm({...transactionForm, type: 'Debit'})} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${transactionForm.type === 'Debit' ? 'bg-emerald-500 text-slate-900' : 'text-slate-500'}`}>Debit (+)</button>
                  <button type="button" onClick={() => setTransactionForm({...transactionForm, type: 'Credit'})} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${transactionForm.type === 'Credit' ? 'bg-red-500 text-slate-100' : 'text-slate-500'}`}>Credit (-)</button>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Chart of Account Mapping</label>
                <select value={transactionForm.accountId} onChange={e => setTransactionForm({...transactionForm, accountId: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-amber-500">
                  {sortedAccounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.code} - {getAccountPath(a.id)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="mt-8 w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3.5 rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-95">
              <Check size={18} /> <span>Synchronize to Ledger</span>
            </button>
          </form>
        </div>
      )}

      {/* Invoice Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto no-print">
          <form onSubmit={handleSaveInvoice} className="glass-morphism border-slate-700 max-w-2xl w-full p-8 my-auto rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <FileText className="text-amber-500" size={28} />
                <h3 className="text-2xl font-black tracking-tight">Generate {invoiceForm.type} Document</h3>
              </div>
              <button type="button" onClick={() => setIsInvoiceModalOpen(false)} className="text-slate-500 hover:text-white bg-slate-900 p-2 rounded-xl border border-slate-800"><X size={20} /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1.5">Document Type</label>
                <div className="flex p-1.5 bg-slate-950 border border-slate-800 rounded-2xl">
                  <button type="button" onClick={() => setInvoiceForm({...invoiceForm, type: 'Sales'})} className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${invoiceForm.type === 'Sales' ? 'bg-amber-500 text-slate-900' : 'text-slate-500 hover:text-slate-300'}`}>Sales Invoice</button>
                  <button type="button" onClick={() => setInvoiceForm({...invoiceForm, type: 'Purchase'})} className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${invoiceForm.type === 'Purchase' ? 'bg-slate-800 text-slate-100' : 'text-slate-500 hover:text-slate-300'}`}>Purchase Bill</button>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1.5">Invoice #</label>
                <input required placeholder="INV-001" value={invoiceForm.invoiceNumber} onChange={e => setInvoiceForm({...invoiceForm, invoiceNumber: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:ring-1 focus:ring-amber-500" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1.5">{invoiceForm.type === 'Sales' ? 'Customer' : 'Vendor'} Name</label>
                <input required placeholder="Search network..." value={invoiceForm.customerName} onChange={e => setInvoiceForm({...invoiceForm, customerName: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-amber-500" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1.5">Issue Date</label>
                <input type="date" required value={invoiceForm.issueDate} onChange={e => setInvoiceForm({...invoiceForm, issueDate: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-amber-500" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1.5">Due Date</label>
                <input type="date" required value={invoiceForm.dueDate} onChange={e => setInvoiceForm({...invoiceForm, dueDate: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-amber-500" />
              </div>
            </div>

            <div className="mt-8 space-y-4">
               <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Line Items</h4>
                  <button type="button" onClick={() => setInvoiceForm({...invoiceForm, items: [...invoiceForm.items, { description: '', quantity: 1, price: 0 }]})} className="text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline"><Plus size={12}/> Add Line</button>
               </div>
               {invoiceForm.items.map((item, idx) => (
                 <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-6">
                       <input placeholder="Item Description" value={item.description} onChange={e => {
                          const newItems = [...invoiceForm.items];
                          newItems[idx].description = e.target.value;
                          setInvoiceForm({...invoiceForm, items: newItems});
                       }} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-amber-500" />
                    </div>
                    <div className="col-span-2">
                       <input type="number" placeholder="Qty" value={item.quantity} onChange={e => {
                          const newItems = [...invoiceForm.items];
                          newItems[idx].quantity = parseInt(e.target.value) || 0;
                          setInvoiceForm({...invoiceForm, items: newItems});
                       }} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-amber-500" />
                    </div>
                    <div className="col-span-3">
                       <input type="number" placeholder="Price" value={item.price} onChange={e => {
                          const newItems = [...invoiceForm.items];
                          newItems[idx].price = parseFloat(e.target.value) || 0;
                          setInvoiceForm({...invoiceForm, items: newItems});
                       }} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-amber-500" />
                    </div>
                    <div className="col-span-1">
                       <button type="button" onClick={() => setInvoiceForm({...invoiceForm, items: invoiceForm.items.filter((_, i) => i !== idx)})} className="p-2 text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                 </div>
               ))}
            </div>

            <button type="submit" className="mt-10 w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-black py-4 rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition-transform active:scale-95">
              <Check size={20} /> <span>Authorize {invoiceForm.type} Document</span>
            </button>
          </form>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 no-print">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-900 shadow-xl shadow-amber-500/20">
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{selectedCompany.name} Hub</h2>
            <div className="flex items-center space-x-2 text-slate-400 text-xs mt-0.5 font-bold uppercase tracking-widest">
              <span className="text-amber-500">{selectedCompany.role} Strategic Access</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileChange} />
          <button onClick={handleScanClick} disabled={isScanning} className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:border-amber-500/50 shadow-inner">
            {isScanning ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
            <span>{isScanning ? 'Extracting Logic...' : 'Scan Receipt'}</span>
          </button>
          <button onClick={() => setIsTransactionModalOpen(true)} className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20">
            <Plus size={18} /> <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center space-x-1 bg-slate-900/50 p-1 rounded-2xl border border-slate-800 w-fit no-print">
        {[
          { id: 'ledger', label: 'Ledger', icon: Landmark },
          { id: 'accounts', label: 'Chart Accounts', icon: ListTree },
          { id: 'invoices', label: 'Invoicing', icon: Receipt },
          { id: 'banking', label: 'Bank Feeds', icon: CreditCard },
          { id: 'reports', label: 'Reporting', icon: PieChart },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveSubTab(tab.id as any)} className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeSubTab === tab.id ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-slate-200'}`}>
            <tab.icon size={16} /> <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeSubTab === 'ledger' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
              <div className="glass-morphism p-5 rounded-3xl border-l-4 border-emerald-500">
                <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Total Assets</p>
                <p className="text-2xl font-bold text-slate-100">{selectedCompany.currency} 142,500</p>
              </div>
              <div className="glass-morphism p-5 rounded-3xl border-l-4 border-red-500">
                <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Total Liabilities</p>
                <p className="text-2xl font-bold text-slate-100">{selectedCompany.currency} 21,800</p>
              </div>
              <div className="glass-morphism p-5 rounded-3xl border-l-4 border-amber-500">
                <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Equity Reserve</p>
                <p className="text-2xl font-bold text-slate-100">{selectedCompany.currency} 120,700</p>
              </div>
              <div className="glass-morphism p-5 rounded-3xl border-l-4 border-blue-500">
                <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Net Flow 24h</p>
                <p className="text-2xl font-bold text-slate-100">+{selectedCompany.currency} 12.4k</p>
              </div>
            </div>

            <div className="glass-morphism rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
              <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input placeholder="Search triple-entry records..." className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-amber-500" />
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={handleScanClick} disabled={isScanning} className="flex items-center space-x-2 text-xs font-bold text-amber-500 bg-amber-500/10 px-4 py-2.5 rounded-xl border border-amber-500/20 hover:bg-amber-500/20 transition-all">
                    {isScanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                    <span>{isScanning ? 'Parsing Document...' : 'Scan Receipt'}</span>
                  </button>
                  <button onClick={() => setIsTransactionModalOpen(true)} className="flex items-center space-x-2 text-xs font-bold text-slate-900 bg-amber-500 px-4 py-2.5 rounded-xl border border-amber-500/20 hover:bg-amber-600 transition-all shadow-lg">
                    <Plus size={14} /> <span>New Entry</span>
                  </button>
                  <button onClick={handlePrint} className="flex items-center space-x-2 text-xs font-bold text-slate-400 bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 transition-all">
                    <Printer size={14} /> <span>Print Ledger</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/50 text-[10px] text-slate-500 uppercase tracking-widest font-black">
                    <tr>
                      <th className="px-6 py-4">Serial #</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Strategic Mapping</th>
                      <th className="px-6 py-4 text-right">Debit</th>
                      <th className="px-6 py-4 text-right">Credit</th>
                      <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 text-sm">
                    {transactions.map(t => {
                      const account = accounts.find(a => a.id === t.accountId);
                      return (
                        <tr key={t.id} className="hover:bg-slate-800/30 transition-colors group">
                          <td className="px-6 py-4 font-mono text-slate-500 text-xs uppercase tracking-tighter">{t.id.toUpperCase()}</td>
                          <td className="px-6 py-4 text-slate-400 font-medium">{t.date}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                               <p className="font-bold text-slate-100">{t.description}</p>
                               {t.attachmentUrl && <Paperclip size={12} className="text-amber-500" />}
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{account?.code} • {account?.name || t.category}</p>
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-black text-emerald-400">
                            {t.type === 'Debit' ? `${selectedCompany.currency} ${t.amount.toLocaleString()}` : '-'}
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-black text-red-400">
                            {t.type === 'Credit' ? `${selectedCompany.currency} ${t.amount.toLocaleString()}` : '-'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-tighter border ${
                              t.status === 'Reconciled' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                              'bg-amber-500/10 text-amber-500 border-amber-500/20'
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

        {activeSubTab === 'accounts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
              <div>
                <h3 className="text-xl font-bold">Chart of Accounts Management</h3>
                <p className="text-xs text-slate-500 font-medium">Define your financial structure with hierarchical categories.</p>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={handlePrint} className="bg-slate-900 border border-slate-800 text-slate-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 hover:bg-slate-800">
                  <Printer size={14} /> <span>Print COA</span>
                </button>
                <button onClick={() => { setEditingAccount(null); setAccountForm({name:'', code:'', type:'Asset', parentId: ''}); setIsAccountModalOpen(true); }} className="bg-amber-500 text-slate-900 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 hover:bg-amber-600 shadow-lg">
                  <Plus size={14} /> <span>Add Strategic Account</span>
                </button>
              </div>
            </div>

            <div className="glass-morphism rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
              <table className="w-full text-left">
                <thead className="bg-slate-950/50 text-[10px] text-slate-500 uppercase tracking-widest font-black">
                  <tr>
                    <th className="px-6 py-4 w-32">Code</th>
                    <th className="px-6 py-4">Account Hierarchy</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 text-right">Balance</th>
                    <th className="px-6 py-4 text-center w-32 no-print">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {sortedAccounts.map(acc => {
                    const depth = getAccountDepth(acc.id);
                    return (
                      <tr key={acc.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4 font-mono text-slate-500 text-xs">{acc.code}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center" style={{ marginLeft: `${depth * 1.5}rem` }}>
                            {depth > 0 && <CornerDownRight size={14} className="text-slate-600 mr-2" />}
                            <span className={`text-sm ${depth === 0 ? 'font-black text-slate-100' : 'text-slate-400 font-medium'}`}>
                              {acc.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] px-2 py-0.5 rounded-lg border font-black uppercase tracking-tighter ${
                            acc.type === 'Asset' ? 'border-emerald-500/30 text-emerald-400' :
                            acc.type === 'Liability' ? 'border-red-500/30 text-red-400' :
                            acc.type === 'Revenue' ? 'border-amber-500/30 text-amber-400' :
                            'border-slate-500/30 text-slate-500'
                          }`}>
                            {acc.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-slate-200 text-sm">
                          {selectedCompany.currency} {acc.balance.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 no-print">
                          <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingAccount(acc); setAccountForm({name: acc.name, code: acc.code, type: acc.type, parentId: acc.parentId || ''}); setIsAccountModalOpen(true); }} className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-amber-500"><Edit2 size={14} /></button>
                            <button onClick={() => { if(window.confirm('Delete account?')) setAccounts(prev => prev.filter(a => a.id !== acc.id)); }} className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-red-500"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSubTab === 'invoices' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
              <div>
                <h3 className="text-xl font-bold">Invoicing & Billing</h3>
                <p className="text-xs text-slate-500 font-medium">Track your accounts receivable (AR) and payable (AP).</p>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={handlePrint} className="bg-slate-900 border border-slate-800 text-slate-400 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 hover:bg-slate-800">
                  <Printer size={14} /> <span>Print List</span>
                </button>
                <button onClick={() => { setInvoiceForm({invoiceNumber: '', customerName: '', amount: '', issueDate: new Date().toISOString().split('T')[0], dueDate: '', status: 'Unpaid', type: 'Sales', items: [{ description: '', quantity: 1, price: 0 }]}); setIsInvoiceModalOpen(true); }} className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-amber-500/10">
                  <Plus size={14} /> <span>Issue Document</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
              <div className="glass-morphism p-6 rounded-3xl border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Total Outstanding (AR)</p>
                  <p className="text-2xl font-bold text-amber-500">{selectedCompany.currency} {invoices.filter(i => i.type === 'Sales' && i.status !== 'Paid').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500"><ArrowUpRight size={24}/></div>
              </div>
              <div className="glass-morphism p-6 rounded-3xl border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Total Payables (AP)</p>
                  <p className="text-2xl font-bold text-red-400">{selectedCompany.currency} {invoices.filter(i => i.type === 'Purchase' && i.status !== 'Paid').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500"><ArrowDownRight size={24}/></div>
              </div>
            </div>

            <div className="glass-morphism rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-950/50 text-[10px] text-slate-500 uppercase tracking-widest font-black">
                    <tr>
                      <th className="px-6 py-4">Document #</th>
                      <th className="px-6 py-4">Client / Vendor</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Due Date</th>
                      <th className="px-6 py-4 text-right">Total Amount</th>
                      <th className="px-6 py-4 text-center">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4">
                           <p className="text-xs font-mono text-slate-400 font-black">{inv.invoiceNumber}</p>
                           <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tight">Issued {inv.issueDate}</p>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-sm font-bold text-slate-100">{inv.customerName}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] px-2 py-0.5 rounded-lg border font-black uppercase tracking-tighter ${
                            inv.status === 'Paid' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' :
                            inv.status === 'Overdue' ? 'border-red-500/30 text-red-400 bg-red-500/5' :
                            inv.status === 'Draft' ? 'border-blue-500/30 text-blue-400 bg-blue-500/5' :
                            'border-amber-500/30 text-amber-400 bg-amber-500/5'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-400">{inv.dueDate}</td>
                        <td className="px-6 py-4 text-right font-mono font-black text-slate-100 text-sm">
                           {selectedCompany.currency} {inv.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className={`text-[9px] px-2 py-0.5 rounded-lg border font-black uppercase tracking-tighter ${
                             inv.type === 'Sales' ? 'border-blue-500/30 text-blue-400' : 'border-purple-500/30 text-purple-400'
                           }`}>
                             {inv.type}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'banking' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center no-print">
               <h3 className="text-xl font-bold">Banking Reconciliation Hub</h3>
               <button className="bg-slate-900 border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 hover:bg-slate-800 transition-colors">
                 <RefreshCcw size={14} /> <span>Sync Feed</span>
               </button>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-morphism rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                   <div className="p-5 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Unmatched Transactions</h4>
                      <button onClick={handlePrint} className="text-[10px] font-bold text-slate-400 no-print flex items-center gap-1 hover:text-white transition-colors">
                        <Printer size={12} /> Print Audit
                      </button>
                   </div>
                   <div className="divide-y divide-slate-800/50">
                      {suggestedBankMatches.filter(s => !s.reconciled).map(stmt => (
                        <div key={stmt.id} className="p-6 hover:bg-slate-800/10 transition-all">
                           <div className="flex justify-between items-start mb-4">
                              <div className="flex items-start space-x-3">
                                 <div className={`p-2 rounded-xl ${stmt.amount < 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                    {stmt.amount < 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                 </div>
                                 <div>
                                    <p className="font-bold text-slate-100">{stmt.description}</p>
                                    <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">{stmt.date} • {stmt.reference}</p>
                                 </div>
                              </div>
                              <p className={`font-mono font-black text-lg ${stmt.amount < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                 {selectedCompany.currency} {Math.abs(stmt.amount).toLocaleString()}
                              </p>
                           </div>
                           {stmt.suggestedMatchId ? (
                              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 animate-in zoom-in-95 no-print">
                                 <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1">
                                       <Sparkles size={12} /> Sika AI Match Suggestion
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-500 bg-emerald-500/10 px-2 rounded-lg">{stmt.matchConfidence}% Match</span>
                                 </div>
                                 <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                       <p className="text-sm font-bold text-slate-200 truncate">{transactions.find(t => t.id === stmt.suggestedMatchId)?.description}</p>
                                       <p className="text-[10px] text-slate-500 font-bold uppercase">{transactions.find(t => t.id === stmt.suggestedMatchId)?.date}</p>
                                    </div>
                                    <button onClick={() => handleReconcile(stmt.id, stmt.suggestedMatchId!)} className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-amber-500/10">Reconcile</button>
                                 </div>
                              </div>
                           ) : (
                              <button className="w-full border border-slate-800 border-dashed py-3 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:text-amber-500 hover:border-amber-500/30 transition-all flex items-center justify-center gap-2 no-print">
                                 <Plus size={14} /> Add to Strategic Ledger
                              </button>
                           )}
                        </div>
                      ))}
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="glass-morphism p-8 rounded-3xl border border-slate-800 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-emerald-500 group-hover:h-2 transition-all" />
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Financial Reconciliation Summary</h4>
                        <button onClick={handlePrint} className="text-slate-500 hover:text-white no-print"><Printer size={16} /></button>
                      </div>
                      <div className="space-y-4">
                         <div className="flex justify-between text-sm">
                            <span className="text-slate-400 font-medium">Bank Balance (GCB)</span>
                            <span className="font-mono font-black text-slate-100">{selectedCompany.currency} 124,500.00</span>
                         </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-slate-400 font-medium">Internal Ledger Balance</span>
                            <span className="font-mono font-black text-slate-100">{selectedCompany.currency} 122,850.00</span>
                         </div>
                         <div className="h-px bg-slate-800/50 w-full my-2" />
                         <div className="flex justify-between items-center">
                            <span className="text-xs font-black uppercase text-slate-500">Unmatched Variance</span>
                            <span className="text-red-400 font-mono font-black text-xl">{selectedCompany.currency} 1,650.00</span>
                         </div>
                      </div>
                   </div>
                   <div className="glass-morphism p-6 rounded-3xl border border-amber-500/20 bg-amber-500/5 no-print">
                      <div className="flex items-center space-x-3 text-amber-500 mb-4">
                         <Zap size={20} />
                         <h4 className="text-sm font-black uppercase tracking-widest">Sika Wura Compliance Notice</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed italic">
                        "Your bank statement from GCB contains 3 unclassified entries. Strategic allocation of these to the 'Marketing' sub-account is recommended for Ghana Revenue Authority compliance."
                      </p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeSubTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex justify-end no-print">
               <button onClick={handlePrint} className="bg-amber-500 text-slate-900 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-transform active:scale-95 shadow-xl shadow-amber-500/20 flex items-center gap-2">
                 <Printer size={18} /> Print Insights
               </button>
            </div>
            <div className="glass-morphism p-20 rounded-[40px] border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl">
               <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800 text-slate-700">
                 <RefreshCcw size={32} className="animate-spin" />
               </div>
               <div>
                 <h3 className="text-2xl font-black tracking-tight">Enterprise Insight Engine</h3>
                 <p className="text-sm text-slate-500 max-w-sm font-medium mt-2">Sika Wura AI is currently synthesizing BigCapital ledger streams into a high-level strategic report for {selectedCompany.name}.</p>
               </div>
               <button className="bg-amber-500 text-slate-900 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-transform active:scale-95 shadow-xl shadow-amber-500/20 no-print">Force Insight Refresh</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialHub;