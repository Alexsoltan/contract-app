from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class Counterparty(Base):
    __tablename__ = "counterparties"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

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