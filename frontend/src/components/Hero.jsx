import React from 'react';
import { Sparkles, ShieldCheck, TrendingUp, IndianRupee, Users } from 'lucide-react';
import { AppleButton } from './Navbar';

const stats = [
  { icon: IndianRupee, value: '₹10L–₹1Cr', label: 'Coverage Plans' },
  { icon: Users, value: '50+ Cities', label: 'Tier 1, 2 & 3 India' },
  { icon: ShieldCheck, value: 'ML Powered', label: 'Random Forest Model' },
  { icon: TrendingUp, value: 'Instant EMI', label: 'Loan Risk Score' },
];

export default function Hero({ onGetStarted }) {
  const gradientStyle = {
    backgroundImage: 'linear-gradient(to right, #091020 0%, #0B2551 12.5%, #A4F4FD 32.5%, #00d2ff 50%, #0B2551 67.5%, #091020 87.5%, #091020 100%)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
    filter: 'url(#c3-noise)',
  };

  return (
    <div className="relative pt-16 md:pt-24 pb-10 text-center flex flex-col items-center select-none z-10 px-4">

      {/* Eyebrow badge */}
      <div
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 mb-6"
        style={{ animation: 'fadeIn 0.6s ease-out forwards', opacity: 0 }}
      >
        <Sparkles className="w-3.5 h-3.5 text-[#A4F4FD]" />
        <span>Made for India · AI-Powered Health Insurance Intelligence</span>
      </div>

      {/* Headline */}
      <h1
        className="text-4xl md:text-7xl font-bold tracking-tight leading-[1.05] text-center max-w-4xl opacity-0"
        style={{ animation: 'slideUp 0.8s cubic-bezier(.22,1,.36,1) 0.3s forwards' }}
      >
        <span className="block text-white">Apna Insurance.</span>
        <span className="block mt-2 animate-shiny" style={gradientStyle}>Smarter.</span>
      </h1>

      {/* Indian-context description */}
      <p
        className="mt-8 text-white/60 max-w-2xl text-sm sm:text-base leading-[1.7] opacity-0"
        style={{ animation: 'fadeIn 0.8s ease-out 0.5s forwards' }}
      >
        Confused about health insurance premiums in India? Enter your age, city, weight, income, and lifestyle —
        our <strong className="text-white">ML model instantly tells you which risk tier you fall in</strong> and recommends
        the right Aura insurance plan. Also helps bank managers assess <strong className="text-white">loan eligibility + EMI</strong> based on health risk.
      </p>

      {/* Value Prop Cards */}
      <div
        className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl w-full opacity-0"
        style={{ animation: 'fadeIn 0.8s ease-out 0.6s forwards' }}
      >
        {stats.map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur"
          >
            <Icon className="w-4 h-4 text-[#A4F4FD]" />
            <span className="text-white font-bold text-sm">{value}</span>
            <span className="text-white/40 text-[10px] text-center leading-tight">{label}</span>
          </div>
        ))}
      </div>

      {/* How it works — 3 steps */}
      <div
        className="mt-10 flex flex-col sm:flex-row gap-3 max-w-xl w-full opacity-0"
        style={{ animation: 'fadeIn 0.8s ease-out 0.65s forwards' }}
      >
        {[
          { step: '1', text: 'Enter age, weight, city & income' },
          { step: '2', text: 'ML model predicts your risk tier (Low / Medium / High)' },
          { step: '3', text: 'Get Indian insurance plans with exact ₹ premiums' },
        ].map(({ step, text }) => (
          <div key={step} className="flex items-start gap-2 text-left flex-1">
            <span className="shrink-0 w-5 h-5 rounded-full bg-[#A4F4FD]/10 border border-[#A4F4FD]/20 text-[#A4F4FD] text-[10px] font-bold flex items-center justify-center">
              {step}
            </span>
            <span className="text-white/50 text-[11px] leading-relaxed">{text}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        className="mt-10 flex flex-col items-center gap-3 opacity-0"
        style={{ animation: 'fadeIn 0.8s ease-out 0.7s forwards' }}
      >
        <AppleButton label="Check My Insurance Premium →" onClick={onGetStarted} />
        <span className="text-[10px] text-white/35 tracking-wider font-medium">
          Free · No registration · Works for all Indian cities
        </span>
      </div>

    </div>
  );
}
