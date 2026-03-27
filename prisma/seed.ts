import "dotenv/config";

import { CourseStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/core/db";
import { splitIntoChunks } from "@/lib/ai/rag";

type CreatedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type SubjectSeed = {
  code: string;
  name: string;
  teacherEmails: string[];
  modules: Array<{
    title: string;
    module: string;
    page: string;
    focus: string[];
    caseStudy: string;
  }>;
};

function makeMaterialContent(params: {
  subjectName: string;
  module: string;
  title: string;
  focus: string[];
  caseStudy: string;
}): string {
  const { subjectName, module, title, focus, caseStudy } = params;

  return [
    `${module} - ${title}`,
    "",
    `Pada topik ${subjectName}, bagian ini membahas ${title.toLowerCase()} dengan pendekatan konseptual dan praktik. Materi dirancang agar mahasiswa memahami definisi, alur kerja, serta alasan pemilihan pendekatan pada skenario nyata pembelajaran digital.`,
    "",
    "Konsep inti:",
    ...focus.map((item, index) => `${index + 1}. ${item}.`),
    "",
    "Alur penerapan:",
    "1) Identifikasi masalah dan tetapkan metrik keberhasilan.",
    "2) Siapkan data atau artefak yang relevan, termasuk validasi kualitas.",
    "3) Terapkan metode secara bertahap dan dokumentasikan hasil.",
    "4) Evaluasi hasil, lakukan perbaikan, lalu ulangi siklus.",
    "",
    "Studi kasus praktis:",
    `${caseStudy} Fokus utama studi kasus ini adalah menghubungkan konsep teoritis dengan keputusan teknis di lapangan, termasuk pertimbangan trade-off waktu komputasi, akurasi, dan kemudahan implementasi untuk konteks kampus.`,
    "",
    "Catatan evaluasi:",
    "- Keberhasilan tidak hanya dilihat dari hasil akhir, tetapi juga dari kualitas proses dan interpretasi.",
    "- Gunakan terminologi yang konsisten dengan modul agar komunikasi lintas tim akademik tetap efektif.",
    "- Dokumentasi asumsi dan batasan sangat penting agar eksperimen dapat direplikasi.",
    "",
    "Refleksi:",
    `Mahasiswa diharapkan mampu merumuskan hubungan antara konsep ${title.toLowerCase()} dan kebutuhan implementasi sistem pembelajaran modern, serta menjelaskan keputusan teknis secara argumentatif dan terukur.`,
  ].join("\n");
}

function pick<T>(arr: T[], index: number): T {
  return arr[index % arr.length];
}

function toEmailSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .replace(/\.{2,}/g, ".");
}

