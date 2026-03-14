/**
 * Menghasilkan inisial dari nama lengkap (maksimal 2 karakter).
 * @param name Nama lengkap
 * @returns Inisial dalam huruf kapital (contoh: "John Doe" -> "JD")
 */
export function getInitials(name: string): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
