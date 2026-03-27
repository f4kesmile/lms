import { Navbar } from "@/components/layout/Navbar";
import { prisma } from "@/lib/core/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type SubjectMeetingsPageProps = {
  params: Promise<{ classId: string; subjectId: string }>;
};

export default async function SubjectMeetingsPage({
  params,
}: SubjectMeetingsPageProps) {
  const { classId, subjectId } = await params;

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      meetings: {
        orderBy: { meetingNo: "asc" },
      },
      teachers: {
         include: {
            user: { select: { name: true } }
         }
      }
    },
  });

  if (!subject) notFound();

  return (
    <>
      <Navbar />
      <main className="app-shell flex flex-col gap-8 pb-16">
        <nav className="flex items-center gap-2 text-[0.85rem] text-muted-foreground">
          <Link href={`/courses/${classId}` as Route} className="text-primary hover:underline">
            Kembali ke Kelas
          </Link>
          <Icon name="chevron_right" size={16} />
          <span className="text-foreground font-semibold">{subject.name}</span>
        </nav>

        <header className="neo-card overflow-hidden">
          <div className="relative h-48 md:h-64 flex items-end p-8 overflow-hidden">
             {subject.bannerImage ? (
                <img src={subject.bannerImage} alt={subject.name} className="absolute inset-0 size-full object-cover" />
             ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-secondary-brand/40 to-secondary-brand/10" />
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
             <div className="relative z-10 space-y-2">
                <span className="px-2 py-1 rounded bg-secondary-brand text-secondary-brand-foreground text-[10px] font-black uppercase tracking-widest">{subject.code}</span>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{subject.name}</h1>
                <p className="text-white/70 text-sm font-medium">Diampu oleh: {subject.teachers.map(t => t.user.name).join(", ")}</p>
             </div>
          </div>
        </header>

        <div className="grid-2 lg:grid-cols-[2fr_1fr] items-start">
           <section className="space-y-6">
              <div className="flex flex-col gap-1">
                 <h2 className="text-2xl font-black tracking-tight">Sesi Pertemuan</h2>
                 <p className="text-sm text-muted-foreground font-medium">Pilih sesi untuk mulai membaca materi dan berdiskusi dengan AI.</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                 {subject.meetings.length > 0 ? (
                    subject.meetings.map((meeting) => (
                       <Link
                          key={meeting.id}
                          href={`/courses/${classId}/subjects/${subjectId}/meetings/${meeting.meetingNo}` as Route}
                          className="group flex items-center justify-between p-5 rounded-2xl border-2 border-border bg-card transition-all hover:border-secondary-brand hover:shadow-xl hover:shadow-secondary-brand/5"
                       >
                          <div className="flex items-center gap-5">
                             <div className="size-12 shrink-0 rounded-xl bg-muted flex flex-col items-center justify-center group-hover:bg-secondary-brand/10 transition-colors">
                                <span className="text-[10px] font-black leading-none opacity-50">SESI</span>
                                <span className="text-lg font-black leading-none">{meeting.meetingNo}</span>
                             </div>
                             <div className="flex flex-col">
                                <h4 className="font-black text-foreground group-hover:text-secondary-brand transition-colors line-clamp-1">{meeting.title}</h4>
                                <p className="text-xs text-muted-foreground">Materi bacaan & asisten AI aktif</p>
                             </div>
                          </div>
                          <Icon name="arrow_forward" size={20} className="text-muted-foreground group-hover:text-secondary-brand transition-all group-hover:translate-x-1" />
                       </Link>
                    ))
                 ) : (
                    <div className="py-20 text-center bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
                       <Icon name="event_busy" size={48} className="text-muted-foreground/30 mb-4 mx-auto" />
                       <p className="font-bold text-muted-foreground text-sm">Belum ada sesi pertemuan yang dijadwalkan.</p>
                    </div>
                 )}
              </div>
           </section>

           <aside className="space-y-6">
              <Card className="p-6 rounded-[2rem] border-2 border-secondary-brand/20 bg-secondary-brand/5">
                 <h3 className="text-sm font-black uppercase tracking-widest text-secondary-brand mb-4">Mengenai Mata Kuliah</h3>
                 <div className="space-y-4">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Deskripsi</p>
                       <p className="text-xs font-medium leading-relaxed">{subject.description || "Tidak ada deskripsi."}</p>
                    </div>
                    {subject.learningOutcomes && (
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">CPMK</p>
                          <p className="text-xs font-medium leading-relaxed">{subject.learningOutcomes}</p>
                       </div>
                    )}
                 </div>
              </Card>

              <Card className="p-6 rounded-[2rem] border-none bg-primary/10 shadow-xl shadow-primary/5">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                       <Icon name="psychology" size={20} />
                    </div>
                    <h3 className="font-black tracking-tight">E-Learning RAG</h3>
                 </div>
                 <p className="text-xs text-muted-foreground leading-relaxed font-medium"> 
                    Setiap materi sesi di mata kuliah ini telah diindeks ke dalam sistem AI. Kamu bisa bertanya apa saja seputar topik perkuliahan ini langsung dari halaman materi.
                 </p>
              </Card>
           </aside>
        </div>
      </main>
    </>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("bg-card border border-border overflow-hidden", className)}>{children}</div>;
}
