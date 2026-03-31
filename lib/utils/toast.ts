import { toast } from "sonner";

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export function notifySuccess(message: string) {
  toast.success(message);
}

export function notifyError(message: string) {
  toast.error(message);
}

export function toastSaved(entity: string) {
  notifySuccess(`Berhasil menyimpan ${entity}.`);
}

export function toastUpdated(entity: string) {
  notifySuccess(`Berhasil memperbarui ${entity}.`);
}

export function toastDeleted(entity: string) {
  notifySuccess(`Berhasil menghapus ${entity}.`);
}

export function toastAssigned(entity: string) {
  notifySuccess(`Berhasil menugaskan ${entity}.`);
}

export function toastUnassigned(entity: string) {
  notifySuccess(`Berhasil melepas ${entity}.`);
}

export function toastSaveFailed(entity: string, error: unknown) {
  notifyError(getErrorMessage(error, `Gagal menyimpan ${entity}.`));
}

export function toastUpdateFailed(entity: string, error: unknown) {
  notifyError(getErrorMessage(error, `Gagal memperbarui ${entity}.`));
}

export function toastDeleteFailed(entity: string, error: unknown) {
  notifyError(getErrorMessage(error, `Gagal menghapus ${entity}.`));
}

export function toastAssignFailed(entity: string, error: unknown) {
  notifyError(getErrorMessage(error, `Gagal menugaskan ${entity}.`));
}
