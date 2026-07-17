from fastapi import FastAPI, Path, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, computed_field, field_validator
from typing import Literal, Annotated, Optional, Dict
import pickle
import pandas as pd
import json
import os
import sqlite3


# -----------------------------
# Load Trained ML Model
# -----------------------------
with open("model.pkl", "rb") as f:
    model = pickle.load(f)

app = FastAPI()

# -----------------------------
# CORS Middleware Configuration
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins — lock down to specific domains in production
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# City Tier Categorisation
# -----------------------------
tier_1_cities = [
    "Mumbai", "Delhi", "Bangalore", "Chennai",
    "Kolkata", "Hyderabad", "Pune"
]

tier_2_cities = [
    "Jaipur", "Chandigarh", "Indore", "Lucknow", "Patna", "Ranchi",
    "Visakhapatnam", "Coimbatore", "Bhopal", "Nagpur", "Vadodara",
    "Surat", "Rajkot", "Jodhpur", "Raipur", "Amritsar", "Varanasi",
    "Agra", "Dehradun", "Mysore", "Jabalpur", "Guwahati",
    "Thiruvananthapuram", "Ludhiana", "Nashik", "Allahabad",
    "Udaipur", "Aurangabad", "Hubli", "Belgaum", "Salem",
    "Vijayawada", "Tiruchirappalli", "Bhavnagar", "Gwalior",
    "Dhanbad", "Bareilly", "Aligarh", "Gaya", "Kozhikode",
    "Warangal", "Kolhapur", "Bilaspur", "Jalandhar", "Noida",
    "Guntur", "Asansol", "Siliguri"
]

# -----------------------------
# Data Models and Pydantic Validators
# -----------------------------
class UserInput(BaseModel):
    age: Annotated[int, Field(..., gt=0, description="Age of the patient", examples=[30])]
    weight: Annotated[float, Field(..., gt=0, description="Weight in kg", examples=[70.5])]
    height: Annotated[float, Field(..., gt=0, description="Height in meters", examples=[1.75])]
    income_lpa: Annotated[float, Field(..., gt=0, description="Income in LPA", examples=[5.5])]
    smoker: Annotated[bool, Field(..., description="Smoker or not", examples=[False])]
    city: Annotated[str, Field(..., description="Residence City", examples=["Delhi"])]
    occupation: Annotated[
        Literal[
            "retired",
            "freelancer",
            "student",
            "government_job",
            "business_owner",
            "unemployed",
            "private_job"
        ],
        Field(..., description="Occupation Area")
    ]

    @computed_field
    @property
    def bmi(self) -> float:
        w = float(self.weight)
        h = float(self.height)
        return float(round(w / (h ** 2), 2))

    @computed_field
    @property
    def lifestyle_risk(self) -> str:
        if self.smoker and self.bmi > 30:
            return "high"
        elif self.smoker or self.bmi > 27:
            return "medium"
        return "low"

    @computed_field
    @property
    def age_group(self) -> str:
        if self.age < 25:
            return "young"
        elif self.age < 45:
            return "adult"
        elif self.age < 60:
            return "middle_aged"
        return "senior"

    @computed_field
    @property
    def city_tier(self) -> int:
        if self.city in tier_1_cities:
            return 1
        elif self.city in tier_2_cities:
            return 2
        return 3

    @field_validator("city", mode="before")
    @classmethod
    def normalize_city(cls, v):
        if isinstance(v, str):
            return v.strip().title()
        return v


