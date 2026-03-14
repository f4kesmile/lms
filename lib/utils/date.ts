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
