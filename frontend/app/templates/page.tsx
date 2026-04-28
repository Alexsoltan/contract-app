"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Eye, FileText, Upload, Clock3, X } from "lucide-react";

const API_URL = "/api";

type TemplateVersion = {
  version: string;
  original_filename: string;
  uploaded_at: string;
};

type Template = {
  id: string;
  title: string;
  description: string;
  active_version: string | null;
  versions: TemplateVersion[];
};

export default function TemplatesPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const loadTemplate = async () => {
    const res = await fetch(`${API_URL}/templates`);
    const data = await res.json();
    setTemplate(data[0]);
  };

  useEffect(() => {
    loadTemplate();
  }, []);

  const handleUpload = async (file: File) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    await fetch(`${API_URL}/templates/framework-contract/upload`, {
      method: "POST",
      body: formData,
    });

    await loadTemplate();
    setLoading(false);
  };

  const handleDownload = () => {
    window.open(`${API_URL}/templates/framework-contract/download`, "_blank");
  };

  if (!template) {
    return <div className="p-6">Загрузка...</div>;
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-8">
        <h1 className="text-4xl font-semibold sm:text-5xl">Шаблоны</h1>

        <p className="mt-3 max-w-[640px] text-neutral-500">
          Здесь хранятся шаблоны документов для автоматической генерации.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[#e5e5e0] bg-white">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f3f3f1]">
              <FileText size={22} />
            </div>

            <div>
              <h2 className="text-2xl font-semibold">{template.title}</h2>

              <p className="mt-2 text-neutral-500">{template.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#f3f3f1] px-3 py-1 text-sm">
                  DOCX
                </span>

                <span className="rounded-full bg-[#f3f3f1] px-3 py-1 text-sm">
                  {template.active_version
                    ? `Активная версия: ${template.active_version}`
                    : "Нет версии"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:min-w-[220px]">
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-white transition-all duration-200 hover:bg-[#2a2a2a] active:scale-[0.98]"
            >
              <Upload size={18} />
              {loading ? "Загрузка..." : "Загрузить DOCX"}
            </button>

            <button
              onClick={() => setIsPreviewOpen(true)}
              disabled={!template.active_version}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#deded8] px-5 py-3 text-neutral-700 transition-all duration-200 hover:border-[#cfcfc9] hover:bg-[#f3f3f1] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Eye size={18} />
              Предпросмотр
            </button>

            <button
              onClick={handleDownload}
              disabled={!template.active_version}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#deded8] px-5 py-3 text-neutral-700 transition-all duration-200 hover:border-[#cfcfc9] hover:bg-[#f3f3f1] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Download size={18} />
              Скачать
            </button>
          </div>
        </div>

        <div className="border-t border-[#ededeb] bg-[#fafaf8] px-6 py-5">
          <div className="mb-3 flex items-center gap-3 text-sm text-neutral-500">
            <Clock3 size={16} />
            История версий
          </div>

          {template.versions.length === 0 && (
            <p className="text-sm text-neutral-400">
              Пока нет загруженных версий
            </p>
          )}

          {template.versions.map((version) => (
            <div
              key={version.version}
              className="flex justify-between border-b py-2 text-sm last:border-0"
            >
              <div>
                <span className="font-medium">{version.version}</span>
                <span className="ml-3 text-neutral-400">
                  {version.original_filename}
                </span>
              </div>

              <span className="text-neutral-400">
                {new Date(version.uploaded_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-3 pb-3 pt-10 sm:items-center sm:px-4 sm:py-6">
          <div className="flex h-[92vh] w-full max-w-[980px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ededeb] px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-xl font-semibold">
                  Предпросмотр шаблона
                </h2>

                <p className="text-sm text-neutral-500">{template.title}</p>
              </div>

              <button
                onClick={() => setIsPreviewOpen(false)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#deded8] transition hover:bg-[#f3f3f1]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 bg-[#f3f3f1] p-4 sm:p-6">
              <iframe
                src={`${API_URL}/templates/framework-contract/preview`}
                className="h-full w-full rounded-2xl border border-[#e5e5e0] bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}