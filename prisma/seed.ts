import "dotenv/config";

import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { splitIntoChunks } from "@/lib/rag";

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

  const admin = await prisma.user.create({
    data: {
      name: "Administrator LMS",
      email: "admin@lms.com",
      password: passwordHash,
      role: UserRole.admin,
    },
  });

  const dosenA = await prisma.user.create({
    data: {
      name: "Dr. Rahmat Hidayat",
      email: "rahmat@lms.com",
      password: passwordHash,
      role: UserRole.dosen,
    },
  });

  const dosenB = await prisma.user.create({
    data: {
      name: "Prof. Dian Lestari",
      email: "dian@lms.com",
      password: passwordHash,
      role: UserRole.dosen,
    },
  });

  const mahasiswa = await Promise.all(
    [
      "Alya Pratama",
      "Bima Nugraha",
      "Citra Laksmi",
      "Danu Aditya",
      "Eka Mahendra",
      "Farah Nabila",
      "Gilang Ramadhan",
      "Hanif Setiawan",
    ].map((name, index) =>
      prisma.user.create({
        data: {
          name,
          email: `mhs${index + 1}@lms.com`,
          password: passwordHash,
          role: UserRole.mahasiswa,
        },
      }),
    ),
  );

  const yearActive = await prisma.academicYear.create({
    data: {
      name: "Ganjil 2025/2026",
      fromYear: new Date("2025-08-01"),
      toYear: new Date("2026-01-31"),
      isCurrent: true,
    },
  });

  await prisma.academicYear.create({
    data: {
      name: "Genap 2025/2026",
      fromYear: new Date("2026-02-01"),
      toYear: new Date("2026-07-31"),
      isCurrent: false,
    },
  });

  const subjects = await Promise.all([
    prisma.subject.create({
      data: { name: "Kecerdasan Buatan", code: "AI-101" },
    }),
    prisma.subject.create({
      data: { name: "Basis Data Lanjut", code: "DB-201" },
    }),
    prisma.subject.create({
      data: { name: "Rekayasa Perangkat Lunak", code: "SE-301" },
    }),
  ]);

  await prisma.subjectTeacher.createMany({
    data: [
      { subjectId: subjects[0].id, userId: dosenA.id },
      { subjectId: subjects[1].id, userId: dosenA.id },
      { subjectId: subjects[2].id, userId: dosenB.id },
    ],
  });

  const classAI = await prisma.class.create({
    data: {
      name: "AI - Kelas A",
      academicYearId: yearActive.id,
      classTeacherId: dosenA.id,
      capacity: 40,
    },
  });

  const classRPL = await prisma.class.create({
    data: {
      name: "RPL - Reguler",
      academicYearId: yearActive.id,
      classTeacherId: dosenB.id,
      capacity: 40,
    },
  });

  await prisma.classSubject.createMany({
    data: [
      { classId: classAI.id, subjectId: subjects[0].id },
      { classId: classAI.id, subjectId: subjects[1].id },
      { classId: classRPL.id, subjectId: subjects[2].id },
    ],
  });

  await prisma.classStudent.createMany({
    data: mahasiswa.map((mhs, index) => ({
      classId: index < 4 ? classAI.id : classRPL.id,
      userId: mhs.id,
      progress: 15 + index * 10,
    })),
  });

  const materialPayload = [
    {
      code: "AI-101",
      courseTitle: "Pengantar Kecerdasan Buatan",
      createdById: dosenA.id,
      title: "Konsep Dasar Machine Learning",
      module: "Modul 1",
      page: "1-8",
      content:
        "Machine Learning adalah cabang AI yang memungkinkan sistem belajar dari data. Proses dimulai dari pengumpulan data, preprocessing, training model, lalu evaluasi metrik. Model supervised belajar dari label, sedangkan unsupervised mencari pola tanpa label.",
    },
    {
      code: "DB-201",
      courseTitle: "Basis Data Lanjut",
      createdById: dosenA.id,
      title: "Normalisasi dan Relasi Database",
      module: "Modul 2",
      page: "9-15",
      content:
        "Normalisasi bertujuan mengurangi redundansi data. Bentuk normal pertama memastikan setiap kolom atomik, bentuk normal kedua menghilangkan ketergantungan parsial, dan bentuk normal ketiga menghilangkan ketergantungan transitif. Relasi one-to-many dan many-to-many harus didesain dengan foreign key yang tepat.",
    },
    {
      code: "SE-301",
      courseTitle: "Rekayasa Perangkat Lunak",
      createdById: dosenB.id,
      title: "Arsitektur Layered pada Aplikasi Web",
      module: "Modul 3",
      page: "16-23",
      content:
        "Arsitektur layered memisahkan domain menjadi presentation, application, domain, dan infrastructure. Pemisahan ini membantu testability, maintainability, dan scalability. Pada Next.js, pemisahan dapat diterapkan melalui route handler, service layer, dan komponen UI.",
    },
  ];

  const courseByCode = new Map<string, { id: string }>();

  for (const material of materialPayload) {
    if (courseByCode.has(material.code)) continue;

    const course = await prisma.course.create({
      data: {
        code: material.code,
        title: material.courseTitle,
        description: `Template mata kuliah untuk ${material.courseTitle}`,
        learningOutcomes: `Mahasiswa memahami materi inti pada ${material.courseTitle}`,
        status: "published",
        createdById: material.createdById,
      },
    });

    courseByCode.set(material.code, { id: course.id });
  }

  for (const mat of materialPayload) {
    const course = courseByCode.get(mat.code);

    const material = await prisma.courseMaterial.create({
      data: {
        courseId: course?.id,
        title: mat.title,
        module: mat.module,
        page: mat.page,
        content: mat.content,
        createdById: mat.createdById,
      },
    });

    const chunks = splitIntoChunks(mat.content, 220);
    await prisma.materialChunk.createMany({
      data: chunks.map((chunk, chunkIndex) => ({
        materialId: material.id,
        chunkIndex,
        content: chunk,
      })),
    });
  }

  const chatSession = await prisma.chatSession.create({
    data: {
      userId: mahasiswa[0].id,
      title: "Diskusi AI dan RAG",
    },
  });

  await prisma.chatTurn.createMany({
    data: [
      {
        sessionId: chatSession.id,
        userId: mahasiswa[0].id,
        question: "Apa perbedaan supervised dan unsupervised learning?",
        answer:
          "Supervised learning belajar dari data berlabel, sedangkan unsupervised learning mencari pola dari data tanpa label.",
        citations: [
          {
            id: "S1",
            title: "Konsep Dasar Machine Learning",
            module: "Modul 1",
          },
        ],
        responseTimeMs: 1420,
        rating: 5,
      },
      {
        sessionId: chatSession.id,
        userId: mahasiswa[0].id,
        question: "Kenapa normalisasi database penting?",
        answer:
          "Normalisasi penting untuk mengurangi duplikasi data dan menjaga konsistensi antar tabel.",
        citations: [
          {
            id: "S1",
            title: "Normalisasi dan Relasi Database",
            module: "Modul 2",
          },
        ],
        responseTimeMs: 1890,
        rating: 4,
      },
    ],
  });

  await prisma.faq.createMany({
    data: [
      {
        question: "Bagaimana cara login pertama kali?",
        answer: "Gunakan akun yang diberikan admin dan ubah password setelah login.",
        category: "Akun",
        isActive: true,
        sortOrder: 1,
      },
      {
        question: "Apakah chatbot bisa dipakai 24 jam?",
        answer: "Ya, chatbot dapat digunakan kapan saja selama sistem aktif.",
        category: "Chatbot",
        isActive: true,
        sortOrder: 2,
      },
    ],
  });

  await prisma.chatbotSetting.create({
    data: {
      key: "default",
      topK: 4,
      minScore: 0.08,
      systemPrompt:
        "Kamu adalah asisten belajar virtual. Jawab hanya berdasarkan konteks materi internal yang diberikan. Jika konteks kurang, katakan keterbatasannya. Setiap klaim utama harus menyertakan sitasi [Sx]. Gunakan Bahasa Indonesia yang jelas dan ringkas.",
    },
  });

  console.log("Seed selesai.");
  console.log("Admin: admin@lms.com / password123");
  console.log("Dosen: rahmat@lms.com / password123");
  console.log("Mahasiswa: mhs1@lms.com / password123");
}

main()
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
