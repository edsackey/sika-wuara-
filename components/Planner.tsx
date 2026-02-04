
import React, { useState } from 'react';
import { DailyObjective } from '../types';
import { Target, CheckCircle2, Circle, Clock, AlertTriangle, Lightbulb } from 'lucide-react';

const INITIAL_GOALS: DailyObjective[] = [
  { id: '1', title: 'Review Ghana-China Trade Compliance', priority: 'High', completed: false, deadline: '10:00 AM' },
  { id: '2', title: 'Audit BigCapital Q2 Projections', priority: 'High', completed: true, deadline: '11:30 AM' },
  { id: '3', title: 'AI Language Partner Call (Spanish)', priority: 'Medium', completed: false, deadline: '02:00 PM' },
  { id: '4', title: 'Capital Allocation Strategy Update', priority: 'Low', completed: false, deadline: '04:30 PM' },
];

const Planner: React.FC = () => {
  const [goals, setGoals] = useState<DailyObjective[]>(INITIAL_GOALS);
  const [showInterrupt, setShowInterrupt] = useState(false);

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const simulateInterruption = () => {
    setShowInterrupt(true);
    setTimeout(() => setShowInterrupt(false), 8000);
  };

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-24 max-w-4xl mx-auto space-y-6 relative">
      {showInterrupt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-morphism border-amber-500 max-w-md w-full p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center space-x-3 mb-4 text-amber-500">
              <AlertTriangle className="animate-bounce" />
              <h3 className="text-xl font-bold uppercase tracking-tight">Sika Wura Focus Interrupt</h3>
            </div>
            <p className="text-slate-200 text-lg mb-6 leading-relaxed">
              You've spent 40 minutes on non-revenue generating tabs. Your 10:00 AM objective <strong>"Ghana-China Trade Compliance"</strong> is at risk of failure.
            </p>
            <div className="flex space-x-3">
              <button onClick={() => setShowInterrupt(false)} className="flex-1 bg-amber-500 text-slate-900 font-bold py-3 rounded-xl">Back to Focus</button>
              <button onClick={() => setShowInterrupt(false)} className="px-4 py-3 bg-slate-800 text-slate-400 rounded-xl">Ignore (Not Recommended)</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Target className="text-amber-500" />
          <h2 className="text-2xl font-bold">Daily Strategic Objectives</h2>
        </div>
        <button 
          onClick={simulateInterruption}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 px-3 py-1.5 rounded-full border border-slate-700 transition-all"
        >
          Test Interrupt Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          {goals.map(goal => (
            <div 
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={`glass-morphism p-5 rounded-2xl flex items-center justify-between cursor-pointer transition-all border-l-4 ${
                goal.completed ? 'border-emerald-500 opacity-60' : 
                goal.priority === 'High' ? 'border-amber-500' : 'border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-4">
                {goal.completed ? <CheckCircle2 className="text-emerald-500" /> : <Circle className="text-slate-600" />}
                <div>
                  <h4 className={`font-semibold ${goal.completed ? 'line-through text-slate-500' : ''}`}>{goal.title}</h4>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-1 uppercase tracking-widest">
                    <Clock size={10} />
                    <span>{goal.deadline}</span>
                    <span className="text-slate-700">•</span>
                    <span className={goal.priority === 'High' ? 'text-amber-500' : ''}>{goal.priority} Priority</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="glass-morphism p-6 rounded-3xl bg-amber-500/5">
            <h4 className="text-sm font-bold uppercase tracking-widest text-amber-500 mb-4 flex items-center">
              <Lightbulb size={16} className="mr-2" /> Focus Analytics
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Objective Completion</span>
                  <span>75%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[75%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Time Optimization</span>
                  <span>42%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[42%]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-morphism p-6 rounded-3xl border border-emerald-500/20">
            <p className="text-xs text-emerald-400 font-bold mb-2 tracking-widest uppercase">Proactive Insight</p>
            <p className="text-slate-300 text-xs leading-relaxed italic">
              "Productivity is not about habits, it is about maintaining focus on High-Revenue Objectives. Sika Wura AI detected a decrease in your Spanish learning pace; shifting resources to evening focus blocks."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planner;
