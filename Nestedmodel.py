from pydantic import BaseModel

# Nested Model
class Address(BaseModel):
    city: str
    state: str
    pin_code: int


# Main Model
class Patient(BaseModel):
    name: str
    gender: str
    age: int
    address: Address


# Step 1: Create a dictionary for Address
address_dict = {
    "city": "Gurgaon",
    "state": "Haryana",
    "pin_code": 122002
}

# Step 2: Create an Address object
address1 = Address(**address_dict)

# Step 3: Create Patient data using the Address object
patient_info = {
    "name": "John Doe",
    "gender": "Male",
    "age": 30,
    "address": address1      # Pass the object, not a string
}

# Step 4: Create Patient object
patient = Patient(**patient_info)

# Print complete object
print(patient)

print("\nPatient Name:", patient.name)
print("Gender:", patient.gender)
print("Age:", patient.age)

print("\nAddress Details")
print("City:", patient.address.city)
print("State:", patient.address.state)
print("Pin Code:", patient.address.pin_code)
temp=patient.model_dump_json()
print(temp)
print(type(temp))
#include for only to include certain parameter and export means to export certain parameter