import React from 'react';
import { Network, Database, Scale, Cpu, CheckCircle2 } from 'lucide-react';

export default function About() {
  const steps = [
    {
      icon: Cpu,
      title: "Data Computation",
      desc: "Height and weight inputs compute the patient BMI. BMI combines with smoking habits to calculate lifestyle risk (low, medium, high)."
    },
    {
      icon: Scale,
      title: "Feature Engineering",
      desc: "Age is segmented into age groups (young, adult, middle-aged, senior). Cities are mapped to Tier 1, 2, or 3 based on urban development registers."
    },
    {
      icon: Database,
      title: "FastAPI Predictive Route",
      desc: "Axios pushes payload parameters to POST `/predict`. The incoming request is mapped into a Pandas DataFrame shape matching the ML schema."
    },
    {
      icon: Network,
      title: "Random Forest Prediction",
      desc: "The pickled Random Forest classifier Model (model.pkl) evaluates the parameters and returns the predicted premium tier (0, 1, 2, etc.)."
    }
  ];

  return (
    <div id="about" className="mx-auto max-w-6xl px-6 py-16 relative z-10 select-none">
      
      {/* Heading */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
          How the Premium Predictor Works
        </h2>
        <p className="mt-4 text-base text-white/50 leading-relaxed">
          This system marries a high-speed Python FastAPI backend with an ML model file to provide classification of insurance premium groups.
        </p>
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <div key={index} className="liquid-glass p-6 rounded-2xl relative overflow-hidden">
            <span className="absolute top-2 right-4 text-6xl font-black text-white/5 select-none font-mono">
              {index + 1}
            </span>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-[#A4F4FD] border border-white/10 mb-6">
              <step.icon className="h-5 w-5" />
            </div>
            <h3 className="text-md font-bold text-white mb-2">{step.title}</h3>
            <p className="text-xs text-white/55 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Spec details grid section */}
      <div className="mt-20 liquid-glass p-8 rounded-3xl lg:flex items-center gap-12">
        
        <div className="lg:w-1/2">
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Technical Architecture Specifications
          </h3>
          <p className="mt-4 text-sm text-white/60 leading-relaxed">
            The frontend captures biometric inputs and converts them into the precise JSON payload structures required by the Pydantic validator models on the backend server.
          </p>

          <ul className="mt-6 space-y-3.5">
            {[
              "Pydantic UserInput BaseModel validation checks",
              "Real-time client-side BMI calculations",
              "Axios client with standard config response interceptors",
              "CORS configured securely for Vite origin calls",
              "Feature calculation matching standard insurance ML factors"
            ].map((spec, i) => (
              <li key={i} className="flex items-center gap-3 text-xs sm:text-sm text-white/50 font-medium">
                <span className="c3-check bg-emerald-500/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-450 shrink-0" />
                </span>
                <span>{spec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Payload display */}
        <div className="lg:w-1/2 mt-8 lg:mt-0">
          <div className="rounded-2xl bg-black/50 p-6 text-white/80 font-mono text-xs overflow-auto border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
              <span className="text-white/40 font-bold uppercase text-[9px]">API Request Payload (POST /predict)</span>
              <span className="h-2 w-2 rounded-full bg-brand" />
            </div>
            <pre className="text-blue-300">
{`{
  "age": 32,
  "weight": 78.5,
  "height": 1.76,
  "income_lpa": 8.4,
  "smoker": false,
  "city": "Mumbai",
  "occupation": "private_job"
}`}
            </pre>
            <div className="flex items-center justify-between mt-5 pb-2 mb-2 border-b border-white/5 text-white/40">
              <span className="text-white/40 font-bold uppercase text-[9px]">API Response (200 OK)</span>
            </div>
            <pre className="text-emerald-400">
{`{
  "predicted_category": "2"
}`}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
