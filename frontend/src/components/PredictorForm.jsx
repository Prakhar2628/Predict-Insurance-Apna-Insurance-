import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, MapPin, Briefcase, Activity, Play, Sparkles, IndianRupee, Wifi, WifiOff } from 'lucide-react';

export default function PredictorForm({ onResult, showToast }) {
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '', // Height in cm (converted to meters on payload)
    income_lpa: '',
    city: 'Delhi',
    occupation: 'private_job',
    smoker: false,
  });

  const [bmi, setBmi] = useState(null);
  const [bmiCategory, setBmiCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [backendOnline, setBackendOnline] = useState(null); // null = unknown, true/false
  const [offlineMode, setOfflineMode] = useState(false);
  const [customCity, setCustomCity] = useState('');


  // Check backend availability on mount
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/health', { timeout: 2000 })
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  const occupations = [
    { value: 'private_job', label: 'Private Sector Job' },
    { value: 'government_job', label: 'Government Sector Job' },
    { value: 'business_owner', label: 'Business Owner' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'student', label: 'Student' },
    { value: 'retired', label: 'Retired' },
    { value: 'unemployed', label: 'Unemployed' },
  ];

  const cities = [
    'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune',
    'Jaipur', 'Chandigarh', 'Indore', 'Lucknow', 'Patna', 'Ranchi', 'Noida', 'Dehradun',
    'Other'
  ];

  // Calculate BMI on height/weight changes
  useEffect(() => {
    const w = parseFloat(formData.weight);
    const h = parseFloat(formData.height);

    if (w > 0 && h > 0) {
      const heightInMeters = h / 100;
      const bmiValue = w / (heightInMeters * heightInMeters);
      const roundedBmi = Math.round(bmiValue * 100) / 100;
      setBmi(roundedBmi);

      if (roundedBmi < 18.5) {
        setBmiCategory('Underweight');
      } else if (roundedBmi >= 18.5 && roundedBmi < 24.9) {
        setBmiCategory('Normal weight');
      } else if (roundedBmi >= 25 && roundedBmi < 29.9) {
        setBmiCategory('Overweight');
      } else {
        setBmiCategory('Obesity');
      }
    } else {
      setBmi(null);
      setBmiCategory('');
    }
  }, [formData.weight, formData.height]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear field-specific error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const age = parseInt(formData.age);
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    const income = parseFloat(formData.income_lpa);

    if (!formData.age || isNaN(age) || age <= 0 || age > 120) {
      newErrors.age = 'Age must be a valid number between 1 and 120';
    }
    if (!formData.weight || isNaN(weight) || weight <= 10 || weight > 300) {
      newErrors.weight = 'Weight must be a valid value between 10 kg and 300 kg';
    }
    if (!formData.height || isNaN(height) || height <= 50 || height > 250) {
      newErrors.height = 'Height must be a valid value between 50 cm and 250 cm';
    }
    if (!formData.income_lpa || isNaN(income) || income < 0 || income > 100) {
      newErrors.income_lpa = 'Income (LPA) must be between 0 and 100';
    }
    if (!formData.city) {
      newErrors.city = 'City selection is required';
    }
    if (!formData.occupation) {
      newErrors.occupation = 'Occupation selection is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Local offline prediction — estimates tier based on health factors
  const computeLocalPrediction = () => {
    const age = parseInt(formData.age);
    const income = parseFloat(formData.income_lpa);
    const bmiVal = bmi || 22;
    let score = 0;
    if (formData.smoker) score += 2;
    if (bmiVal > 30) score += 2;
    else if (bmiVal > 27) score += 1;
    if (age > 60) score += 2;
    else if (age > 45) score += 1;
    if (income < 3) score += 1;
    if (score === 0) return '0';
    if (score <= 2) return '1';
    if (score <= 4) return '2';
    return '3';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please correct the highlighted fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height) / 100,
        income_lpa: parseFloat(formData.income_lpa),
        smoker: formData.smoker,
        city: formData.city === 'Other' ? (customCity.trim() || 'Other') : formData.city,
        occupation: formData.occupation,
      };

      const response = await axios.post('http://127.0.0.1:8000/predict', payload, { timeout: 5000 });
      setBackendOnline(true);
      setOfflineMode(false);
      const predictionResponse = {
        input: { ...formData, bmi: bmi || 0, bmiCategory },
        result: response.data.predicted_category,
        plans: response.data.recommended_plans,
        timestamp: new Date().toLocaleString(),
      };
      onResult(predictionResponse);
      showToast('Premium prediction calculated! ✓', 'success');
    } catch (err) {
      console.error(err);
      setBackendOnline(false);
      // Offline fallback — local estimation
      const localResult = computeLocalPrediction();
      setOfflineMode(true);
      const predictionResponse = {
        input: { ...formData, bmi: bmi || 0, bmiCategory },
        result: localResult,
        offline: true,
        timestamp: new Date().toLocaleString(),
      };
      onResult(predictionResponse);
      showToast('Backend offline — showing local estimate.', 'success');
      setErrors((prev) => ({ ...prev, api: null }));
    } finally {
      setLoading(false);
    }
  };

  const getBmiBadgeStyle = () => {
    switch (bmiCategory) {
      case 'Normal weight':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Overweight':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Obesity':
        return 'text-rose-450 bg-rose-500/10 border-rose-500/20';
      case 'Underweight':
        return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      default:
        return 'text-slate-400 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="w-full liquid-glass p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
              Insurance Premium Check <Sparkles className="w-3.5 h-3.5 text-brand" />
            </h2>
            <p className="text-xs text-white/50">Enter your details to find the right Indian health plan</p>
          </div>
        </div>
        {/* Backend status badge */}
        <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
          backendOnline === true
            ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
            : backendOnline === false
            ? 'text-amber-400 border-amber-500/20 bg-amber-500/10'
            : 'text-white/30 border-white/10 bg-white/5'
        }`}>
          {backendOnline === true ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span>{backendOnline === true ? 'Live' : backendOnline === false ? 'Offline (Local)' : '…'}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Age Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/50 tracking-wider uppercase flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Age (Years)
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="e.g. 35"
              className={`w-full rounded-xl border py-3 px-4 text-sm bg-white/5 border-white/10 text-white placeholder-white/20 focus:ring-1 focus:ring-brand focus:border-brand focus:outline-none transition-all ${
                errors.age ? 'border-rose-505/50 focus:ring-rose-500/50' : ''
              }`}
            />
            {errors.age && <p className="text-xs text-rose-450 font-medium mt-0.5">{errors.age}</p>}
          </div>

          {/* Income LPA */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/50 tracking-wider uppercase flex items-center gap-1.5">
              <IndianRupee className="h-3.5 w-3.5" /> Annual Income (LPA)
            </label>
            <input
              type="number"
              step="0.1"
              name="income_lpa"
              value={formData.income_lpa}
              onChange={handleChange}
              placeholder="e.g. 6.5"
              className={`w-full rounded-xl border py-3 px-4 text-sm bg-white/5 border-white/10 text-white placeholder-white/20 focus:ring-1 focus:ring-brand focus:border-brand focus:outline-none transition-all ${
                errors.income_lpa ? 'border-rose-505/50 focus:ring-rose-500/50' : ''
              }`}
            />
            {errors.income_lpa && <p className="text-xs text-rose-450 font-medium mt-0.5">{errors.income_lpa}</p>}
          </div>

          {/* Height Input (cm) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/50 tracking-wider uppercase">
              Height (cm)
            </label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="e.g. 175"
              className={`w-full rounded-xl border py-3 px-4 text-sm bg-white/5 border-white/10 text-white placeholder-white/20 focus:ring-1 focus:ring-brand focus:border-brand focus:outline-none transition-all ${
                errors.height ? 'border-rose-505/50 focus:ring-rose-500/50' : ''
              }`}
            />
            {errors.height && <p className="text-xs text-rose-450 font-medium mt-0.5">{errors.height}</p>}
          </div>

          {/* Weight Input (kg) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/50 tracking-wider uppercase">
              Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="e.g. 70"
              className={`w-full rounded-xl border py-3 px-4 text-sm bg-white/5 border-white/10 text-white placeholder-white/20 focus:ring-1 focus:ring-brand focus:border-brand focus:outline-none transition-all ${
                errors.weight ? 'border-rose-505/50 focus:ring-rose-500/50' : ''
              }`}
            />
            {errors.weight && <p className="text-xs text-rose-450 font-medium mt-0.5">{errors.weight}</p>}
          </div>

          {/* City Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/50 tracking-wider uppercase flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> City Select
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/60 text-white py-3 px-4 text-sm focus:ring-1 focus:ring-brand focus:border-brand focus:outline-none transition-all"
            >
              {cities.map((city) => (
                <option key={city} value={city} className="bg-[#0c0c0c] text-white">
                  {city}
                </option>
              ))}
            </select>
          </div>

          {formData.city === 'Other' && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-[11px] font-bold text-white/50 tracking-wider uppercase">
                Custom City Name
              </label>
              <input
                type="text"
                placeholder="e.g. Dehradun or Salem"
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 text-white py-3 px-4 text-sm focus:ring-1 focus:ring-brand focus:border-brand focus:outline-none transition-all"
              />
            </div>
          )}

          {/* Occupation Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-white/50 tracking-wider uppercase flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> Occupation
            </label>
            <select
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              className="w-full rounded-xl border border-white/10 bg-black/60 text-white py-3 px-4 text-sm focus:ring-1 focus:ring-brand focus:border-brand focus:outline-none transition-all"
            >
              {occupations.map((occ) => (
                <option key={occ.value} value={occ.value} className="bg-[#0c0c0c] text-white">
                  {occ.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Real-time BMI display */}
        {bmi && (
          <div className={`p-4 rounded-xl border text-xs flex justify-between items-center transition-colors ${getBmiBadgeStyle()}`}>
            <span className="font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4" /> Live BMI Index: <strong>{bmi}</strong>
            </span>
            <span className="font-extrabold uppercase hover:underline">
              {bmiCategory}
            </span>
          </div>
        )}

        {/* Smoker Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white/90">Smoking History</span>
            <span className="text-[11px] text-white/40">Active/passive tobacco use standard status</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="smoker"
              checked={formData.smoker}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 rounded-full peer peer-focus:ring-1 peer-focus:ring-brand/50 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
          </label>
        </div>

        {/* Offline mode notice */}
        {offlineMode && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold leading-relaxed rounded-xl flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>Backend offline — showing a local estimate. Start uvicorn for ML-accurate results.</span>
          </div>
        )}
        {errors.api && !offlineMode && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-455 text-xs font-semibold leading-relaxed rounded-xl">
            {errors.api}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-white/90 active:scale-[0.99] text-black font-bold text-sm py-3.5 shadow-xl transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Running Solver Estimations...</span>
            </div>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Check My Insurance Category</span>
            </>
          )}
        </button>
      </form>

      {/* Interactive Feature Explainability Guide */}
      <FeatureExplainability />
    </div>
  );
}

function FeatureExplainability() {
  const [selectedFeature, setSelectedFeature] = useState('smoker');

  const features = [
    {
      id: 'smoker',
      name: 'Smoker Status',
      weight: 35,
      color: '#f43f5e',
      purpose: 'Underwriting Risk Hedge',
      why: 'Actuarial models use smoking status as a major risk multiplier. Tobacco consumption increases the probability of critical health events, directly inflating premium brackets by 25% to 50% and increasing banker default reserves.'
    },
    {
      id: 'bmi',
      name: 'BMI (Height & Weight)',
      weight: 25,
      color: '#fbbf24',
      purpose: 'Biometric Classification',
      why: 'Body Mass Index (BMI) determines physical fitness classification. Obese (BMI > 30) or underweight profiles face elevated health risks. BMI is dynamically computed to determine your overall physical risk group.'
    },
    {
      id: 'age',
      name: 'Age (Years)',
      weight: 20,
      color: '#3b82f6',
      purpose: 'Actuarial Lifespan Estimator',
      why: 'Age defines the timeline for loan repayment. Higher age categories present higher health risks, which require higher actuarial premiums or markup adjustments to offset the risk of mortality.'
    },
    {
      id: 'income',
      name: 'Income (LPA)',
      weight: 12,
      color: '#10b981',
      purpose: 'Lending Serviceability Index',
      why: 'Income in Lakhs Per Annum (LPA) is the primary driver of debt-to-income (DTI) ratio. Higher income indicates a larger buffer to service monthly EMIs, crucial for credit approvals.'
    },
    {
      id: 'occupation',
      name: 'Occupation',
      weight: 5,
      color: '#8b5cf6',
      purpose: 'Cash Flow Stability',
      why: 'Different job sectors represent varying degrees of income stability. Government employees offer stable repayment profiles, whereas student/unemployed profiles represent elevated credit default risks.'
    },
    {
      id: 'city',
      name: 'City Tier',
      weight: 3,
      color: '#6b7280',
      purpose: 'Demographic Loading Adjuster',
      why: 'Cities are classified into Tiers (1, 2, 3) representing local cost of living and healthcare infrastructure. Tier 1 cities have better healthcare availability, slightly hedging severe medical complications.'
    }
  ];

  const activeFeature = features.find(f => f.id === selectedFeature) || features[0];

  return (
    <div className="mt-8 pt-8 border-t border-white/10 text-left">
      <h4 className="text-xs font-bold text-white/90 uppercase tracking-wider mb-2">
        🔍 Interactive Feature Importance & Explainability
      </h4>
      <p className="text-[11px] text-white/50 mb-4 leading-relaxed">
        Click any feature bar in the graph to understand why it is collected and how it influences your risk calculation.
      </p>

      {/* SVG Bar Chart */}
      <div className="bg-black/40 p-4 rounded-xl border border-white/5 mb-4">
        <svg viewBox="0 0 400 160" className="w-full h-auto">
          {features.map((f, idx) => {
            const barHeight = 16;
            const gap = 8;
            const y = idx * (barHeight + gap) + 10;
            const barWidth = (f.weight / 35) * 200;
            const isSelected = selectedFeature === f.id;

            return (
              <g 
                key={f.id} 
                className="cursor-pointer select-none group"
                onClick={() => setSelectedFeature(f.id)}
              >
                {/* Feature Label */}
                <text 
                  x="5" 
                  y={y + 12} 
                  fill={isSelected ? "#fff" : "rgba(255,255,255,0.6)"} 
                  className="text-[9px] font-bold transition-colors group-hover:fill-white"
                >
                  {f.name}
                </text>

                {/* Background Track */}
                <rect 
                  x="120" 
                  y={y} 
                  width="200" 
                  height={barHeight} 
                  rx="4" 
                  fill="rgba(255,255,255,0.03)" 
                />

                {/* Filled Bar */}
                <rect 
                  x="120" 
                  y={y} 
                  width={barWidth} 
                  height={barHeight} 
                  rx="4" 
                  fill={f.color} 
                  className="transition-all duration-300 opacity-80 group-hover:opacity-100"
                  style={{
                    filter: isSelected ? `drop-shadow(0 0 4px ${f.color})` : 'none'
                  }}
                />

                {/* Weight Percentage text */}
                <text 
                  x="330" 
                  y={y + 12} 
                  fill={isSelected ? f.color : "rgba(255,255,255,0.4)"} 
                  className="text-[9px] font-mono font-extrabold transition-colors group-hover:fill-white"
                >
                  {f.weight}% Influence
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Explanation Box */}
      <div 
        className="p-4 rounded-xl border transition-all duration-300"
        style={{
          borderColor: `${activeFeature.color}33`,
          backgroundColor: `${activeFeature.color}0a`
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase font-bold" style={{ color: activeFeature.color }}>
            {activeFeature.purpose}
          </span>
          <span className="text-[9px] font-extrabold bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
            Weight: {activeFeature.weight}%
          </span>
        </div>
        <h5 className="text-xs font-bold text-white mb-1.5">{activeFeature.name}</h5>
        <p className="text-[11px] text-white/70 leading-relaxed">
          {activeFeature.why}
        </p>
      </div>
    </div>
  );
}
