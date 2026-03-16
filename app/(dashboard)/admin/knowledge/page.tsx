"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { formatDate } from "@/lib/utils/index";
import {
  FileText,
  Trash2,
  Plus,
  Search,
  Database,
  RefreshCw,
  Pencil,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Material = {
  id: string;
  courseId: string | null;
  title: string;
  module: string;
  page: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  _count: { chunks: number };
  course: { id: string; code: string; title: string } | null;
  createdBy: { id: string; name: string | null; email: string } | null;
};

type MaterialForm = {
  courseId: string;
  title: string;
  module: string;
  page: string;
  content: string;
};

type CourseOption = {
  id: string;
  code: string;
  title: string;
  status: string;
};

const EMPTY_FORM: MaterialForm = {
  courseId: "",
  title: "",
  module: "",
  page: "",
  content: "",
};

const MODULE_SUGGESTIONS = [
  "Pertemuan 1 - Pengantar",
  "Pertemuan 2",
  "Pertemuan 3",
  "Pertemuan 4",
  "Pertemuan 5",
  "Pertemuan 6",
  "Pertemuan 7",
  "Pertemuan 8 - UTS",
  "Pertemuan 9",
  "Pertemuan 10",
  "Pertemuan 11",
  "Pertemuan 12",
  "Pertemuan 13",
  "Pertemuan 14",
  "Pertemuan 15",
  "Pertemuan 16 - UAS",
  "Praktikum",
  "Studi Kasus",
];

export default function KnowledgeAdminPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [form, setForm] = useState<MaterialForm>(EMPTY_FORM);
  const [notice, setNotice] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({
    open: false,
    title: "",
    message: "",
  });
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: null | (() => Promise<void> | void);
  }>({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  async function loadData(query = "", courseId = "") {
    setLoading(true);
    try {
      const q = query.trim();
      const params = new URLSearchParams();
      if (q) params.set("search", q);
      if (courseId.trim()) params.set("courseId", courseId.trim());
      const endpoint = params.toString()
        ? `/api/kb/materials?${params.toString()}`
        : "/api/kb/materials";
      const res = await fetch(endpoint);
      const data = await res.json();
      setMaterials(data.materials || []);
    } catch {
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadCourses() {
    try {
      const res = await fetch("/api/kb/courses");
      const data = await res.json();
      if (!res.ok) {
        setCourses([]);
        return;
      }
      setCourses(data.courses || []);
    } catch {
      setCourses([]);
    }
  }

  useEffect(() => {
    loadData("", selectedCourseId);
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(search, selectedCourseId);
    }, 250);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedCourseId]);

  function openCreateModal() {
    setEditingMaterial(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEditModal(item: Material) {
    setEditingMaterial(item);
    setForm({
      courseId: item.course?.id ?? "",
      title: item.title,
      module: item.module,
      page: item.page ?? "",
      content: item.content,
    });
    setShowModal(true);
  }

  async function deleteMaterial(id: string) {
    setConfirmState({
      open: true,
      title: "Hapus Materi",
      message: "Hapus sumber pengetahuan ini?",
      onConfirm: async () => {
        const res = await fetch(`/api/kb/materials/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          setNotice({
            open: true,
            title: "Gagal Menghapus",
            message: "Materi tidak dapat dihapus.",
          });
          return;
        }
        setMaterials((prev) => prev.filter((k) => k.id !== id));
      },
    });
  }

  async function saveMaterial(e: React.FormEvent) {
    e.preventDefault();

    setSubmitting(true);
    try {
      const payload = {
        courseId: form.courseId || undefined,
        title: form.title,
        module: form.module,
        page: form.page.trim() || undefined,
        content: form.content,
      };

      const endpoint = editingMaterial
        ? `/api/kb/materials/${editingMaterial.id}`
        : "/api/kb/materials";
      const method = editingMaterial ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Gagal menyimpan materi");
      }

      setShowModal(false);
      setEditingMaterial(null);
      setForm(EMPTY_FORM);
      await loadData(search, selectedCourseId);
    } catch (error) {
      setNotice({
        open: true,
        title: "Gagal Menyimpan",
        message:
          error instanceof Error ? error.message : "Gagal menyimpan materi",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminLayout
      title="Basis Pengetahuan & Training AI"
      headerActions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="font-bold border-primary/20 text-primary hover:bg-primary/5"
            onClick={() => loadData(search)}
          >
            <RefreshCw className="mr-1 size-3.5" />
            Sync Data
          </Button>
          <Button
            size="sm"
            className="font-bold shadow-lg shadow-primary/20"
            asChild
          >
            <Link
              href={{
                pathname: "/admin/materials/new",
                query: { from: "knowledge" },
              }}
            >
              <Plus className="mr-1 size-4" />
              Upload Materi
            </Link>
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Knowledge Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-none bg-card shadow-sm p-4 flex items-center gap-4">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Database className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Koleksi Dokumen
              </span>
              <span className="text-xl font-black">
                {materials.length} Materi
              </span>
            </div>
          </Card>
          <Card className="border-none bg-card shadow-sm p-4 flex items-center gap-4">
            <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <FileText className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Tipe Terbanyak
              </span>
              <span className="text-xl font-black">Materi Teks</span>
            </div>
          </Card>
          <div className="flex items-center justify-end">
            <div className="flex w-full max-w-2xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Select
                value={selectedCourseId || "all"}
                onValueChange={(value) =>
                  setSelectedCourseId(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="h-11 w-full bg-card font-medium sm:max-w-xs">
                  <SelectValue placeholder="Semua Mata Kuliah" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Mata Kuliah</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  className="pl-9 h-11 bg-card border-border/50 focus-visible:ring-primary/20 font-medium"
                  placeholder="Cari materi pengetahuan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table (lg+) */}
        <Card className="hidden overflow-hidden border-none bg-card shadow-xl lg:block">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="px-6 h-12 text-[10px] font-black uppercase tracking-widest">
                  Judul Materi
                </TableHead>
                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest">
                  Mata Kuliah
                </TableHead>
                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest">
                  Topik/Modul
                </TableHead>
                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-center">
                  Chunks
                </TableHead>
                <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest">
                  Diperbarui
                </TableHead>
                <TableHead className="px-6 h-12 text-right text-[10px] font-black uppercase tracking-widest px-6">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={i}>
                      <TableCell
                        colSpan={6}
                        className="h-16 border-b border-border/30"
                      >
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
              ) : materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-6">
                    <EmptyState
                      icon={Database}
                      title="Materi pengetahuan belum tersedia"
                      description={
                        search
                          ? "Tidak ada materi yang sesuai dengan kata kunci pencarian."
                          : "Tambahkan materi baru agar AI memiliki referensi jawaban yang lebih kaya."
                      }
                      action={
                        !search ? (
                          <Button size="sm" onClick={openCreateModal}>
                            <Plus className="mr-1 size-4" /> Upload Materi
                          </Button>
                        ) : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((item) => (
                  <TableRow
                    key={item.id}
                    className="group border-b border-border/30 transition-colors hover:bg-muted/20"
                  >
                    <TableCell className="px-6">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shadow-inner">
                          <FileText className="size-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black tracking-tight">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            MATA KULIAH: {item.course ? `${item.course.code} - ${item.course.title}` : "Tanpa Mata Kuliah"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="max-w-[280px] truncate font-bold px-2.5 py-0.5 text-[10px]"
                      >
                        {item.course
                          ? `${item.course.code} - ${item.course.title}`
                          : "Tanpa Mata Kuliah"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-primary/5 text-primary border-primary/20 font-bold px-2.5 py-0.5 text-[10px] uppercase"
                      >
                        {item.module}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
                        {item._count.chunks}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                        {formatDate(item.updatedAt)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          onClick={() => openEditModal(item)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => deleteMaterial(item.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Mobile + Tablet Card List */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:hidden">
          {loading ? (
            Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton
                  key={`mobile-knowledge-skeleton-${i}`}
                  className="h-36 w-full"
                />
              ))
          ) : materials.length === 0 ? (
            <EmptyState
              icon={Database}
              title="Materi pengetahuan belum tersedia"
              description={
                search
                  ? "Tidak ada materi yang sesuai dengan kata kunci pencarian."
                  : "Tambahkan materi baru agar AI memiliki referensi jawaban yang lebih kaya."
              }
              action={
                !search ? (
                  <Button size="sm" onClick={openCreateModal}>
                    <Plus className="mr-1 size-4" /> Upload Materi
                  </Button>
                ) : undefined
              }
            />
          ) : (
            materials.map((item) => (
              <Card
                key={`mobile-${item.id}`}
                className="border-border/50 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black tracking-tight">
                      {item.title}
                    </p>
                    <p className="mt-1 truncate text-[11px] font-semibold text-muted-foreground">
                      Mata Kuliah: {item.course ? `${item.course.code} - ${item.course.title}` : "Tanpa Mata Kuliah"}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
                    {item._count.chunks} Chunks
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="max-w-[220px] truncate px-2.5 py-0.5 text-[10px] font-bold"
                    >
                      {item.course
                        ? `${item.course.code} - ${item.course.title}`
                        : "Tanpa Mata Kuliah"}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-primary/5 px-2.5 py-0.5 text-[10px] font-bold uppercase text-primary border-primary/20"
                    >
                      {item.module}
                    </Badge>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {formatDate(item.updatedAt)}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                    onClick={() => openEditModal(item)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => deleteMaterial(item.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="border-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">
              {editingMaterial ? "Edit Materi" : "Upload Materi Baru"}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium">
              Materi ini akan dipecah menjadi chunk dan dipakai sebagai sumber
              AI RAG.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={saveMaterial} className="space-y-4">
            <div className="space-y-1.5">
              <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Mata Kuliah (Opsional)
              </label>
              <Select
                value={form.courseId || "none"}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    courseId: value === "none" ? "" : value,
                  }))
                }
              >
                <SelectTrigger className="h-11 border border-border/70 bg-background focus:ring-primary/20">
                  <SelectValue placeholder="Pilih mata kuliah" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tanpa Mata Kuliah</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="pl-1 text-[11px] text-muted-foreground">
                Bank Materi dikelompokkan per mata kuliah. Kelas publik tetap
                dikelola terpisah.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Judul Materi
              </label>
              <Input
                required
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="h-11 border border-border/70 bg-background focus-visible:ring-primary/20"
                placeholder="Contoh: Dasar Pemrograman Python"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Topik/Modul
                </label>
                <div className="rounded-md border border-border/70 bg-background p-3 space-y-2">
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Pilih dari daftar (opsional)
                  </p>
                  <Select
                    value={MODULE_SUGGESTIONS.includes(form.module) ? form.module : "__none"}
                    onValueChange={(value) => {
                      if (value !== "__none") {
                        setForm((prev) => ({ ...prev, module: value }));
                      }
                    }}
                  >
                    <SelectTrigger className="h-10 border border-border/70 bg-background">
                      <SelectValue placeholder="Pilih topik/modul" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Tidak pilih (isi manual)</SelectItem>
                      {MODULE_SUGGESTIONS.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] font-semibold text-muted-foreground pt-1">
                    Atau isi sendiri
                  </p>
                  <Input
                    required
                    value={form.module}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, module: e.target.value }))
                    }
                    className="h-11 border border-border/70 bg-background"
                    placeholder="Contoh: Pertemuan 3 - Normalisasi Database"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Halaman (Opsional)
                </label>
                <Input
                  value={form.page}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, page: e.target.value }))
                  }
                  className="h-11 border border-border/70 bg-background focus-visible:ring-primary/20"
                  placeholder="Contoh: 12-20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Konten Materi
              </label>
              <textarea
                required
                minLength={50}
                value={form.content}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, content: e.target.value }))
                }
                className="w-full min-h-56 rounded-md border border-border/70 bg-background p-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/20"
                placeholder="Tempelkan konten materi lengkap di sini agar dapat diproses untuk RAG..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="font-bold text-muted-foreground"
                onClick={() => {
                  setShowModal(false);
                  setEditingMaterial(null);
                  setForm(EMPTY_FORM);
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="min-w-[140px] font-bold"
              >
                {submitting
                  ? "Menyimpan..."
                  : editingMaterial
                    ? "Update Materi"
                    : "Upload Materi"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={notice.open}
        onOpenChange={(open) => setNotice((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{notice.title}</DialogTitle>
            <DialogDescription>{notice.message}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button
              onClick={() => setNotice((prev) => ({ ...prev, open: false }))}
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmState.open}
        onOpenChange={(open) =>
          setConfirmState((prev) => ({
            ...prev,
            open,
            onConfirm: open ? prev.onConfirm : null,
          }))
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{confirmState.title}</DialogTitle>
            <DialogDescription>{confirmState.message}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setConfirmState({
                  open: false,
                  title: "",
                  message: "",
                  onConfirm: null,
                })
              }
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                const action = confirmState.onConfirm;
                setConfirmState({
                  open: false,
                  title: "",
                  message: "",
                  onConfirm: null,
                });
                if (action) await action();
              }}
            >
              Ya, Lanjutkan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
