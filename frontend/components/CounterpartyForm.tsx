import Input from "./Input";
import type { Counterparty } from "../lib/types";

type CounterpartyFormProps = {
  form: Omit<Counterparty, "id">;
  updateForm: (field: keyof Omit<Counterparty, "id">, value: string) => void;
};

export default function CounterpartyForm({
  form,
  updateForm,
}: CounterpartyFormProps) {
  return (
    <div className="space-y-5">
      <div>
        <span className="block text-sm text-neutral-500 mb-2">
          Тип контрагента
        </span>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateForm("entity_type", "ООО")}
            className={
              form.entity_type === "ООО"
                ? "rounded-2xl bg-black text-white px-5 py-4 text-[15px]"
                : "rounded-2xl border border-[#deded8] bg-[#fafaf8] px-5 py-4 text-[15px]"
            }
          >
            ООО
          </button>

          <button
            type="button"
            onClick={() => updateForm("entity_type", "ИП")}
            className={
              form.entity_type === "ИП"
                ? "rounded-2xl bg-black text-white px-5 py-4 text-[15px]"
                : "rounded-2xl border border-[#deded8] bg-[#fafaf8] px-5 py-4 text-[15px]"
            }
          >
            ИП
          </button>
        </div>
      </div>

      <Input label="Название" value={form.name || ""} onChange={(v) => updateForm("name", v)} />
      <Input label="ИНН" value={form.inn || ""} onChange={(v) => updateForm("inn", v)} />
      <Input label="КПП" value={form.kpp || ""} onChange={(v) => updateForm("kpp", v)} />
      <Input label="ОГРН / ОГРНИП" value={form.ogrn || ""} onChange={(v) => updateForm("ogrn", v)} />
      <Input label="Юридический адрес" value={form.legal_address || ""} onChange={(v) => updateForm("legal_address", v)} />
      <Input label="Банк" value={form.bank_name || ""} onChange={(v) => updateForm("bank_name", v)} />
      <Input label="БИК" value={form.bik || ""} onChange={(v) => updateForm("bik", v)} />
      <Input label="Расчётный счёт" value={form.payment_account || ""} onChange={(v) => updateForm("payment_account", v)} />
      <Input label="Корреспондентский счёт" value={form.correspondent_account || ""} onChange={(v) => updateForm("correspondent_account", v)} />
      <Input label="ФИО подписанта" value={form.signer_full_name || ""} onChange={(v) => updateForm("signer_full_name", v)} />
      <Input label="Должность подписанта" value={form.signer_position || ""} onChange={(v) => updateForm("signer_position", v)} />
      <Input label="Основание полномочий" value={form.signer_basis || ""} onChange={(v) => updateForm("signer_basis", v)} />
    </div>
  );
}