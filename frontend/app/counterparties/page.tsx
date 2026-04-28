"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Trash2 } from "lucide-react";

import CounterpartyForm from "../../components/CounterpartyForm";
import ModalShell from "../../components/ModalShell";

import {
  getCounterparties,
  createCounterparty,
  updateCounterparty,
  deleteCounterparty,
  extractCounterpartyFromPdf,
  downloadFrameworkContract,
} from "../../lib/api";

import { Counterparty, emptyCounterpartyForm } from "../../lib/types";
import { formatCounterpartyName } from "../../lib/format";

export default function CounterpartiesPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [loading, setLoading] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedCounterparty, setSelectedCounterparty] =
    useState<Counterparty | null>(null);

  const [form, setForm] = useState(emptyCounterpartyForm);

  const deletingCounterparty = counterparties.find(
    (item) => item.id === deleteId
  );

  const loadData = async () => {
    setLoading(true);
    const data = await getCounterparties();
    setCounterparties(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCreateModal = () => {
    setForm(emptyCounterpartyForm);
    setIsCreateOpen(true);
  };

  const handleCreate = async () => {
    await createCounterparty(form);
    setIsCreateOpen(false);
    loadData();
  };

  const handleSave = async () => {
    if (!selectedCounterparty) return;

    await updateCounterparty(selectedCounterparty.id, form);
    setSelectedCounterparty(null);
    loadData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    await deleteCounterparty(deleteId);
    setDeleteId(null);
    loadData();
  };

  const openCard = (counterparty: Counterparty) => {
    setSelectedCounterparty(counterparty);
    setForm({
      ...emptyCounterpartyForm,
      ...counterparty,
    });
  };

  const recognizePdf = async (file: File) => {
    setIsPdfLoading(true);
    setPdfError("");

    try {
      const data = await extractCounterpartyFromPdf(file);

      setForm({
        ...emptyCounterpartyForm,
        ...data,
      });

      setIsCreateOpen(true);
    } catch (error: any) {
      setPdfError(error.message);
    } finally {
      setIsPdfLoading(false);
      setIsDragOver(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      recognizePdf(file);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-4xl font-semibold sm:text-5xl">Контрагенты</h1>

        <button
          onClick={openCreateModal}
          className="w-full rounded-full bg-black px-6 py-3 text-white transition hover:bg-[#2a2a2a] sm:w-auto"
        >
          Добавить контрагента
        </button>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={
          isDragOver
            ? "mb-5 flex min-h-[96px] items-center justify-center rounded-3xl border-2 border-black bg-white px-5 text-center sm:mb-6"
            : "mb-5 flex min-h-[96px] items-center justify-center rounded-3xl border border-dashed border-[#d8d8d2] bg-white/60 px-5 text-center sm:mb-6"
        }
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              recognizePdf(file);
            }
          }}
        />

        <div>
          <p className="text-sm text-neutral-600 sm:text-base">
            {isPdfLoading ? "Распознаём PDF..." : "Перетащите PDF или "}

            {!isPdfLoading && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="underline underline-offset-4"
              >
                выберите на компьютере
              </button>
            )}
          </p>

          {pdfError && <p className="mt-2 text-sm text-red-500">{pdfError}</p>}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white">
        {loading && <p className="p-6 text-neutral-400">Загрузка...</p>}

        {!loading && counterparties.length === 0 && (
          <p className="p-6 text-neutral-400">Нет контрагентов</p>
        )}

        {counterparties.map((counterparty) => (
          <div
            key={counterparty.id}
            onClick={() => openCard(counterparty)}
            className="group grid cursor-pointer grid-cols-[1fr_44px] gap-3 border-b border-[#f0f0ed] px-5 py-5 transition last:border-b-0 hover:bg-[#fafafa] md:grid-cols-[180px_1fr_180px_48px] lg:grid-cols-[220px_1fr_220px_48px] lg:px-6"
          >
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-neutral-400 md:hidden">
                Компания
              </p>
              <p className="truncate font-medium">
                {counterparty.company || "—"}
              </p>
            </div>

            <div className="min-w-0 md:col-start-2">
              <p className="text-xs uppercase tracking-wide text-neutral-400 md:hidden">
                Контрагент
              </p>
              <p className="truncate font-medium">
                {formatCounterpartyName(counterparty)}
              </p>
            </div>

            <p className="col-span-2 text-sm text-neutral-700 md:col-span-1">
              ИНН: {counterparty.inn || "-"}
            </p>

            <button
              onClick={(event) => {
                event.stopPropagation();
                setDeleteId(counterparty.id);
              }}
              className="row-start-1 col-start-2 flex h-10 w-10 items-center justify-center rounded-xl text-neutral-500 opacity-100 transition hover:bg-red-50 hover:text-red-600 md:col-start-4 md:opacity-0 md:group-hover:opacity-100"
              title="Удалить"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {isCreateOpen && (
        <ModalShell>
          <div className="px-5 pt-6 pb-5 sm:px-8 sm:pt-8 sm:pb-6">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Новый контрагент
            </h2>
          </div>

          <div className="px-5 pb-6 sm:px-8 sm:pb-8">
            <CounterpartyForm form={form} updateForm={updateForm} />
          </div>

          <div className="sticky bottom-0 flex flex-col gap-3 rounded-b-3xl border-t border-[#ededeb] bg-white px-5 py-5 sm:flex-row sm:px-8">
            <button
              onClick={handleCreate}
              className="flex-1 rounded-2xl bg-black py-4 text-white transition hover:bg-[#2a2a2a]"
            >
              Создать
            </button>

            <button
              onClick={() => setIsCreateOpen(false)}
              className="flex-1 rounded-2xl border border-[#deded8] py-4 transition hover:bg-[#f3f3f1]"
            >
              Отмена
            </button>
          </div>
        </ModalShell>
      )}

      {selectedCounterparty && (
        <ModalShell>
          <div className="px-5 pt-6 pb-5 sm:px-8 sm:pt-8 sm:pb-6">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              {selectedCounterparty.company || "Без компании"}
            </h2>

            <p className="mt-2 text-base text-neutral-500 sm:text-lg">
              {formatCounterpartyName(selectedCounterparty)}
            </p>
          </div>

          <div className="px-5 pb-6 sm:px-8 sm:pb-8">
            <CounterpartyForm form={form} updateForm={updateForm} />
          </div>

          <div className="sticky bottom-0 flex flex-col gap-3 rounded-b-3xl border-t border-[#ededeb] bg-white px-5 py-5 sm:px-8">
            <button
              onClick={() => downloadFrameworkContract(selectedCounterparty.id)}
              className="flex items-center justify-center gap-2 rounded-2xl border border-[#deded8] bg-[#fafaf8] py-4 transition hover:bg-[#f3f3f1]"
            >
              <FileText size={18} />
              Сгенерировать договор
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleSave}
                className="flex-1 rounded-2xl bg-black py-4 text-white transition hover:bg-[#2a2a2a]"
              >
                Сохранить
              </button>

              <button
                onClick={() => setSelectedCounterparty(null)}
                className="flex-1 rounded-2xl border border-[#deded8] py-4 transition hover:bg-[#f3f3f1]"
              >
                Закрыть
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[440px] overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="px-6 pt-7 pb-6 sm:px-8 sm:pt-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Trash2 size={22} />
              </div>

              <h2 className="mb-3 text-2xl font-semibold">
                Удалить контрагента?
              </h2>

              <p className="text-neutral-500">
                {deletingCounterparty
                  ? `Контрагент «${formatCounterpartyName(
                      deletingCounterparty
                    )}» будет удалён из приложения.`
                  : "Контрагент будет удалён из приложения."}
              </p>

              <p className="mt-3 text-sm text-neutral-400">
                Это действие нельзя отменить.
              </p>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#ededeb] bg-[#fafaf8] px-6 py-5 sm:flex-row sm:px-8">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-2xl border border-[#deded8] bg-white py-4 transition hover:bg-[#f3f3f1]"
              >
                Отмена
              </button>

              <button
                onClick={handleDelete}
                className="flex-1 rounded-2xl bg-red-600 py-4 text-white transition hover:bg-red-700"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}