class Patient(BaseModel):
    id: Annotated[str, Field(..., description="The Unique ID of the patient", examples=["P001"])]
    name: Annotated[str, Field(..., min_length=3, max_length=50, description="Name profile", examples=["John Doe"])]
    city: Annotated[str, Field(..., min_length=2, max_length=50, description="Residing city", examples=["Delhi"])]
    age: Annotated[int, Field(..., gt=0, description="Age in years", examples=[30])]
    weight: Annotated[float, Field(..., gt=0, description="Weight in kg", examples=[70.5])]
    gender: Annotated[Literal["male", "female", "others"], Field(..., description="Gender", examples=["male"])]
    height: Annotated[float, Field(..., gt=0, description="Height in meters", examples=[1.75])]
    
    # Extended columns supporting ML calculations
    income_lpa: Annotated[float, Field(default=5.5, gt=0, description="Income in LPA")]
    smoker: Annotated[bool, Field(default=False, description="Tobacco smoker status")]
    occupation: Annotated[
        Literal["retired", "freelancer", "student", "government_job", "business_owner", "unemployed", "private_job"],
        Field(default="private_job", description="Occupation")
    ]

    @computed_field
    @property
    def bmi(self) -> float:
        w = float(self.weight)
        h = float(self.height)
        return float(round(w / (h ** 2), 2))

    @computed_field
    @property
    def lifestyle_risk(self) -> str:
        if self.smoker and self.bmi > 30:
            return "high"
        elif self.smoker or self.bmi > 27:
            return "medium"
        return "low"

    @computed_field
    @property
    def age_group(self) -> str:
        if self.age < 25:
            return "young"
        elif self.age < 45:
            return "adult"
        elif self.age < 60:
            return "middle_aged"
        return "senior"

    @computed_field
    @property
    def city_tier(self) -> int:
        if self.city in tier_1_cities:
            return 1
        elif self.city in tier_2_cities:
            return 2
        return 3

    @computed_field
    @property
    def verdict(self) -> str:
        if self.bmi < 18.5:
            return "Underweight"
        elif self.bmi < 24.9:
            return "Normal weight"  
        elif self.bmi < 29.9:
            return "Overweight"
        return "Obesity"

    @field_validator("city", mode="before")
    @classmethod
    def normalize_city(cls, v):
        if isinstance(v, str):
            return v.strip().title()
        return v


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[Literal["male", "female", "others"]] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    income_lpa: Optional[float] = None
    smoker: Optional[bool] = None
    occupation: Optional[Literal["retired", "freelancer", "student", "government_job", "business_owner", "unemployed", "private_job"]] = None

    @field_validator("city", mode="before")
    @classmethod
    def normalize_city(cls, v):
        if isinstance(v, str):
            return v.strip().title()
        return v


class LoginRequest(BaseModel):
    username: str
    password: str


class BankEvaluationRequest(BaseModel):
    age: int
    weight: float
    height: float
    income_lpa: float
    smoker: bool
    city: str
    occupation: str
    credit_score: int = Field(..., ge=300, le=850)
    requested_loan: float = Field(..., gt=0)
    existing_debt: float = Field(default=0, ge=0)

    @field_validator("city", mode="before")
    @classmethod
    def normalize_city(cls, v):
        if isinstance(v, str):
            return v.strip().title()
        return v


