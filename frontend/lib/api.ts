import type { Counterparty } from "./types";

const API_URL = "http://127.0.0.1:8000";

export async function getCounterparties() {
  const response = await fetch(`${API_URL}/counterparties`);
  return response.json();
}

export async function createCounterparty(data: Omit<Counterparty, "id">) {
  await fetch(`${API_URL}/counterparties`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function updateCounterparty(
  id: number,
  data: Omit<Counterparty, "id">
) {
  await fetch(`${API_URL}/counterparties/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function deleteCounterparty(id: number) {
  await fetch(`${API_URL}/counterparties/${id}`, {
    method: "DELETE",
  });
}

export async function extractCounterpartyFromPdf(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/counterparties/extract-from-pdf`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || "Не удалось распознать PDF");
  }

  return result.data;
}