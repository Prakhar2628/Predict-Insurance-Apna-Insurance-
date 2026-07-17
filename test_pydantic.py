from pydantic import BaseModel, Field,EmailStr,AnyUrl,conint,confloat
from typing import Optional,Annotated
from typing import List, Dict
class Patient(BaseModel):
    name:Annotated[str,Field(...,min_length=3,max_length=50,description="Name of the patient",example=["John Doe","Ram Kumar"])]
    email:EmailStr
    linkdin_url:AnyUrl=None
    age:Annotated[int,Field(gt=0,description="Age of the patient in years",example=30)]
    weight:Annotated[float,Field(gt=0,strict=True,description="Weight of the patient in kg",example=70.5)]
    married:Annotated[bool,Field(default=None,description="Marital status of the patient")]
    allergies:Optional[List[str]]=Field(None,max_length=5,description="List of allergies")
    contact_details:Dict[str,str]
def insert_patient(patient: Patient):
    print(f"Inserting patient: {patient.name}, Age: {patient.age} years, Weight: {patient.weight} kg, Married: {patient.married}, Allergies: {patient.allergies}, Contact Details: {patient.contact_details}")
patient_info={'name': 'John Doe','email': 'john.doe@example.com','linkdin_url': 'https://www.linkedin.com/in/johndoe', 'age': 30, 'weight': 70.5, 'married': True, 'allergies': ['dust','pollen'], 'contact_details': {'email': 'john.doe@example.com', 'phone': '123-456-7890'}} 
patient1=Patient(**patient_info)
insert_patient(patient1) 




