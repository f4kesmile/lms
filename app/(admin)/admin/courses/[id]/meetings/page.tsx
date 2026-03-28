"use client";

import { useCallback, useEffect, useState } from "react";
import type { Route } from "next";
import { useParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  getSubjectMeetingsAction,
  deleteSubjectMeetingAction,
} from "@/lib/actions/meeting";
import { MeetingEditor } from "./_components/MeetingEditor";
import { Prisma } from "@prisma/client";

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
  const [editingMeeting, setEditingMeeting] =
    useState<SubjectMeetingItem | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, sRes] = await Promise.all([
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
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    if (!subjectId) return;
    void loadData();
  }, [subjectId, loadData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus sesi pertemuan ini?")) return;

    const res = await deleteSubjectMeetingAction(id);
    if (res.success) {
      toast.success("Pertemuan dihapus");
      await loadData();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <AdminLayout
      title="Manajemen Sesi Pertemuan"
      headerActions={
        <Button
          onClick={() => {
            setEditingMeeting(null);
            setShowEditor(true);
          }}
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
          <Card className="p-1 rounded-3xl border-none bg-gradient-to-br from-primary/20 via-background to-background shadow-2xl">
            <div className="bg-card rounded-[22px] p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="size-24 rounded-2xl bg-muted overflow-hidden border-2 border-primary/20 shadow-inner">
                {subject.bannerImage ? (
                  <img
                    src={subject.bannerImage}
                    alt={subject.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="size-full flex items-center justify-center bg-primary/5 text-primary">
                    <Icon name="menu_book" size={32} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase tracking-tighter">
                    {subject.code}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {subject.credits || 2} SKS • {subject.status}
                  </span>
                </div>
                <h1 className="text-2xl font-black tracking-tighter mb-2">
                  {subject.name}
                </h1>
                <p className="text-sm text-muted-foreground font-medium line-clamp-2 max-w-2xl leading-relaxed">
                  {subject.description ||
                    "Tentukan materi pembelajaran untuk setiap pertemuan agar mahasiswa dapat belajar secara terstruktur."}
                </p>
              </div>
              <div className="flex flex-col gap-2 min-w-[200px]">
                <div className="flex -space-x-3 mb-1">
                  {subject.teachers?.map((t) => (
                    <div
                      key={t.user.id}
                      className="size-8 rounded-full border-2 border-card bg-primary/20 flex items-center justify-center text-[10px] font-black"
                      title={t.user.name}
                    >
                      {t.user.name.substring(0, 2)}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Tim Dosen Pengampu
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-5 rounded-3xl border border-border/60 bg-card/70">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-black uppercase tracking-widest text-foreground">
              Mahasiswa dan preview materi tersedia di halaman Mata Kuliah Dosen.
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
              onClick={() => setShowEditor(true)}
              className="rounded-xl font-bold"
            >
              Buat Sesi Pertama
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meetings.map((m) => (
              <Card
                key={m.id}
                className="group relative overflow-hidden rounded-3xl border-border/50 bg-card hover:bg-primary/5 transition-all p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg">
                    {m.meetingNo}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg hover:bg-primary/20 hover:text-primary transition-all"
                      onClick={() => {
                        setEditingMeeting(m);
                        setShowEditor(true);
                      }}
                    >
                      <Icon name="edit" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all"
                      onClick={() => handleDelete(m.id)}
                    >
                      <Icon name="delete" size={16} />
                    </Button>
                  </div>
                </div>
                <h3 className="text-lg font-black tracking-tight mb-2 line-clamp-1">
                  {m.title}
                </h3>
                <p className="text-xs text-muted-foreground font-medium line-clamp-2 mb-4 leading-relaxed">
                  {m.content.substring(0, 100)}...
                </p>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icon name="description" size={12} />
                    {m.content.length} Karakter
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="inventory_2" size={12} />
                    RAG Ready
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showEditor && (
        <MeetingEditor
          key={editingMeeting?.id || "new"}
          subjectId={subjectId}
          open={showEditor}
          onClose={() => setShowEditor(false)}
          editingMeeting={editingMeeting}
          onSuccess={loadData}
          nextMeetingNo={meetings.length + 1}
        />
      )}
    </AdminLayout>
  );
}
