"use client";

import { useEffect, useMemo, useState } from "react";
import { Lock, Plus, Search, UserCheck } from "lucide-react";
import ModalShell from "../../components/ModalShell";
import Input from "../../components/Input";
import {
  ActivityLog,
  AppUser,
  createUser,
  getActivityLogs,
  getUsers,
  updateUser,
} from "../../lib/api";

type SettingsTab = "users" | "activity";

type UserFormState = {
  full_name: string;
  position: string;
  login: string;
  password: string;
  role: "admin" | "manager";
};

const emptyForm: UserFormState = {
  full_name: "",
  position: "",
  login: "",
  password: "",
  role: "manager",
};

const roleLabels = {
  admin: "Администратор",
  manager: "Менеджер",
};

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("users");

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold sm:text-5xl">Настройки</h1>

        <p className="mt-3 max-w-[640px] text-neutral-500">
          Управление пользователями, ролями и журналом действий.
        </p>
      </div>

      <div className="mb-8 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setTab("users")}
          className={
            tab === "users"
              ? "cursor-pointer rounded-2xl bg-black px-5 py-3 text-white"
              : "cursor-pointer rounded-2xl border border-[#deded8] bg-white px-5 py-3 transition hover:bg-[#f3f3f1]"
          }
        >
          Пользователи
        </button>

        <button
          onClick={() => setTab("activity")}
          className={
            tab === "activity"
              ? "cursor-pointer rounded-2xl bg-black px-5 py-3 text-white"
              : "cursor-pointer rounded-2xl border border-[#deded8] bg-white px-5 py-3 transition hover:bg-[#f3f3f1]"
          }
        >
          Журнал действий
        </button>
      </div>

      {tab === "users" ? <UsersPanel /> : <ActivityPanel />}
    </div>
  );
}

function UsersPanel() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    const data = await getUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return users;

    return users.filter((user) => {
      return (
        user.full_name.toLowerCase().includes(value) ||
        (user.position || "").toLowerCase().includes(value) ||
        user.login.toLowerCase().includes(value) ||
        roleLabels[user.role].toLowerCase().includes(value)
      );
    });
  }, [search, users]);

  const updateForm = (field: keyof UserFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCreate = () => {
    setError("");
    setForm(emptyForm);
    setIsCreateOpen(true);
  };

  const openUser = (user: AppUser) => {
    setError("");
    setSelectedUser(user);
    setForm({
      full_name: user.full_name,
      position: user.position || "",
      login: user.login,
      password: "",
      role: user.role,
    });
  };

  const handleCreate = async () => {
    try {
      setError("");

      if (!form.full_name.trim() || !form.login.trim() || !form.password.trim()) {
        setError("Заполните ФИО, логин и пароль");
        return;
      }

      await createUser(form);
      setIsCreateOpen(false);
      setForm(emptyForm);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || "Не удалось создать пользователя");
    }
  };

  const handleSave = async () => {
    if (!selectedUser) return;

    try {
      setError("");

      const payload: any = {
        full_name: form.full_name,
        position: form.position,
        login: form.login,
        role: form.role,
      };

      if (form.password.trim()) {
        payload.password = form.password;
      }

      await updateUser(selectedUser.id, payload);
      setSelectedUser(null);
      setForm(emptyForm);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || "Не удалось сохранить пользователя");
    }
  };

  const toggleStatus = async (user: AppUser) => {
    await updateUser(user.id, {
      is_active: !user.is_active,
    });

    await loadUsers();
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold">Пользователи</h2>

          <p className="mt-2 text-neutral-500">
            Управление пользователями, ролями и доступами.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-white transition hover:bg-[#2a2a2a] sm:w-auto"
        >
          <Plus size={18} />
          Добавить пользователя
        </button>
      </div>

      <div className="mb-6 rounded-2xl border border-[#deded8] bg-[#fafaf8] px-4 py-3">
        <div className="flex items-center gap-3">
          <Search size={18} className="text-neutral-400" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск по имени, логину, роли или должности"
            className="w-full bg-transparent outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white">
        {loading && <p className="p-6 text-neutral-400">Загрузка...</p>}

        {!loading && filteredUsers.length === 0 && (
          <p className="p-6 text-neutral-400">Пользователи не найдены</p>
        )}

        {filteredUsers.map((user) => (
          <div
            key={user.id}
            onClick={() => openUser(user)}
            className="grid cursor-pointer grid-cols-[1fr_44px] gap-3 border-b border-[#f0f0ed] px-5 py-5 transition last:border-b-0 hover:bg-[#fafafa] md:grid-cols-[1fr_180px_160px_140px_80px] md:items-center"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{user.full_name}</p>
              <p className="mt-1 truncate text-sm text-neutral-400">
                {user.position || "Без должности"}
              </p>
            </div>

            <p className="text-sm text-neutral-700">{user.login}</p>
            <p className="text-sm text-neutral-700">{roleLabels[user.role]}</p>

            <span
              className={
                user.is_active
                  ? "text-sm text-green-600"
                  : "text-sm text-red-600"
              }
            >
              {user.is_active ? "Активен" : "Заблокирован"}
            </span>

            <button
              onClick={(event) => {
                event.stopPropagation();
                toggleStatus(user);
              }}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition hover:bg-[#f3f3f1]"
              title={user.is_active ? "Заблокировать" : "Разблокировать"}
            >
              {user.is_active ? <Lock size={18} /> : <UserCheck size={18} />}
            </button>
          </div>
        ))}
      </div>

      {isCreateOpen && (
        <ModalShell>
          <UserModalContent
            title="Новый пользователь"
            description="Добавьте сотрудника и задайте ему роль."
            form={form}
            updateForm={updateForm}
            error={error}
            primaryText="Создать"
            onPrimary={handleCreate}
            secondaryText="Отмена"
            onSecondary={() => setIsCreateOpen(false)}
          />
        </ModalShell>
      )}

      {selectedUser && (
        <ModalShell>
          <UserModalContent
            title={selectedUser.full_name}
            description="Редактирование пользователя, логина, пароля и роли."
            form={form}
            updateForm={updateForm}
            error={error}
            primaryText="Сохранить"
            onPrimary={handleSave}
            secondaryText="Закрыть"
            onSecondary={() => setSelectedUser(null)}
          />
        </ModalShell>
      )}
    </div>
  );
}

function ActivityPanel() {
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    const data = await getActivityLogs(page, 10);
    setLogs(data.items);
    setTotalPages(data.total_pages);
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, [page]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-semibold">Журнал действий</h2>

        <p className="mt-2 text-neutral-500">
          История создания, изменения и удаления данных в приложении.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white">
        {loading && <p className="p-6 text-neutral-400">Загрузка...</p>}

        {!loading && logs.length === 0 && (
          <p className="p-6 text-neutral-400">Пока нет действий</p>
        )}

        {logs.map((log) => (
          <div
            key={log.id}
            className="grid gap-3 border-b border-[#f0f0ed] px-5 py-5 text-sm last:border-b-0 md:grid-cols-[1fr_160px_160px_1fr_180px]"
          >
            <span className="font-medium">{log.user_name}</span>
            <span>{log.action}</span>
            <span className="text-neutral-600">{log.entity_type}</span>
            <span className="text-neutral-600">
              {log.entity_name || "—"}
            </span>
            <span className="text-neutral-400">
              {new Date(log.created_at).toLocaleString()}
            </span>
          </div>
        ))}

        <div className="flex items-center justify-between border-t border-[#ededeb] bg-[#fafaf8] px-5 py-5">
          <button
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={page === 1}
            className="cursor-pointer rounded-xl border border-[#deded8] bg-white px-4 py-2 transition hover:bg-[#f3f3f1] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Назад
          </button>

          <span className="text-sm text-neutral-500">
            Страница {page} из {totalPages}
          </span>

          <button
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={page === totalPages}
            className="cursor-pointer rounded-xl border border-[#deded8] bg-white px-4 py-2 transition hover:bg-[#f3f3f1] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Вперёд
          </button>
        </div>
      </div>
    </div>
  );
}

