
import React, { useState } from 'react';
import { Transaction } from '../types';
import { Landmark, Filter, Download, Plus, Search, PieChart } from 'lucide-react';

// Fix: Added missing 'accountId' and 'type' properties to INITIAL_TRANSACTIONS to comply with Transaction interface
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2024-05-20', description: 'Tech Export - Hamburg', amount: 4500.00, category: 'Revenue', status: 'Cleared', source: 'bank', accountId: 'a1', type: 'Debit' },
  { id: '2', date: '2024-05-21', description: 'Server Maintenance', amount: -250.00, category: 'Expense', status: 'Cleared', source: 'bank', accountId: 'a1', type: 'Credit' },
  { id: '3', date: '2024-05-22', description: 'Yoruba Merchant Payment', amount: 1200.00, category: 'Revenue', status: 'Pending', source: 'bank', accountId: 'a2', type: 'Debit' },
  { id: '4', date: '2024-05-23', description: 'Investment - Gold Mining', amount: -5000.00, category: 'Investment', status: 'Cleared', source: 'manual', accountId: 'a1', type: 'Credit' },
  { id: '5', date: '2024-05-24', description: 'Consultancy Fees', amount: 850.00, category: 'Revenue', status: 'Cleared', source: 'bank', accountId: 'a2', type: 'Debit' },
];

const Ledger: React.FC = () => {
  const [transactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-24 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Landmark className="mr-3 text-amber-500" /> BigCapital Auto-Ledger
          </h2>
          <p className="text-slate-400 text-sm">Real-time financial synchronization and automated classification.</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-slate-800 hover:bg-slate-700 p-2.5 rounded-xl border border-slate-700">
            <Download size={20} />
          </button>
          <button className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-4 py-2.5 rounded-xl flex items-center space-x-2">
            <Plus size={20} /> <span>Entry</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-500 uppercase">Gross Revenue</p>
            <p className="text-lg font-bold text-emerald-400">$6,550.00</p>
          </div>
          <PieChart className="text-slate-700" size={32} />
        </div>
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-500 uppercase">Total Expenses</p>
            <p className="text-lg font-bold text-red-400">$5,250.00</p>
          </div>
          <PieChart className="text-slate-700" size={32} />
        </div>
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-500 uppercase">Net Income</p>
            <p className="text-lg font-bold text-amber-500">$1,300.00</p>
          </div>
          <PieChart className="text-slate-700" size={32} />
        </div>
        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-500 uppercase">Tax Liability</p>
            <p className="text-lg font-bold text-slate-400">$195.00</p>
          </div>
          <PieChart className="text-slate-700" size={32} />
        </div>
      </div>

      <div className="glass-morphism rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search ledger..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center space-x-2 text-sm text-slate-400 bg-slate-800 px-3 py-2 rounded-lg border border-slate-700">
            <Filter size={16} /> <span>Filters</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {transactions
                .filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono">{t.date}</td>
                    <td className="px-6 py-4 text-sm font-medium">{t.description}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-1 rounded-full border ${
                        t.category === 'Revenue' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                        t.category === 'Expense' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                        'border-amber-500/30 text-amber-400 bg-amber-500/10'
                      }`}>
                        {t.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold text-right font-mono ${t.amount < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {t.amount < 0 ? '-' : '+'}${Math.abs(t.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] ${t.status === 'Cleared' ? 'text-slate-500' : 'text-amber-500 italic animate-pulse'}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ledger;
