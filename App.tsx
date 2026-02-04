
import React, { useState, useCallback } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Translator from './components/Translator';
import FinancialHub from './components/FinancialHub';
import Advisor from './components/Advisor';
import Planner from './components/Planner';
import CRM from './components/CRM';
import VoiceOverlay from './components/VoiceOverlay';
import { AppTab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);

  const handleNavigate = useCallback((tab: AppTab) => {
    setActiveTab(tab);
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD: return <Dashboard />;
      case AppTab.CRM: return <CRM />;
      case AppTab.FINANCE: return <FinancialHub />;
      case AppTab.TRANSLATOR: return <Translator />;
      case AppTab.ADVISOR: return <Advisor />;
      case AppTab.PLANNER: return <Planner />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-500">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Voice Assistant Layer */}
      <VoiceOverlay onNavigate={handleNavigate} activeTab={activeTab} />

      <main className="animate-in fade-in slide-in-from-bottom-2 duration-700 pb-24 md:pb-8">
        {renderTab()}
      </main>
      
      {/* Subtle Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] -z-10" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
    </div>
  );
};

export default App;
