import hashlib
import json
import re
import secrets
import shutil
from datetime import datetime
from io import BytesIO
from pathlib import Path
from typing import Optional

import mammoth
from docxtpl import DocxTemplate
from fastapi import Depends, FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from pypdf import PdfReader
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import ActivityLog, AppUser, Counterparty
from schemas import (
    ActivityLogRead,
    CounterpartyCreate,
    CounterpartyRead,
    CounterpartyUpdate,
    LoginRequest,
    LoginResponse,
    UserCreate,
    UserRead,
    UserUpdate,
)


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Contract Generator API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STORAGE_DIR = Path("storage")
TEMPLATES_DIR = STORAGE_DIR / "templates"
DOCUMENTS_DIR = STORAGE_DIR / "documents"
TEMPLATES_META_FILE = TEMPLATES_DIR / "templates.json"

TEMPLATES_DIR.mkdir(parents=True, exist_ok=True)
DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100_000,
    ).hex()

    return f"{salt}${password_hash}"


def verify_password(password: str, stored_hash: str) -> bool:
    if not stored_hash:
        return False

    if "$" not in stored_hash:
        return secrets.compare_digest(password, stored_hash)

    salt, saved_hash = stored_hash.split("$", 1)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100_000,
    ).hex()

    return secrets.compare_digest(password_hash, saved_hash)


def serialize_json(data) -> str:
    return json.dumps(data, ensure_ascii=False, default=str)


def log_action(
    db: Session,
    *,
    action: str,
    entity_type: str,
    entity_id: Optional[int] = None,
    entity_name: Optional[str] = None,
    details: Optional[dict] = None,
    user_id: Optional[int] = None,
    user_name: str = "Администратор",
):
    log = ActivityLog(
        user_id=user_id,
        user_name=user_name,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        entity_name=entity_name,
        details=serialize_json(details) if details else None,
    )

    db.add(log)


def create_default_admin_if_needed():
    db = next(get_db())

    try:
        existing_admin = db.execute(
            select(AppUser).where(AppUser.login == "admin")
        ).scalar_one_or_none()

        if existing_admin:
            return

        admin = AppUser(
            full_name="Александр Солтан",
            position="Основатель",
            login="admin",
            password_hash=hash_password("1234"),
            role="admin",
            is_active=True,
        )

        db.add(admin)
        db.commit()
    finally:
        db.close()


create_default_admin_if_needed()


