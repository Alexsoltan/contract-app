type ModalShellProps = {
  children: React.ReactNode;
};

export default function ModalShell({ children }: ModalShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-3 pb-3 pt-10 sm:items-center sm:px-4 sm:py-6">
      <div className="flex max-h-[92vh] w-full max-w-[720px] flex-col overflow-y-auto rounded-3xl bg-white shadow-2xl sm:max-h-[90vh]">
        {children}
      </div>
    </div>
  );
}