async function main() {
  console.log("Mulai reset data development...");

  await prisma.chatTurn.deleteMany();
  await prisma.chatSession.deleteMany();
  await prisma.materialChunk.deleteMany();
  await prisma.courseMaterial.deleteMany();
  await prisma.course.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.classStudent.deleteMany();
  await prisma.classSubject.deleteMany();
  await prisma.subjectTeacher.deleteMany();
  await prisma.class.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.chatbotSetting.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const adminUsers = await Promise.all([
    prisma.user.create({
      data: {
        name: "Administrator LMS",
        email: "admin@lms.com",
        password: passwordHash,
        role: UserRole.admin,
      },
    }),
    prisma.user.create({
      data: {
        name: "Operator Akademik",
        email: "operator@lms.com",
        password: passwordHash,
        role: UserRole.admin,
      },
    }),
  ]);

  const dosenSeed = [
    { name: "Dr. Rahmat Hidayat", email: "rahmat@lms.com" },
    { name: "Prof. Dian Lestari", email: "dian@lms.com" },
    { name: "Dr. Sinta Wulandari", email: "sinta@lms.com" },
    { name: "Dr. Farhan Akbar", email: "farhan@lms.com" },
    { name: "Prof. Mita Azzahra", email: "mita@lms.com" },
  ];

  const dosenUsers = await Promise.all(
    dosenSeed.map((item: { name: string; email: string }) =>
      prisma.user.create({
        data: {
          name: item.name,
          email: item.email,
          password: passwordHash,
          role: UserRole.dosen,
        },
      }),
    ),
  );

  const mahasiswaNames = [
    "Muhammad Daffa Alfarizi",
    "Nabila Putri Maharani",
    "Rizky Maulana Pratama",
    "Siti Aisyah Ramadhani",
    "Fajar Nugroho Saputra",
    "Dinda Cahyani Lestari",
    "Bagus Ramadhan Hidayat",
    "Anisa Nur Kholifah",
    "Yoga Prasetyo Wibowo",
    "Nadya Zahra Amelia",
    "Rafiq Akbar Maulana",
    "Tiara Ayu Puspitasari",
    "Arif Rahman Hakim",
    "Shabrina Khairunnisa Putri",
    "Reza Aditya Nugraha",
    "Aulia Safitri Handayani",
    "Dimas Fikriansyah",
    "Salsa Billa Oktaviani",
    "Irfan Maulana Siregar",
    "Vina Melati Permata",
    "Hafiz Al Ghifari",
    "Natasya Syafira Putri",
    "Bayu Kurniawan Santoso",
    "Rania Fadhilah Nuraini",
    "Gilang Pradana Wijaya",
    "Azzam Rifqi Ramadhan",
    "Meylisa Andini Putri",
    "Taufik Hidayatullah",
    "Cindy Aurelia Salsabila",
    "Farhan Adi Nugroho",
    "Annisa Rahmawati",
    "Iqbal Firmansyah Prakoso",
    "Luthfiah Nabila Sari",
    "Rendy Saputra Kurnia",
    "Naufal Dzaky Pratama",
    "Salsa Nur Azzahra",
  ];

  const emailCounter = new Map<string, number>();

  const mahasiswaUsers: CreatedUser[] = await Promise.all(
    mahasiswaNames.map((name, idx) => {
      const baseSlug = toEmailSlug(name);
      const seen = emailCounter.get(baseSlug) ?? 0;
      emailCounter.set(baseSlug, seen + 1);
      const suffix = seen === 0 ? "" : `.${seen + 1}`;

      return prisma.user.create({
        data: {
          name,
          email: `${baseSlug}${suffix}@student.lms.com`,
          password: passwordHash,
          role: UserRole.mahasiswa,
          isActive: idx % 11 !== 0,
        },
      });
    }),
  );

  const years = await Promise.all([
    prisma.academicYear.create({
      data: {
        name: "Ganjil 2024/2025",
        fromYear: new Date("2024-08-01"),
        toYear: new Date("2025-01-31"),
        isCurrent: false,
      },
    }),
    prisma.academicYear.create({
      data: {
        name: "Genap 2024/2025",
        fromYear: new Date("2025-02-01"),
        toYear: new Date("2025-07-31"),
        isCurrent: false,
      },
    }),
    prisma.academicYear.create({
      data: {
        name: "Ganjil 2025/2026",
        fromYear: new Date("2025-08-01"),
        toYear: new Date("2026-01-31"),
        isCurrent: true,
      },
    }),
  ]);

  const currentYear = years[2];

  const subjectSeed: SubjectSeed[] = [
    {
      code: "AI-101",
      name: "Kecerdasan Buatan",
      teacherEmails: ["rahmat@lms.com", "sinta@lms.com"],
      modules: [
        {
          title: "Konsep Dasar Machine Learning",
          module: "Modul 1",
          page: "1-12",
          focus: [
            "Definisi AI, ML, dan Deep Learning serta relasinya",
            "Perbedaan supervised, unsupervised, dan reinforcement learning",
            "Peran data, fitur, dan label dalam proses pembelajaran model",
          ],
          caseStudy:
            "Sistem prediksi risiko mahasiswa drop-out berdasarkan histori kehadiran, nilai tugas, dan partisipasi forum diskusi.",
        },
        {
          title: "Evaluasi Model dan Metrik",
          module: "Modul 2",
          page: "13-25",
          focus: [
            "Akurasi, precision, recall, dan F1-score untuk klasifikasi",
            "Confusion matrix sebagai alat diagnosis kesalahan model",
            "Bias-variance trade-off dalam memilih model",
          ],
          caseStudy:
            "Analisis performa model rekomendasi materi remedial untuk mahasiswa berisiko gagal pada kuis mingguan.",
        },
        {
          title: "Pipeline ML untuk Sistem Kampus",
          module: "Modul 3",
          page: "26-39",
          focus: [
            "Tahap data ingestion, preprocessing, training, dan deployment",
            "Monitoring drift data dan evaluasi berkala",
            "Prinsip etika AI pada data akademik",
          ],
          caseStudy:
            "Pengembangan model prediksi keterlambatan kelulusan untuk mendukung intervensi akademik dini.",
        },
      ],
    },
    {
      code: "DB-201",
      name: "Basis Data Lanjut",
      teacherEmails: ["rahmat@lms.com", "farhan@lms.com"],
      modules: [
        {
          title: "Normalisasi dan Integritas Data",
          module: "Modul 1",
          page: "1-10",
          focus: [
            "Normal form 1NF sampai 3NF untuk skema akademik",
            "Anomali insert, update, delete pada desain tabel buruk",
            "Constraint primary key, foreign key, dan unique",
          ],
          caseStudy:
            "Perbaikan skema data registrasi mata kuliah agar bebas duplikasi dan konsisten antar semester.",
        },
        {
          title: "Optimasi Query dan Indexing",
          module: "Modul 2",
          page: "11-23",
          focus: [
            "Analisis query plan dan bottleneck join",
            "Strategi indexing pada kolom pencarian utama",
            "Trade-off write performance vs read performance",
          ],
          caseStudy:
            "Optimasi dashboard admin yang menampilkan statistik mahasiswa aktif dan progres kelas secara real-time.",
        },
        {
          title: "Transaksi dan Konsistensi",
          module: "Modul 3",
          page: "24-36",
          focus: [
            "ACID dan isolation level pada sistem multi-user",
            "Race condition pada proses enrollment kelas",
            "Strategi locking dan retry untuk kestabilan",
          ],
          caseStudy:
            "Simulasi pendaftaran kelas serentak untuk 500 mahasiswa pada jam sibuk KRS.",
        },
      ],
    },
    {
      code: "SE-301",
      name: "Rekayasa Perangkat Lunak",
      teacherEmails: ["dian@lms.com", "mita@lms.com"],
      modules: [
        {
          title: "Arsitektur Sistem dan Clean Layer",
          module: "Modul 1",
          page: "1-11",
          focus: [
            "Pemecahan layer presentation, application, domain, infrastructure",
            "Dependency rule dan maintainability jangka panjang",
            "Pola service-repository untuk proyek web modern",
          ],
          caseStudy:
            "Refactor aplikasi LMS monolitik agar modul autentikasi, kursus, dan chatbot terpisah jelas.",
        },
        {
          title: "Quality Assurance dan Testing",
          module: "Modul 2",
          page: "12-22",
          focus: [
            "Pyramid testing: unit, integration, end-to-end",
            "Strategi test data dan mocking dependency",
            "Defect triage untuk rilis cepat",
          ],
          caseStudy:
            "Desain skenario uji end-to-end untuk alur login, enrollment, akses materi, dan chatbot.",
        },
        {
          title: "DevOps Ringan untuk Tim Kampus",
          module: "Modul 3",
          page: "23-34",
          focus: [
            "CI lint-test-build sebelum deployment",
            "Rollback strategy saat rilis bermasalah",
            "Observability dasar: log, metrics, alert",
          ],
          caseStudy:
            "Penyusunan pipeline rilis mingguan untuk platform LMS dengan downtime minimal.",
        },
      ],
    },
    {
      code: "NW-210",
      name: "Jaringan Komputer",
      teacherEmails: ["farhan@lms.com"],
      modules: [
        {
          title: "Dasar TCP/IP dan Routing",
          module: "Modul 1",
          page: "1-14",
          focus: [
            "Model TCP/IP dan fungsi setiap layer",
            "Subnetting dan perencanaan alamat IP",
            "Routing static vs dynamic",
          ],
          caseStudy:
            "Perancangan segmentasi jaringan laboratorium kampus agar aman dan stabil.",
        },
        {
          title: "Keamanan Jaringan Dasar",
          module: "Modul 2",
          page: "15-28",
          focus: [
            "Firewall rules dan hardening layanan penting",
            "Deteksi anomali traffic dasar",
            "Praktik backup konfigurasi perangkat jaringan",
          ],
          caseStudy:
            "Mitigasi serangan brute force pada portal akademik selama periode registrasi.",
        },
        {
          title: "Monitoring dan Troubleshooting",
          module: "Modul 3",
          page: "29-40",
          focus: [
            "Interpretasi metrik latency, packet loss, throughput",
            "Root cause analysis gangguan layanan",
            "Dokumentasi insiden dan tindakan perbaikan",
          ],
          caseStudy:
            "Investigasi gangguan akses LMS saat puncak ujian daring.",
        },
      ],
    },
    {
      code: "DS-220",
      name: "Visualisasi Data",
      teacherEmails: ["sinta@lms.com"],
      modules: [
        {
          title: "Prinsip Dasar Visualisasi",
          module: "Modul 1",
          page: "1-9",
          focus: [
            "Pemilihan grafik sesuai tipe data",
            "Penerapan visual hierarchy dan fokus informasi",
            "Kesalahan umum interpretasi chart",
          ],
          caseStudy:
            "Menyusun dashboard progres mahasiswa per kelas untuk kebutuhan rapat akademik bulanan.",
        },
        {
          title: "Storytelling dengan Data",
          module: "Modul 2",
          page: "10-21",
          focus: [
            "Menyusun narasi dari data mentah",
            "Penyederhanaan insight untuk pemangku kebijakan",
            "Penggunaan anotasi dan highlight",
          ],
          caseStudy:
            "Presentasi tren performa mahasiswa lintas semester untuk dekanat.",
        },
        {
          title: "Dashboard Operasional EduTech",
          module: "Modul 3",
          page: "22-33",
          focus: [
            "KPI operasional untuk platform pembelajaran",
            "Desain komponen dashboard yang responsif",
            "Validasi kualitas data sebelum visualisasi",
          ],
          caseStudy:
            "Rancang dashboard adopsi chatbot dan efektivitas materi penunjang.",
        },
      ],
    },
  ];

  const dosenByEmail = new Map(dosenUsers.map((user) => [user.email, user]));
  const adminByEmail = new Map(adminUsers.map((user) => [user.email, user]));

  const createdSubjects = new Map<string, { id: string; name: string }>();

  for (const item of subjectSeed) {
    const subject = await prisma.subject.create({
      data: {
        code: item.code,
        name: item.name,
        isActive: true,
      },
    });

    createdSubjects.set(item.code, { id: subject.id, name: subject.name });

    for (const teacherEmail of item.teacherEmails) {
      const teacher = dosenByEmail.get(teacherEmail);
      if (!teacher) continue;

      await prisma.subjectTeacher.create({
        data: {
          subjectId: subject.id,
          userId: teacher.id,
        },
      });
    }
  }

  const classes = await Promise.all([
    prisma.class.create({
      data: {
        name: "AI - Kelas A",
        academicYearId: currentYear.id,
        capacity: 45,
      },
    }),
    prisma.class.create({
      data: {
        name: "AI - Kelas B",
        academicYearId: currentYear.id,
        capacity: 45,
        enrollmentKey: "AI-B-2026",
      },
    }),
    prisma.class.create({
      data: {
        name: "RPL - Reguler",
        academicYearId: currentYear.id,
        capacity: 42,
      },
    }),
    prisma.class.create({
      data: {
        name: "Data Science - Intensif",
        academicYearId: currentYear.id,
        capacity: 35,
        enrollmentKey: "DS-INTENSIF",
      },
    }),
    prisma.class.create({
      data: {
        name: "Jaringan - Reguler",
        academicYearId: years[1].id,
        capacity: 40,
      },
    }),
    prisma.class.create({
      data: {
        name: "AI - Kelas Malam",
        academicYearId: years[1].id,
        capacity: 30,
      },
    }),
  ]);

  const classByName = new Map(classes.map((item) => [item.name, item]));

  const classSubjectPlan: Record<string, string[]> = {
    "AI - Kelas A": ["AI-101", "DB-201", "SE-301"],
    "AI - Kelas B": ["AI-101", "DS-220", "SE-301"],
    "RPL - Reguler": ["SE-301", "DB-201"],
    "Data Science - Intensif": ["AI-101", "DS-220"],
    "Jaringan - Reguler": ["NW-210", "DB-201"],
    "AI - Kelas Malam": ["AI-101", "NW-210"],
  };

  for (const [className, subjectCodes] of Object.entries(classSubjectPlan)) {
    const cls = classByName.get(className);
    if (!cls) continue;

    for (const code of subjectCodes) {
      const subject = createdSubjects.get(code);
      if (!subject) continue;

      await prisma.classSubject.create({
        data: {
          classId: cls.id,
          subjectId: subject.id,
        },
      });
    }
  }

  const activeClasses = [
    classByName.get("AI - Kelas A"),
    classByName.get("AI - Kelas B"),
    classByName.get("RPL - Reguler"),
    classByName.get("Data Science - Intensif"),
  ].filter(Boolean) as Array<{ id: string }>;

  const studentPrimaryClass = new Map<string, string>();
  const classStudentRows: Array<{ classId: string; userId: string; progress: number }> = [];

  for (let i = 0; i < mahasiswaUsers.length; i += 1) {
    const student = mahasiswaUsers[i];
    const primaryClass = pick(activeClasses, i);
    studentPrimaryClass.set(student.id, primaryClass.id);

    classStudentRows.push({
      classId: primaryClass.id,
      userId: student.id,
      progress: Math.min(100, 18 + ((i * 7) % 79)),
    });

    if (i % 5 === 0) {
      const secondaryClass = pick(activeClasses, i + 2);
      if (secondaryClass.id !== primaryClass.id) {
        classStudentRows.push({
          classId: secondaryClass.id,
          userId: student.id,
          progress: Math.min(100, 10 + ((i * 5) % 65)),
        });
      }
    }
  }

  await prisma.classStudent.createMany({
    data: classStudentRows,
  });

  for (const [userId, classId] of studentPrimaryClass) {
    await prisma.user.update({
      where: { id: userId },
      data: { studentClassId: classId },
    });
  }

  const createdCourses = new Map<
    string,
    { id: string; code: string; title: string; createdById: string }
  >();

  for (const [index, subject] of subjectSeed.entries()) {
    const leadTeacherEmail = subject.teacherEmails[0];
    const leadTeacher = dosenByEmail.get(leadTeacherEmail);
    if (!leadTeacher) continue;

    const course = await prisma.course.create({
      data: {
        code: subject.code,
        title: subject.name,
        description: `Mata kuliah ${subject.name} untuk simulasi pembelajaran kampus nyata dengan skenario teori dan praktik.`,
        learningOutcomes:
          "Mahasiswa mampu memahami konsep inti, mengaitkan dengan studi kasus, dan menjelaskan keputusan teknis berbasis data.",
        status: CourseStatus.published,
        createdById: leadTeacher.id,
      },
    });

    createdCourses.set(subject.code, {
      id: course.id,
      code: course.code,
      title: course.title,
      createdById: leadTeacher.id,
    });

    if (index === 0) {
      await prisma.course.create({
        data: {
          code: "AI-102-ADV",
          title: "Kecerdasan Buatan Lanjutan",
          description: "Kelas lanjutan untuk eksperimen model dan optimasi pipeline.",
          learningOutcomes:
            "Mahasiswa mampu mengevaluasi model lanjutan dan memilih strategi deployment.",
          status: CourseStatus.draft,
          createdById: leadTeacher.id,
        },
      });
    }
  }

  await prisma.course.create({
    data: {
      code: "LEG-000",
      title: "Arsip Kurikulum Lama",
      description: "Data arsip untuk validasi tampilan status mata kuliah archived.",
      learningOutcomes: "Tidak digunakan untuk perkuliahan aktif.",
      status: CourseStatus.archived,
      createdById: adminByEmail.get("admin@lms.com")?.id,
    },
  });

  const createdMaterials: Array<{
    id: string;
    title: string;
    module: string;
    page: string | null;
    courseCode: string;
  }> = [];

  for (const subject of subjectSeed) {
    const course = createdCourses.get(subject.code);
    if (!course) continue;

    for (const mod of subject.modules) {
      const content = makeMaterialContent({
        subjectName: subject.name,
        module: mod.module,
        title: mod.title,
        focus: mod.focus,
        caseStudy: mod.caseStudy,
      });

      const material = await prisma.courseMaterial.create({
        data: {
          courseId: course.id,
          title: mod.title,
          module: mod.module,
          page: mod.page,
          content,
          createdById: course.createdById,
        },
      });

      const chunks = splitIntoChunks(content, 320);
      await prisma.materialChunk.createMany({
        data: chunks.map((chunk, chunkIndex) => ({
          materialId: material.id,
          chunkIndex,
          content: chunk,
        })),
      });

      createdMaterials.push({
        id: material.id,
        title: material.title,
        module: material.module,
        page: material.page,
        courseCode: subject.code,
      });
    }
  }

  const chatbotPrompt =
    "Kamu adalah asisten belajar virtual kampus. Jawab hanya dari materi internal. Jelaskan hubungan konsep dengan studi kasus jika pertanyaan meminta penerapan. Hindari pengulangan kalimat. Sertakan sitasi [Sx] pada klaim penting dan sebutkan batasan jika konteks kurang.";

  await prisma.chatbotSetting.create({
    data: {
      key: "default",
      topK: 6,
      minScore: 0.06,
      systemPrompt: chatbotPrompt,
    },
  });

  const faqItems = [
    {
      question: "Bagaimana cara login pertama kali?",
      answer:
        "Gunakan akun yang diberikan admin. Setelah berhasil masuk, segera ganti password melalui menu profil.",
      category: "Akun",
      sortOrder: 1,
    },
    {
      question: "Bagaimana jika lupa password?",
      answer:
        "Hubungi admin akademik untuk reset password sementara, lalu lakukan perubahan password saat login berikutnya.",
      category: "Akun",
      sortOrder: 2,
    },
    {
      question: "Bagaimana cara daftar ke kelas berkunci?",
      answer:
        "Masukkan enrollment key yang diberikan dosen wali pada halaman detail kelas sebelum konfirmasi pendaftaran.",
      category: "Kelas",
      sortOrder: 3,
    },
    {
      question: "Apakah chatbot bisa menjawab di luar materi internal?",
      answer:
        "Tidak. Chatbot memprioritaskan materi internal agar jawaban terjaga konsisten dengan modul perkuliahan.",
      category: "Chatbot",
      sortOrder: 4,
    },
    {
      question: "Bagaimana interpretasi angka sitasi [S1], [S2]?",
      answer:
        "Kode sitasi merujuk ke sumber materi yang dipakai chatbot sebagai dasar jawaban pada sesi tersebut.",
      category: "Chatbot",
      sortOrder: 5,
    },
    {
      question: "Bagaimana dosen mengunggah materi baru?",
      answer:
        "Masuk ke menu Bank Materi, tambah materi baru, isi konten lengkap, lalu simpan agar otomatis diproses menjadi chunk.",
      category: "Materi",
      sortOrder: 6,
    },
    {
      question: "Apa arti status course draft dan archived?",
      answer:
        "Draft berarti belum dipublikasikan ke mahasiswa, archived berarti kursus disimpan sebagai arsip dan tidak aktif.",
      category: "Kursus",
      sortOrder: 7,
    },
    {
      question: "Bagaimana melihat progress mahasiswa dalam kelas?",
      answer:
        "Dosen dapat membuka detail kelas dan memantau progress mahasiswa melalui dashboard admin pada tab kelas.",
      category: "Monitoring",
      sortOrder: 8,
    },
  ];

  await prisma.faq.createMany({
    data: faqItems.map((item) => ({
      ...item,
      isActive: true,
    })),
  });

  const sampleQuestions = [
    "Hubungkan konsep dasar machine learning dengan studi kasus prediksi mahasiswa berisiko drop-out.",
    "Apa perbedaan supervised dan unsupervised learning dalam konteks data akademik?",
    "Jelaskan bagaimana normalisasi database mencegah anomali data saat KRS.",
    "Berikan langkah praktis menguji kualitas model klasifikasi mahasiswa berisiko.",
    "Kenapa arsitektur layered membantu pengembangan LMS skala besar?",
    "Bagaimana cara mengoptimalkan query dashboard agar tetap cepat saat data membesar?",
    "Hubungkan metrik precision dan recall dengan keputusan intervensi akademik.",
    "Apa contoh monitoring jaringan yang relevan saat ujian daring serentak?",
    "Tolong kaitkan storytelling data dengan pelaporan performa mahasiswa ke dekanat.",
    "Jelaskan trade-off antara akurasi model dan biaya komputasi untuk sistem kampus.",
  ];

  const answerTemplate = (topic: string, citation: string) =>
    [
      "Baik, berikut rangkuman berbasis materi internal.",
      "",
      `Inti jawaban berdasarkan materi internal: ${topic} ${citation}`,
      "",
      "Penjelasan ringkas:",
      `- ${topic} ${citation}`,
      "",
      "Poin penting:",
      "- Definisikan konteks masalah secara terukur.",
      "- Gunakan data yang relevan dan tervalidasi.",
      "- Lakukan evaluasi berkala dan dokumentasikan keputusan.",
    ].join("\n");

  for (let i = 0; i < 12; i += 1) {
    const student = pick(mahasiswaUsers, i);
    const session = await prisma.chatSession.create({
      data: {
        userId: student.id,
        title: `Diskusi Akademik ${i + 1}`,
      },
    });

    const turnCount = 3 + (i % 3);
    for (let t = 0; t < turnCount; t += 1) {
      const materialA = pick(createdMaterials, i + t);
      const materialB = pick(createdMaterials, i + t + 4);
      const question = pick(sampleQuestions, i + t);

      const citations = [
        {
          id: "S1",
          materialId: materialA.id,
          title: materialA.title,
          module: materialA.module,
          page: materialA.page,
          score: Number((0.22 + ((i + t) % 7) * 0.04).toFixed(3)),
        },
        {
          id: "S2",
          materialId: materialB.id,
          title: materialB.title,
          module: materialB.module,
          page: materialB.page,
          score: Number((0.17 + ((i + t) % 5) * 0.03).toFixed(3)),
        },
      ];

      await prisma.chatTurn.create({
        data: {
          sessionId: session.id,
          userId: student.id,
          question,
          answer: answerTemplate(
            `${materialA.title} dikaitkan dengan penerapan pada skenario ${materialA.courseCode}.`,
            "¹",
          ),
          citations,
          responseTimeMs: 900 + ((i * 170 + t * 230) % 4200),
          rating: (i + t) % 5 === 0 ? null : ((i + t) % 5) + 1,
          feedback:
            (i + t) % 4 === 0
              ? "Jawaban cukup membantu, perlu contoh lebih konkret."
              : null,
        },
      });
    }
  }

  console.log("Seed kompleks selesai.");
  console.log("Admin utama: admin@lms.com / password123");
  console.log("Admin operasional: operator@lms.com / password123");
  console.log("Dosen contoh: rahmat@lms.com / password123");
  console.log("Mahasiswa contoh: muhammad.daffa.alfarizi@student.lms.com / password123");
  console.log(
    `Total users: ${adminUsers.length + dosenUsers.length + mahasiswaUsers.length}, subjects: ${subjectSeed.length}, materials: ${createdMaterials.length}`,
  );
}

main()
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