# -----------------------------
# SQLite Database Setup & Migration
# -----------------------------
DB_FILE = "patients.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS patients (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            city TEXT NOT NULL,
            age INTEGER NOT NULL,
            weight REAL NOT NULL,
            gender TEXT NOT NULL,
            height REAL NOT NULL,
            income_lpa REAL NOT NULL,
            smoker INTEGER NOT NULL,
            occupation TEXT NOT NULL,
            bmi REAL NOT NULL,
            lifestyle_risk TEXT NOT NULL,
            age_group TEXT NOT NULL,
            city_tier INTEGER NOT NULL,
            verdict TEXT NOT NULL
        )
    """)
    conn.commit()
    
    # Migrate from json if exists
    json_path = "patients.json"
    if os.path.exists(json_path):
        try:
            with open(json_path, "r") as f:
                data = json.load(f)
            for pid, p_dict in data.items():
                cursor.execute("SELECT id FROM patients WHERE id = ?", (pid,))
                if not cursor.fetchone():
                    # Calculate computed properties if not present
                    bmi = p_dict.get("bmi")
                    if bmi is None:
                        bmi = float(round(float(p_dict.get("weight", 70.0)) / (float(p_dict.get("height", 1.75)) ** 2), 2))
                    
                    lifestyle_risk = p_dict.get("lifestyle_risk")
                    if lifestyle_risk is None:
                        smoker = bool(p_dict.get("smoker", False))
                        if smoker and bmi > 30:
                            lifestyle_risk = "high"
                        elif smoker or bmi > 27:
                            lifestyle_risk = "medium"
                        else:
                            lifestyle_risk = "low"

                    age_group = p_dict.get("age_group")
                    if age_group is None:
                        age = int(p_dict.get("age", 30))
                        if age < 25:
                            age_group = "young"
                        elif age < 45:
                            age_group = "adult"
                        elif age < 60:
                            age_group = "middle_aged"
                        else:
                            age_group = "senior"

                    city = p_dict.get("city", "Delhi")
                    city_tier = p_dict.get("city_tier")
                    if city_tier is None:
                        if city in tier_1_cities:
                            city_tier = 1
                        elif city in tier_2_cities:
                            city_tier = 2
                        else:
                            city_tier = 3

                    verdict = p_dict.get("verdict")
                    if verdict is None:
                        if bmi < 18.5:
                            verdict = "Underweight"
                        elif bmi < 24.9:
                            verdict = "Normal weight"
                        elif bmi < 29.9:
                            verdict = "Overweight"
                        else:
                            verdict = "Obesity"

                    cursor.execute("""
                        INSERT INTO patients (
                            id, name, city, age, weight, gender, height, income_lpa, smoker, occupation, bmi, lifestyle_risk, age_group, city_tier, verdict
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        pid,
                        p_dict.get("name", "Unknown"),
                        city,
                        int(p_dict.get("age", 30)),
                        float(p_dict.get("weight", 70.0)),
                        p_dict.get("gender", "male"),
                        float(p_dict.get("height", 1.75)),
                        float(p_dict.get("income_lpa", 5.5)),
                        1 if p_dict.get("smoker", False) else 0,
                        p_dict.get("occupation", "private_job"),
                        bmi,
                        lifestyle_risk,
                        age_group,
                        city_tier,
                        verdict
                    ))
            conn.commit()
        except Exception as e:
            print(f"Migration error: {e}")
    conn.close()

# Run database setup
init_db()

def loaddata() -> Dict[str, dict]:
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, name, city, age, weight, gender, height, income_lpa, smoker, occupation, bmi, lifestyle_risk, age_group, city_tier, verdict 
        FROM patients
    """)
    rows = cursor.fetchall()
    conn.close()
    
    data = {}
    for r in rows:
        data[r[0]] = {
            "name": r[1],
            "city": r[2],
            "age": r[3],
            "weight": r[4],
            "gender": r[5],
            "height": r[6],
            "income_lpa": r[7],
            "smoker": bool(r[8]),
            "occupation": r[9],
            "bmi": r[10],
            "lifestyle_risk": r[11],
            "age_group": r[12],
            "city_tier": r[13],
            "verdict": r[14]
        }
    return data

# -----------------------------
# API Endpoints
# -----------------------------
@app.get("/")
def home():
    return {
        "status": "healthy",
        "model_version": "1.0.0",
        "message": "Aura Consolidated Actuarial Bank API is Running! Welcome to the actuarial admin services.",
        "documentation": "/docs"
    }

@app.get("/health")
def health_check():
    db_accessible = True
    try:
        conn = sqlite3.connect(DB_FILE)
        conn.execute("SELECT 1")
        conn.close()
    except Exception:
        db_accessible = False
        
    model_loaded = model is not None
    
    return {
        "status": "healthy" if (db_accessible and model_loaded) else "unhealthy",
        "model_version": "1.0.0",
        "database_accessible": db_accessible,
        "model_loaded": model_loaded,
        "services": {
            "underwriter_crm": True,
            "credit_desk": True,
            "stress_testing": True
        }
    }

# 1. Login Authentication Route
@app.post("/login")
def login(credentials: LoginRequest):
    if credentials.username == "admin" and credentials.password == "aura2026":
        return {"success": True, "token": "aura-auth-token-2026"}
    raise HTTPException(status_code=401, detail="Invalid administrator credentials.")

def get_indian_plans(category: str) -> list[dict]:
    cat = str(category).strip()
    if cat == "0":
        return [
            {"name": "Aura Swasthya Rakshak", "coverage": "₹10 Lakhs Cover", "premium": "₹450/month", "type": "Health Insurance"},
            {"name": "Aura Jeevan Suraksha", "coverage": "₹25 Lakhs Cover", "premium": "₹850/month", "type": "Term Life Insurance"},
            {"name": "Aura Kavach Gold", "coverage": "₹1 Crore Cover", "premium": "₹1,800/month", "type": "Comprehensive Plan"}
        ]
    elif cat == "1":
        return [
            {"name": "Aura Swasthya Rakshak", "coverage": "₹10 Lakhs Cover", "premium": "₹620/month", "type": "Health Insurance"},
            {"name": "Aura Jeevan Suraksha", "coverage": "₹25 Lakhs Cover", "premium": "₹1,120/month", "type": "Term Life Insurance"},
            {"name": "Kavach Super Shield", "coverage": "₹1 Crore Cover", "premium": "₹2,350/month", "type": "Comprehensive Plan"}
        ]
    elif cat == "2":
        return [
            {"name": "Aura Swasthya Rakshak", "coverage": "₹10 Lakhs Cover", "premium": "₹850/month (Includes 25% Loading)", "type": "Health Insurance"},
            {"name": "Aura Jeevan Suraksha", "coverage": "₹25 Lakhs Cover", "premium": "₹1,490/month (Includes 25% Loading)", "type": "Term Life Insurance"},
            {"name": "Kavach Super Shield", "coverage": "₹1 Crore Cover", "premium": "₹3,100/month (Includes 25% Loading)", "type": "Comprehensive Plan"}
        ]
    else:
        return [
            {"name": "Aura Swasthya Rakshak", "coverage": "₹10 Lakhs Cover", "premium": "₹1,150/month (Includes 50% Loading)", "type": "Health Insurance"},
            {"name": "Aura Jeevan Suraksha", "coverage": "₹25 Lakhs Cover", "premium": "₹2,100/month (Includes 50% Loading)", "type": "Term Life Insurance"},
            {"name": "Kavach Super Shield", "coverage": "₹1 Crore Cover", "premium": "₹4,400/month (Includes 50% Loading)", "type": "Comprehensive Plan"}
        ]

def apply_actuarial_overrides(ml_pred: str, bmi: float, smoker: bool, age: int, income: float) -> str:
    """Override ML prediction (0, 1, 2) based on real-world medical/financial rules."""
    pred_int = int(ml_pred) if ml_pred.isdigit() else 0
    
    if bmi > 35:
        pred_int = max(pred_int, 2)
    if income < 4.0 and (bmi > 28 or smoker):
        pred_int = max(pred_int, 2)
    if smoker:
        pred_int = max(pred_int, 1)
    if age > 60 and income < 5.0:
        pred_int = max(pred_int, 2)
        
    return str(pred_int)

# 2. Prediction Route (Raw API)
@app.post("/predict")
def predict_premium(data: UserInput):
    input_df = pd.DataFrame([
        {
            "bmi": data.bmi,
            "age_group": data.age_group,
            "lifestyle_risk": data.lifestyle_risk,
            "city_tier": data.city_tier,
            "income_lpa": data.income_lpa,
            "occupation": data.occupation,
        }
    ])

    prediction_raw = str(model.predict(input_df)[0])
    mapping = {"Low": "0", "Medium": "1", "High": "2", "Critical": "3"}
    prediction = mapping.get(prediction_raw, prediction_raw)
    
    prediction = apply_actuarial_overrides(prediction, data.bmi, data.smoker, data.age, data.income_lpa)
    
    return JSONResponse(
        status_code=200,
        content={
            "predicted_category": prediction,
            "recommended_plans": get_indian_plans(prediction)
        }
    )

# 2b. Batch Prediction Route (Actuarial Stress Testing)
class BatchPredictionItem(BaseModel):
    age: int
    weight: float
    height: float
    income_lpa: float
    smoker: bool
    city: str
    occupation: str

    @field_validator("city", mode="before")
    @classmethod
    def normalize_city(cls, v):
        if isinstance(v, str):
            return v.strip().title()
        return v

@app.post("/batch/predict")
def batch_predict(items: list[BatchPredictionItem]):
    if not items:
        return {"predictions": []}
        
    records = []
    for x in items:
        bmi = float(round(x.weight / (x.height ** 2), 2))
        
        if x.smoker and bmi > 30:
            lifestyle_risk = "high"
        elif x.smoker or bmi > 27:
            lifestyle_risk = "medium"
        else:
            lifestyle_risk = "low"
            
        if x.age < 25:
            age_group = "young"
        elif x.age < 45:
            age_group = "adult"
        elif x.age < 60:
            age_group = "middle_aged"
        else:
            age_group = "senior"
            
        if x.city in tier_1_cities:
            city_tier = 1
        elif x.city in tier_2_cities:
            city_tier = 2
        else:
            city_tier = 3
            
        records.append({
            "bmi": bmi,
            "age_group": age_group,
            "lifestyle_risk": lifestyle_risk,
            "city_tier": city_tier,
            "income_lpa": x.income_lpa,
            "occupation": x.occupation,
        })
        
    input_df = pd.DataFrame(records)
    predictions = model.predict(input_df)
    
    mapping = {"Low": "0", "Medium": "1", "High": "2", "Critical": "3"}
    mapped_predictions = []
    for i, p in enumerate(predictions):
        base_pred = mapping.get(str(p), str(p))
        final_pred = apply_actuarial_overrides(base_pred, records[i]['bmi'], items[i].smoker, items[i].age, items[i].income_lpa)
        mapped_predictions.append(final_pred)
    
    return {"predictions": mapped_predictions}


# 3. Banker Credit Score Evaluation
@app.post("/bank/evaluate")
def evaluate_bank_risk(data: BankEvaluationRequest):
    # Calculate properties manually
    bmi = float(round(data.weight / (data.height ** 2), 2))
    
    if data.smoker and bmi > 30:
        lifestyle_risk = "high"
    elif data.smoker or bmi > 27:
        lifestyle_risk = "medium"
    else:
        lifestyle_risk = "low"
        
    if data.age < 25:
        age_group = "young"
    elif data.age < 45:
        age_group = "adult"
    elif data.age < 60:
        age_group = "middle_aged"
    else:
        age_group = "senior"
        
    if data.city in tier_1_cities:
        city_tier = 1
    elif data.city in tier_2_cities:
        city_tier = 2
    else:
        city_tier = 3
        
    # Execute Model prediction
    input_df = pd.DataFrame([
        {
            "bmi": bmi,
            "age_group": age_group,
            "lifestyle_risk": lifestyle_risk,
            "city_tier": city_tier,
            "income_lpa": data.income_lpa,
            "occupation": data.occupation,
        }
    ])
    
    prediction_raw = str(model.predict(input_df)[0])
    mapping = {"Low": "0", "Medium": "1", "High": "2", "Critical": "3"}
    prediction = mapping.get(prediction_raw, prediction_raw)
    
    prediction = apply_actuarial_overrides(prediction, bmi, data.smoker, data.age, data.income_lpa)
    
    # Debt-To-Income Calculations (Income in LPA. 1 LPA = 100,000 / 12 = 8,333.33 per month)
    monthly_income = (data.income_lpa * 100000) / 12
    monthly_debt = data.existing_debt
    
    dti_ratio = 0.0
    if monthly_income > 0:
        dti_ratio = float(round((monthly_debt / monthly_income) * 100, 2))
        
    # Base Loan Interest Rate
    base_rate = 7.0
    
    # Credit Score markup adjustments
    credit_markup = 0.0
    if data.credit_score < 580:
        credit_markup = 4.5
        credit_health = "Subprime / High Default Risk"
    elif data.credit_score < 670:
        credit_markup = 2.5
        credit_health = "Fair / Moderate Risk"
    elif data.credit_score < 740:
        credit_markup = 1.0
        credit_health = "Prime / Standard approved"
    elif data.credit_score < 800:
        credit_markup = 0.0
        credit_health = "Superprime / Highly Preferred"
    else:
        credit_markup = -0.5
        credit_health = "Exceptional Prime / Preferred"
        
    # Medical Premium Category markup factor (Hedges default risks)
    medical_markup = 0.0
    pred_lower = prediction.lower()
    if "medium" in pred_lower:
        medical_markup = 1.5
    elif "high" in pred_lower:
        medical_markup = 3.0
        
    final_interest_rate = float(round(base_rate + credit_markup + medical_markup, 2))
    
    # Monthly financed premium EMI amortizations over 5 years (60 months)
    r_monthly = (final_interest_rate / 12) / 100
    n_months = 60
    p = data.requested_loan
    
    emi = 0.0
    if r_monthly > 0:
        emi = float(round((p * r_monthly * ((1 + r_monthly) ** n_months)) / (((1 + r_monthly) ** n_months) - 1), 2))
    else:
        emi = float(round(p / n_months, 2))
        
    # Approval Verdict
    if dti_ratio > 50 or data.credit_score < 500:
        approval_status = "Declined"
        approval_reason = "Debt ratio exceeds limits or subprime credit score below 500."
    elif dti_ratio > 40:
        approval_status = "Conditional Approval"
        approval_reason = "Approved with higher rates due to high debt exposure (DTI > 40%)."
    else:
        approval_status = "Approved"
        approval_reason = "Client satisfies baseline risk limits."
        
    return {
        "predicted_category": prediction,
        "dti_ratio": dti_ratio,
        "credit_health": credit_health,
        "base_rate": base_rate,
        "credit_markup": credit_markup,
        "medical_markup": medical_markup,
        "final_interest_rate": final_interest_rate,
        "monthly_emi": emi,
        "approval_status": approval_status,
        "approval_reason": approval_reason
    }

# 4. View All Stored Patients
@app.get("/view")
def view_patients():
    return loaddata()

# 5. View Single Patient
@app.get("/patient/{patient_id}")
def view_patient(patient_id: str = Path(..., description="Unique Patient Identifier (e.g., P001)")):
    data = loaddata()
    if patient_id in data:
        return data[patient_id]
    raise HTTPException(status_code=404, detail="Patient NOT FOUND")

# 6. Create Patient
@app.post("/create")
def create_patient(patient: Patient):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM patients WHERE id = ?", (patient.id,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Patient with this ID already exists.")
    
    cursor.execute("""
        INSERT INTO patients (
            id, name, city, age, weight, gender, height, income_lpa, smoker, occupation, bmi, lifestyle_risk, age_group, city_tier, verdict
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        patient.id,
        patient.name,
        patient.city,
        patient.age,
        patient.weight,
        patient.gender,
        patient.height,
        patient.income_lpa,
        1 if patient.smoker else 0,
        patient.occupation,
        patient.bmi,
        patient.lifestyle_risk,
        patient.age_group,
        patient.city_tier,
        patient.verdict
    ))
    conn.commit()
    conn.close()
    
    return JSONResponse(
        status_code=201, 
        content={"message": "Patient created successfully.", "patient_id": patient.id}
    )

