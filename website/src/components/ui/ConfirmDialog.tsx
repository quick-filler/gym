"use client";

import { Button } from "./Button";
import { Dialog } from "./Dialog";

/**
 * Lightweight "are you sure?" dialog. Parent owns the open state and
 * passes a synchronous `onConfirm`; the dialog itself doesn't know
 * about loading states — wrap async calls on the parent side if you
 * need a spinner.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "default",
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  loading?: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <p className="text-[0.95rem] text-ink-600 leading-[1.6]">{message}</p>

      <div className="flex items-center justify-end gap-3 mt-6">
        <Button variant="ghost" onClick={onClose} type="button">
          {cancelLabel}
        </Button>
        <Button
          variant={tone === "danger" ? "flame" : "ink"}
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={
            tone === "danger"
              ? "!bg-rose hover:!bg-[#9f102f] !text-white"
              : undefined
          }
        >
          {loading ? "Processando…" : confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
