import React from 'react';
import { AppTab } from '../types';
import { LayoutDashboard, Languages, Landmark, CalendarClock, Users, ShoppingBag, Sparkles, Group, Wallet2 } from 'lucide-react';

interface NavigationProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const items = [
    { id: AppTab.DASHBOARD, label: 'Wealth', icon: LayoutDashboard },
    { id: AppTab.CRM, label: 'CRM', icon: Users },
    { id: AppTab.FINANCE, label: 'Finance', icon: Landmark },
    { id: AppTab.ECOMMERCE, label: 'Market', icon: ShoppingBag },
    { id: AppTab.SIKAPAY, label: 'Sika Pay', icon: Wallet2 },
    { id: AppTab.ROSCA, label: 'ROSCA AI', icon: Group },
    { id: AppTab.TRANSLATOR, label: 'Linguistics', icon: Languages },
    { id: AppTab.ADVISOR, label: 'AI Coach', icon: Sparkles },
    { id: AppTab.PLANNER, label: 'Focus', icon: CalendarClock },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-morphism border-t border-slate-800 px-2 py-2 md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="hidden md:flex items-center space-x-2 mr-8 shrink-0">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.5)]">SW</div>
          <span className="font-bold text-lg tracking-tight uppercase">SIKA WURA <span className="text-amber-500">AI</span></span>
        </div>
        <div className="flex flex-1 justify-around md:justify-end md:space-x-4">
          {items.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-2 px-3 py-2 rounded-xl transition-all ${
                activeTab === id 
                  ? 'text-amber-500 bg-amber-500/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon size={18} />
              <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;