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


/**
 * Memformat rentang tanggal ke dalam format Indonesia yang user-friendly.
 * @param start Tanggal mulai
 * @param end Tanggal selesai
 * @returns String rentang tanggal (Contoh: 1 Feb 2026 - 31 Jul 2026)
 */
export function formatDateRange(
  start: Date | string | number,
  end: Date | string | number
): string {
  const s = new Date(start);
  const e = new Date(end);

  if (isNaN(s.getTime()) || isNaN(e.getTime())) return "Rentang tidak valid";

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };

  return `${s.toLocaleDateString("id-ID", options)} - ${e.toLocaleDateString(
    "id-ID",
    options
  )}`;
}