# 7. Update Patient
@app.put("/update/{patient_id}")
def update_patient(patient_id: str, patient_update: PatientUpdate):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, city, age, weight, gender, height, income_lpa, smoker, occupation FROM patients WHERE id = ?", (patient_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Patient NOT FOUND")
        
    existing = {
        "id": row[0],
        "name": row[1],
        "city": row[2],
        "age": row[3],
        "weight": row[4],
        "gender": row[5],
        "height": row[6],
        "income_lpa": row[7],
        "smoker": bool(row[8]),
        "occupation": row[9]
    }
    
    update_dict = patient_update.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        existing[key] = value

    patient_obj = Patient(**existing)
    
    cursor.execute("""
        UPDATE patients SET
            name = ?, city = ?, age = ?, weight = ?, gender = ?, height = ?, income_lpa = ?, smoker = ?, occupation = ?,
            bmi = ?, lifestyle_risk = ?, age_group = ?, city_tier = ?, verdict = ?
        WHERE id = ?
    """, (
        patient_obj.name,
        patient_obj.city,
        patient_obj.age,
        patient_obj.weight,
        patient_obj.gender,
        patient_obj.height,
        patient_obj.income_lpa,
        1 if patient_obj.smoker else 0,
        patient_obj.occupation,
        patient_obj.bmi,
        patient_obj.lifestyle_risk,
        patient_obj.age_group,
        patient_obj.city_tier,
        patient_obj.verdict,
        patient_id
    ))
    conn.commit()
    conn.close()
    
    return JSONResponse(
        status_code=200, 
        content={"message": "Patient updated successfully.", "patient_id": patient_id}
    )

