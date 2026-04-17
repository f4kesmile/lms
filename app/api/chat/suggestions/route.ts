import type { Prisma, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/user";
import { prisma } from "@/lib/core/db";
import { serverError, unauthorized } from "@/lib/core/http";

const adminTemplates = [
  "Tampilkan ringkasan statistik platform minggu ini",
  "Bagaimana cara mengelola pengguna baru di sistem?",
  "Beri saya panduan membaca log aktivitas server",
  "Jelaskan peran dan batas kewenangan admin",
  "Apa metrik utama yang harus admin pantau?",
  "Tampilkan rekap mahasiswa dan dosen aktif",
];

const studentTemplates = [
  "Jelaskan konsep inti dari {title}",
  "Apa poin penting pada {title}?",
  "Berikan rangkuman singkat terkait {title}",
  "Bagaimana penerapan {title} di dunia nyata?",
  "Apa kesalahan umum saat mempelajari {title}?",
  "Beri contoh penerapan sederhana untuk {title}",
];

const mentorTemplates = [
  "Rancang soal latihan lanjutan dari materi {title}",
  "Apa saja kemampuan yang harus dicapai mahasiswa pada {title}?",
  "Buat bahan diskusi interaktif tentang {title}",
  "Bagaimana cara mengevaluasi pemahaman terkait {title}?",
  "Apa indikator keberhasilan belajar untuk topik {title}?",
  "Hubungkan materi {title} dengan studi kasus tingkat lanjut",
];

function truncateTitle(title: string, maxLength = 72): string {
  const clean = title.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trimEnd()}...`;
}

function shuffle<T>(items: T[]): T[] {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

type MeetingSuggestionItem = {
  id: string;
  title: string;
  meetingNo: number;
  subjectName: string;
};

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const allowedRoles: UserRole[] = ["admin", "dosen", "mahasiswa"];
    if (!allowedRoles.includes(user.role)) return unauthorized();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") || 8), 12);
    const classId = searchParams.get("classId")?.trim() || undefined;

    // Untuk Admin, langsung kembalikan static template yang diacak tanpa harus hit tabel Meeting
    if (user.role === "admin") {
      const suggestions = shuffle([...adminTemplates]).slice(0, limit);
      return NextResponse.json({ suggestions, meetings: [] });
    }

    const templates = user.role === "mahasiswa" ? studentTemplates : mentorTemplates;

    const whereConditions: Prisma.SubjectMeetingWhereInput = classId
      ? { subject: { classes: { some: { classId } } } }
      : {};

    const rawMeetings = await prisma.subjectMeeting.findMany({
      where: whereConditions,
      orderBy: { updatedAt: "desc" },
      take: 40,
      select: {
        id: true,
        title: true,
        meetingNo: true,
        subject: { select: { name: true } },
      },
    });

    const meetings: MeetingSuggestionItem[] = rawMeetings.map((m) => ({
      id: m.id,
      title: m.title,
      meetingNo: m.meetingNo,
      subjectName: m.subject.name,
    }));

    const groupedBySubject = new Map<string, MeetingSuggestionItem[]>();
    for (const meeting of meetings) {
      const key = meeting.subjectName || "Tanpa Mata Kuliah";
      const bucket = groupedBySubject.get(key) || [];
      bucket.push(meeting);
      groupedBySubject.set(key, bucket);
    }

    const subjectKeys = shuffle(Array.from(groupedBySubject.keys()));
    const subjectQueues = subjectKeys.map((key) => ({
      key,
      meetings: shuffle(groupedBySubject.get(key) || []),
      templateOrder: shuffle(templates),
      nextMeeting: 0,
      nextTemplate: 0,
    }));

    const suggestions: string[] = [];
    const seen = new Set<string>();

    while (suggestions.length < limit) {
      let addedInRound = false;

      for (const queue of subjectQueues) {
        if (suggestions.length >= limit) break;
        if (queue.meetings.length === 0) continue;

        const meeting = queue.meetings[queue.nextMeeting % queue.meetings.length];
        const template = queue.templateOrder[queue.nextTemplate % queue.templateOrder.length];
        const suggestion = template.replace("{title}", truncateTitle(meeting.title));

        queue.nextTemplate += 1;
        if (queue.nextTemplate % queue.templateOrder.length === 0) {
          queue.nextMeeting += 1;
        }

        if (seen.has(suggestion)) continue;

        seen.add(suggestion);
        suggestions.push(suggestion);
        addedInRound = true;
      }

      if (!addedInRound) break;
    }

    // Jika DB materi kosong dan loop di atas gagal dapat minimal limit
    if (suggestions.length === 0) {
      suggestions.push("Ceritakan sedikit tentang platform ini", "Apa fungsi utama dari LMS ini?");
    }

    return NextResponse.json({
      suggestions,
      meetings: meetings.map((m) => ({
        id: m.id,
        title: m.title,
        meetingNo: m.meetingNo,
        subjectName: m.subjectName,
      })),
    });
  } catch (error) {
    return serverError(error);
  }
}
