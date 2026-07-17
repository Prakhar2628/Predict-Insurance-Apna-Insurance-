from pydantic import BaseModel, EmailStr,computed_field
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
    @computed_field
    @property
    def calculate_bmi(self) -> float:
        height_in_meters = 1.75
        bmi = self.weight / (height_in_meters ** 2)
        return round(bmi, 2)

# Sample data
patient_info = {
    "name": "John Doe",
    "email": "john@gmail.com",
    "age": 30,
    "weight": 72.5,
    "married": False,
    "allergies": ["Dust", "Pollen"],
    "contact_details": {
        "phone": "9876543210",
        "city": "Delhi"
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
print("BMI:", patient.calculate_bmi) 