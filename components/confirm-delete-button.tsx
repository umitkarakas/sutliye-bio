"use client";

interface ConfirmDeleteButtonProps {
  action: (formData: FormData) => Promise<void> | void;
  id: string;
  returnTo: string;
  label?: string;
  confirmMessage?: string;
  disabled?: boolean;
  className?: string;
}

export function ConfirmDeleteButton({
  action,
  id,
  returnTo,
  label = "Sil",
  confirmMessage = "Bu kaydı silmek istediğinden emin misin? Bu işlem geri alınamaz.",
  disabled = false,
  className = "admin-cta-secondary whitespace-nowrap text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
}: ConfirmDeleteButtonProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm(confirmMessage)) {
      e.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <button type="submit" disabled={disabled} className={className}>
        {label}
      </button>
    </form>
  );
}
