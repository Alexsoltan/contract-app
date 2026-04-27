type ModalShellProps = {
  children: React.ReactNode;
};

export default function ModalShell({ children }: ModalShellProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-3xl w-full max-w-[720px] shadow-2xl max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}