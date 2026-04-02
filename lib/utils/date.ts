const ID_LOCALE = "id-ID";

const DEFAULT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

/**
 * Helper internal untuk parsing dan validasi tanggal.
 * @param date Objek Date, string, atau number
 * @returns Objek Date jika valid, null jika tidak
 */
function parseDate(date: Date | string | number): Date | null {
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Memformat tanggal ke dalam format Indonesia (id-ID).
 * @param date Objek Date atau string tanggal
 * @param options Opsi Intl.DateTimeFormat
 * @returns String tanggal terformat
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = DEFAULT_OPTIONS
): string {
  const d = parseDate(date);
  if (!d) return "Tanggal tidak valid";
  return d.toLocaleDateString(ID_LOCALE, options);
}

/**
 * Memformat tanggal dan waktu ke dalam format Indonesia (id-ID).
 * @param date Objek Date atau string tanggal
 * @returns String tanggal & waktu terformat (Contoh: 15 Mar 2026 20:30)
 */
export function formatDateTime(date: Date | string | number): string {
  const d = parseDate(date);
  if (!d) return "Tanggal tidak valid";

  return d.toLocaleString(ID_LOCALE, {
    ...DEFAULT_OPTIONS,
    hour: "2-digit",
    minute: "2-digit",
  }).replace(/\./g, ":"); // Pastikan titik dua (colon) daripada titik (dot) untuk waktu
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
  const s = parseDate(start);
  const e = parseDate(end);

  if (!s || !e) return "Rentang tidak valid";

  return `${s.toLocaleDateString(ID_LOCALE, DEFAULT_OPTIONS)} - ${e.toLocaleDateString(
    ID_LOCALE,
    DEFAULT_OPTIONS
  )}`;
}
