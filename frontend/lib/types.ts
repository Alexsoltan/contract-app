export type Counterparty = {
  id: number;
  entity_type?: string;
  name: string;
  inn?: string;
  kpp?: string;
  ogrn?: string;
  legal_address?: string;
  bank_name?: string;
  bik?: string;
  payment_account?: string;
  correspondent_account?: string;
  signer_full_name?: string;
  signer_position?: string;
  signer_basis?: string;
};

export const emptyCounterpartyForm: Omit<Counterparty, "id"> = {
  entity_type: "ООО",
  name: "",
  inn: "",
  kpp: "",
  ogrn: "",
  legal_address: "",
  bank_name: "",
  bik: "",
  payment_account: "",
  correspondent_account: "",
  signer_full_name: "",
  signer_position: "",
  signer_basis: "",
};