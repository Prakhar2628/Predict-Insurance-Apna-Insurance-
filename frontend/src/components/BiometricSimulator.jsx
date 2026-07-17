import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, HeartPulse, Flame, IndianRupee, TrendingUp, Info } from 'lucide-react';

// ─── Mini Bar Chart for risk factors ──────────────────────────────
function RiskBar({ label, value, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-white/50">{label}</span>
        <span className="text-white font-bold">{value}/{max}</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── BMI Gauge ────────────────────────────────────────────────────
function BmiGauge({ bmi }) {
  // BMI scale 10–40, mark at 18.5 (normal), 25 (overweight), 30 (obese)
  const clampedBmi = Math.max(10, Math.min(40, bmi));
  const pct = ((clampedBmi - 10) / 30) * 100;
  const color =
    bmi < 18.5 ? 'bg-sky-400' :
    bmi < 25   ? 'bg-emerald-400' :
    bmi < 30   ? 'bg-amber-400' :
                 'bg-rose-500';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px]">
        <span className="text-white/40">Underweight</span>
        <span className="text-white/40">Normal</span>
        <span className="text-white/40">Obese</span>
      </div>
      <div className="relative h-2 w-full bg-gradient-to-r from-sky-500/30 via-emerald-500/30 to-rose-500/30 rounded-full overflow-hidden">
        {/* Needle */}
        <div
          className="absolute top-0 h-full w-1 rounded-full bg-white shadow"
          style={{ left: `calc(${pct}% - 2px)`, transition: 'left 0.4s' }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-white/25">
        <span>10</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
      </div>
    </div>
  );
}

export default function BiometricSimulator({ showToast }) {
  const [inputs, setInputs] = useState({
    age: 35,
    weight: 70,
    height: 170,
    income_lpa: 6.5,
    smoker: false,
    city: 'Delhi',
    occupation: 'private_job',
  });

  const [bmi, setBmi] = useState(24.22);
  const [bmiCategory, setBmiCategory] = useState('Normal weight');
  const [prediction, setPrediction] = useState('0');
  const [loading, setLoading] = useState(false);

  const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Jaipur', 'Lucknow', 'Other'];
  const occupations = ['private_job', 'government_job', 'business_owner', 'freelancer', 'student', 'retired', 'unemployed'];

  // BMI calculation
  useEffect(() => {
    const h = inputs.height / 100;
    const bmiVal = inputs.weight / (h * h);
    const rBmi = Math.round(bmiVal * 100) / 100;
    setBmi(rBmi);
    if (rBmi < 18.5)      setBmiCategory('Underweight');
    else if (rBmi < 24.9) setBmiCategory('Normal weight');
    else if (rBmi < 29.9) setBmiCategory('Overweight');
    else                   setBmiCategory('Obese');
  }, [inputs.weight, inputs.height]);

  // Debounced real-time prediction
  useEffect(() => {
    const t = setTimeout(() => runRealTimePrediction(), 400);
    return () => clearTimeout(t);
  }, [inputs, bmi]);

  const runRealTimePrediction = async () => {
    setLoading(true);
    try {
      const payload = {
        age: parseInt(inputs.age),
        weight: parseFloat(inputs.weight),
        height: parseFloat(inputs.height) / 100,
        income_lpa: parseFloat(inputs.income_lpa),
        smoker: inputs.smoker,
        city: inputs.city,
        occupation: inputs.occupation,
      };
      const res = await axios.post('http://127.0.0.1:8000/predict', payload, { timeout: 4000 });
      setPrediction(String(res.data.predicted_category));
    } catch {
      // Local fallback
      let score = 0;
      if (inputs.smoker) score += 2;
      if (bmi > 30) score += 2; else if (bmi > 27) score += 1;
      if (inputs.age > 60) score += 2; else if (inputs.age > 45) score += 1;
      if (inputs.income_lpa < 3) score += 1;
      if (score === 0) setPrediction('0');
      else if (score <= 2) setPrediction('1');
      else if (score <= 4) setPrediction('2');
      else setPrediction('3');
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setInputs((p) => ({ ...p, [name]: parseFloat(value) }));
  };
  const handleToggleSmoker = () => setInputs((p) => ({ ...p, smoker: !p.smoker }));
  const handleSelectChange = (e) => setInputs((p) => ({ ...p, [e.target.name]: e.target.value }));

  // ── Verdict config ────────────────────────────────────────────────
  const tiers = {
    '0': {
      label: 'Low Risk', emoji: '✅', numLabel: 'Tier 1',
      color: 'from-emerald-400 to-teal-400', textColor: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      markup: '+0.00%', markupLabel: 'Preferred Rate',
      approval: 'Approved (95%)', approvalColor: 'text-emerald-400',
      emi: '₹6,800/mo', apr: '7.00% APR',
      why: [
        { factor: 'BMI', ok: bmi >= 18.5 && bmi < 25, msg: bmi >= 18.5 && bmi < 25 ? 'Healthy BMI range' : 'BMI outside ideal range' },
        { factor: 'Smoking', ok: !inputs.smoker, msg: !inputs.smoker ? 'Non-smoker ✓' : 'Active smoker ✗' },
        { factor: 'Age', ok: inputs.age < 45, msg: inputs.age < 45 ? 'Young adult ✓' : 'Age factor applies' },
        { factor: 'Income', ok: inputs.income_lpa >= 5, msg: inputs.income_lpa >= 5 ? 'Good income base ✓' : 'Low income flag' },
      ],
      plans: [
        { name: 'Aura Swasthya Rakshak', cover: '₹10 Lakh', premium: '₹450/mo' },
        { name: 'Aura Jeevan Suraksha', cover: '₹25 Lakh', premium: '₹850/mo' },
        { name: 'Aura Kavach Gold', cover: '₹1 Crore', premium: '₹1,800/mo' },
      ],
    },
    '1': {
      label: 'Moderate Risk', emoji: '⚠️', numLabel: 'Tier 2',
      color: 'from-blue-400 to-indigo-400', textColor: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      markup: '+1.50%', markupLabel: 'Standard Risk',
      approval: 'Approved (85%)', approvalColor: 'text-blue-400',
      emi: '₹7,200/mo', apr: '8.50% APR',
      why: [
        { factor: 'BMI', ok: bmi < 27, msg: bmi < 27 ? 'Slightly elevated BMI' : 'High BMI adds risk' },
        { factor: 'Smoking', ok: !inputs.smoker, msg: !inputs.smoker ? 'Non-smoker ✓' : 'Smoker flag active ✗' },
        { factor: 'Age', ok: inputs.age < 50, msg: inputs.age < 50 ? 'Adult age bracket' : 'Middle-aged bracket' },
        { factor: 'Income', ok: inputs.income_lpa >= 3, msg: inputs.income_lpa >= 3 ? 'Moderate income ✓' : 'Income below average' },
      ],
      plans: [
        { name: 'Aura Swasthya Rakshak', cover: '₹10 Lakh', premium: '₹620/mo' },
        { name: 'Aura Jeevan Suraksha', cover: '₹25 Lakh', premium: '₹1,120/mo' },
        { name: 'Kavach Super Shield', cover: '₹1 Crore', premium: '₹2,350/mo' },
      ],
    },
    '2': {
      label: 'High Risk', emoji: '🔴', numLabel: 'Tier 3',
      color: 'from-amber-400 to-orange-500', textColor: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      markup: '+3.00%', markupLabel: 'Elevated Risk (+25% Loading)',
      approval: 'Conditional Approval', approvalColor: 'text-amber-400',
      emi: '₹7,600/mo', apr: '10.00% APR',
      why: [
        { factor: 'BMI', ok: false, msg: 'Overweight/Obese classification' },
        { factor: 'Smoking', ok: false, msg: inputs.smoker ? 'Active smoker increases risk ✗' : 'BMI the primary driver ✗' },
        { factor: 'Age', ok: inputs.age < 55, msg: inputs.age < 55 ? 'Age manageable' : 'Senior age adds risk' },
        { factor: 'Income', ok: inputs.income_lpa >= 5, msg: inputs.income_lpa >= 5 ? 'Income adequate ✓' : 'Income below average ✗' },
      ],
      plans: [
        { name: 'Aura Swasthya Rakshak', cover: '₹10 Lakh', premium: '₹850/mo (+25%)' },
        { name: 'Aura Jeevan Suraksha', cover: '₹25 Lakh', premium: '₹1,490/mo (+25%)' },
        { name: 'Kavach Super Shield', cover: '₹1 Crore', premium: '₹3,100/mo (+25%)' },
      ],
    },
    '3': {
      label: 'Critical Risk', emoji: '🚨', numLabel: 'Tier 4',
      color: 'from-rose-500 to-red-600', textColor: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
      markup: '+4.50%', markupLabel: 'Subprime Risk (+50% Loading)',
      approval: 'Declined / Co-signer Required', approvalColor: 'text-rose-400',
      emi: '₹8,200/mo', apr: '11.50% APR',
      why: [
        { factor: 'BMI', ok: false, msg: 'Severe obesity classification ✗' },
        { factor: 'Smoking', ok: false, msg: 'Active smoker — major risk factor ✗' },
        { factor: 'Age', ok: false, msg: 'Senior age group — high claims likelihood ✗' },
        { factor: 'Income', ok: false, msg: 'Multiple compounding risk factors ✗' },
      ],
      plans: [
        { name: 'Aura Swasthya Rakshak', cover: '₹10 Lakh', premium: '₹1,150/mo (+50%)' },
        { name: 'Aura Jeevan Suraksha', cover: '₹25 Lakh', premium: '₹2,100/mo (+50%)' },
        { name: 'Kavach Super Shield', cover: '₹1 Crore', premium: '₹4,400/mo (+50%)' },
      ],
    },
  };

  const tier = tiers[prediction] || tiers['0'];

  // Risk score for bar chart (0–10)
  const riskScore = (() => {
    let s = 0;
    if (inputs.smoker) s += 3;
    if (bmi > 30) s += 3; else if (bmi > 27) s += 1.5; else if (bmi > 25) s += 0.5;
    if (inputs.age > 60) s += 2; else if (inputs.age > 45) s += 1;
    if (inputs.income_lpa < 3) s += 1;
    return Math.min(10, Math.round(s * 10) / 10);
  })();

  const bmiScore = Math.min(10, Math.round(Math.max(0, (bmi - 10) / 3) * 10) / 10);
  const ageScore = Math.min(10, Math.round((inputs.age / 90) * 10 * 10) / 10);
  const smokerScore = inputs.smoker ? 10 : 0;

  return (
    <div className="w-full relative z-10 select-none animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">🎯 Live Risk Simulator</h2>
        <p className="text-xs text-white/50 mt-0.5">Move the sliders — see your insurance tier update in real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── Left: Sliders ─────────────────────────────────────────── */}
        <div className="lg:col-span-6 liquid-glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <h3 className="text-xs font-bold text-white/90 uppercase tracking-wider flex items-center gap-1.5 pb-3 border-b border-white/5">
            <Activity className="w-4 h-4 text-brand" /> Biometric Parameters
          </h3>

          {[
            { name: 'age', label: 'Age (Years)', min: 18, max: 90, step: 1, unit: 'yrs', ticks: ['18', '50', '90'] },
            { name: 'height', label: 'Height (cm)', min: 130, max: 220, step: 1, unit: 'cm', ticks: ['130', '175', '220'] },
            { name: 'weight', label: 'Weight (kg)', min: 30, max: 150, step: 1, unit: 'kg', ticks: ['30', '90', '150'] },
            { name: 'income_lpa', label: 'Annual Income (LPA ₹)', min: 1, max: 35, step: 0.5, unit: 'LPA', ticks: ['₹1L', '₹18L', '₹35L'] },
          ].map(({ name, label, min, max, step, unit, ticks }) => (
            <div key={name} className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/50 font-medium">{label}</span>
                <span className="text-white font-extrabold">{inputs[name]} {unit}</span>
              </div>
              <input type="range" name={name} min={min} max={max} step={step}
                value={inputs[name]} onChange={handleSliderChange}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
              />
              <div className="flex justify-between text-[9px] text-white/25 font-semibold">
                {ticks.map(t => <span key={t}>{t}</span>)}
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/45 uppercase">City</label>
              <select name="city" value={inputs.city} onChange={handleSelectChange}
                className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl py-2 px-3 text-xs text-white">
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/45 uppercase">Occupation</label>
              <select name="occupation" value={inputs.occupation} onChange={handleSelectChange}
                className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl py-2 px-3 text-xs text-white">
                {occupations.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>

          {/* Smoker Toggle */}
          <div onClick={handleToggleSmoker}
            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
              inputs.smoker ? 'border-rose-500/30 bg-rose-500/5' : 'border-white/5 bg-white/[0.01]'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg border ${inputs.smoker ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse' : 'bg-white/5 border-white/10 text-white/40'}`}>
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Active Smoker</span>
                <span className="text-[9px] text-white/40">+2–3 risk points — significantly shifts your tier</span>
              </div>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${inputs.smoker ? 'bg-rose-500' : 'bg-white/10'}`}>
              <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${inputs.smoker ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </div>

          {/* BMI Gauge */}
          <div className="pt-3 border-t border-white/5 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-white/50 font-medium flex items-center gap-1"><HeartPulse className="w-3 h-3" /> Live BMI</span>
              <span className="font-extrabold text-white">{bmi} — <span className={
                bmiCategory === 'Normal weight' ? 'text-emerald-400' :
                bmiCategory === 'Overweight' ? 'text-amber-400' : 'text-rose-400'
              }>{bmiCategory}</span></span>
            </div>
            <BmiGauge bmi={bmi} />
          </div>
        </div>

        {/* ── Right: Verdict + Explainability ────────────────────────── */}
        <div className="lg:col-span-6 space-y-4">

          {/* Tier Verdict Card */}
          <div className="liquid-glass p-6 rounded-3xl border border-white/10 text-center relative overflow-hidden shadow-2xl">
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-gradient-to-br ${tier.color} filter blur-[80px] opacity-20 pointer-events-none`} />

            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
              {loading ? 'Calculating…' : 'Simulation Verdict'}
            </span>

            <div className="mt-4 mb-3 flex flex-col items-center">
              <div className={`h-20 w-20 rounded-full border-2 bg-black/60 flex items-center justify-center shadow-inner relative z-10 border-current ${tier.textColor}`}>
                <span className={`text-2xl font-black bg-gradient-to-br ${tier.color} bg-clip-text text-transparent`}>
                  {tier.numLabel}
                </span>
              </div>
              <span className={`mt-3 text-lg font-extrabold ${tier.textColor}`}>{tier.emoji} {tier.label}</span>
            </div>

            {/* Actuarial strip */}
            <div className="mt-3 pt-3 border-t border-white/5 text-left space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-white/50">Lending Interest Markup:</span>
                <span className={`font-bold ${tier.textColor}`}>{tier.markup} ({tier.markupLabel})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Estimated Loan Approval:</span>
                <span className={`font-bold ${tier.approvalColor}`}>{tier.approval}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-white/5">
                <span className="text-white/50">Financed EMI (5-yr plan):</span>
                <span className="font-bold text-white font-mono">{tier.emi} @ {tier.apr}</span>
              </div>
            </div>
          </div>

          {/* ── Risk Factor Chart ──────────────────────────────────── */}
          <div className="liquid-glass p-5 rounded-3xl border border-white/10">
            <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Risk Factor Breakdown
            </h4>
            <div className="space-y-3">
              <RiskBar label="Overall Risk Score" value={riskScore} max={10} color={
                riskScore < 3 ? 'bg-emerald-400' : riskScore < 6 ? 'bg-amber-400' : 'bg-rose-500'
              } />
              <RiskBar label="BMI Index" value={bmiScore} max={10} color={
                bmiScore < 5 ? 'bg-emerald-400' : bmiScore < 7 ? 'bg-amber-400' : 'bg-rose-500'
              } />
              <RiskBar label="Age Factor" value={ageScore} max={10} color="bg-blue-400" />
              <RiskBar label="Smoker Penalty" value={smokerScore} max={10} color="bg-rose-500" />
            </div>
          </div>

          {/* ── Explainability ─────────────────────────────────────── */}
          <div className="liquid-glass p-5 rounded-3xl border border-white/10">
            <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Why {tier.label}?
            </h4>
            <div className="space-y-2">
              {tier.why.map(({ factor, ok, msg }) => (
                <div key={factor} className={`flex items-center gap-2.5 p-2.5 rounded-xl text-[11px] border ${
                  ok ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-rose-500/5 border-rose-500/15'
                }`}>
                  <span className={`text-xs ${ok ? 'text-emerald-400' : 'text-rose-400'}`}>{ok ? '✓' : '✗'}</span>
                  <span className="text-white/40 font-bold uppercase text-[9px] w-12 shrink-0">{factor}</span>
                  <span className={ok ? 'text-white/70' : 'text-white/60'}>{msg}</span>
                </div>
              ))}
            </div>
            <div className={`mt-3 p-3 rounded-xl text-[10px] leading-relaxed border ${tier.bg} ${tier.textColor}`}>
              <strong>How to improve:</strong>{' '}
              {prediction === '0' && 'Maintain your current lifestyle. Annual checkups recommended.'}
              {prediction === '1' && 'Reducing BMI to under 25 and quitting smoking can move you to Tier 1 (Low Risk).'}
              {prediction === '2' && 'Reducing weight (BMI below 27) and quitting smoking are the two highest-impact steps to lower your premium.'}
              {prediction === '3' && 'Significant lifestyle changes needed: weight management, quit smoking, and regular health checkups to shift tier over 6–12 months.'}
            </div>
          </div>

          {/* ── Indian Plans ───────────────────────────────────────── */}
          <div className="liquid-glass p-5 rounded-3xl border border-white/10">
            <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5" /> Recommended Plans for You
            </h4>
            <div className="space-y-2">
              {tier.plans.map((plan) => (
                <div key={plan.name} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs">
                  <div>
                    <span className="text-white font-semibold block">{plan.name}</span>
                    <span className="text-white/40 text-[10px]">Coverage: {plan.cover}</span>
                  </div>
                  <span className={`font-extrabold ${tier.textColor}`}>{plan.premium}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
