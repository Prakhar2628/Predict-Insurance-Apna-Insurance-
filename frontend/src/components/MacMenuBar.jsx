import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../config';


export function AppleLogo({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 384 512" fill="currentColor">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

// Dropdown menu component
function MenuDropdown({ items, onClose }) {
  return (
    <div className="absolute top-full left-0 mt-1 min-w-[180px] bg-[#1c1c1e]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl py-1 z-[100] overflow-hidden">
      {items.map((item, i) =>
        item === 'separator' ? (
          <div key={i} className="my-1 border-t border-white/10" />
        ) : (
          <button
            key={i}
            onClick={() => { item.action(); onClose(); }}
            className="w-full text-left px-3 py-1.5 text-[11px] text-white/75 hover:bg-white/10 hover:text-white transition-colors flex items-center justify-between group"
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="text-white/30 text-[10px] group-hover:text-white/50">{item.shortcut}</span>
            )}
          </button>
        )
      )}
    </div>
  );
}

export default function MacMenuBar({ setActiveTab, showToast }) {
  const [timeStr, setTimeStr] = useState('');
  const [openMenu, setOpenMenu] = useState(null); // which menu is open
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const options = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      };
      setTimeStr(d.toLocaleString('en-US', options).replace(',', ''));
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Close search on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setOpenMenu(null);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const navigate = (tab) => {
    if (setActiveTab) setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toast = (msg) => {
    if (showToast) showToast(msg, 'success');
  };

  const menuDefinitions = {
    File: [
      { label: 'New Prediction', shortcut: '⌘N', action: () => { navigate('predict'); if (showToast) showToast('New session — fill the form below.', 'success'); } },
      'separator',
      { label: '⬆ Import Patients from JSON', action: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async (evt) => {
            try {
              const data = JSON.parse(evt.target.result);
              let patientsArray = [];
              if (Array.isArray(data)) {
                patientsArray = data;
              } else if (typeof data === 'object') {
                patientsArray = Object.entries(data).map(([id, val]) => ({
                  id: val.id || id,
                  ...val
                }));
              }
              const validArray = patientsArray.map(p => ({
                id: p.id,
                name: p.name || 'Unknown',
                city: p.city || 'Delhi',
                age: parseInt(p.age) || 30,
                weight: parseFloat(p.weight) || 70.0,
                gender: p.gender || 'male',
                height: parseFloat(p.height) || 1.75,
                income_lpa: parseFloat(p.income_lpa) || 5.5,
                smoker: Boolean(p.smoker),
                occupation: p.occupation || 'private_job'
              }));
              const res = await axios.post(`${API_BASE}/import`, validArray);
              if (showToast) showToast(`Imported ${res.data.imported_count} patients successfully!`, 'success');
              window.dispatchEvent(new Event('patientImported'));
            } catch (err) {
              console.error(err);
              if (showToast) showToast('Failed to import JSON file. Verify schema.', 'error');
            }
          };
          reader.readAsText(file);
        };
        input.click();
      }},
      { label: '⬇ Export All Registered Patients', action: async () => {
        try {
          const res = await axios.get(`${API_BASE}/view`);
          const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = 'patients_export.json'; a.click();
          if (showToast) showToast('All profiles exported to patients_export.json', 'success');
        } catch (err) {
          if (showToast) showToast('Failed to export patient profiles.', 'error');
        }
      }},
      'separator',
      { label: '⬇ Export Last Result as JSON', action: () => {
        const h = localStorage.getItem('prediction_history');
        if (h) {
          try {
            const last = JSON.parse(h)[0];
            const blob = new Blob([JSON.stringify(last, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'aura_result.json'; a.click();
            if (showToast) showToast('Result downloaded as aura_result.json', 'success');
          } catch { if (showToast) showToast('No prediction to export yet.', 'error'); }
        } else { if (showToast) showToast('No prediction to export yet.', 'error'); }
      }},
      { label: '🖨 Print This Page', action: () => window.print() },
      'separator',
      { label: '🌐 Check Backend Health', action: () => window.open(`${API_BASE}/health`, '_blank') },
      { label: '📖 API Docs (Swagger)', action: () => window.open(`${API_BASE}/docs`, '_blank') },
    ],
    Edit: [
      { label: 'Copy Last Result', shortcut: '⌘C', action: () => {
        const h = localStorage.getItem('prediction_history');
        if (h) {
          try {
            const last = JSON.parse(h)[0];
            navigator.clipboard.writeText(JSON.stringify(last, null, 2));
            toast('Last result copied to clipboard.');
          } catch { toast('No prediction result to copy.'); }
        } else {
          toast('No prediction result to copy.');
        }
      }},
      'separator',
      { label: 'Reset All Filters', action: () => { navigate('predict'); toast('Filters reset.'); } },
    ],
    View: [
      { label: 'Predictor', shortcut: '⌘1', action: () => navigate('predict') },
      { label: 'Underwriter CRM', shortcut: '⌘2', action: () => navigate('crm') },
      { label: 'Credit Evaluator', shortcut: '⌘3', action: () => navigate('credit') },
      { label: 'Portfolio Stress Tester', shortcut: '⌘4', action: () => navigate('stress') },
      { label: 'Risk Simulator', shortcut: '⌘5', action: () => navigate('simulator') },
      { label: 'API Sandbox', shortcut: '⌘6', action: () => navigate('sandbox') },
      'separator',
      { label: 'History Logs', shortcut: '⌘7', action: () => navigate('history') },
      { label: 'Model Info', shortcut: '⌘8', action: () => navigate('about') },
    ],
    Go: [
      { label: 'Back to Top', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
      { label: 'Jump to Predictor Form', action: () => {
        navigate('predict');
        setTimeout(() => {
          const el = document.getElementById('predictor-section');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }},
      { label: 'Jump to Results', action: () => {
        const el = document.getElementById('result-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }},
      'separator',
      { label: 'Open FastAPI Backend', action: () => window.open(API_BASE, '_blank') },
    ],
    Window: [
      { label: 'Scroll to Top', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
      { label: 'Scroll to Bottom', action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }) },
      'separator',
      { label: 'Toggle Fullscreen', action: () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
      }},
    ],
    Help: [
      { label: 'About InsurePredict', action: () => navigate('about') },
      { label: 'API Documentation', action: () => window.open(`${API_BASE}/docs`, '_blank') },
      { label: 'Redoc Reference', action: () => window.open(`${API_BASE}/redoc`, '_blank') },
      'separator',
      { label: 'Default Login: admin / aura2026', action: () => toast('Credentials: admin / aura2026') },
    ],
  };

  // Quick search routes
  const searchItems = [
    { label: 'Predictor', tab: 'predict' },
    { label: 'Underwriter CRM', tab: 'crm' },
    { label: 'Credit Evaluator', tab: 'credit' },
    { label: 'Portfolio Stress Tester', tab: 'stress' },
    { label: 'Risk Simulator', tab: 'simulator' },
    { label: 'API Sandbox', tab: 'sandbox' },
    { label: 'History Logs', tab: 'history' },
    { label: 'Model Info', tab: 'about' },
  ];

  const filteredSearch = searchQuery.trim()
    ? searchItems.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : searchItems;

  return (
    <>
      <div className="w-full h-10 bg-black/45 backdrop-blur-md border-t border-b border-white/10 select-none z-10 relative" ref={menuRef}>
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between text-xs text-white/80">

          {/* Left: Logo + Menu items */}
          <div className="flex items-center gap-5">
            <div
              className="flex items-center gap-1.5 text-white font-bold cursor-pointer hover:text-indigo-400 transition-colors"
              onClick={() => navigate('predict')}
            >
              <AppleLogo className="w-3.5 h-3.5" />
              <span>InsurePredict</span>
            </div>

            <div className="flex items-center gap-4 text-white/60">
              {Object.keys(menuDefinitions).map((menuName, index) => {
                let displayClass = "hover:text-white cursor-pointer transition-colors relative";
                if (index > 2) displayClass += " hidden sm:inline";
                if (index > 3) displayClass += " hidden md:inline";

                return (
                  <span
                    key={menuName}
                    className={`${displayClass} ${openMenu === menuName ? 'text-white bg-white/10 rounded px-1.5 py-0.5' : ''}`}
                    onClick={() => setOpenMenu(openMenu === menuName ? null : menuName)}
                  >
                    {menuName}
                    {openMenu === menuName && (
                      <MenuDropdown
                        items={menuDefinitions[menuName]}
                        onClose={() => setOpenMenu(null)}
                      />
                    )}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Right: Search + Clock */}
          <div className="flex items-center gap-4 text-white/60">
            <Search
              className="w-3.5 h-3.5 cursor-pointer hover:text-white transition-colors"
              onClick={() => setSearchOpen(true)}
            />
            <span className="font-medium text-[11px] text-white">
              {timeStr || 'Wed May 6 1:09 PM'}
            </span>
          </div>

        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24"
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
        >
          <div className="w-full max-w-md mx-4 bg-[#1c1c1e]/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
              <Search className="w-4 h-4 text-white/40 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pages…"
                className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
              />
              <button onClick={() => setSearchOpen(false)}>
                <X className="w-4 h-4 text-white/30 hover:text-white transition-colors" />
              </button>
            </div>

            {/* Results */}
            <div className="py-2 max-h-72 overflow-y-auto">
              {filteredSearch.length === 0 ? (
                <p className="text-center text-white/30 text-xs py-6">No results found.</p>
              ) : (
                filteredSearch.map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => { navigate(item.tab); setSearchOpen(false); setSearchQuery(''); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30 shrink-0" />
                    {item.label}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
