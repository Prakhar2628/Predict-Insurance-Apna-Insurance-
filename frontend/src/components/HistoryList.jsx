import React from 'react';
import { Trash2, Calendar, ArrowRight, ShieldCheck, User, Activity } from 'lucide-react';

export default function HistoryList({ history, clearHistory, deleteItem, onLoadPast }) {
  if (history.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto liquid-glass p-12 rounded-3xl border border-white/10 text-center animate-fade-in mt-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/50 mb-4 animate-pulse-subtle">
          <Calendar className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-bold text-white">No Evaluation Records Yet</h3>
        <p className="mt-2 text-xs text-white/40 leading-relaxed max-w-md mx-auto">
          Calculations you perform in the console will populate here in the local browser triage registry.
        </p>
      </div>
    );
  }

  // Triage count values
  const lowCount = history.filter(item => {
    const r = String(item.result).toLowerCase();
    return r === '0' || r.includes('low');
  }).length;
  
  const mediumCount = history.filter(item => {
    const r = String(item.result).toLowerCase();
    return r === '1' || r.includes('medium');
  }).length;
  
  const highCount = history.filter(item => {
    const r = String(item.result).toLowerCase();
    return r === '2' || r === '3' || r.includes('high') || r.includes('elevated') || r.includes('elev');
  }).length;

  const getBadgeStyle = (result) => {
    const stringCat = String(result).toLowerCase();
    if (stringCat === '0' || stringCat.includes('low')) {
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    } else if (stringCat === '1' || stringCat.includes('medium')) {
      return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    } else if (stringCat === '2' || stringCat.includes('elevated') || stringCat.includes('elev') || stringCat.includes('high')) {
      return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    } else {
      return 'text-rose-455 bg-rose-500/10 border-rose-500/20';
    }
  };

  const getCategoryLabel = (result) => {
    const r = String(result).toLowerCase();
    if (r === '0' || r.includes('low')) return 'LOW';
    if (r === '1' || r.includes('medium')) return 'MEDIUM';
    if (r === '2' || r.includes('elevated') || r.includes('elev') || r.includes('high')) return 'ELEVATED';
    return 'HIGH';
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 mt-6 animate-fade-in relative z-10 select-none">
      
      {/* Top Header stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Valuation Triage Dashboard
          </h2>
          <p className="text-xs text-white/40">Review past parameters submitted locally from this device</p>
        </div>

        <button
          onClick={clearHistory}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-400 rounded-xl border border-rose-550/20 bg-rose-500/10 hover:bg-rose-500/20 transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Purge All Records</span>
        </button>
      </div>

      {/* Triage summary display */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Low Risk', count: lowCount, border: 'border-emerald-500/25', text: 'text-emerald-400' },
          { label: 'Medium Risk', count: mediumCount, border: 'border-blue-500/25', text: 'text-blue-400' },
          { label: 'High Risk', count: highCount, border: 'border-rose-500/25', text: 'text-rose-400' }
        ].map((card, i) => (
          <div key={i} className={`liquid-glass p-4 rounded-xl border ${card.border} text-center`}>
            <span className="text-[10px] text-white/35 font-bold uppercase tracking-wider block">{card.label}</span>
            <span className={`text-2xl font-black block mt-1.5 ${card.text}`}>{card.count}</span>
          </div>
        ))}
      </div>

      {/* Grid of calculations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {history.map((item, index) => (
          <div
            key={index}
            className="group relative liquid-glass p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-[10px] text-white/40 font-semibold flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {item.timestamp}
              </span>
              
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getBadgeStyle(item.result)}`}>
                  {getCategoryLabel(item.result)}
                </span>
                
                <button
                  onClick={() => deleteItem(index)}
                  className="p-1 rounded-md text-white/30 hover:text-rose-400 hover:bg-white/5 transition-colors"
                  title="Remove from history"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Inputs summary */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] text-white/60">
              <div>
                <span className="text-white/35 font-medium block">Age</span>
                <span className="font-extrabold text-white">{item.input.age} Years</span>
              </div>
              <div>
                <span className="text-white/35 font-medium block">BMI Status</span>
                <span className="font-extrabold text-white truncate block">{item.input.bmi}</span>
              </div>
              <div>
                <span className="text-white/35 font-medium block">Smoking</span>
                <span className="font-extrabold text-white">{item.input.smoker ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-white/35 font-medium block">City</span>
                <span className="font-extrabold text-white truncate block">{item.input.city}</span>
              </div>
              <div>
                <span className="text-white/35 font-medium block">Occupation</span>
                <span className="font-extrabold text-white truncate block">
                  {item.input.occupation.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-white/35 font-medium block">Income Factor</span>
                <span className="font-extrabold text-white">{item.input.income_lpa} LPA</span>
              </div>
            </div>

            {/* Load Back action */}
            <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
              <button
                onClick={() => onLoadPast(item)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white/70 hover:text-white group-hover:translate-x-0.5 transition-transform"
              >
                <span>Load into Console</span>
                <ArrowRight className="h-3 w-3 text-brand" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
