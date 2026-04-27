"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";

import CounterpartyForm from "../../components/CounterpartyForm";
import ModalShell from "../../components/ModalShell";

import {
  getCounterparties,
  createCounterparty,
  updateCounterparty,
  deleteCounterparty,
  extractCounterpartyFromPdf,
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

  const deletingCounterparty = counterparties.find((item) => item.id === deleteId);

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

  const openCard = (c: Counterparty) => {
    setSelectedCounterparty(c);
    setForm({
      ...emptyCounterpartyForm,
      ...c,
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
    } catch (e: any) {
      setPdfError(e.message);
    } finally {
      setIsPdfLoading(false);
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) recognizePdf(file);
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-5xl font-semibold">Контрагенты</h1>

        <button
          onClick={openCreateModal}
          className="bg-black text-white px-6 py-3 rounded-full hover:bg-[#2a2a2a] transition"
        >
          Добавить контрагента
        </button>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`mb-6 h-[96px] rounded-3xl border flex items-center justify-center text-center ${
          isDragOver
            ? "border-black border-2 bg-white"
            : "border-dashed border-[#d8d8d2] bg-white/60"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) recognizePdf(file);
          }}
        />

        <div>
          <p>
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

          {pdfError && <p className="text-sm text-red-500 mt-2">{pdfError}</p>}
        </div>
      </div>

      <div className="bg-white rounded-3xl overflow-hidden">
        {loading && <p className="p-6 text-neutral-400">Загрузка...</p>}

        {!loading && counterparties.length === 0 && (
          <p className="p-6 text-neutral-400">Нет контрагентов</p>
        )}

        {counterparties.map((c) => (
          <div
            key={c.id}
            onClick={() => openCard(c)}
            className="group px-6 py-5 grid grid-cols-[1fr_220px_48px] items-center gap-4 hover:bg-[#fafafa] cursor-pointer transition"
          >
            <div>
              <p className="font-medium">{formatCounterpartyName(c)}</p>
            </div>

            <p className="text-neutral-700">ИНН: {c.inn || "-"}</p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteId(c.id);
              }}
              className="opacity-0 group-hover:opacity-100 transition flex items-center justify-center w-10 h-10 rounded-xl text-neutral-500 hover:bg-red-50 hover:text-red-600"
              title="Удалить"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {isCreateOpen && (
        <ModalShell>
          <div className="px-8 pt-8 pb-6">
            <h2 className="text-3xl font-semibold">Новый контрагент</h2>
          </div>

          <div className="px-8 pb-8">
            <CounterpartyForm form={form} updateForm={updateForm} />
          </div>

          <div className="sticky bottom-0 bg-white border-t border-[#ededeb] px-8 py-5 flex gap-3 rounded-b-3xl">
            <button
              onClick={handleCreate}
              className="flex-1 bg-black text-white py-4 rounded-2xl hover:bg-[#2a2a2a] transition"
            >
              Создать
            </button>

            <button
              onClick={() => setIsCreateOpen(false)}
              className="flex-1 border border-[#deded8] py-4 rounded-2xl hover:bg-[#f3f3f1] transition"
            >
              Отмена
            </button>
          </div>
        </ModalShell>
      )}

      {selectedCounterparty && (
        <ModalShell>
          <div className="px-8 pt-8 pb-6">
            <p className="text-sm text-neutral-400 mb-2">
              Карточка контрагента #{selectedCounterparty.id}
            </p>
            <h2 className="text-3xl font-semibold">
              {formatCounterpartyName(selectedCounterparty)}
            </h2>
          </div>

          <div className="px-8 pb-8">
            <CounterpartyForm form={form} updateForm={updateForm} />
          </div>

          <div className="sticky bottom-0 bg-white border-t border-[#ededeb] px-8 py-5 flex gap-3 rounded-b-3xl">
            <button
              onClick={handleSave}
              className="flex-1 bg-black text-white py-4 rounded-2xl hover:bg-[#2a2a2a] transition"
            >
              Сохранить
            </button>

            <button
              onClick={() => setSelectedCounterparty(null)}
              className="flex-1 border border-[#deded8] py-4 rounded-2xl hover:bg-[#f3f3f1] transition"
            >
              Закрыть
            </button>
          </div>
        </ModalShell>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl w-full max-w-[440px] shadow-2xl overflow-hidden">
            <div className="px-8 pt-8 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-5">
                <Trash2 size={22} />
              </div>

              <h2 className="text-2xl font-semibold mb-3">
                Удалить контрагента?
              </h2>

              <p className="text-neutral-500">
                {deletingCounterparty
                  ? `Контрагент «${formatCounterpartyName(
                      deletingCounterparty
                    )}» будет удалён из приложения.`
                  : "Контрагент будет удалён из приложения."}
              </p>

              <p className="text-neutral-400 text-sm mt-3">
                Это действие нельзя отменить.
              </p>
            </div>

            <div className="border-t border-[#ededeb] px-8 py-5 flex gap-3 bg-[#fafaf8]">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 border border-[#deded8] bg-white py-4 rounded-2xl hover:bg-[#f3f3f1] transition"
              >
                Отмена
              </button>

              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-4 rounded-2xl hover:bg-red-700 transition"
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