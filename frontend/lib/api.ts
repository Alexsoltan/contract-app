import type { Counterparty } from "./types";

const API_URL = "/api";

export type AppUser = {
  id: number;
  full_name: string;
  position?: string | null;
  login: string;
  role: "admin" | "manager";
  is_active: boolean;
  created_at: string;
};

export type UserCreatePayload = {
  full_name: string;
  position?: string;
  login: string;
  password: string;
  role: "admin" | "manager";
};

export type UserUpdatePayload = Partial<UserCreatePayload> & {
  is_active?: boolean;
};

export type ActivityLog = {
  id: number;
  user_id?: number | null;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id?: number | null;
  entity_name?: string | null;
  details?: string | null;
  created_at: string;
};

export type ActivityLogsResponse = {
  items: ActivityLog[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export async function login(login: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ login, password }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || "Ошибка авторизации");
  }

  return result.user as AppUser;
}

export async function getCounterparties() {
  const response = await fetch(`${API_URL}/counterparties`);
  return response.json();
}

export async function createCounterparty(data: Omit<Counterparty, "id">) {
  await fetch(`${API_URL}/counterparties`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateCounterparty(
  id: number,
  data: Omit<Counterparty, "id">
) {
  await fetch(`${API_URL}/counterparties/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
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

export function downloadFrameworkContract(counterpartyId: number) {
  window.open(
    `${API_URL}/documents/generate/framework-contract/${counterpartyId}`,
    "_blank"
  );
}

export async function getUsers(): Promise<AppUser[]> {
  const response = await fetch(`${API_URL}/users`);
  return response.json();
}

export async function createUser(data: UserCreatePayload): Promise<AppUser> {
  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || "Не удалось создать пользователя");
  }

  return result;
}

export async function updateUser(
  id: number,
  data: UserUpdatePayload
): Promise<AppUser> {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || "Не удалось обновить пользователя");
  }

  return result;
}

export async function deleteUser(id: number) {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.detail || "Не удалось удалить пользователя");
  }

  return result;
}

export async function getActivityLogs(
  page: number,
  pageSize = 10
): Promise<ActivityLogsResponse> {
  const response = await fetch(
    `${API_URL}/activity-logs?page=${page}&page_size=${pageSize}`
  );

  return response.json();
}