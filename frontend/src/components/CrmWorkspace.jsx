import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Search, Trash2, ShieldAlert, ArrowUpDown, ChevronDown, CheckCircle2, UserCheck, Shield } from 'lucide-react';

export default function CrmWorkspace({ showToast }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc'); // asc | desc

  // Modal open controllers
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    id: '',
    name: '',
    city: 'Delhi',
    age: '',
    weight: '',
    height: '',
    gender: 'male',
    income_lpa: '',
    smoker: false,
    occupation: 'private_job',
  });

  // Predict result overlay
  const [activePrediction, setActivePrediction] = useState(null);
  const [predictLoadingId, setPredictLoadingId] = useState(null);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://127.0.0.1:8000/view');
      // Convert mapping dict into array format
      const arr = Object.entries(res.data).map(([id, val]) => ({
        id,
        ...val
      }));
      setPatients(arr);
    } catch (err) {
      console.error(err);
      showToast('Failed to load patient records from backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    const handleImported = () => {
      fetchPatients();
    };
    window.addEventListener('patientImported', handleImported);
    return () => window.removeEventListener('patientImported', handleImported);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPatient((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddPatientSubmit = async (e) => {
    e.preventDefault();
    if (!newPatient.id || !newPatient.name || !newPatient.age || !newPatient.weight || !newPatient.height || !newPatient.income_lpa) {
      showToast('Please fill out all patient fields.', 'error');
      return;
    }

    try {
      const payload = {
        ...newPatient,
        age: parseInt(newPatient.age),
        weight: parseFloat(newPatient.weight),
        height: parseFloat(newPatient.height) / 100, // Convert cm to meters
        income_lpa: parseFloat(newPatient.income_lpa),
      };

      await axios.post('http://127.0.0.1:8000/create', payload);
      showToast(`Patient ${newPatient.id} created successfully!`, 'success');
      setShowAddModal(false);
      // Reset
      setNewPatient({
        id: '',
        name: '',
        city: 'Delhi',
        age: '',
        weight: '',
        height: '',
        gender: 'male',
        income_lpa: '',
        smoker: false,
        occupation: 'private_job',
      });
      fetchPatients();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.detail || 'Failed to save patient record.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete patient registration ${id}?`)) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/delete/${id}`);
      showToast(`Patient ID ${id} deleted.`, 'success');
      fetchPatients();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete patient record.', 'error');
    }
  };

  const handleRunPrediction = async (patient) => {
    setPredictLoadingId(patient.id);
    try {
      const payload = {
        age: parseInt(patient.age),
        weight: parseFloat(patient.weight),
        height: parseFloat(patient.height), // Already in meters inside the database!
        income_lpa: parseFloat(patient.income_lpa !== undefined ? patient.income_lpa : 5.5),
        smoker: Boolean(patient.smoker !== undefined ? patient.smoker : false),
        city: patient.city || 'Delhi',
        occupation: patient.occupation || 'private_job',
      };

      const res = await axios.post('http://127.0.0.1:8000/predict', payload);
      setActivePrediction({
        patient: {
          ...patient,
          // Prefill values if not present
          income_lpa: patient.income_lpa !== undefined ? patient.income_lpa : 5.5,
          smoker: patient.smoker !== undefined ? patient.smoker : false,
          occupation: patient.occupation || 'private_job',
        },
        result: res.data.predicted_category,
      });
      showToast('Actuarial prediction tier calculated!', 'success');
    } catch (err) {
      console.error(err);
      showToast('ML solver prediction request failed.', 'error');
    } finally {
      setPredictLoadingId(null);
    }
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Snappy Client-side filtering & sorting
  const filteredPatients = patients
    .filter((p) => {
      const query = search.toLowerCase();
      return p.name.toLowerCase().includes(query) || p.id.toLowerCase().includes(query) || p.city.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const getBmiBadge = (bmi) => {
    if (bmi < 18.5) return 'text-sky-400 bg-sky-500/10 border border-sky-500/20';
    if (bmi < 24.9) return 'text-emerald-450 bg-emerald-500/10 border border-emerald-500/20';
    if (bmi < 29.9) return 'text-amber-400 bg-amber-500/10 border border-amber-500/20';
    return 'text-rose-455 bg-rose-500/10 border border-rose-500/20';
  };

  return (
    <div className="w-full relative z-10 select-none animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Underwriter CRM Desk</h2>
          <p className="text-xs text-white/50">Manage local patient demographics and trigger ML categories</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-full bg-white text-black font-semibold text-xs py-2.5 px-4.5 hover:bg-white/90 active:scale-[0.98] transition-all"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add New Patient</span>
        </button>
      </div>

      {/* CRM Actions Bar */}
      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/40 pointer-events-none">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Filter by ID, name, or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:ring-1 focus:ring-brand focus:border-brand focus:outline-none focus:bg-white/[0.08] transition-all"
        />
      </div>

      {/* Patients Grid Table */}
      <div className="liquid-glass rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] text-white/80 text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/10 text-white/45 font-bold uppercase tracking-wider">
                <th className="py-4 px-4 cursor-pointer hover:text-white" onClick={() => toggleSort('id')}>
                  ID <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </th>
                <th className="py-4 px-4 cursor-pointer hover:text-white" onClick={() => toggleSort('name')}>
                  Patient Name <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </th>
                <th className="py-4 px-4 cursor-pointer hover:text-white" onClick={() => toggleSort('age')}>
                  Age <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </th>
                <th className="py-4 px-4">Gender</th>
                <th className="py-4 px-4 cursor-pointer hover:text-white" onClick={() => toggleSort('bmi')}>
                  BMI <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </th>
                <th className="py-4 px-4">Smoker</th>
                <th className="py-4 px-4 cursor-pointer hover:text-white" onClick={() => toggleSort('income_lpa')}>
                  Income (LPA) <ArrowUpDown className="inline w-3 h-3 ml-1" />
                </th>
                <th className="py-4 px-4">City</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-white/45">
                    <svg className="animate-spin h-5 w-5 mx-auto text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-10 text-center text-white/45 font-medium">
                    No registry profiles match current query filter.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-4 font-bold text-white/95">{p.id}</td>
                    <td className="py-4 px-4 font-semibold text-white">{p.name}</td>
                    <td className="py-4 px-4">{p.age} yrs</td>
                    <td className="py-4 px-4 capitalize">{p.gender}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold inline-block text-[10px] ${getBmiBadge(p.bmi)}`}>
                        {p.bmi} ({p.verdict})
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-semibold ${p.smoker ? 'text-rose-455' : 'text-emerald-450'}`}>
                        {p.smoker ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold">{p.income_lpa} LPA</td>
                    <td className="py-4 px-4">{p.city}</td>
                    <td className="py-4 px-4 text-right flex items-center justify-end gap-2 h-full">
                      <button
                        onClick={() => handleRunPrediction(p)}
                        disabled={predictLoadingId === p.id}
                        className="py-1 px-3 text-[10px] rounded-lg font-bold bg-[#3D81E3] hover:bg-[#3D81E3]/80 active:scale-95 text-white disabled:opacity-50 transition-all"
                      >
                        {predictLoadingId === p.id ? 'Estimating...' : 'Run Valuation'}
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-md text-white/40 hover:text-rose-400 hover:bg-white/5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-xl liquid-glass rounded-3xl p-6 border border-white/10 shadow-2xl relative animate-slide-up">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-brand" /> Register Actuarial Patient
            </h3>
            
            <form onSubmit={handleAddPatientSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/45 uppercase">Patient ID</label>
                  <input
                    type="text"
                    name="id"
                    placeholder="e.g. P006"
                    value={newPatient.id}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/45 uppercase">Patient Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full name"
                    value={newPatient.name}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/45 uppercase">Age (Years)</label>
                  <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={newPatient.age}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/45 uppercase">Gender</label>
                  <select
                    name="gender"
                    value={newPatient.gender}
                    onChange={handleInputChange}
                    className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="others">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/45 uppercase">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    placeholder="e.g. 175"
                    value={newPatient.height}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/45 uppercase">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    placeholder="e.g. 72"
                    value={newPatient.weight}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/45 uppercase">Income (LPA)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="income_lpa"
                    placeholder="e.g. 8.5"
                    value={newPatient.income_lpa}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-white/45 uppercase">City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Mumbai, Delhi, or Other"
                    value={newPatient.city}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-white/45 uppercase">Occupation</label>
                  <select
                    name="occupation"
                    value={newPatient.occupation}
                    onChange={handleInputChange}
                    className="w-full bg-[#0c0c0c] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                  >
                    <option value="private_job">Private Sector Job</option>
                    <option value="government_job">Government Sector Job</option>
                    <option value="business_owner">Business Owner</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="student">Student</option>
                    <option value="retired">Retired</option>
                    <option value="unemployed">Unemployed</option>
                  </select>
                </div>

                <div className="col-span-2 flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02] mt-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">Smoker Status</span>
                    <span className="text-[9px] text-white/45">Exposes higher premium risk categories</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="smoker"
                      checked={newPatient.smoker}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-white/10 rounded-full peer peer-focus:ring-1 peer-focus:ring-brand/50 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2.2px] after:bg-white after:border-slate-350 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3D81E3]"></div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-white/5 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-white/10 hover:bg-white/5 text-xs text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-white hover:bg-white/90 text-black text-xs font-semibold rounded-xl"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Predict Result Overlay Modal */}
      {activePrediction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md liquid-glass rounded-3xl p-6 border border-white/10 shadow-2xl relative text-center animate-slide-up">
            
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border text-[#3D81E3] bg-[#3D81E3]/10 border-[#3D81E3]/20">
              <Shield className="w-3.5 h-3.5 fill-current" /> Risk Valuation Result
            </span>

            <h3 className="mt-4 text-3xl font-black text-white">
              Category <span className="text-[#3D81E3]">{activePrediction.result}</span>
            </h3>

            <p className="mt-2 text-xs font-semibold text-white/50 tracking-wider">
              Profile: {activePrediction.patient.name} ({activePrediction.patient.id})
            </p>

            <div className="mt-4 p-4 rounded-xl border border-white/5 bg-white/[0.015] text-[11px] leading-relaxed text-white/60 text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-white/40">Biometric weight index:</span>
                <span className="text-white font-bold">{activePrediction.patient.bmi} BMI ({activePrediction.patient.verdict})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Smoking history flags:</span>
                <span className="text-white font-bold">{activePrediction.patient.smoker ? 'Elevated Smoker' : 'No habits'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Income evaluation:</span>
                <span className="text-white font-bold">{activePrediction.patient.income_lpa} LPA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Occupation & tier:</span>
                <span className="text-white font-bold capitalize">{activePrediction.patient.occupation.replace('_', ' ')} (Tier {activePrediction.patient.city_tier})</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setActivePrediction(null)}
                className="w-full py-2 bg-white hover:bg-white/90 text-black text-xs font-bold rounded-xl active:scale-[0.98] transition-all"
              >
                Close Verdict
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
