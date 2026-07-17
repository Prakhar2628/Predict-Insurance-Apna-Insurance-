import React, { useState } from 'react';
import { ChevronRight, Menu, X } from 'lucide-react';
import { AppleLogo } from './MacMenuBar';

// Shared Primitive: LogoMark (4-quadrant curves)
export function LogoMark({ className = "w-8 h-8 text-white" }) {
  return (
    <svg className={`${className} fill-current`} viewBox="0 0 256 256">
      <path d="M 0 128 C 70.692 128 128 185.308 128 256 L 64 256 C 64 220.654 35.346 192 0 192 Z M 256 192 C 220.654 192 192 220.654 192 256 L 128 256 C 128 185.308 185.308 128 256 128 Z M 128 0 C 128 70.692 70.692 128 0 128 L 0 64 C 35.346 64 64 35.346 64 0 Z M 192 0 C 192 35.346 220.654 64 256 64 L 256 128 C 185.308 128 128 70.692 128 0 Z" />
    </svg>
  );
}

// Shared Primitive: AppleButton
export function AppleButton({ label = "Download Aura", full = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-semibold text-xs py-2.5 px-4.5 transition-all hover:bg-white/90 active:scale-[0.98] ${
        full ? 'w-full' : ''
      }`}
    >
      <AppleLogo className="w-3.5 h-3.5 fill-current" />
      <span>{label}</span>
      <ChevronRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-[1px]" />
    </button>
  );
}

export default function Navbar({ activeTab, setActiveTab, isLoggedIn, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'predict', label: 'Predictor' },
    { id: 'crm', label: 'Underwriter CRM' },
    { id: 'credit', label: 'Credit Evaluator' },
    { id: 'stress', label: 'Portfolio Stress Tester' },
    { id: 'simulator', label: 'Risk Simulator' },
    { id: 'sandbox', label: 'API Sandbox' },
    { id: 'history', label: 'History Logs' },
    { id: 'about', label: 'Model Info' }
  ];

  return (
    <nav className="relative z-20 w-full bg-transparent">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo - Just LogoMark */}
          <div className="flex items-center cursor-pointer" onClick={() => setActiveTab('predict')}>
            <LogoMark className="w-8 h-8 text-white hover:text-brand transition-colors" />
          </div>

          {/* Center navigation links */}
          <div className="hidden md:flex items-center gap-6">
            {tabs.map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs font-medium transition-all duration-300 relative ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-white/60 hover:text-white'
                }`}
                style={{
                  animation: `slideUp 0.6s cubic-bezier(.22,1,.36,1) forwards`,
                  animationDelay: `${0.1 + i * 0.03}s`,
                  opacity: 0,
                }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white/40 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Right desktop Action (AppleButton or Logout) */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn && (
              <button
                onClick={onLogout}
                className="text-[10px] uppercase font-bold text-rose-455 hover:text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 rounded-full px-3.5 py-1.5 transition-all active:scale-95"
              >
                Log Out
              </button>
            )}
            <AppleButton 
              label="System Shell" 
              onClick={() => setActiveTab('predict')} 
            />
          </div>

          {/* Mobile Right: Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#0c0c0c]/95 px-6 pb-6 pt-3 backdrop-blur-xl absolute top-20 left-0 right-0 z-50">
          <div className="flex flex-col gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full py-2.5 text-left text-sm font-medium transition-colors ${
                  activeTab === tab.id ? 'text-white' : 'text-white/65'
                }`}
              >
                {tab.label}
              </button>
            ))}
            
            {isLoggedIn && (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2.5 text-xs uppercase font-bold text-rose-455 hover:text-rose-400 bg-rose-500/5 border border-rose-500/10 rounded-xl"
              >
                Log Out System
              </button>
            )}
            
            <AppleButton 
              label="System Shell" 
              full 
              onClick={() => {
                setActiveTab('predict');
                setMobileMenuOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </nav>
  );
}
