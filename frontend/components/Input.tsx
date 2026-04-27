type InputProps = {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
};

export default function Input({
  label,
  value,
  type = "text",
  onChange,
}: InputProps) {
  return (
    <label className="block">
      <span className="block text-sm text-neutral-500 mb-2">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-[#deded8] bg-[#fafaf8] px-5 py-4 text-[15px] outline-none focus:bg-white focus:border-black transition"
      />
    </label>
  );
}