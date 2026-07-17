import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../config';
import { Landmark, ArrowRight, ShieldCheck, Percent, Activity, IndianRupee, UserCheck, AlertTriangle } from 'lucide-react';

export default function BankerCreditDesk({ showToast }) {
  const [patientsList, setPatientsList] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  
  const [inputs, setInputs] = useState({
    age: 30,
    weight: 70,
    height: 175,
    income_lpa: 6.0,
    smoker: false,
    city: 'Mumbai',
    occupation: 'private_job',
    credit_score: 720,
    requested_loan: 500000,
    existing_debt: 20000,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Fetch registered patients for prefill actions
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(`${API_BASE}/view`);
        const arr = Object.entries(res.data).map(([id, val]) => ({
          id,
          ...val
        }));
        setPatientsList(arr);
      } catch (err) {
        console.error('Failed to load prefill profiles list:', err);
      }
    };
    fetchPatients();

    const handleImported = () => {
      fetchPatients();
    };
    window.addEventListener('patientImported', handleImported);
    return () => window.removeEventListener('patientImported', handleImported);
  }, []);

  const handlePatientSelect = (e) => {
    const id = e.target.value;
    setSelectedPatientId(id);
    if (!id) return;

    const patient = patientsList.find((p) => p.id === id);
    if (patient) {
      setInputs((prev) => ({
        ...prev,
        age: patient.age,
        weight: patient.weight,
        height: Math.round(patient.height * 100), // Convert to cm
        city: patient.city,
        // Safeguard legacy undefined metrics
        income_lpa: patient.income_lpa || 5.5,
        smoker: patient.smoker !== undefined ? patient.smoker : false,
        occupation: patient.occupation || 'private_job',
      }));
      showToast(`Biometrics loaded from patient ${patient.name}.`, 'success');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value) || value,
    }));
  };

  const handleRunEvaluation = async (e) => {
    e.preventDefault();
    if (inputs.credit_score < 300 || inputs.credit_score > 850) {
      showToast('Credit Score must be between 300 and 850.', 'error');
      return;
    }
    if (inputs.requested_loan <= 0) {
      showToast('Please enter a valid loan requested amount.', 'error');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const payload = {
        age: parseInt(inputs.age),
        weight: parseFloat(inputs.weight),
        height: parseFloat(inputs.height) / 100, // convert cm to meters
        income_lpa: parseFloat(inputs.income_lpa),
        smoker: inputs.smoker,
        city: inputs.city,
        occupation: inputs.occupation,
        credit_score: parseInt(inputs.credit_score),
        requested_loan: parseFloat(inputs.requested_loan),
        existing_debt: parseFloat(inputs.existing_debt || 0),
      };

      const res = await axios.post(`${API_BASE}/bank/evaluate`, payload);
      setResult(res.data);
      showToast('Credit risk parameters calculated successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Banking risk evaluation endpoint failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Approved') return 'text-emerald-450 bg-emerald-500/10 border-emerald-500/20';
    if (status === 'Conditional Approval') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-455 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="w-full relative z-10 select-none animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Banker Credit Evaluator</h2>
          <p className="text-xs text-white/50">Cross-reference client health risk categories with lending credit scores</p>
        </div>

        {/* Profile Prefill Select */}
        {patientsList.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-white/45 tracking-wider">Prefill Profile:</span>
            <select
              value={selectedPatientId}
              onChange={handlePatientSelect}
              className="bg-[#0c0c0c] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
            >
              <option value="">-- Select Patient --</option>
              {patientsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form controls */}
        <div className="lg:col-span-7 liquid-glass p-6 sm:p-8 rounded-3xl border border-white/10">
          <form onSubmit={handleRunEvaluation} className="space-y-4">
            
            <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest pb-2 border-b border-white/5 flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-brand" /> Financial Credit Indicators
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-white/45 uppercase">Credit Score (300 - 850)</label>
                <input
                  type="number"
                  name="credit_score"
                  value={inputs.credit_score}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white placeholder-white/20 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-white/45 uppercase">Requested Loan Amount (₹)</label>
                <input
                  type="number"
                  name="requested_loan"
                  value={inputs.requested_loan}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white placeholder-white/20 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-white/45 uppercase">Existing Monthly Debt (₹)</label>
                <input
                  type="number"
                  name="existing_debt"
                  value={inputs.existing_debt}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white placeholder-white/20 focus:outline-none"
                />
              </div>
            </div>

            <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest pt-4 pb-2 border-b border-white/5 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-450" /> Biometric Health Indicators
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-white/45 uppercase">Age (Years)</label>
                <input
                  type="number"
                  name="age"
                  value={inputs.age}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-white/45 uppercase">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={inputs.height}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-white/45 uppercase">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={inputs.weight}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-white/45 uppercase">Income (LPA)</label>
                <input
                  type="number"
                  step="0.1"
                  name="income_lpa"
                  value={inputs.income_lpa}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-white/45 uppercase">City</label>
                <input
                  type="text"
                  name="city"
                  value={inputs.city}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1 col-span-1">
                <label className="text-[9px] font-bold text-white/45 uppercase">Occupation</label>
                <select
                  name="occupation"
                  value={inputs.occupation}
                  onChange={handleInputChange}
                  className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none"
                >
                  <option value="private_job">Private Job</option>
                  <option value="government_job">Government Job</option>
                  <option value="business_owner">Business Owner</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <div className="sm:col-span-3 flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.015] mt-2">
                <span className="text-xs font-semibold text-white">Active Smoker</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="smoker"
                    checked={inputs.smoker}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2.2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3D81E3]"></div>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 text-right">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-semibold text-xs py-3 px-6 hover:bg-white/90 active:scale-95 transition-all"
              >
                <span>{loading ? 'Evaluating...' : 'Run Credit Risk Evaluation'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="space-y-6 animate-slide-up text-center">
              
              {/* Approval status header */}
              <div className="liquid-glass p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-4">Lending Decision</span>
                
                <span className={`inline-flex px-4.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusColor(result.approval_status)}`}>
                  {result.approval_status}
                </span>

                <p className="mt-4 text-xs text-white/60 leading-relaxed">
                  {result.approval_reason}
                </p>

                <div className="mt-4 pt-3 border-t border-white/5 text-left text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-white/40">DTI Exposure Ratio:</span>
                    <span className={`font-bold ${result.dti_ratio > 40 ? 'text-rose-455' : 'text-emerald-450'}`}>{result.dti_ratio}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Credit Health Rating:</span>
                    <span className="text-white font-bold">{result.credit_health}</span>
                  </div>
                </div>
              </div>

              {/* Interest Rate Breakdowns */}
              <div className="liquid-glass p-6 rounded-3xl border border-white/10 text-left">
                <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider mb-4 flex items-center gap-1.5 pb-2 border-b border-white/5">
                  <Percent className="w-4 h-4 text-brand" /> Financed Rates Breakdowns
                </h4>

                <div className="space-y-2.5 text-xs text-white/70">
                  <div className="flex justify-between">
                    <span className="text-white/45">Baseline Standard Interest:</span>
                    <span className="text-white font-semibold">{result.base_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/45">Credit Score adjustments:</span>
                    <span className={`font-semibold ${result.credit_markup > 0 ? 'text-rose-455' : 'text-emerald-450'}`}>
                      {result.credit_markup > 0 ? `+${result.credit_markup}%` : `${result.credit_markup}%`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/45">Medical Insurance Risk category markup:</span>
                    <span className="text-white font-semibold text-rose-455">+{result.medical_markup}% (Tier {result.predicted_category})</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/5 text-sm font-bold text-white">
                    <span>Final Loan Interest Rate:</span>
                    <span className="text-brand">{result.final_interest_rate}%</span>
                  </div>
                </div>
              </div>

              {/* Monthly EMI Finance calculator */}
              <div className="liquid-glass p-6 rounded-3xl border border-white/10 text-left">
                <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider mb-4 flex items-center gap-1.5 pb-2 border-b border-white/5">
                  <IndianRupee className="w-4 h-4 text-emerald-450" /> Premium Amortization Schedule (₹)
                </h4>

                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-white/55 font-semibold block">Monthly Finance EMI</span>
                    <span className="text-[9px] text-white/40">Financed over 5-year repayment plan (60 months)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-white block">₹{result.monthly_emi.toLocaleString('en-IN')}/mo</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="liquid-glass p-10 rounded-3xl border border-white/10 text-center text-white/20 select-none min-h-[300px] flex flex-col items-center justify-center">
              <Landmark className="w-10 h-10 mb-2 opacity-50 text-white/30" />
              <h4 className="text-sm font-bold text-white/80">Pending Underwriting</h4>
              <p className="text-xs text-white/40 max-w-[240px] mx-auto mt-2">
                Input the client's credit score and requested loan values to run evaluations.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
