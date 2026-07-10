import Modal from "./Modal";
import Button from "./Button";

/**
 * ConfirmationDialog — modal that asks the user to confirm a destructive action.
 *
 * Props:
 *   open        — bool
 *   onClose     — fn
 *   onConfirm   — fn
 *   title       — string
 *   message     — string
 *   confirmLabel — defaults to "Confirm"
 *   cancelLabel  — defaults to "Cancel"
 *   variant     — "danger" | "primary"
 *   loading     — bool, disables confirm button
 */
export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      {message && <p className="text-sm text-slate-600 leading-relaxed mb-5">{message}</p>}
      <div className="flex gap-3">
        <Button variant="outline" fullWidth onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={variant} fullWidth onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
