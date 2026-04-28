from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class CounterpartyCreate(BaseModel):
    company: Optional[str] = None
    entity_type: Optional[str] = None
    name: str
    inn: Optional[str] = None
    kpp: Optional[str] = None
    ogrn: Optional[str] = None
    legal_address: Optional[str] = None
    bank_name: Optional[str] = None
    bik: Optional[str] = None
    payment_account: Optional[str] = None
    correspondent_account: Optional[str] = None
    signer_full_name: Optional[str] = None
    signer_position: Optional[str] = None
    signer_basis: Optional[str] = None


class CounterpartyUpdate(BaseModel):
    company: Optional[str] = None
    entity_type: Optional[str] = None
    name: Optional[str] = None
    inn: Optional[str] = None
    kpp: Optional[str] = None
    ogrn: Optional[str] = None
    legal_address: Optional[str] = None
    bank_name: Optional[str] = None
    bik: Optional[str] = None
    payment_account: Optional[str] = None
    correspondent_account: Optional[str] = None
    signer_full_name: Optional[str] = None
    signer_position: Optional[str] = None
    signer_basis: Optional[str] = None


class CounterpartyRead(CounterpartyCreate):
    id: int

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    full_name: str
    position: Optional[str] = None
    login: str
    password: str
    role: str = "manager"


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    position: Optional[str] = None
    login: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserRead(BaseModel):
    id: int
    full_name: str
    position: Optional[str] = None
    login: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    login: str
    password: str


class LoginResponse(BaseModel):
    user: UserRead


class ActivityLogRead(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_name: str
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    entity_name: Optional[str] = None
    details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True