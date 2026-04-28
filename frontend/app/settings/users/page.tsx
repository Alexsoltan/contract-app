"use client";

import { useMemo, useState } from "react";
import { Lock, Plus, Search, UserCheck } from "lucide-react";
import ModalShell from "../../../components/ModalShell";
import Input from "../../../components/Input";

type AppUser = {
  id: number;
  fullName: string;
  position: string;
  login: string;
  password: string;
  role: "Администратор" | "Менеджер";
  status: "active" | "blocked";
};

type UserFormState = {
  fullName: string;
  position: string;
  login: string;
  password: string;
  role: "Администратор" | "Менеджер";
};

const initialUsers: AppUser[] = [
  {
    id: 1,
    fullName: "Александр Солтан",
    position: "Основатель",
    login: "admin",
    password: "1234",
    role: "Администратор",
    status: "active",
  },
];

const emptyForm: UserFormState = {
  fullName: "",
  position: "",
  login: "",
  password: "",
  role: "Менеджер",
};

export default function SettingsUsersPage() {
  const [users, setUsers] = useState<AppUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);

  const filteredUsers = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return users;

    return users.filter((user) => {
      return (
        user.fullName.toLowerCase().includes(value) ||
        user.position.toLowerCase().includes(value) ||
        user.login.toLowerCase().includes(value) ||
        user.role.toLowerCase().includes(value)
      );
    });
  }, [search, users]);

  const updateForm = (field: keyof UserFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCreate = () => {
    setForm(emptyForm);
    setIsCreateOpen(true);
  };

  const openUser = (user: AppUser) => {
    setSelectedUser(user);
    setForm({
      fullName: user.fullName,
      position: user.position,
      login: user.login,
      password: user.password,
      role: user.role,
    });
  };

  const createUser = () => {
    if (!form.fullName.trim() || !form.login.trim() || !form.password.trim()) {
      alert("Заполните ФИО, логин и пароль");
      return;
    }

    setUsers((prev) => [
      {
        id: Date.now(),
        ...form,
        status: "active",
      },
      ...prev,
    ]);

    setForm(emptyForm);
    setIsCreateOpen(false);
  };

  const saveUser = () => {
    if (!selectedUser) return;

    setUsers((prev) =>
      prev.map((user) =>
        user.id === selectedUser.id ? { ...user, ...form } : user
      )
    );

    setForm(emptyForm);
    setSelectedUser(null);
  };

  const toggleStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === "active" ? "blocked" : "active",
            }
          : user
      )
    );
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-semibold sm:text-5xl">Пользователи</h1>

          <p className="mt-3 max-w-[640px] text-neutral-500">
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
        {filteredUsers.length === 0 && (
          <p className="p-6 text-neutral-400">Пользователи не найдены</p>
        )}

        {filteredUsers.map((user) => (
          <div
            key={user.id}
            onClick={() => openUser(user)}
            className="grid cursor-pointer grid-cols-[1fr_44px] gap-3 border-b border-[#f0f0ed] px-5 py-5 transition last:border-b-0 hover:bg-[#fafafa] md:grid-cols-[1fr_180px_160px_140px_80px] md:items-center"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{user.fullName}</p>
              <p className="mt-1 truncate text-sm text-neutral-400">
                {user.position || "Без должности"}
              </p>
            </div>

            <p className="text-sm text-neutral-700">{user.login}</p>
            <p className="text-sm text-neutral-700">{user.role}</p>

            <span
              className={
                user.status === "active"
                  ? "text-sm text-green-600"
                  : "text-sm text-red-600"
              }
            >
              {user.status === "active" ? "Активен" : "Заблокирован"}
            </span>

            <button
              onClick={(event) => {
                event.stopPropagation();
                toggleStatus(user.id);
              }}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition hover:bg-[#f3f3f1]"
              title={
                user.status === "active" ? "Заблокировать" : "Разблокировать"
              }
            >
              {user.status === "active" ? (
                <Lock size={18} />
              ) : (
                <UserCheck size={18} />
              )}
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
            primaryText="Создать"
            onPrimary={createUser}
            secondaryText="Отмена"
            onSecondary={() => setIsCreateOpen(false)}
          />
        </ModalShell>
      )}

      {selectedUser && (
        <ModalShell>
          <UserModalContent
            title={selectedUser.fullName}
            description="Редактирование пользователя, логина, пароля и роли."
            form={form}
            updateForm={updateForm}
            primaryText="Сохранить"
            onPrimary={saveUser}
            secondaryText="Закрыть"
            onSecondary={() => setSelectedUser(null)}
          />
        </ModalShell>
      )}
    </div>
  );
}

function UserModalContent({
  title,
  description,
  form,
  updateForm,
  primaryText,
  onPrimary,
  secondaryText,
  onSecondary,
}: {
  title: string;
  description: string;
  form: UserFormState;
  updateForm: (field: keyof UserFormState, value: string) => void;
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
        value={form.fullName}
        onChange={(value) => updateForm("fullName", value)}
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
          {(["Администратор", "Менеджер"] as const).map((role) => (
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
              {role}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}