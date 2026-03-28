export const MASTER_DATA_NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "space_dashboard" },
  { href: "/admin/courses", label: "Mata Kuliah & Kelas", icon: "school" },
  { href: "/admin/knowledge", label: "Bank Materi", icon: "library_books" },
];

export const DOSEN_MASTER_DATA_NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "space_dashboard" },
  { href: "/admin/knowledge", label: "Bank Materi", icon: "library_books" },
];

export const DOSEN_FEATURE_NAV_LINKS = [
  { href: "/admin/teaching-schedule", label: "Jadwal Mengajar", icon: "event" },
];

export const ADMIN_FEATURE_NAV_LINKS = [
  { href: "/admin/users", label: "Manajemen Pengguna", icon: "groups" },
  { href: "/admin/insights", label: "AI & Wawasan", icon: "monitoring" },
  { href: "/admin/stats", label: "Manajemen Chatbot", icon: "query_stats" },
  { href: "/admin/logs", label: "Log Sistem", icon: "terminal" },
];

export const ADMIN_NAV_LINKS = [
  ...MASTER_DATA_NAV_LINKS,
  ...DOSEN_FEATURE_NAV_LINKS,
  ...ADMIN_FEATURE_NAV_LINKS,
];

export const STUDENT_NAV_LINKS = [
  { href: "/courses", label: "Katalog Kelas", icon: "book" },
  { href: "/help", label: "Pusat Bantuan", icon: "help" },
];

export const DOSEN_NAV_LINKS = [
  ...DOSEN_MASTER_DATA_NAV_LINKS,
  ...DOSEN_FEATURE_NAV_LINKS,
];

export const PUBLIC_NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/courses", label: "Katalog Kelas" },
  { href: "/about", label: "Tentang Kami" },
  { href: "/help", label: "Pusat Bantuan" },
];
