import "dotenv/config";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Mulai menabur benih (seeding) database...");

  // --- 1. Reset Data Lama (Opsional tapi direkomendasikan untuk environment development murni) ---
  console.log("Menghapus data lama...");
  await prisma.faq.deleteMany();
  await prisma.courseMaterial.deleteMany();
  await prisma.classStudent.deleteMany();
  await prisma.classSubject.deleteMany();
  await prisma.subjectTeacher.deleteMany();
  await prisma.class.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  // --- 2. Seed Academic Year ---
  console.log("Membuat Tahun Akademik...");
  const currentAcademicYear = await prisma.academicYear.create({
    data: {
      name: "Ganjil 2024/2025",
      fromYear: new Date("2024-08-01"),
      toYear: new Date("2025-01-31"),
      isCurrent: true,
    },
  });

  await prisma.academicYear.create({
    data: {
      name: "Genap 2024/2025",
      fromYear: new Date("2025-02-01"),
      toYear: new Date("2025-07-31"),
      isCurrent: false,
    },
  });

  // --- 3. Seed Users ---
  console.log("Membuat Pengguna (Admin, Dosen, Mahasiswa)...");
  const defaultPassword = await bcrypt.hash("password123", 10);

  // Admin
  const admin = await prisma.user.create({
    data: {
      name: "Administrator Sistem",
      email: "admin@lms.com",
      password: defaultPassword,
      role: "admin",
    },
  });

  // Dosen (3 Orang)
  const dosen1 = await prisma.user.create({
    data: { name: "Dr. Budi Santoso, S.Kom., M.Cs.", email: "budi@lms.com", password: defaultPassword, role: "dosen" },
  });
  const dosen2 = await prisma.user.create({
    data: { name: "Prof. Siti Aminah, Ph.D.", email: "siti@lms.com", password: defaultPassword, role: "dosen" },
  });
  const dosen3 = await prisma.user.create({
    data: { name: "Ir. Gunawan Wibisono, M.T.", email: "gunawan@lms.com", password: defaultPassword, role: "dosen" },
  });
  // Mahasiswa (10 Orang untuk data yang lebih "hidup")
  const mhsData = [
    { name: "Andi Saputra", email: "andi@student.com" },
    { name: "Rina Melati", email: "rina@student.com" },
    { name: "Kevin Sanjaya", email: "kevin@student.com" },
    { name: "Siska Dewi", email: "siska@student.com" },
    { name: "Bagus Pratama", email: "bagus@student.com" },
    { name: "Dinda Kirana", email: "dinda@student.com" },
    { name: "Fajar Alfian", email: "fajar@student.com" },
    { name: "Gita Gutawa", email: "gita@student.com" },
    { name: "Hardi Yanto", email: "hardi@student.com" },
    { name: "Intan Permata", email: "intan@student.com" },
  ];

  const mahasiswaList = [];
  for (const mhs of mhsData) {
    mahasiswaList.push(
      await prisma.user.create({
        data: { ...mhs, password: defaultPassword, role: "mahasiswa" },
      })
    );
  }

  // --- 4. Seed Subjects (Mata Kuliah) ---
  console.log("Membuat Mata Kuliah...");
  const subjects = await Promise.all([
    prisma.subject.create({ data: { name: "Pengantar Kecerdasan Buatan", code: "CS101" } }),
    prisma.subject.create({ data: { name: "Rekayasa Perangkat Lunak Lanjut", code: "CS201" } }),
    prisma.subject.create({ data: { name: "Struktur Data & Algoritma", code: "CS301" } }),
    prisma.subject.create({ data: { name: "Sistem Basis Data", code: "CS401" } }),
    prisma.subject.create({ data: { name: "Jaringan Komputer", code: "CS501" } }),
  ]);

  // Relasikan Dosen dengan Mata Kuliah
  const subjectTeachers = [
    { subjectId: subjects[0].id, userId: dosen1.id }, // Budi -> AI
    { subjectId: subjects[1].id, userId: dosen2.id }, // Siti -> RPL
    { subjectId: subjects[2].id, userId: dosen3.id }, // Gunawan -> SDA
    { subjectId: subjects[3].id, userId: dosen1.id }, // Budi -> Basis Data
    { subjectId: subjects[4].id, userId: dosen2.id }, // Siti -> Jaringan
  ];
  for (const st of subjectTeachers) {
    await prisma.subjectTeacher.create({ data: st });
  }

  // --- 5. Seed Classes ---
  console.log("Membuat Kelas dan Mendaftarkan Mahasiswa...");
  const classData = [
    { name: "Kecerdasan Buatan - Kelas A", subjectIdx: 0, teacher: dosen1, students: mahasiswaList.slice(0, 7) },
    { name: "Rekayasa Perangkat Lunak - Reguler", subjectIdx: 1, teacher: dosen2, students: mahasiswaList.slice(3, 10) },
    { name: "SDA & Strategi Algoritmik", subjectIdx: 2, teacher: dosen3, students: mahasiswaList.slice(0, 10) },
    { name: "DBMS & Tuning - Paralel", subjectIdx: 3, teacher: dosen1, students: mahasiswaList.slice(1, 8) },
  ];

  for (const cd of classData) {
    const cls = await prisma.class.create({
      data: {
        name: cd.name,
        academicYearId: currentAcademicYear.id,
        classTeacherId: cd.teacher.id,
        capacity: 40,
      },
    });

    // Relasi Class <> Subject
    await prisma.classSubject.create({
      data: { classId: cls.id, subjectId: subjects[cd.subjectIdx].id },
    });

    // Daftarkan Mahasiswa ke Kelas dengan progress random
    for (const student of cd.students) {
      await prisma.classStudent.create({
        data: {
          classId: cls.id,
          userId: student.id,
          progress: Math.floor(Math.random() * 100), // Kemajuan penyelesaian dari 0 - 100
        },
      });
    }
  }

  // --- 6. Seed Course Materials (Knowledge Base) ---
  console.log("Mengisi Material Pengetahuan (Knowledge Base)...");
  const materialData = [
    { title: "Silabus AI 2024", content: "Dokumen ini berisi silabus lengkap untuk mata kuliah Pemrograman Kecerdasan Buatan...", module: "Syllabus", createdById: dosen1.id },
    { title: "Panduan Instalasi Node.js & Next.js", content: "Langkah-langkah untuk menyiapkan environment React dengan Next.js versi 15.", module: "Guide", createdById: admin.id },
    { title: "Materi PPT UML Lanjut", content: "Slide presentasi dari materi minggu ke-3 tentang Unified Modeling Language.", module: "Slide", createdById: dosen2.id },
    { title: "Tugas Besar: Aplikasi E-Commerce", content: "Persyaratan tugas akhir pembuatan e-commerce menggunakan Prisma dan PostgreSQL.", module: "Assignment", createdById: dosen3.id },
    { title: "Jurnal Pendukung NLP", content: "Referensi bacaan tentang Natural Language Processing untuk mahasiswa akhir.", module: "Reference", createdById: dosen1.id },
  ];

  for (const mat of materialData) {
    await prisma.courseMaterial.create({ data: mat });
  }

  // --- 7. Seed FAQs ---
  console.log("Mengisi Rekaman FAQ...");
  const faqData = [
    { question: "Bagaimana cara mereset kata sandi?", answer: "Silakan hubungi administrator IT fakultas atau gunakan fitur lupa password di halaman login (jika tersedia).", category: "Akun" },
    { question: "Apakah saya bisa berganti kelas setelah KRS?", answer: "Perpindahan kelas hanya dapat dilakukan pada masa revisi KRS selama kapasitas masih tersedia.", category: "Akademik" },
    { question: "Bagaimana cara gabung meeting online?", answer: "Link meeting akan muncul di dalam detail kursus 15 menit sebelum kelas dimulai.", category: "Teknis" },
    { question: "Dimana saya bisa bertanya pada Dosen?", answer: "Gunakan fitur AI Chat untuk pertanyaan umum materi, atau kirim pesan via email kampus yang tertera di profil instruktur.", category: "Komunikasi" },
  ];

  for (const f of faqData) {
    await prisma.faq.create({ data: { ...f, isActive: true } });
  }

  console.log("✅ Proses Seeding Selesai!");
  console.log("-----------------------------------------");
  console.log("Gunakan akun berikut untuk login pengujian:");
  console.log("  Admin: admin@lms.com / password123");
  console.log("  Dosen: budi@lms.com / password123");
  console.log("  Mahasiswa: andi@student.com / password123");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("Gagal melakukan seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
