import React, { useState } from 'react';
import axios from 'axios';
import { Terminal, Send, CheckCircle, AlertTriangle, Cpu, Play } from 'lucide-react';

export default function DeveloperSandbox({ showToast }) {
  const defaultPayload = `{
  "age": 30,
  "weight": 70.5,
  "height": 1.75,
  "income_lpa": 5.5,
  "smoker": false,
  "city": "Delhi",
  "occupation": "private_job"
}`;

  const [payloadText, setPayloadText] = useState(defaultPayload);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState(null);
  const [status, setStatus] = useState(null);

  const handleRunRequest = async () => {
    setLoading(true);
    setResponse(null);
    setLatency(null);
    setStatus(null);

    // Validate JSON structure
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(payloadText);
    } catch (err) {
      showToast('Invalid JSON syntax. Verify schema parameters.', 'error');
      setResponse({ error: 'JSON Parse Error: Check your syntax spacing or comma placements.' });
      setLoading(false);
      return;
    }

    const t0 = performance.now();
    try {
      const res = await axios.post('http://127.0.0.1:8000/predict', parsedPayload);
      const t1 = performance.now();
      
      setLatency(Math.round(t1 - t0));
      setStatus(res.status);
      setResponse(res.data);
      showToast('Payload processed by AI Random Forest model!', 'success');
    } catch (err) {
      const t1 = performance.now();
      setLatency(Math.round(t1 - t0));
      
      if (err.response) {
        setStatus(err.response.status);
        setResponse(err.response.data);
        showToast(`API rejected payload with status code ${err.response.status}.`, 'error');
      } else {
        setStatus(500);
        setResponse({ error: 'Network socket disconnected or server offline.' });
        showToast('HTTP connection failed.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetSample = () => {
    setPayloadText(defaultPayload);
  };

  return (
    <div className="w-full relative z-10 select-none animate-fade-in text-left">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">API Developer Sandbox</h2>
        <p className="text-xs text-white/50">Run direct raw JSON requests against the ML prediction servers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Code Console Panel */}
        <div className="lg:col-span-6 flex flex-col rounded-2xl border border-white/10 bg-[#0e1014]/90 overflow-hidden shadow-2xl">
          
          {/* Console Header Bar */}
          <div className="h-10 bg-black/30 border-b border-white/5 flex items-center px-4 justify-between select-none">
            <div className="flex gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
            </div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-white/40 flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5" /> POST /predict
            </span>
            <button 
              onClick={handleResetSample} 
              className="text-[9px] font-bold text-[#3D81E3] hover:text-[#3D81E3]/80 transition-colors uppercase tracking-wider"
            >
              Reset Sample
            </button>
          </div>

          {/* Textarea Code Area */}
          <div className="relative flex-1 p-4 bg-black/20 font-mono text-xs">
            <textarea
              className="w-full h-80 bg-transparent text-emerald-400 placeholder-white/10 focus:outline-none resize-none font-mono leading-relaxed"
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              spellCheck="false"
            />
          </div>

          <div className="p-4 border-t border-white/5 bg-black/10 flex justify-between items-center">
            <span className="text-[9px] font-semibold text-white/35 uppercase">
              Payload Content-Type: application/json
            </span>
            <button
              onClick={handleRunRequest}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#3D81E3] text-white font-bold text-xs py-2 px-4 hover:bg-[#3D81E3]/80 active:scale-[0.98] disabled:opacity-50 transition-all font-mono"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'RUNNING...' : 'SEND REQUEST'}</span>
            </button>
          </div>

        </div>

        {/* Right: Response Output JSON */}
        <div className="lg:col-span-6 flex flex-col rounded-2xl border border-white/10 bg-[#0e1014]/90 overflow-hidden shadow-2xl min-h-[400px]">
          
          {/* Response Header */}
          <div className="h-10 bg-black/30 border-b border-white/5 flex items-center px-4 justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">
              Server Response Logs
            </span>
            {status && (
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold ${
                status === 200 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-455 border border-rose-500/20'
              }`}>
                {status === 200 ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                HTTP {status}
              </span>
            )}
          </div>

          {/* Output Display Area */}
          <div className="flex-1 p-4 bg-black/40 font-mono text-xs overflow-auto">
            {response ? (
              <pre className="text-white/80 leading-relaxed text-left whitespace-pre-wrap">
                {JSON.stringify(response, null, 2)}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-white/20 select-none">
                <Cpu className="w-8 h-8 mb-2 opacity-50" />
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider">Console Terminal Idle</h4>
                <p className="text-[10px] text-white/35 mt-1">Submit the request schema on the left to capture server output logs.</p>
              </div>
            )}
          </div>

          {/* Telemetry Footer */}
          {latency !== null && (
            <div className="px-4 py-3 border-t border-white/5 bg-black/20 flex justify-between items-center text-[10px] font-mono text-white/45">
              <span>Latency duration: <strong className="text-white">{latency} ms</strong></span>
              <span>Content size: <strong className="text-white">{JSON.stringify(response).length} bytes</strong></span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
