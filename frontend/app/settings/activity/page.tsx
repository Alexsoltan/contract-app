"use client";

import { useMemo, useState } from "react";

type LogItem = {
  id: number;
  user: string;
  action: string;
  entity: string;
  entityName: string;
  date: string;
};

const mockLogs: LogItem[] = Array.from({ length: 35 }).map((_, index) => ({
  id: index + 1,
  user: "Александр Солтан",
  action: ["Создание", "Изменение", "Удаление"][index % 3],
  entity: ["Контрагент", "Шаблон", "Документ"][index % 3],
  entityName: ["ИП Резинов Д.Н.", "Рамочный договор", "Договор №1"][
    index % 3
  ],
  date: new Date(Date.now() - index * 1000 * 60 * 12).toLocaleString(),
}));

export default function SettingsActivityPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(mockLogs.length / pageSize);

  const paginatedLogs = useMemo(() => {
    return mockLogs.slice((page - 1) * pageSize, page * pageSize);
  }, [page]);

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold sm:text-5xl">
          Журнал действий
        </h1>

        <p className="mt-3 max-w-[640px] text-neutral-500">
          История создания, изменения и удаления данных в приложении.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white">
        {paginatedLogs.map((log) => (
          <div
            key={log.id}
            className="grid gap-3 border-b border-[#f0f0ed] px-5 py-5 text-sm last:border-b-0 md:grid-cols-[1fr_160px_160px_1fr_180px]"
          >
            <span className="font-medium">{log.user}</span>
            <span>{log.action}</span>
            <span className="text-neutral-600">{log.entity}</span>
            <span className="text-neutral-600">{log.entityName}</span>
            <span className="text-neutral-400">{log.date}</span>
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