function UserModalContent({
  title,
  description,
  form,
  updateForm,
  error,
  primaryText,
  onPrimary,
  secondaryText,
  onSecondary,
}: {
  title: string;
  description: string;
  form: UserFormState;
  updateForm: (field: keyof UserFormState, value: string) => void;
  error: string;
  primaryText: string;
  onPrimary: () => void;
  secondaryText: string;
  onSecondary: () => void;
}) {
  return (
    <>
      <div className="px-5 pt-6 pb-5 sm:px-8 sm:pt-8">
        <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>

        <p className="mt-2 text-neutral-500">{description}</p>
      </div>

      <div className="px-5 pb-6 sm:px-8">
        <UserForm form={form} updateForm={updateForm} />

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>

      <div className="sticky bottom-0 flex flex-col gap-3 rounded-b-3xl border-t border-[#ededeb] bg-white px-5 py-5 sm:flex-row sm:px-8">
        <button
          onClick={onPrimary}
          className="flex-1 cursor-pointer rounded-2xl bg-black py-4 text-white transition hover:bg-[#2a2a2a]"
        >
          {primaryText}
        </button>

        <button
          onClick={onSecondary}
          className="flex-1 cursor-pointer rounded-2xl border border-[#deded8] py-4 transition hover:bg-[#f3f3f1]"
        >
          {secondaryText}
        </button>
      </div>
    </>
  );
}

function UserForm({
  form,
  updateForm,
}: {
  form: UserFormState;
  updateForm: (field: keyof UserFormState, value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <Input
        label="ФИО"
        value={form.full_name}
        onChange={(value) => updateForm("full_name", value)}
      />

      <Input
        label="Должность"
        value={form.position}
        onChange={(value) => updateForm("position", value)}
      />

      <Input
        label="Логин"
        value={form.login}
        onChange={(value) => updateForm("login", value)}
      />

      <Input
        label="Пароль"
        type="password"
        value={form.password}
        onChange={(value) => updateForm("password", value)}
      />

      <div>
        <p className="mb-2 text-sm text-neutral-500">Роль</p>

        <div className="grid grid-cols-2 gap-3">
          {(["admin", "manager"] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => updateForm("role", role)}
              className={
                form.role === role
                  ? "cursor-pointer rounded-2xl bg-black px-4 py-4 text-white"
                  : "cursor-pointer rounded-2xl border border-[#deded8] bg-[#fafaf8] px-4 py-4 transition hover:bg-[#f3f3f1]"
              }
            >
              {roleLabels[role]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}