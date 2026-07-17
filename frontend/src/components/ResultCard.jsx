import React from 'react';
import { Shield, Sparkles, RefreshCw } from 'lucide-react';

export default function ResultCard({ predictionData, onReset }) {
  if (!predictionData) return null;

  const { input, result, timestamp } = predictionData;

  const getCategoryDetails = (cat) => {
    const stringCat = String(cat).toLowerCase();
    
    if (stringCat === '0' || stringCat.includes('low')) {
      return {
        title: 'Tier 1 - Low Premium',
        percentage: '15% - 25% cheaper',
        description: 'Excellent health indicators and demographic metrics place you in the lowest premium bracket.',
        color: 'from-emerald-400 to-teal-400',
        textColor: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10 border-emerald-500/20',
        badge: 'Low Risk Profile'
      };
    } else if (stringCat === '1' || stringCat.includes('medium')) {
      return {
        title: 'Tier 2 - Medium Premium',
        percentage: 'Standard Base Rate',
        description: 'Average biometric indices and normal lifestyle profile. Qualifies for standard market pricing.',
        color: 'from-blue-400 to-indigo-400',
        textColor: 'text-blue-400',
        bgColor: 'bg-blue-500/10 border-blue-500/20',
        badge: 'Moderate Risk Profile'
      };
    } else if (stringCat === '2' || stringCat.includes('high')) {
      return {
        title: 'Tier 3 - Elevated Premium',
        percentage: '15% - 30% loading',
        description: 'Compromised values (such as smoking or elevated body weight indices) place you in a higher pricing tier.',
        color: 'from-amber-400 to-orange-405',
        textColor: 'text-amber-400',
        bgColor: 'bg-amber-500/10 border-amber-500/20',
        badge: 'Elevated Risk Profile'
      };
    } else {
      return {
        title: 'Tier 4 - High Premium Plus',
        percentage: '40% - 60% loading',
        description: 'Cooccurring critical indicators (high BMI, smoker status, or age brackets) result in highest categorisation.',
        color: 'from-rose-400 to-red-405',
        textColor: 'text-rose-450',
        bgColor: 'bg-rose-500/10 border-rose-500/20',
        badge: 'High Risk Profile'
      };
    }
  };

  const details = getCategoryDetails(result);

  const generateInsights = (inp, finalCat) => {
    let strengths = [];
    let weaknesses = [];
    let actions = [];

    if (inp.bmi >= 18.5 && inp.bmi < 25) strengths.push("Healthy BMI lowers your risk profile.");
    else if (inp.bmi >= 30) weaknesses.push("Obesity classification (BMI > 30) forces you into higher risk tiers.");
    else weaknesses.push("Overweight BMI increases premium baseline.");

    if (!inp.smoker) strengths.push("Non-smoker status grants significant premium discounts.");
    else weaknesses.push("Active smoking automatically defaults you to at least Medium/Elevated risk tiers.");

    if (inp.income_lpa >= 5) strengths.push("Strong income buffer secures lower tier classifications.");
    else if (inp.income_lpa < 4) weaknesses.push("Low income buffer combined with health risks severely impacts tier approval.");

    if (inp.bmi >= 25) {
      const targetWeight = (24.9 * (inp.height/100) * (inp.height/100)).toFixed(1);
      actions.push(`Drop your weight to ~${targetWeight}kg to reach a normal BMI and enter a lower premium tier.`);
    }
    if (inp.smoker) {
      actions.push("Quitting smoking will instantly drop your category by at least 1 full tier.");
    }
    if (inp.income_lpa < 4 && (inp.bmi >= 25 || inp.smoker)) {
      actions.push("Increasing financial liquidity (income > 4 LPA) will offset your medical penalties.");
    }
    if (actions.length === 0 && finalCat === '0') {
      actions.push("Maintain current lifestyle. You are in the best possible bracket!");
    }

    return { strengths, weaknesses, actions };
  };

  const insights = generateInsights(input, result);

  return (
    <div className="w-full liquid-glass p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative transition-all duration-300 animate-slide-up">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
        <span className="text-[10px] font-bold tracking-wider uppercase text-white/40 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#A4F4FD]" /> Model Verdict
        </span>
        <span className="text-[10px] text-white/40 font-medium">{timestamp}</span>
      </div>

      {/* Main Prediction Value Display */}
      <div className="mt-6 text-center">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${details.bgColor} ${details.textColor}`}>
          <Shield className="h-3.5 w-3.5 fill-current" /> {details.badge}
        </span>
        
        <h3 className="mt-4 text-4xl sm:text-5xl font-black tracking-tight text-white leading-none">
          Category <span className={`bg-gradient-to-r ${details.color} bg-clip-text text-transparent`}>{result}</span>
        </h3>
        
        <p className="mt-3 text-sm font-bold text-white">
          {details.title}
        </p>

        {/* Pricing Impact Indicator */}
        <p className={`mt-1.5 text-xs font-semibold uppercase tracking-wider ${details.textColor}`}>
          Factor: {details.percentage}
        </p>
      </div>

      {/* Description */}
      <div className={`mt-6 p-4 rounded-xl border text-xs leading-relaxed text-white/70 ${details.bgColor}`}>
        {details.description}
      </div>

      {/* Input Parameter Breakdown grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 text-[11px]">
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
          <span className="text-white/40 font-semibold block">Age Base</span>
          <span className="font-extrabold text-white block mt-0.5">{input.age} Years</span>
        </div>
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
          <span className="text-white/40 font-semibold block">BMI & Verdict</span>
          <span className="font-extrabold text-white block mt-0.5">{input.bmi} ({input.bmiCategory})</span>
        </div>
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
          <span className="text-white/40 font-semibold block">Smoking Habit</span>
          <span className="font-extrabold text-white block mt-0.5">{input.smoker ? 'Smoker' : 'Non-Smoker'}</span>
        </div>
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
          <span className="text-white/40 font-semibold block">Income bracket</span>
          <span className="font-extrabold text-white block mt-0.5">{input.income_lpa} LPA</span>
        </div>
      </div>

      {/* Actionable Insights */}
      <div className="mt-6 p-5 rounded-2xl border border-white/5 bg-black/40 text-xs shadow-inner">
        <h4 className="font-bold text-white/90 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand" /> Actionable Insights
        </h4>
        
        {insights.weaknesses.length > 0 && (
          <div className="mb-3.5 space-y-2">
            <span className="text-[10px] font-bold text-rose-450 uppercase tracking-widest block">Risk Drivers (Penalties)</span>
            {insights.weaknesses.map((w, i) => (
              <p key={`w-${i}`} className="text-white/70 flex items-start gap-2">
                <span className="text-rose-500 font-black mt-0.5 text-[10px]">✕</span> {w}
              </p>
            ))}
          </div>
        )}

        {insights.strengths.length > 0 && (
          <div className="mb-4 space-y-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Positive Indicators</span>
            {insights.strengths.map((s, i) => (
              <p key={`s-${i}`} className="text-white/70 flex items-start gap-2">
                <span className="text-emerald-500 font-black mt-0.5 text-[10px]">✓</span> {s}
              </p>
            ))}
          </div>
        )}

        <div className="pt-3.5 border-t border-white/10 space-y-2">
          <span className="text-[10px] font-bold text-[#A4F4FD] uppercase tracking-widest block">How to Improve Your Tier</span>
          {insights.actions.map((a, i) => (
            <p key={`a-${i}`} className="text-white/90 font-medium flex items-start gap-2">
              <span className="text-[#A4F4FD] font-black mt-0.5 text-[10px]">→</span> {a}
            </p>
          ))}
        </div>
      </div>

      {/* Reset button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-all active:scale-[0.97]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Perform Another Calculation</span>
        </button>
      </div>

    </div>
  );
}
