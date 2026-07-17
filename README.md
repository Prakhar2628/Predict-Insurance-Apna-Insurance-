<div align="center">

```
 ██████╗ ██████╗ ███╗   ██╗ █████╗     ██╗███╗   ██╗███████╗
██╔══██╗██╔══██╗████╗  ██║██╔══██╗   ██║████╗  ██║██╔════╝
███████║██████╔╝██╔██╗ ██║███████║   ██║██╔██╗ ██║███████╗
██╔══██║██╔═══╝ ██║╚██╗██║██╔══██║   ██║██║╚██╗██║╚════██║
██║  ██║██║     ██║ ╚████║██║  ██║   ██║██║ ╚████║███████║
╚═╝  ╚═╝╚═╝     ╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝╚═╝  ╚═══╝╚══════╝
```

# 🏛️ Aura Actuarial Bank Suite

### *Where Biometric Intelligence Meets Banking Risk Engineering*

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0%2B-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.0%2B-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![SQLite](https://img.shields.io/badge/SQLite-Persistent_DB-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-Random_Forest-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-gold?style=for-the-badge)](./LICENSE)

---

> **"The most dangerous risk of all is the risk of spending your life not doing what you want"** — but in financial services, unquantified health risk is even more dangerous.
>
> **Aura** solves that — by fusing actuarial science, machine learning, and banking credit risk into a single glassmorphic command center.

---

</div>

## 🌌 What Is This?

**Aura Actuarial Bank Suite** is a full-stack AI-native financial intelligence platform that bridges the gap between **health underwriting** and **banking credit risk**. 

Using a trained **Random Forest ML pipeline**, the platform:

- Classifies patients into risk tiers: `Low` → `Medium` → `High`
- Calculates actuarial **premium loading surcharges** on insurance plans
- Applies **banking interest rate markups** (hedging default exposure from health risk)
- Runs live biometric simulations to find category inflection points
- Stress-tests entire patient portfolios against macro shocks (smoking epidemic, obesity crisis, aging population)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    🖥️  VITE REACT FRONTEND                       │
│                     http://localhost:5173                        │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ 🎛️ Live Risk │  │ 📊 CRM Desk  │  │ 🏛️ Banker Credit Desk  │  │
│  │  Simulator  │  │ (SQLite CRUD)│  │  (DTI + EMI + Risk)    │  │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬─────────────┘  │
│         │                │                      │               │
│  ┌──────▼──────────────────────────────────────▼─────────────┐  │
│  │          🔍 SVG Feature Explainability Widget              │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ⚡  FASTAPI BACKEND SERVER                      │
│                     http://127.0.0.1:8000                        │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────────────┐ │
│  │  /predict    │  │  /bank/evaluate │  │  /batch/predict      │ │
│  │  /view       │  │  /view/bank    │  │  /create /update     │ │
│  │  /import     │  │  /delete/:id   │  │  /export             │ │
│  └──────┬───────┘  └───────┬────────┘  └──────────────────────┘ │
│         │                  │                                     │
│  ┌──────▼──────┐    ┌──────▼──────────────────────────────────┐ │
│  │  model.pkl  │    │       patients.db (SQLite)               │ │
│  │  Random     │    │  ┌──────────────┐  ┌────────────────┐   │ │
│  │  Forest     │    │  │ patients tbl │  │  bank_clients  │   │ │
│  └─────────────┘    │  └──────────────┘  └────────────────┘   │ │
│                     └────────────────────────────────────────── │ │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Feature Breakdown

### 🔐 `[1]` Administrator Authentication Gate

```
╔══════════════════════════════════════╗
║    🔒  AURA SECURITY GATEWAY         ║
║    Username: [admin          ]       ║
║    Password: [••••••••       ]       ║
║              [ AUTHENTICATE ]        ║
╚══════════════════════════════════════╝
```

A glassmorphic login screen that protects all clinical and financial patient data.

| Field    | Default Value |
|----------|---------------|
| Username | `admin`       |
| Password | `aura2026`    |

---

### 📊 `[2]` Unified Underwriter CRM (SQLite-Backed)

A persistent relational patient registry with full CRUD operations:

| Operation | Endpoint | Description |
|-----------|----------|-------------|
| `CREATE` | `POST /create` | Register new patient biometric profile |
| `READ` | `GET /view` | List all patient records |
| `UPDATE` | `PUT /update/{id}` | Modify patient biometrics |
| `DELETE` | `DELETE /delete/{id}` | Remove a patient record |
| `IMPORT` | `POST /import` | Bulk JSON import via File Menu |
| `EXPORT` | `GET /export` | Download all records as JSON |

> **Sort by**: BMI · Income · Age · Height · Risk Category

---

### 🏛️ `[3]` Banker Credit Desk

Combines health classification with CIBIL/credit score data to model full loan serviceability:

```
Input  →  [ Age | BMI | Smoker | Income | Credit Score | Requested Loan | Existing Debt ]
                          ↓
              Random Forest Risk Classification
                  Low (0) | Medium (1) | High (2)
                          ↓
    ┌──────────────────────────────────────────────────┐
    │  Base Rate        : 7.00% APR                    │
    │  Credit Markup    : +0.00% to +4.50% (by CIBIL)  │
    │  Health Loading   : +0.50% to +2.50% (by risk)   │
    │  ─────────────────────────────────────────────── │
    │  Final APR        : 7.00% — 14.00%               │
    │  Loan Term        : 60 months                     │
    │  EMI              : ₹X,XXX/month                  │
    │  DTI Ratio        : XX.XX%                        │
    └──────────────────────────────────────────────────┘
```

---

### 🎛️ `[4]` Real-Time Biometric Risk Simulator

Move sliders and watch everything update **instantly** — no page refresh needed:

```
Weight  ●──────────────────────○  120 kg
Height  ○──────────────────────●  175 cm
Age     ○──────────●───────────○  45 yrs
Income  ○──────────────────●───○  ₹12 LPA

  BMI = 39.2  →  ⚠️  HIGH RISK  →  Tier 3
  Estimated Premium Loading: +₹4,200/yr
  APR Markup: +2.50%
```

---

### 🔍 `[5]` Interactive SVG Explainability Widget

An inline bar chart showing **why** each feature impacts the prediction:

| Feature | Importance | Explanation |
|---------|-----------|-------------|
| 🚬 Smoker Status | ████████░░ 82% | Largest single predictor of health claim costs |
| 📏 BMI | ██████░░░░ 60% | Obesity correlates directly to chronic disease burden |
| 🎂 Age Group | █████░░░░░ 52% | Older demographics have higher actuarial mortality tables |
| 💰 Income LPA | ████░░░░░░ 40% | Inversely related to claim frequency in Indian cohorts |
| 🏙️ City Tier | ███░░░░░░░ 30% | Tier-1 cities have higher healthcare cost inflation |
| 💼 Occupation | ██░░░░░░░░ 22% | Blue-collar roles show elevated physical injury risk |

> Click any bar in the widget to reveal a detailed explanation panel.

---

### 💻 `[6]` Developer Sandbox

Build custom JSON payloads and fire live API requests against the backend with real-time latency telemetry:

```json
POST /predict
{
  "age": 45,
  "bmi": 32.5,
  "smoker": "yes",
  "income_lpa": 8.5,
  "city": "Mumbai",
  "occupation": "Software Engineer"
}
→ 200 OK  |  12ms
{
  "predicted_category": "2",
  "recommended_plans": [...]
}
```

---

## ⚙️ Quick Start

### Prerequisites

| Tool | Minimum Version |
|------|----------------|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |

### 1️⃣ Clone the Repo

```bash
git clone https://github.com/Prakhar2628/Predict-Insurance-Apna-Insurance-.git
cd Predict-Insurance-Apna-Insurance-
```

### 2️⃣ Backend — FastAPI Server

```bash
# Create and activate virtual environment
python -m venv myenv
myenv\Scripts\activate          # Windows
# source myenv/bin/activate     # macOS/Linux

# Install Python dependencies
pip install -r requirements.txt

# Start API server on port 8000
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

### 3️⃣ Frontend — React + Vite Client

```bash
# Navigate to frontend
cd frontend

# Install Node modules
npm install

# Start Vite dev server
npm run dev
```

### 4️⃣ Open in Browser

```
🌐  http://localhost:5173/
```

---

## 🗂️ Project Structure

```
Predict-Insurance-Apna-Insurance-/
│
├── 📄 app.py                   # FastAPI main application
├── 🤖 model.pkl                # Trained Random Forest pipeline
├── 🗄️  patients.db              # SQLite database (auto-created)
├── 📋 requirements.txt         # Python dependencies
├── 📖 README.md                # This file
│
└── 📁 frontend/
    ├── 📄 index.html
    ├── ⚙️  vite.config.js
    └── 📁 src/
        ├── 📁 components/
        │   ├── 🔐 MacMenuBar.jsx          # File menu (Import / Export JSON)
        │   ├── 📊 CrmWorkspace.jsx        # Patient registry CRUD
        │   ├── 🏛️  BankerCreditDesk.jsx    # Loan + credit risk evaluator
        │   ├── 🎛️  BiometricSimulator.jsx   # Live risk slider simulator
        │   ├── 🔍 PredictorForm.jsx       # Manual form + Explainability SVG
        │   ├── 💻 DeveloperSandbox.jsx    # API request builder
        │   └── 🗃️  HistoryList.jsx         # Prediction history log
        └── 📁 assets/
```

---

## 🧬 ML Model Details

| Property | Value |
|----------|-------|
| Algorithm | Random Forest Classifier |
| Framework | Scikit-Learn Pipeline |
| Input Features | Age, BMI, Smoker, Income, City Tier, Occupation |
| Output Classes | `Low` → `Medium` → `High` |
| Internal Mapping | `Low=0`, `Medium=1`, `High=2` |
| Training Dataset | Indian demographic health cohort |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/amazing-feature`
3. Commit changes: `git commit -m 'feat: Add amazing feature'`
4. Push to branch: `git push origin feat/amazing-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

**Built with ❤️ by [Prakhar2628](https://github.com/Prakhar2628)**

*Merging actuarial science and AI to make financial risk human-readable*

⭐ **Star this repo if you found it useful!** ⭐

</div>
