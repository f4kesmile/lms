"use client";

import { Prisma } from "@prisma/client";
import type { Route } from "next";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, getInitials } from "@/lib/utils/index";

const MeetingEditor = dynamic(
  () =>
    import("@/app/(admin)/admin/courses/[id]/meetings/_components/MeetingEditor").then(
      (mod) => mod.MeetingEditor,
    ),
  { ssr: false },
);
import {
  deleteSubjectMeetingAction,
  getSubjectMeetingsAction,
} from "@/lib/actions/meeting";

export type SubjectMeetingItem = {
  id: string;
  subjectId: string;
  meetingNo: number;
  title: string;
  content: string;
  assets: Prisma.JsonValue;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export default function SubjectMeetingsPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.id as string;

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    role: string;
  } | null>(null);

  const [meetings, setMeetings] = useState<SubjectMeetingItem[]>([]);
  const [subject, setSubject] = useState<{
    id: string;
    code: string;
    name: string;
    description: string | null;
    bannerImage: string | null;
    status: string;
    credits: number;
    teachers: Array<{ user: { id: string; name: string } }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: (() => Promise<void> | void) | null;
  }>({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, sRes, sessionRes] = await Promise.all([
        getSubjectMeetingsAction(subjectId),
        fetch(`/api/kb/courses`).then((r) => r.json()) as Promise<{
          courses: Array<{
            id: string;
            name: string;
            code: string;
            description: string | null;
            bannerImage: string | null;
            status: string;
            credits: number;
            teachers: Array<{ user: { id: string; name: string } }>;
          }>;
        }>,
        fetch("/api/auth/session").then((r) => r.json()) as Promise<{
          user?: { id: string; name: string; role: string };
        }>,
      ]);

      if (mRes.success) {
        setMeetings(mRes.meetings || []);
      } else {
        setMeetings([]);
        toast.error(mRes.error || "Gagal memuat sesi");
      }

      const currentSubject = sRes.courses?.find(
        (c: { id: string }) => c.id === subjectId,
      );
      if (currentSubject) setSubject(currentSubject);

      setCurrentUser(sessionRes?.user ?? null);
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  const headerTeachers =
    currentUser?.role === "dosen"
      ? [{ user: { id: currentUser.id, name: currentUser.name } }]
      : Array.from(
          new Map(subject?.teachers?.map((t) => [t.user.id, t]) ?? []).values(),
        );

  useEffect(() => {
    if (!subjectId) return;
    void loadData();
  }, [subjectId, loadData]);

  const handleDelete = async (id: string) => {
    setConfirmState({
      open: true,
      title: "Hapus Sesi Pertemuan",
      message:
        "Aksi ini tidak dapat dibatalkan. Hapus sesi ini secara permanen?",
      onConfirm: async () => {
        const res = await deleteSubjectMeetingAction(id);
        if (res.success) {
          toast.success("Pertemuan berhasil dihapus");
          await loadData();
        } else {
          toast.error(res.error || "Gagal menghapus sesi");
        }
      },
    });
  };

  const openWorkstation = (meetingId?: string) => {
    const url = new URL("/admin/knowledge", window.location.origin);
    url.searchParams.set("courseId", subjectId);
    url.searchParams.set("type", "session");
    if (meetingId) {
      url.searchParams.set("edit", meetingId);
    } else {
      url.searchParams.set("new", "true");
      url.searchParams.set("meetingNo", (meetings.length + 1).toString());
    }
    router.push((url.pathname + url.search) as Route);
  };

  return (
    <AdminLayout
      title="Manajemen Sesi Pertemuan"
      headerActions={
        <Button
          onClick={() => openWorkstation()}
          className="rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-primary/20"
        >
          <Icon name="add" size={18} className="mr-2" />
          Tambah Sesi
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/courses" as Route)}
            className="rounded-full hover:bg-primary/10 text-primary border border-border/50 transition-all"
          >
            <Icon name="arrow_back" size={20} />
          </Button>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
              Pusat Akademik
            </h2>
            <p className="text-xl font-black tracking-tight">
              Manajemen Sesi Pembelajaran
            </p>
          </div>
        </div>

        {subject && (
          <div className="relative group overflow-hidden rounded-[2.5rem] p-[1px] bg-gradient-to-br from-primary/30 via-border/50 to-background shadow-2xl transition-all hover:shadow-primary/5">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 opacity-50" />
            <div className="relative bg-card rounded-[2.45rem] p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start md:items-center overflow-hidden">
              {/* Ornamen Background */}
              <div className="absolute -right-20 -top-20 size-64 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute -left-20 -bottom-20 size-64 bg-primary/5 rounded-full blur-3xl" />

              <div className="relative size-28 md:size-32 shrink-0 rounded-[2rem] bg-gradient-to-br from-muted/50 to-muted overflow-hidden border border-border/40 shadow-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                {subject.bannerImage ? (
                  <Image
                    src={subject.bannerImage}
                    alt={subject.name}
                    width={128}
                    height={128}
                    unoptimized
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="size-full flex items-center justify-center bg-primary/5 text-primary/40">
                    <Icon name="menu_book" size={48} />
                  </div>
                )}
              </div>

              <div className="relative flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider border border-primary/20">
                    {subject.code}
                  </div>
                  <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <Icon
                      name="history_edu"
                      size={14}
                      className="text-primary/40"
                    />
                    {subject.credits || 2} SKS • {subject.status}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 text-foreground leading-[1.1]">
                  {subject.name}
                </h1>

                <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed max-w-3xl line-clamp-2 md:line-clamp-none opacity-80">
                  {subject.description ||
                    "Platform manajemen workstation untuk mendistribusikan materi pembelajaran secara terstruktur melalui asisten AI Nusa Belajar."}
                </p>
              </div>

              <div className="relative flex flex-col gap-4 min-w-[180px] pt-6 md:pt-0 md:pl-8 border-t md:border-t-0 md:border-l border-border/40">
                <div className="flex -space-x-3 mb-1 justify-start md:justify-end">
                  {headerTeachers.map((t) => (
                    <Tooltip key={`teacher-${t.user.id}`}>
                      <TooltipTrigger asChild>
                        <div className="size-10 rounded-full border-2 border-card bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary shadow-xl ring-2 ring-background transition-transform hover:scale-110 hover:z-30 cursor-pointer">
                          {getInitials(t.user.name)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="font-bold">
                        {t.user.name}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                <div className="text-start md:text-end">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                    Tim Pengajar
                  </p>
                  <p className="text-[9px] font-bold text-muted-foreground/60 uppercase mt-0.5">
                    Nusa Belajar Academic
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <Card className="p-5 rounded-3xl border border-border/60 bg-card/70">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-black uppercase tracking-widest text-foreground">
              Mahasiswa dan preview materi tersedia di halaman Mata Kuliah
              Dosen.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/teaching-schedule" as Route)}
              className="rounded-xl font-black text-[11px] uppercase tracking-widest"
            >
              Buka Halaman Mata Kuliah Dosen
            </Button>
          </div>
        </Card>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 bg-card/50 animate-pulse rounded-3xl border border-border/30"
              />
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card/30 rounded-3xl border border-dashed border-border/50">
            <Icon
              name="history_edu"
              size={48}
              className="text-muted-foreground/30 mb-4"
            />
            <p className="font-bold text-muted-foreground">
              Belum ada sesi pertemuan
            </p>
            <p className="text-sm text-muted-foreground/60 mb-6">
              Mulai tambahkan materi untuk setiap pertemuan.
            </p>
            <Button
              variant="outline"
              onClick={() => openWorkstation()}
              className="rounded-xl font-bold"
            >
              Buat Sesi Pertama
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meetings.map((m) => (
              <div
                key={m.id}
                className="group relative overflow-hidden rounded-[2rem] border border-border/40 bg-card p-7 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative mb-6 flex items-start justify-between">
                  <div className="flex flex-col gap-1.5">
                    <div className="size-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20 border border-primary/10">
                      {m.meetingNo}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 pl-1">
                      Sesi
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-10 rounded-[1rem] border border-border/40 bg-background/50 backdrop-blur-md text-foreground shadow-sm hover:border-primary hover:text-primary transition-all"
                          onClick={() => openWorkstation(m.id)}
                        >
                          <Icon name="edit" size={20} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="font-bold">
                        Edit Sesi
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-10 rounded-[1rem] border border-destructive/10 bg-destructive/5 text-destructive shadow-sm hover:bg-destructive hover:text-white transition-all"
                          onClick={() => handleDelete(m.id)}
                        >
                          <Icon name="delete" size={20} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="font-bold">
                        Hapus Sesi
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <h3 className="relative text-xl font-black tracking-tight mb-3 text-foreground line-clamp-2 leading-tight min-h-[3rem]">
                  {m.title}
                </h3>

                <div
                  className="relative text-xs text-muted-foreground/70 font-medium line-clamp-2 mb-6 leading-relaxed max-h-12 overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: m.content }}
                />

                <div className="relative pt-6 border-t border-border/40 flex items-center gap-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-primary/40" />
                    <Icon
                      name="description"
                      size={14}
                      className="text-primary/40"
                    />
                    {m.content.length.toLocaleString()} Karakter
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-secondary-brand/40" />
                    <Icon
                      name="database"
                      size={14}
                      className="text-secondary-brand/40"
                    />
                    Knowledge Bank
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <Dialog
          open={confirmState.open}
          onOpenChange={(o) =>
            setConfirmState((p) => ({
              ...p,
              open: o,
              onConfirm: o ? p.onConfirm : null,
            }))
          }
        >
          <DialogContent className="sm:max-w-md border border-border rounded-md shadow-sm">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase text-destructive">
                {confirmState.title}
              </DialogTitle>
              <DialogDescription className="font-bold text-muted-foreground pt-2">
                {confirmState.message}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 pt-6">
              <Button
                variant="ghost"
                className="font-black text-[11px] uppercase tracking-widest border border-border h-11 px-6"
                onClick={() => setConfirmState((p) => ({ ...p, open: false }))}
              >
                Batal
              </Button>
              <Button
                className="font-black text-[11px] uppercase tracking-widest bg-destructive hover:bg-destructive/90 text-destructive-foreground px-8 rounded-md border border-border shadow-sm h-11"
                onClick={async () => {
                  if (confirmState.onConfirm) await confirmState.onConfirm();
                  setConfirmState((p) => ({ ...p, open: false }));
                }}
              >
                Ya, Hapus Sesi
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