def read_templates_meta():
    if not TEMPLATES_META_FILE.exists():
        return {
            "framework_contract": {
                "id": "framework_contract",
                "title": "Рамочный договор",
                "description": "Типовой договор с контрагентом",
                "active_version": None,
                "versions": [],
            }
        }

    with open(TEMPLATES_META_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def write_templates_meta(data):
    with open(TEMPLATES_META_FILE, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)


def safe_filename(value: str):
    cleaned = re.sub(r"[^A-Za-zА-Яа-яЁё0-9_-]+", "_", value)
    return cleaned.strip("_")[:80] or "document"


def get_active_framework_template_path():
    meta = read_templates_meta()
    template = meta["framework_contract"]

    if not template["active_version"] or not template["versions"]:
        raise HTTPException(
            status_code=404,
            detail="Сначала загрузите шаблон рамочного договора",
        )

    active_file = template["versions"][0]["filename"]
    file_path = TEMPLATES_DIR / active_file

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Файл шаблона не найден")

    return file_path


def extract_counterparty_data(text: str):
    clean_text = re.sub(r"\s+", " ", text).strip()

    def find(pattern: str):
        match = re.search(pattern, clean_text, re.IGNORECASE)
        return match.group(1).strip(" ,.") if match else ""

    name = find(r"Название организации\s+(.+?)\s+Юридический адрес организации")

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
    legal_address = find(r"Юридический адрес организации\s+(.+?)\s+ИНН")
    payment_account = find(r"Расчетный счет\s*([0-9]{20})")
    bank_name = find(r"Банк\s+(.+?)\s+БИК")
    bik = find(r"БИК\s*([0-9]{9})")
    correspondent_account = find(r"Корреспондентский счет банка\s*([0-9]{20})")

    return {
        "company": "",
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


@app.get("/")
def root():
    return {"message": "Contract Generator API работает 🚀"}


@app.post("/auth/login", response_model=LoginResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.execute(
        select(AppUser).where(AppUser.login == data.login)
    ).scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Пользователь заблокирован")

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")

    log_action(
        db,
        action="Вход",
        entity_type="Пользователь",
        entity_id=user.id,
        entity_name=user.full_name,
        user_id=user.id,
        user_name=user.full_name,
    )

    db.commit()
    db.refresh(user)

    return {"user": user}


@app.get("/users", response_model=list[UserRead])
def list_users(db: Session = Depends(get_db)):
    result = db.execute(select(AppUser).order_by(AppUser.id.desc()))
    return result.scalars().all()


@app.post("/users", response_model=UserRead)
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.execute(
        select(AppUser).where(AppUser.login == data.login)
    ).scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Пользователь с таким логином уже существует",
        )

    user = AppUser(
        full_name=data.full_name,
        position=data.position,
        login=data.login,
        password_hash=hash_password(data.password),
        role=data.role,
        is_active=True,
    )

    db.add(user)
    db.flush()

    log_action(
        db,
        action="Создание",
        entity_type="Пользователь",
        entity_id=user.id,
        entity_name=user.full_name,
        details={
            "login": user.login,
            "role": user.role,
        },
    )

    db.commit()
    db.refresh(user)

    return user


@app.put("/users/{user_id}", response_model=UserRead)
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
    user = db.get(AppUser, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    update_data = data.model_dump(exclude_unset=True)
    details = {}

    if "login" in update_data and update_data["login"] != user.login:
        existing_user = db.execute(
            select(AppUser).where(AppUser.login == update_data["login"])
        ).scalar_one_or_none()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Пользователь с таким логином уже существует",
            )

    if "password" in update_data and update_data["password"]:
        user.password_hash = hash_password(update_data["password"])
        details["password"] = "changed"

    for field, value in update_data.items():
        if field == "password":
            continue

        old_value = getattr(user, field)
        setattr(user, field, value)

        if old_value != value:
            details[field] = {
                "old": old_value,
                "new": value,
            }

    log_action(
        db,
        action="Изменение",
        entity_type="Пользователь",
        entity_id=user.id,
        entity_name=user.full_name,
        details=details,
    )

    db.commit()
    db.refresh(user)

    return user


@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(AppUser, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    entity_name = user.full_name
    entity_login = user.login
    entity_role = user.role

    db.delete(user)

    log_action(
        db,
        action="Удаление",
        entity_type="Пользователь",
        entity_id=user_id,
        entity_name=entity_name,
        details={
            "login": entity_login,
            "role": entity_role,
        },
    )

    db.commit()

    return {"message": "Пользователь удалён"}


@app.get("/activity-logs", response_model=dict)
def list_activity_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    total = db.execute(select(func.count(ActivityLog.id))).scalar_one()

    result = db.execute(
        select(ActivityLog)
        .order_by(ActivityLog.created_at.desc(), ActivityLog.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    items = result.scalars().all()

    return {
        "items": [ActivityLogRead.model_validate(item).model_dump() for item in items],
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": max(1, (total + page_size - 1) // page_size),
    }


@app.post("/counterparties", response_model=CounterpartyRead)
def create_counterparty(data: CounterpartyCreate, db: Session = Depends(get_db)):
    counterparty = Counterparty(**data.model_dump())
    db.add(counterparty)
    db.flush()

    log_action(
        db,
        action="Создание",
        entity_type="Контрагент",
        entity_id=counterparty.id,
        entity_name=counterparty.name,
        details=data.model_dump(),
    )

    db.commit()
    db.refresh(counterparty)

    return counterparty


@app.get("/counterparties", response_model=list[CounterpartyRead])
def list_counterparties(db: Session = Depends(get_db)):
    result = db.execute(select(Counterparty).order_by(Counterparty.id.desc()))
    return result.scalars().all()


@app.get("/counterparties/{counterparty_id}", response_model=CounterpartyRead)
def get_counterparty(counterparty_id: int, db: Session = Depends(get_db)):
    counterparty = db.get(Counterparty, counterparty_id)

    if not counterparty:
        raise HTTPException(status_code=404, detail="Контрагент не найден")

    return counterparty


@app.put("/counterparties/{counterparty_id}", response_model=CounterpartyRead)
def update_counterparty(
    counterparty_id: int,
    data: CounterpartyUpdate,
    db: Session = Depends(get_db),
):
    counterparty = db.get(Counterparty, counterparty_id)

    if not counterparty:
        raise HTTPException(status_code=404, detail="Контрагент не найден")

    update_data = data.model_dump(exclude_unset=True)
    details = {}

    for field, value in update_data.items():
        old_value = getattr(counterparty, field)

        if old_value != value:
            details[field] = {
                "old": old_value,
                "new": value,
            }

            setattr(counterparty, field, value)

    log_action(
        db,
        action="Изменение",
        entity_type="Контрагент",
        entity_id=counterparty.id,
        entity_name=counterparty.name,
        details=details,
    )

    db.commit()
    db.refresh(counterparty)

    return counterparty


@app.delete("/counterparties/{counterparty_id}")
def delete_counterparty(counterparty_id: int, db: Session = Depends(get_db)):
    counterparty = db.get(Counterparty, counterparty_id)

    if not counterparty:
        raise HTTPException(status_code=404, detail="Контрагент не найден")

    entity_name = counterparty.name

    db.delete(counterparty)

    log_action(
        db,
        action="Удаление",
        entity_type="Контрагент",
        entity_id=counterparty_id,
        entity_name=entity_name,
    )

    db.commit()

    return {"message": "Контрагент удалён"}


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
            detail="Не удалось извлечь текст. Возможно, это скан.",
        )

    extracted_data = extract_counterparty_data(text)

    return {
        "filename": file.filename,
        "raw_text_preview": text[:1000],
        "data": extracted_data,
    }


@app.get("/templates")
def list_templates():
    meta = read_templates_meta()
    return list(meta.values())


@app.post("/templates/framework-contract/upload")
async def upload_framework_contract_template(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename.lower().endswith(".docx"):
        raise HTTPException(status_code=400, detail="Загрузите файл в формате DOCX")

    meta = read_templates_meta()
    template = meta["framework_contract"]

    version_number = len(template["versions"]) + 1
    version = f"v{version_number}"

    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    filename = f"framework_contract_{version}_{timestamp}.docx"
    file_path = TEMPLATES_DIR / filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    version_data = {
        "version": version,
        "filename": filename,
        "original_filename": file.filename,
        "uploaded_at": datetime.utcnow().isoformat(),
    }

    template["active_version"] = version
    template["versions"].insert(0, version_data)

    meta["framework_contract"] = template
    write_templates_meta(meta)

    log_action(
        db,
        action="Загрузка",
        entity_type="Шаблон",
        entity_name=template["title"],
        details=version_data,
    )

    db.commit()

    return template


@app.get("/templates/framework-contract/download")
def download_framework_contract_template():
    file_path = get_active_framework_template_path()

    return FileResponse(
        path=file_path,
        filename=file_path.name,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )


@app.get("/templates/framework-contract/preview", response_class=HTMLResponse)
def preview_framework_contract_template():
    file_path = get_active_framework_template_path()

    with open(file_path, "rb") as docx_file:
        result = mammoth.convert_to_html(docx_file)
        html = result.value

    return f"""
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {{
            margin: 0;
            padding: 32px;
            font-family: Arial, sans-serif;
            color: #111;
            background: #fff;
            line-height: 1.55;
          }}

          p {{
            margin: 0 0 12px;
          }}

          table {{
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
          }}

          td, th {{
            border: 1px solid #ddd;
            padding: 8px;
            vertical-align: top;
          }}
        </style>
      </head>
      <body>
        {html}
      </body>
    </html>
    """


@app.post("/documents/generate/framework-contract/{counterparty_id}")
def generate_framework_contract(counterparty_id: int, db: Session = Depends(get_db)):
    counterparty = db.get(Counterparty, counterparty_id)

    if not counterparty:
        raise HTTPException(status_code=404, detail="Контрагент не найден")

    template_path = get_active_framework_template_path()
    doc = DocxTemplate(template_path)

    context = {
        "company": counterparty.company or "",
        "counterparty_name": counterparty.name or "",
        "counterparty_type": counterparty.entity_type or "",
        "inn": counterparty.inn or "",
        "kpp": counterparty.kpp or "",
        "ogrn": counterparty.ogrn or "",
        "legal_address": counterparty.legal_address or "",
        "bank_name": counterparty.bank_name or "",
        "bik": counterparty.bik or "",
        "payment_account": counterparty.payment_account or "",
        "correspondent_account": counterparty.correspondent_account or "",
        "signer_full_name": counterparty.signer_full_name or "",
        "signer_position": counterparty.signer_position or "",
        "signer_basis": counterparty.signer_basis or "",
        "contract_date": datetime.now().strftime("%d.%m.%Y"),
        "contract_number": f"{counterparty.id}-{datetime.now().strftime('%Y%m%d')}",
    }

    output_filename = (
        f"framework_contract_"
        f"{safe_filename(counterparty.company or counterparty.name)}_"
        f"{datetime.now().strftime('%Y%m%d_%H%M%S')}.docx"
    )

    output_path = DOCUMENTS_DIR / output_filename

    doc.render(context)
    doc.save(output_path)

    log_action(
        db,
        action="Генерация",
        entity_type="Документ",
        entity_id=counterparty.id,
        entity_name=output_filename,
        details={"counterparty": counterparty.name},
    )

    db.commit()

    return FileResponse(
        path=output_path,
        filename=output_filename,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )