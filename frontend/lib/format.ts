import type { Counterparty } from "./types";

export function formatCounterpartyName(counterparty: Counterparty) {
  const type = counterparty.entity_type || "";

  if (type === "ИП") {
    const cleaned = counterparty.name
      .replace("ИНДИВИДУАЛЬНЫЙ ПРЕДПРИНИМАТЕЛЬ", "")
      .replace(/^ИП\s+/i, "")
      .trim();

    const parts = cleaned.split(/\s+/);

    if (parts.length >= 3) {
      const lastName = parts[0];
      const firstInitial = parts[1]?.[0] ? `${parts[1][0]}.` : "";
      const middleInitial = parts[2]?.[0] ? `${parts[2][0]}.` : "";

      return `ИП ${lastName} ${firstInitial}${middleInitial}`;
    }

    return `ИП ${cleaned}`;
  }

  return counterparty.name;
}