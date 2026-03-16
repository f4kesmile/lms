/**
 * Memformat tanggal ke dalam format Indonesia (id-ID).
 * @param date Objek Date atau string tanggal
 * @param options Opsi Intl.DateTimeFormat
 * @returns String tanggal terformat
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  }
): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Tanggal tidak valid";
  return d.toLocaleDateString("id-ID", options);
}

/**
 * Memformat tanggal dan waktu ke dalam format Indonesia (id-ID).
 * @param date Objek Date atau string tanggal
 * @returns String tanggal & waktu terformat (Contoh: 15 Mar 2026 20:30)
 */
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Tanggal tidak valid";
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).replace(/\./g, ":"); // Ensure colon instead of dot for time if locale uses dots
}

