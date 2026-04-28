from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Counterparty(Base):
    __tablename__ = "counterparties"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    company: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    entity_type: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    inn: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    kpp: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    ogrn: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)

    legal_address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    bank_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    bik: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    payment_account: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    correspondent_account: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    signer_full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    signer_position: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    signer_basis: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AppUser(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    position: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    login: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    role: Mapped[str] = mapped_column(String(32), default="manager", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    user_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    user_name: Mapped[str] = mapped_column(String(255), default="Система", nullable=False)

    action: Mapped[str] = mapped_column(String(64), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(64), nullable=False)
    entity_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    entity_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)