import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { AlertOctagon, TrendingUp, Users, ShieldAlert, Zap, RefreshCw, BarChart2, Shield } from 'lucide-react';

export default function StressTester({ showToast }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Stress sliders state
  const [ageShock, setAgeShock] = useState(0); // years to add
  const [weightShockPercent, setWeightShockPercent] = useState(0); // % weight to add
  const [smokerShock, setSmokerShock] = useState(false); // force all to smoke

  const fetchPatients = async () => {
    try {
      const res = await axios.get(`${API_BASE}/view`);
      const arr = Object.entries(res.data).map(([id, val]) => ({
        id,
        ...val
      }));
      setPatients(arr);
    } catch (err) {
      console.error(err);
      showToast('Failed to load patient profiles for stress test.', 'error');
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const runStressTest = async () => {
    if (patients.length === 0) {
      showToast('No patients found in register to run stress testing.', 'error');
      return;
    }

    setLoading(true);
    try {
      // 1. Prepare Base items for prediction
      const baseItems = patients.map((p) => ({
        age: parseInt(p.age),
        weight: parseFloat(p.weight),
        height: parseFloat(p.height),
        income_lpa: parseFloat(p.income_lpa !== undefined ? p.income_lpa : 5.5),
        smoker: Boolean(p.smoker !== undefined ? p.smoker : false),
        city: p.city || 'Delhi',
        occupation: p.occupation || 'private_job',
      }));

      // 2. Prepare Shocked items for prediction
      const shockedItems = patients.map((p) => {
        const baseWeight = parseFloat(p.weight);
        const addedWeight = baseWeight * (weightShockPercent / 100);
        return {
          age: parseInt(p.age) + parseInt(ageShock),
          weight: baseWeight + addedWeight,
          height: parseFloat(p.height),
          income_lpa: parseFloat(p.income_lpa !== undefined ? p.income_lpa : 5.5),
          smoker: smokerShock ? true : Boolean(p.smoker !== undefined ? p.smoker : false),
          city: p.city || 'Delhi',
          occupation: p.occupation || 'private_job',
        };
      });

      // 3. Batch predict both sets
      const [baseRes, shockedRes] = await Promise.all([
        axios.post(`${API_BASE}/batch/predict`, baseItems),
        axios.post(`${API_BASE}/batch/predict`, shockedItems)
      ]);

      const basePreds = baseRes.data.predictions;
      const shockedPreds = shockedRes.data.predictions;

      // 4. Summarize distributions
      const analyzeDistribution = (preds) => {
        const counts = { '0': 0, '1': 0, '2': 0, '3': 0 };
        preds.forEach((p) => {
          const val = String(p).toLowerCase();
          if (val === '0' || val.includes('low')) counts['0']++;
          else if (val === '1' || val.includes('medium')) counts['1']++;
          else if (val === '2' || val.includes('elevated') || val.includes('high')) counts['2']++;
          else counts['3']++;
        });
        return counts;
      };

      const baseCounts = analyzeDistribution(basePreds);
      const shockedCounts = analyzeDistribution(shockedPreds);

      // 5. Calculate Simulated Financial Default Risk
      // Loan Defaults association factor per category:
      // Cat 0 (Low) = 1.2% Default
      // Cat 1 (Medium) = 3.5% Default
      // Cat 2 (Elevated) = 7.8% Default
      // Cat 3 (High) = 14.5% Default
      // Sum (Applicant Default Risk Index)
      const calculateDefaultRisk = (counts) => {
        const total = patients.length;
        const weightedScore = (
          (counts['0'] * 1.2) + 
          (counts['1'] * 3.5) + 
          (counts['2'] * 7.8) + 
          (counts['3'] * 14.5)
        ) / total;
        return Math.round(weightedScore * 100) / 100;
      };

      const baseRisk = calculateDefaultRisk(baseCounts);
      const shockedRisk = calculateDefaultRisk(shockedCounts);
      const riskDelta = Math.round((shockedRisk - baseRisk) * 100) / 100;

      setResults({
        baseCounts,
        shockedCounts,
        baseRisk,
        shockedRisk,
        riskDelta,
        totalEvaluated: patients.length
      });
      showToast('Portfolio stress test complete!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Stress test batch calculations failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getBmiShocksDesc = () => {
    if (weightShockPercent === 0) return 'Base Weight';
    return `+${weightShockPercent}% Weight Shock`;
  };

  const getAgeShocksDesc = () => {
    if (ageShock === 0) return 'Base Demographics';
    return `+${ageShock} Years Aging Trend`;
  };

  return (
    <div className="w-full relative z-10 select-none animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Actuarial Stress Tester</h2>
          <p className="text-xs text-white/50">Run macroeconomic risk scenario simulations on the active lending database</p>
        </div>

        <button
          onClick={fetchPatients}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-white rounded-lg border border-white/10 bg-white/5 hover:bg-white/10"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Registry ({patients.length})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Parameter Adjustment Card */}
        <div className="lg:col-span-5 liquid-glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest pb-2 border-b border-white/5 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-brand" /> Scenario Shocks
          </h3>

          {/* Age Shock Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/50 font-medium">Aging Shock</span>
              <span className="text-white font-extrabold">{getAgeShocksDesc()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={ageShock}
              onChange={(e) => setAgeShock(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          {/* Weight Shock Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/50 font-medium">Obesity Shock</span>
              <span className="text-white font-extrabold">{getBmiShocksDesc()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={weightShockPercent}
              onChange={(e) => setWeightShockPercent(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          {/* Smoker Shock Toggle */}
          <div 
            onClick={() => setSmokerShock(!smokerShock)}
            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
              smokerShock 
                ? 'border-rose-500/30 bg-rose-500/5' 
                : 'border-white/5 bg-white/[0.01]'
            }`}
          >
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-white">Tobacco Epidemic Shock</span>
              <span className="text-[9px] text-white/45">Forces all profiles to smoker classification</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${smokerShock ? 'bg-rose-500' : 'bg-white/10'}`}>
              <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${smokerShock ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </div>

          <button
            onClick={runStressTest}
            disabled={loading || patients.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white text-black font-semibold text-xs py-3 hover:bg-white/90 active:scale-95 disabled:opacity-50 transition-all"
          >
            <span>{loading ? 'Simulating Batch Shocks...' : 'Run Portfolio Stress Test'}</span>
          </button>
        </div>

        {/* Right Output Comparison Card */}
        <div className="lg:col-span-7 space-y-6">
          {results ? (
            <div className="space-y-6 animate-slide-up">
              
              {/* Alert Callouts */}
              <div className={`liquid-glass p-5 rounded-2xl border ${results.riskDelta > 3 ? 'border-rose-500/20 bg-rose-500/5 text-rose-400' : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-450'} flex gap-3.5 items-start`}>
                <AlertOctagon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">Portfolio Vulnerability Assessment</h4>
                  <p className="text-[11px] text-white/60 mt-1 leading-relaxed">
                    Under current scenario shocks, the average client default probability index changed from **{results.baseRisk}%** to **{results.shockedRisk}%** (Delta: **{results.riskDelta > 0 ? `+${results.riskDelta}` : results.riskDelta}%**).
                    {results.riskDelta > 3 ? ' Action recommended: Increase reserve loan provisioning rates to hedge increased default risks.' : ' Credit buffers remain acceptable under baseline scenarios.'}
                  </p>
                </div>
              </div>

              {/* Side-by-side counts table */}
              <div className="liquid-glass rounded-2xl border border-white/10 overflow-hidden">
                <div className="h-9 bg-white/[0.02] border-b border-white/5 flex items-center px-4 justify-between">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-white/40 flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5" /> Category Shift Distributions
                  </span>
                  <span className="text-[9px] text-white/45 uppercase font-mono">N={patients.length} Stored Profiles</span>
                </div>
                
                <div className="p-4 space-y-3.5">
                  {[
                    { label: 'Category 0 (Low)', key: '0', color: 'bg-emerald-500' },
                    { label: 'Category 1 (Medium)', key: '1', color: 'bg-blue-500' },
                    { label: 'Category 2 (Elevated)', key: '2', color: 'bg-amber-500' },
                    { label: 'Category 3+ (High)', key: '3', color: 'bg-rose-500' },
                  ].map((row) => {
                    const baseCount = results.baseCounts[row.key] || 0;
                    const shockedCount = results.shockedCounts[row.key] || 0;
                    const diff = shockedCount - baseCount;

                    return (
                      <div key={row.key} className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="font-semibold text-white/70">{row.label}</span>
                          <span className="font-bold text-white">
                            {baseCount} → {shockedCount}
                            {diff !== 0 && (
                              <span className={`ml-2 text-[10px] font-extrabold ${diff > 0 ? 'text-rose-455' : 'text-emerald-450'}`}>
                                ({diff > 0 ? `+${diff}` : diff})
                              </span>
                            )}
                          </span>
                        </div>
                        {/* Dynamic Segment Progress Comparison bar */}
                        <div className="h-1.5 w-full bg-white/5 rounded-full flex overflow-hidden">
                          <div 
                            className={`h-full ${row.color} opacity-40 transition-all`} 
                            style={{ width: `${(baseCount / patients.length) * 100}%` }}
                          />
                          <div 
                            className={`h-full ${row.color} transition-all border-l border-white/20`} 
                            style={{ width: `${(shockedCount / patients.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            <div className="liquid-glass p-12 rounded-3xl border border-white/10 text-center text-white/20 select-none min-h-[300px] flex flex-col items-center justify-center">
              <Users className="w-10 h-10 mb-2 opacity-50 text-white/30" />
              <h4 className="text-sm font-bold text-white/80">Pending Simulation</h4>
              <p className="text-xs text-white/40 max-w-[240px] mx-auto mt-2">
                Configure scenario shocks on the left and click Simulate to measure default volatility changes.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
