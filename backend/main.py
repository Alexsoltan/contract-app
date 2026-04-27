import re
from io import BytesIO

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import select
from pypdf import PdfReader

from database import Base, engine, get_db
from models import Counterparty
from schemas import CounterpartyCreate, CounterpartyRead, CounterpartyUpdate


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Contract Generator API",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------
# ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
# ------------------------

def find_value(pattern: str, text: str):
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return ""


def extract_counterparty_data(text: str):
    clean_text = re.sub(r"\s+", " ", text).strip()

    def find(pattern: str):
        match = re.search(pattern, clean_text, re.IGNORECASE)
        return match.group(1).strip(" ,.") if match else ""

    name = find(
        r"Название организации\s+(.+?)\s+Юридический адрес организации"
    )

    if not name:
        name = find(
            r"(ИНДИВИДУАЛЬНЫЙ ПРЕДПРИНИМАТЕЛЬ\s+[А-ЯЁа-яё\s]+|ИП\s+[А-ЯЁа-яё\s]+|ООО\s+[«\"A-Za-zА-Яа-яЁё0-9\s\-]+)"
        )

    entity_type = ""
    if "ИНДИВИДУАЛЬНЫЙ ПРЕДПРИНИМАТЕЛЬ" in name.upper() or name.upper().startswith("ИП "):
        entity_type = "ИП"
    elif name.upper().startswith("ООО"):
        entity_type = "ООО"

    inn = find(r"ИНН\s*([0-9]{10,12})")
    kpp = find(r"КПП\s*([0-9]{9})")
    ogrn = find(r"(?:ОГРН|ОГРНИП)\s*([0-9]{13,15})")

    legal_address = find(
        r"Юридический адрес организации\s+(.+?)\s+ИНН"
    )

    payment_account = find(
        r"Расчетный счет\s*([0-9]{20})"
    )

    bank_name = find(
        r"Банк\s+(.+?)\s+БИК"
    )

    bik = find(r"БИК\s*([0-9]{9})")

    correspondent_account = find(
        r"Корреспондентский счет банка\s*([0-9]{20})"
    )

    return {
        "entity_type": entity_type,
        "name": name,
        "inn": inn,
        "kpp": kpp,
        "ogrn": ogrn,
        "legal_address": legal_address,
        "bank_name": bank_name,
        "bik": bik,
        "payment_account": payment_account,
        "correspondent_account": correspondent_account,
        "signer_full_name": "",
        "signer_position": "",
        "signer_basis": "",
    }

    return {
        "name": name,
        "inn": inn,
        "kpp": kpp,
        "ogrn": ogrn,
        "legal_address": legal_address,
        "bank_name": bank_name,
        "bik": bik,
        "payment_account": payment_account,
        "signer_full_name": "",
        "signer_position": "",
        "signer_basis": "",
    }


# ------------------------
# API
# ------------------------

@app.get("/")
def root():
    return {"message": "Contract Generator API работает 🚀"}


@app.post("/counterparties", response_model=CounterpartyRead)
def create_counterparty(
    data: CounterpartyCreate,
    db: Session = Depends(get_db)
):
    counterparty = Counterparty(**data.model_dump())
    db.add(counterparty)
    db.commit()
    db.refresh(counterparty)
    return counterparty


@app.get("/counterparties", response_model=list[CounterpartyRead])
def list_counterparties(
    db: Session = Depends(get_db)
):
    result = db.execute(select(Counterparty).order_by(Counterparty.id.desc()))
    return result.scalars().all()


@app.get("/counterparties/{counterparty_id}", response_model=CounterpartyRead)
def get_counterparty(
    counterparty_id: int,
    db: Session = Depends(get_db)
):
    counterparty = db.get(Counterparty, counterparty_id)

    if not counterparty:
        raise HTTPException(status_code=404, detail="Контрагент не найден")

    return counterparty


@app.put("/counterparties/{counterparty_id}", response_model=CounterpartyRead)
def update_counterparty(
    counterparty_id: int,
    data: CounterpartyUpdate,
    db: Session = Depends(get_db)
):
    counterparty = db.get(Counterparty, counterparty_id)

    if not counterparty:
        raise HTTPException(status_code=404, detail="Контрагент не найден")

    update_data = data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(counterparty, field, value)

    db.commit()
    db.refresh(counterparty)

    return counterparty


@app.delete("/counterparties/{counterparty_id}")
def delete_counterparty(
    counterparty_id: int,
    db: Session = Depends(get_db)
):
    counterparty = db.get(Counterparty, counterparty_id)

    if not counterparty:
        raise HTTPException(status_code=404, detail="Контрагент не найден")

    db.delete(counterparty)
    db.commit()

    return {"message": "Контрагент удалён"}


# ------------------------
# PDF РАСПОЗНАВАНИЕ
# ------------------------

@app.post("/counterparties/extract-from-pdf")
async def extract_from_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Загрузите PDF-файл")

    file_bytes = await file.read()

    reader = PdfReader(BytesIO(file_bytes))
    text = ""

    for page in reader.pages:
        page_text = page.extract_text() or ""
        text += page_text + "\n"

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="Не удалось извлечь текст. Возможно, это скан."
        )

    extracted_data = extract_counterparty_data(text)

    return {
        "filename": file.filename,
        "raw_text_preview": text[:1000],
        "data": extracted_data
    }