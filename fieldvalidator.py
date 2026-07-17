from pydantic import BaseModel, EmailStr,field_validator
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

    @field_validator("email")
    @classmethod
    def email_validator(cls, v):
        valid_domains = ["hdfc.com", "icici.com", "outlook.com"]

        # Convert EmailStr to string and get the domain
        domain_name = str(v).split("@")[-1]

        if domain_name not in valid_domains:
            raise ValueError(
                f"Invalid email domain. Valid domains are {valid_domains}"
            )

        return v
    @field_validator("name")
    @classmethod
    def transform_name(cls, v):
        return v.upper()  # Convert name to uppercase
      

# Sample data
patient_info = {
    "name": "John Doe",
    "email": "john@hdfc.com",
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