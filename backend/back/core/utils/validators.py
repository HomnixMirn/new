import re

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def phone_number_validator(phone_number):
    pattern = r'^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$'
    '+7 (901) 041-44-21'
    return re.match(pattern, phone_number) is not None
        