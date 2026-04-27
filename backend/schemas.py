from typing import Optional
from pydantic import BaseModel


class CounterpartyCreate(BaseModel):
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