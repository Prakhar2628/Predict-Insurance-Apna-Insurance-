from pydantic import BaseModel, EmailStr,model_validator
from typing import List, Dict

# Create the model
class Patient(BaseModel):
    name: str
    email: EmailStr
    age: int
    weight: float
    married: bool
    allergies: List[str]
    contact_details: Dict[str, str]
    @model_validator(mode="after")
    def validate_emergency_contact(cls, model):
        if model.age > 60 and "emergency_contact" not in model.contact_details:
            raise ValueError("Emergency contact is required for patients above 60 years of age.")
        return model
# Sample data
patient_info = {
    "name": "John Doe",
    "email": "john@gmail.com",
    "age": 65,
    "weight": 72.5,
    "married": False,
    "allergies": ["Dust", "Pollen"],
    "contact_details": {
        "phone": "9876543210",
        "city": "Delhi",
        "emergency_contact": "9876543211"
    }
}

# Create object
patient = Patient(**patient_info)

# Print object
print(patient)

print("\nName:", patient.name)
print("Email:", patient.email)
print("Age:", patient.age)
print("Weight:", patient.weight)
print("Married:", patient.married)
print("Allergies:", patient.allergies)
print("Contact Details:", patient.contact_details)