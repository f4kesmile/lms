import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarkMeetingCompleteButton } from "@/app/(public)/courses/[classId]/subjects/[subjectId]/meetings/[meetingNo]/_components/MarkMeetingCompleteButton";
import { Navbar } from "@/components/layout/Navbar";
import { Icon } from "@/components/ui/icon";
import { getCurrentUserIdFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/core/db";
import { cn } from "@/lib/utils";
import { renderMaterialHtml } from "@/lib/utils/material-content";

type MeetingContentPageProps = {
  params: Promise<{
    classId: string;
    subjectId: string;
    meetingNo: string;
  }>;
};

export default async function MeetingContentPage({
  params,
}: MeetingContentPageProps) {
  const { classId, subjectId, meetingNo: mNoStr } = await params;
  const meetingNo = parseInt(mNoStr);

  const meeting = await prisma.subjectMeeting.findFirst({
    where: {
      subjectId,
      meetingNo,
    },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          code: true,
          _count: { select: { meetings: true } },
        },
      },
    },
  });

  if (!meeting) notFound();

  const prevMeeting =
    meetingNo > 1
      ? await prisma.subjectMeeting.findFirst({
          where: { subjectId, meetingNo: meetingNo - 1 },
          select: { id: true, meetingNo: true, title: true },
        })
      : null;

  const nextMeeting =
    meetingNo < meeting.subject._count.meetings
      ? await prisma.subjectMeeting.findFirst({
          where: { subjectId, meetingNo: meetingNo + 1 },
          select: { id: true, meetingNo: true, title: true },
        })
      : null;

  const currentUserId = await getCurrentUserIdFromCookie();
  const completionDelegate = (
    prisma as unknown as {
      subjectMeetingCompletion?: {
        findUnique: (args: {
          where: {
            meetingId_classId_userId: {
              meetingId: string;
              classId: string;
              userId: string;
            };
          };
          select: { meetingId: true };
        }) => Promise<{ meetingId: string } | null>;
        count: (args: {
          where: {
            classId: string;
            userId: string;
            meeting: { subjectId: string };
          };
        }) => Promise<number>;
      };
    }
  ).subjectMeetingCompletion;

  let canMarkComplete = false;
  let initialCompleted = false;
  let initialProgress = 0;

  if (currentUserId) {
    const enrollment = await prisma.classStudent.findUnique({
      where: { classId_userId: { classId, userId: currentUserId } },
      select: { classId: true },
    });

    if (enrollment && completionDelegate) {
      canMarkComplete = true;

      const [completion, totalMeetings, completedMeetings] = await Promise.all([
        completionDelegate.findUnique({
          where: {
            meetingId_classId_userId: {
              meetingId: meeting.id,
              classId,
              userId: currentUserId,
            },
          },
          select: { meetingId: true },
        }),
        prisma.subjectMeeting.count({ where: { subjectId } }),
        completionDelegate.count({
          where: {
            classId,
            userId: currentUserId,
            meeting: { subjectId },
          },
        }),
      ]);

      initialCompleted = Boolean(completion);
      initialProgress =
        totalMeetings > 0
          ? Math.round((completedMeetings / totalMeetings) * 100)
          : 0;
    }
  }

  return (
    <>
      <Navbar />
      <main className="app-shell flex flex-col gap-8 pb-32">
        <nav className="flex items-center gap-2 text-[0.85rem] text-muted-foreground">
          <Link
            href={`/courses/${classId}` as Route}
            className="hover:text-primary transition-colors"
          >
            Beranda Kelas
          </Link>
          <Icon name="chevron_right" size={16} />
          <Link
            href={`/courses/${classId}/subjects/${subjectId}` as Route}
            className="hover:text-primary transition-colors"
          >
            {meeting.subject.name}
          </Link>
          <Icon name="chevron_right" size={16} />
          <span className="text-foreground font-semibold">
            Sesi {meeting.meetingNo}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          <article className="space-y-8">
            <header className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-secondary-brand/10 text-secondary-brand text-[10px] font-black uppercase tracking-widest border border-secondary-brand/20">
                  Pertemuan {meeting.meetingNo}
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  {meeting.subject.code}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                {meeting.title}
              </h1>
            </header>

            <div className="neo-card p-8 md:p-12 bg-card min-h-[400px]">
              <div
                className="prose prose-lg dark:prose-invert max-w-none 
                               prose-headings:font-black prose-headings:tracking-tight
                               prose-p:text-foreground/90 prose-p:leading-relaxed
                               prose-strong:text-primary prose-strong:font-black"
                dangerouslySetInnerHTML={{
                  __html: renderMaterialHtml(meeting.content),
                }}
              />
            </div>

            <footer className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
              {prevMeeting ? (
                <Link
                  href={
                    `/courses/${classId}/subjects/${subjectId}/meetings/${prevMeeting.meetingNo}` as Route
                  }
                  className="group flex flex-col gap-2 p-6 rounded-3xl border-2 border-border bg-card transition-all hover:border-primary hover:-translate-x-1"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary">
                    Sesi Sebelumnya
                  </span>
                  <span className="font-bold text-sm line-clamp-1">
                    {prevMeeting.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}

              {nextMeeting ? (
                <Link
                  href={
                    `/courses/${classId}/subjects/${subjectId}/meetings/${nextMeeting.meetingNo}` as Route
                  }
                  className="group flex flex-col gap-2 p-6 rounded-3xl border-2 border-border bg-card transition-all hover:border-primary hover:translate-x-1 text-right"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary">
                    Sesi Berikutnya
                  </span>
                  <span className="font-bold text-sm line-clamp-1">
                    {nextMeeting.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
            </footer>
          </article>

          <aside className="space-y-6 lg:sticky lg:top-24">
            <Card className="p-6 rounded-[2rem] bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                  <Icon name="info" size={20} />
                </div>
                <h3 className="font-black tracking-tight text-sm">
                  Informasi Sesi
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">
                    Mata Kuliah
                  </span>
                  <span className="font-black text-primary">
                    {meeting.subject.code}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">
                    Progress Sesi
                  </span>
                  <span className="font-black">
                    {meeting.meetingNo} / {meeting.subject._count.meetings}
                  </span>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-border/40">
                <MarkMeetingCompleteButton
                  meetingId={meeting.id}
                  classId={classId}
                  subjectId={subjectId}
                  initialCompleted={initialCompleted}
                  initialProgress={initialProgress}
                  canMark={canMarkComplete}
                />
              </div>
            </Card>

            <Card className="p-8 rounded-[2.5rem] bg-secondary-brand text-secondary-brand-foreground shadow-2xl shadow-secondary-brand/20">
              <Icon name="psychology" size={48} className="mb-4 opacity-50" />
              <h3 className="text-xl font-black tracking-tight mb-2">
                Butuh Bantuan?
              </h3>
              <p className="text-xs font-medium leading-relaxed mb-6 opacity-90">
                Gunakan tombol chat di pojok kanan bawah untuk bertanya seputar
                materi sesi {meeting.meetingNo} ini. AI kami telah mempelajari
                seluruh modul mata kuliah ini.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-black/20 px-3 py-2 rounded-lg w-fit">
                <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AI Assistant Online
              </div>
            </Card>
          </aside>
        </div>
      </main>
    </>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("bg-card border border-border overflow-hidden", className)}
    >
      {children}
    </div>
  );
}
