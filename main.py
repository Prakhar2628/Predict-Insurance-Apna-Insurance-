from fastapi import FastAPI,Path,HTTPException,Query
import json
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr,computed_field,Field
from typing import List, Dict,Annotated,Literal, Optional

import pydantic
app=FastAPI()
class Patient(BaseModel):
    id: Annotated[str,Field(...,description="The ID of the patient",example="P001")]
    name: Annotated[str, Field(..., min_length=3, max_length=50, description="Name of the patient", example="John Doe")]
    city: Annotated[str, Field(..., min_length=3, max_length=50, description="City of the patient", example="Delhi")]
    age: Annotated[int,Field(gt=0,description="Age of the patient in years",example=30)]
    weight: Annotated[float,Field(gt=0,strict=True,description="Weight of the patient in kg",example=70.5)]
    gender: Annotated[Literal["male","female","others"],Field(...,description="Gender of the patient",example="Male")]
    height: Annotated[float,Field(gt=0,description="Height of the patient in meters",example=1.75)]
    @computed_field
    @property  
    def calculate_bmi(self) -> float:
        bmi = self.weight / (self.height ** 2)    
        return round(bmi, 2)
    @computed_field
    @property
    def verdict(self)->str:
        if self.calculate_bmi < 18.5:
            return "Underweight"
        elif 18.5 <= self.calculate_bmi < 24.9:
            return "Normal weight"  
        elif 25 <= self.calculate_bmi < 29.9:
            return "Overweight"
        else:
            return "Obesity" 
class PatientUpdate(BaseModel):
    name:Annotated[Optional[str],Field(default=None)]
    city:Annotated[Optional[str],Field(default=None)]
    age:Annotated[Optional[int],Field(default=None,gt=0)] 
    gender:Annotated[Optional[Literal["Male","Female","others"]],Field(default=None)]
    height:Annotated[Optional[float],Field(default=None,gt=0)]
    weight:Annotated[Optional[float],Field(default=None,gt=0,strict=True)]
def loaddata():
    with open('patients.json','r') as f:
        data = json.load(f)
        return data
@app.get("/")
def hello():
    return {"message": "Patient Management System API"} 
@app.get('/about')
def about():
    return {"message": "A fully funcional API to manage your patient records."}
@app.get('/view')
def view():
    return loaddata()
@app.get('/patient/{patient_id}')
def view_patient(patient_id:str=Path(...,description="The ID of the patient to retrieve",example="P001")):
    #load all data
    data = loaddata()
    #search for patient with the given id
    if patient_id in data:
        return data[patient_id]
    raise HTTPException(status_code=404,detail="Patient NOT FOUND")
@app.get("/sort")
def sortpatients(
    sort_by: str = Query(..., description="Sort on the basis of height, weight, or bmi"),
    order: str = Query("asc", description="Sort in ascending or descending order")
):
    valid_fields = ["height", "weight", "bmi"]

    if sort_by not in valid_fields:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid sort field. Valid fields are {valid_fields}"
        )

    if order not in ["asc", "desc"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid order. Valid orders are 'asc' or 'desc'"
        )

    data = loaddata()

    sorted_data = sorted(
        data.values(),
        key=lambda x: x[sort_by],
        reverse=(order == "desc")
    )

    return sorted_data
@app.post('/create')
def create_patient(patient: Patient):
    data = loaddata()
    if patient.id in data:
        raise HTTPException(status_code=400, detail="Patient with this ID already exists.")
    
    # Convert the Patient object to a dictionary and add it to the data
    data[patient.id] = patient.model_dump(exclude=['id'])   
    
    # Save the updated data back to the JSON file
    with open('patients.json', 'w') as f:
        json.dump(data, f)
    
    return JSONResponse(status_code=201, content={"message": "Patient created successfully.", "patient_id": patient.id})
@app.put('/update/{patient_id}')
def update_patient(patient_id: str, patient_update: PatientUpdate):
    data = loaddata()
    
    if patient_id not in data:
        raise HTTPException(status_code=404, detail="Patient NOT FOUND")
    
    # Update the existing patient data with the new values
    existing_patient = data[patient_id]
    updated_data = patient_update.model_dump(exclude_unset=True)
    
    for key, value in updated_data.items():
        existing_patient[key] = value
    #existing_patient->pydantic object ->updated bmi+verdict
    existing_patient['id'] = patient_id
    Patient_obj = Patient(**existing_patient)
    #pydantic object->dict
    data[patient_id] = Patient_obj.model_dump(exclude=['id'])

    # Save the updated data back to the JSON file
    with open('patients.json', 'w') as f:
        json.dump(data, f)
    
    return JSONResponse(status_code=200, content={"message": "Patient updated successfully.", "patient_id": patient_id})
@app.delete('/delete/{patient_id}')
def delete_patient(patient_id: str):
    data = loaddata()
    
    if patient_id not in data:
        raise HTTPException(status_code=404, detail="Patient NOT FOUND")
    
    # Remove the patient from the data
    del data[patient_id]
    
    # Save the updated data back to the JSON file
    with open('patients.json', 'w') as f:
        json.dump(data, f)
    
    return JSONResponse(status_code=200, content={"message": "Patient deleted successfully.", "patient_id": patient_id})