# 8. Delete Patient
@app.delete("/delete/{patient_id}")
def delete_patient(patient_id: str):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM patients WHERE id = ?", (patient_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Patient NOT FOUND")
    
    cursor.execute("DELETE FROM patients WHERE id = ?", (patient_id,))
    conn.commit()
    conn.close()
    return JSONResponse(
        status_code=200, 
        content={"message": "Patient deleted successfully.", "patient_id": patient_id}
    )

# 8b. Bulk Import Patients
class BulkImportResponse(BaseModel):
    imported_count: int
    errors: list[str]

@app.post("/import", response_model=BulkImportResponse)
def import_patients(patients_list: list[Patient]):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    imported_count = 0
    errors = []
    
    for patient in patients_list:
        try:
            cursor.execute("SELECT id FROM patients WHERE id = ?", (patient.id,))
            if cursor.fetchone():
                cursor.execute("""
                    UPDATE patients SET
                        name = ?, city = ?, age = ?, weight = ?, gender = ?, height = ?, income_lpa = ?, smoker = ?, occupation = ?,
                        bmi = ?, lifestyle_risk = ?, age_group = ?, city_tier = ?, verdict = ?
                    WHERE id = ?
                """, (
                    patient.name,
                    patient.city,
                    patient.age,
                    patient.weight,
                    patient.gender,
                    patient.height,
                    patient.income_lpa,
                    1 if patient.smoker else 0,
                    patient.occupation,
                    patient.bmi,
                    patient.lifestyle_risk,
                    patient.age_group,
                    patient.city_tier,
                    patient.verdict,
                    patient.id
                ))
            else:
                cursor.execute("""
                    INSERT INTO patients (
                        id, name, city, age, weight, gender, height, income_lpa, smoker, occupation, bmi, lifestyle_risk, age_group, city_tier, verdict
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    patient.id,
                    patient.name,
                    patient.city,
                    patient.age,
                    patient.weight,
                    patient.gender,
                    patient.height,
                    patient.income_lpa,
                    1 if patient.smoker else 0,
                    patient.occupation,
                    patient.bmi,
                    patient.lifestyle_risk,
                    patient.age_group,
                    patient.city_tier,
                    patient.verdict
                ))
            imported_count += 1
        except Exception as e:
            errors.append(f"Patient {patient.id}: {str(e)}")
            
    conn.commit()
    conn.close()
    return {"imported_count": imported_count, "errors": errors}

# 9. Sort Patients
@app.get("/sort")
def sort_patients(
    sort_by: str = Query(..., description="Sort parameter basis"),
    order: str = Query("asc", description="asc or desc")
):
    valid_fields = ["height", "weight", "bmi", "age", "income_lpa"]
    if sort_by not in valid_fields:
        raise HTTPException(status_code=400, detail=f"Invalid sort parameter. Valid fields are {valid_fields}")
    
    if order not in ["asc", "desc"]:
        raise HTTPException(status_code=400, detail="Order parameter must be 'asc' or 'desc'")
        
    data = loaddata()
    
    records = []
    for k, v in data.items():
        item = v.copy()
        item['id'] = k
        records.append(item)
        
    sorted_records = sorted(
        records,
        key=lambda x: x.get(sort_by, 0),
        reverse=(order == "desc")
    )
    
    return sorted_records