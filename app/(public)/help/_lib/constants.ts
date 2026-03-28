import type { FaqItem, HelpCategory } from "@/app/(public)/help/_lib/types";

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    icon: "person",
    title: "Akun & Profil",
    desc: "Masalah login, ganti password, verifikasi email, dan pengaturan profil pengguna.",
    link: "Lihat Artikel ->",
  },
  {
    icon: "build",
    title: "Masalah Teknis",
    desc: "Error sistem, kendala browser, aplikasi mobile, dan akses konten video pembelajaran.",
    link: "Lihat Artikel ->",
  },
  {
    icon: "school",
    title: "Akademik",
    desc: "Cara pengumpulan tugas, kuis online, melihat nilai, dan interaksi di forum diskusi.",
    link: "Lihat Artikel ->",
  },
  {
    icon: "payments",
    title: "Pembayaran",
    desc: "Informasi UKT, cicilan biaya, beasiswa, dan validasi bukti bayar otomatis.",
    link: "Lihat Artikel ->",
  },
];

export const DEFAULT_FAQS: FaqItem[] = [
  {
    id: "d1",
    question: "Bagaimana cara reset password jika saya lupa?",
    answer:
      'Anda dapat menekan tombol "Lupa Password" pada halaman login. Sistem akan mengirimkan link reset ke email institusi yang terdaftar. Pastikan cek folder spam jika tidak menemukannya di inbox.',
    category: "Akun & Profil",
  },
  {
    id: "d2",
    question: "Kenapa saya tidak bisa mengunggah tugas PDF?",
    answer:
      "Pastikan ukuran file tidak melebihi 10MB dan format yang didukung adalah PDF, DOCX, atau PPT. Coba gunakan browser versi terbaru.",
    category: "Masalah Teknis",
  },
  {
    id: "d3",
    question: "Kapan batas akhir pengisian KRS online?",
    answer:
      "Batas pengisian KRS berbeda setiap semester. Silakan lihat kalender akademik di halaman utama atau hubungi bagian akademik.",
    category: "Akademik",
  },
];
