import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MacMenuBar from './components/MacMenuBar';
import PredictorForm from './components/PredictorForm';
import ResultCard from './components/ResultCard';
import HistoryList from './components/HistoryList';
import About from './components/About';
import Footer from './components/Footer';
import { XCircle, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { AppleButton } from './components/Navbar';
import CrmWorkspace from './components/CrmWorkspace';
import BiometricSimulator from './components/BiometricSimulator';
import DeveloperSandbox from './components/DeveloperSandbox';
import BankerCreditDesk from './components/BankerCreditDesk';
import StressTester from './components/StressTester';
import axios from 'axios';
import API_BASE from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState('predict');
  const [history, setHistory] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('aura_session'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      showToast('Please enter both username and password.', 'error');
      return;
    }
    setLoginLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/login`, { username, password });
      if (res.data.success) {
        localStorage.setItem('aura_session', 'true');
        setIsLoggedIn(true);
        showToast('Console authentication successful!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.detail || 'Invalid admin credentials.', 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aura_session');
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    showToast('Logged out of Actuarial Console.', 'success');
  };

  // Toast notifications state
  const [toast, setToast] = useState({
    message: '',
    type: 'success', // success | error
    visible: false,
  });

  // Track history cache on load
  useEffect(() => {
    const cached = localStorage.getItem('prediction_history');
    if (cached) {
      try {
        setHistory(JSON.parse(cached));
      } catch (err) {
        console.error('Failed to parse calculations history:', err);
      }
    }
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4500);
  };

  const handleResultCalculated = (newPredict) => {
    setCurrentResult(newPredict);
    const updatedHistory = [newPredict, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('prediction_history', JSON.stringify(updatedHistory));
    
    // Smooth scroll down to result card
    setTimeout(() => {
      const el = document.getElementById('result-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  const deleteItem = (indexToDelete) => {
    const updated = history.filter((_, idx) => idx !== indexToDelete);
    setHistory(updated);
    localStorage.setItem('prediction_history', JSON.stringify(updated));
    showToast('Record deleted.', 'success');
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to delete all historical prediction records?')) {
      setHistory([]);
      localStorage.removeItem('prediction_history');
      showToast('All evaluation history logs purged.', 'success');
    }
  };

  const handleLoadPastResult = (itemData) => {
    setCurrentResult(itemData);
    setActiveTab('predict');
    showToast('Past prediction details loaded.', 'success');
    
    setTimeout(() => {
      const el = document.getElementById('result-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0c0c0c] text-white select-none">
      
      {/* Global Background Video (fixed, behind everything) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover pointer-events-none"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4" 
        />
      </div>

      {/* Hidden-on-mobile fixed vertical guide lines */}
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 -translate-x-[calc(50%+36rem)] w-px bg-white/10 z-[5]" />
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 translate-x-[calc(-50%+36rem)] w-px bg-white/10 z-[5]" />

      {/* Global SVG noise filters (one at root level) */}
      <svg className="hidden">
        <filter id="c3-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
        </filter>
      </svg>

      {/* macOS Menu bar strip */}
      <MacMenuBar setActiveTab={setActiveTab} showToast={showToast} />

      {/* Navbar logo & headers */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} isLoggedIn={isLoggedIn} onLogout={handleLogout} />

      {/* Tab contents */}
      <div className="relative z-10">
        
        {activeTab === 'predict' && (
          <div className="pb-24">
            {/* Hero Banner text */}
            <Hero onGetStarted={() => {
              const el = document.getElementById('predictor-section');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }} />

            {/* Dashboard area */}
            <div id="predictor-section" className="max-w-6xl mx-auto px-6 py-16 scroll-mt-24">
              {isLoggedIn ? (
                /* Outer macOS mockup container */
                <div 
                  className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0e1014]/90 backdrop-blur-2xl opacity-0"
                  style={{
                    animation: 'slideUp 0.8s cubic-bezier(.22,1,.36,1) 0.9s forwards'
                  }}
                >
                  {/* Traffic light bar */}
                  <div className="h-10 bg-black/30 border-b border-white/5 flex items-center px-4 justify-between select-none">
                    <div className="flex gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                      <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                      <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">
                      InsurePredict Console — Valuation
                    </span>
                    <span className="w-12 h-2" />
                  </div>

                  {/* Form and card split panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
                    {/* Left: Input Console */}
                    <div className="lg:col-span-7 p-6 sm:p-8 border-r border-white/5 bg-black/20">
                      <PredictorForm
                        onResult={handleResultCalculated}
                        showToast={showToast}
                      />
                    </div>

                    {/* Right: Results Render */}
                    <div id="result-section" className="lg:col-span-5 p-6 sm:p-8 flex items-center justify-center bg-black/10 scroll-mt-24">
                      {currentResult ? (
                        <ResultCard
                          predictionData={currentResult}
                          onReset={() => setCurrentResult(null)}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-8 max-w-[280px]">
                          <span className="text-white/20 text-6xl mb-4 font-mono select-none font-bold">?</span>
                          <h4 className="text-sm font-bold text-white/80">Pending Calibration</h4>
                          <p className="mt-2 text-xs text-white/40 leading-relaxed">
                            Submit biometric parameter values to run the ML random forest prediction models.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto px-6 py-6 animate-fade-in text-left">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
                    
                    {/* Left Column: Suite Overview & Explainability */}
                    <div className="md:col-span-7 liquid-glass p-8 rounded-3xl border border-white/10 flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-[#A4F4FD]/10 filter blur-[40px] pointer-events-none" />
                      <div>
                        <span className="text-[10px] font-bold text-[#A4F4FD] uppercase tracking-widest block mb-2">Platform Overview</span>
                        <h3 className="text-xl font-extrabold text-white mb-3">Aura Actuarial Bank Suite</h3>
                        <p className="text-xs text-white/60 leading-relaxed mb-4">
                          In commercial lending, banking credit score models and medical risk statistics are heavily correlated. If a borrower faces lifestyle risks or health conditions, default rates escalate.
                        </p>
                        <p className="text-xs text-white/60 leading-relaxed mb-6">
                          This suite bridges underwriting and lending desks directly through integrated machine learning:
                        </p>
                        
                        <div className="space-y-4">
                          <div className="flex gap-3">
                            <span className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 font-mono">1</span>
                            <div>
                              <h4 className="text-xs font-bold text-white">Biometric Risk Assessment</h4>
                              <p className="text-[10px] text-white/40 leading-relaxed">Random Forest models analyze parameters (Age, BMI, Smoking) to classify risks into standard Tiers 1-4.</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <span className="h-5 w-5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 font-mono">2</span>
                            <div>
                              <h4 className="text-xs font-bold text-white">Lending Rate Markup</h4>
                              <p className="text-[10px] text-white/40 leading-relaxed">Health risk tiers translate to actuarial markups (+1.5% to +3.0% APR) on borrower loans to hedge default risk.</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <span className="h-5 w-5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 font-mono">3</span>
                            <div>
                              <h4 className="text-xs font-bold text-white">Portfolio Stress Testing</h4>
                              <p className="text-[10px] text-white/40 leading-relaxed">Simulate age, weight, and smoker macro-shocks across the entire client database to stress test banking default volatility.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t border-white/5 mt-6 text-[10px] text-white/35 flex justify-between items-center">
                        <span>Backend Services: FastAPI (Port 8000)</span>
                        <span>Client Side: React + Tailwind + Vite</span>
                      </div>
                    </div>

                    {/* Right Column: Authentication Form */}
                    <div className="md:col-span-5 liquid-glass p-8 rounded-3xl border border-white/10 flex flex-col justify-center relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-[#3D81E3]/20 filter blur-[50px] pointer-events-none" />
                      <h3 className="text-lg font-bold text-white mb-1">Operator Portal</h3>
                      <p className="text-xs text-white/50 mb-6">Unlock console via administrator credentials.</p>
                      
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-white/45 uppercase tracking-wider">Username</label>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="admin"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-white/45 uppercase tracking-wider">Password</label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={loginLoading}
                          className="w-full py-3 mt-4 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all"
                        >
                          {loginLoading ? 'Authenticating...' : 'Unlock Console'}
                        </button>
                      </form>
                      <p className="text-[9px] text-white/35 text-center mt-4">Default Credentials: <strong>admin</strong> / <strong>aura2026</strong></p>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Section 9 - Final CTA overlay */}
            <div className="max-w-6xl mx-auto px-6 py-20">
              <div 
                className="liquid-glass relative overflow-hidden rounded-3xl px-8 py-16 text-center"
                style={{
                  background: 'rgba(255,255,255,0.01)',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)'
                }}
              >
                {/* Radial overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-30" 
                  style={{
                    backgroundImage: 'radial-gradient(600px circle at 50% 0%, rgba(255,255,255,0.15), transparent 70%)'
                  }}
                />

                <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white leading-none">
                  Predict premiums.<br/>Approve bank loans.
                </h2>
                <p className="mt-6 text-white/60 max-w-sm mx-auto text-xs sm:text-sm leading-relaxed">
                  Consolidated tools for underwriting brokers, credit managers, and actuarial operators.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                  <button
                    onClick={() => {
                      const el = document.getElementById('predictor-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="rounded-full bg-white text-black font-semibold text-xs py-2.5 px-4.5 hover:bg-white/90 active:scale-95 transition-all"
                  >
                    Launch System Shell
                  </button>
                  
                  <button 
                    onClick={() => {
                      setActiveTab('credit');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold px-5 py-3 flex items-center gap-1 transition-all"
                  >
                    <span>Evaluate Credit Desk</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'crm' && (
          <div className="mx-auto max-w-6xl px-6 py-8">
            {isLoggedIn ? (
              <CrmWorkspace showToast={showToast} />
            ) : (
              <div className="max-w-md mx-auto px-6 py-6 animate-fade-in text-left">
                <div className="liquid-glass p-8 rounded-3xl border border-white/10 shadow-2xl relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-[#3D81E3]/20 filter blur-[50px] pointer-events-none" />
                  <h3 className="text-xl font-bold text-white mb-1">Actuarial Console</h3>
                  <p className="text-xs text-white/50 mb-6">Unlock CRM database via administrator credentials.</p>
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/45 uppercase tracking-wider">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/45 uppercase tracking-wider">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full py-3 mt-4 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all"
                    >
                      {loginLoading ? 'Authenticating...' : 'Unlock Console'}
                    </button>
                  </form>
                  <p className="text-[9px] text-white/35 text-center mt-4">Credentials: admin / aura2026</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'credit' && (
          <div className="mx-auto max-w-6xl px-6 py-8">
            {isLoggedIn ? (
              <BankerCreditDesk showToast={showToast} />
            ) : (
              <div className="max-w-md mx-auto px-6 py-6 animate-fade-in text-left">
                <div className="liquid-glass p-8 rounded-3xl border border-white/10 shadow-2xl relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-[#3D81E3]/20 filter blur-[50px] pointer-events-none" />
                  <h3 className="text-xl font-bold text-white mb-1">Actuarial Console</h3>
                  <p className="text-xs text-white/50 mb-6">Unlock Credit Evaluator via administrator credentials.</p>
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/45 uppercase tracking-wider">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/45 uppercase tracking-wider">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full py-3 mt-4 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all"
                    >
                      {loginLoading ? 'Authenticating...' : 'Unlock Console'}
                    </button>
                  </form>
                  <p className="text-[9px] text-white/35 text-center mt-4">Credentials: admin / aura2026</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stress' && (
          <div className="mx-auto max-w-6xl px-6 py-8">
            {isLoggedIn ? (
              <StressTester showToast={showToast} />
            ) : (
              <div className="max-w-md mx-auto px-6 py-6 animate-fade-in text-left">
                <div className="liquid-glass p-8 rounded-3xl border border-white/10 shadow-2xl relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-[#3D81E3]/20 filter blur-[50px] pointer-events-none" />
                  <h3 className="text-xl font-bold text-white mb-1">Actuarial Console</h3>
                  <p className="text-xs text-white/50 mb-6">Unlock Stress Tester via administrator credentials.</p>
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/45 uppercase tracking-wider">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/45 uppercase tracking-wider">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full py-3 mt-4 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all"
                    >
                      {loginLoading ? 'Authenticating...' : 'Unlock Console'}
                    </button>
                  </form>
                  <p className="text-[9px] text-white/35 text-center mt-4">Credentials: admin / aura2026</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'simulator' && (
          <div className="mx-auto max-w-6xl px-6 py-8">
            {isLoggedIn ? (
              <BiometricSimulator showToast={showToast} />
            ) : (
              <div className="max-w-md mx-auto px-6 py-6 animate-fade-in text-left">
                <div className="liquid-glass p-8 rounded-3xl border border-white/10 shadow-2xl relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-[#3D81E3]/20 filter blur-[50px] pointer-events-none" />
                  <h3 className="text-xl font-bold text-white mb-1">Actuarial Console</h3>
                  <p className="text-xs text-white/50 mb-6">Unlock Biometric Risk Simulator via administrator credentials.</p>
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/45 uppercase tracking-wider">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/45 uppercase tracking-wider">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full py-3 mt-4 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all"
                    >
                      {loginLoading ? 'Authenticating...' : 'Unlock Console'}
                    </button>
                  </form>
                  <p className="text-[9px] text-white/35 text-center mt-4">Credentials: admin / aura2026</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sandbox' && (
          <div className="mx-auto max-w-6xl px-6 py-8">
            {isLoggedIn ? (
              <DeveloperSandbox showToast={showToast} />
            ) : (
              <div className="max-w-md mx-auto px-6 py-6 animate-fade-in text-left">
                <div className="liquid-glass p-8 rounded-3xl border border-white/10 shadow-2xl relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-[#3D81E3]/20 filter blur-[50px] pointer-events-none" />
                  <h3 className="text-xl font-bold text-white mb-1">Actuarial Console</h3>
                  <p className="text-xs text-white/50 mb-6">Unlock Developer API Sandbox via administrator credentials.</p>
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/45 uppercase tracking-wider">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/45 uppercase tracking-wider">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full py-3 mt-4 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all"
                    >
                      {loginLoading ? 'Authenticating...' : 'Unlock Console'}
                    </button>
                  </form>
                  <p className="text-[9px] text-white/35 text-center mt-4">Credentials: admin / aura2026</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="mx-auto max-w-6xl px-6 py-8">
            {isLoggedIn ? (
              <HistoryList
                history={history}
                clearHistory={clearHistory}
                deleteItem={deleteItem}
                onLoadPast={handleLoadPastResult}
              />
            ) : (
              <div className="max-w-md mx-auto px-6 py-6 animate-fade-in text-left">
                <div className="liquid-glass p-8 rounded-3xl border border-white/10 shadow-2xl relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-[#3D81E3]/20 filter blur-[50px] pointer-events-none" />
                  <h3 className="text-xl font-bold text-white mb-1">Actuarial Console</h3>
                  <p className="text-xs text-white/50 mb-6">Unlock calculations history logs via administrator credentials.</p>
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/45 uppercase tracking-wider">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-white/45 uppercase tracking-wider">Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full py-3 mt-4 bg-white text-black font-bold text-xs rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all"
                    >
                      {loginLoading ? 'Authenticating...' : 'Unlock Console'}
                    </button>
                  </form>
                  <p className="text-[9px] text-white/35 text-center mt-4">Credentials: admin / aura2026</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="py-8">
            <About />
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />

      {/* Custom toast alerts */}
      {toast.visible && (
        <div 
          className="fixed bottom-5 right-5 z-55 max-w-md p-4 rounded-xl shadow-2xl flex items-center gap-3 border bg-[#0e1014]/95 border-white/10 backdrop-blur-md transition-all duration-300 animate-slide-in"
        >
          <div>
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-450" />
            ) : (
              <XCircle className="h-5 w-5 text-rose-450" />
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-white leading-tight">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
            className="text-white/40 hover:text-white transition-colors ml-2"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

    </div>
  );
}
