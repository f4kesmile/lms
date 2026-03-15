"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  createCourseAction,
  createAcademicYearAction,
  deleteAcademicYearAction,
  deleteCourseAction,
  setAcademicYearActiveAction,
  updateCourseAction,
} from "@/lib/actions/courseActions";
import {
  BookOpen,
  Calendar,
  Edit,
  LayoutGrid,
  Plus,
  Search,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/index";

type ClassItem = {
  id: string;
  name: string;
  academicYear: { id: string; name: string };
  academicYearId: string;
  classTeacher: { id: string; name: string } | null;
  classTeacherId: string | null;
  capacity: number;
  students: Array<{ userId: string }>;
  createdAt: string;
};

type AcademicYear = {
  id: string;
  name: string;
  fromYear: string;
  toYear: string;
  isCurrent: boolean;
};

type Teacher = {
  id: string;
  name: string;
};

export default function AdminCoursesPage() {
  const [activeTab, setActiveTab] = useState<"courses" | "years">("courses");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<ClassItem | null>(null);

  const [courseForm, setCourseForm] = useState({
    name: "",
    academicYearId: "",
    classTeacherId: "",
    capacity: 40,
  });

  const [yearForm, setYearForm] = useState({
    name: "",
    fromYear: "",
    toYear: "",
    isCurrent: false,
  });

  const [meta, setMeta] = useState<{
    years: AcademicYear[];
    teachers: Teacher[];
  }>({
    years: [],
    teachers: [],
  });

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

  useEffect(() => {
    loadData();
    loadMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function fetchClasses() {
    const res = await fetch("/api/classes?limit=100");
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Gagal mengambil data kelas");
    return data.classes ?? [];
  }

  async function fetchAcademicYears() {
    const res = await fetch("/api/academic-years?limit=100");
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || "Gagal mengambil data tahun akademik");
    }
    return data.years ?? [];
  }

  async function loadData() {
    setLoading(true);
    try {
      if (activeTab === "courses") {
        const data = await fetchClasses();
        setClasses(data);
      } else {
        const data = await fetchAcademicYears();
        setYears(data);
      }
    } catch {
      if (activeTab === "courses") setClasses([]);
      else setYears([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadMeta() {
    try {
      const [yData, tRes] = await Promise.all([
        fetchAcademicYears(),
        fetch("/api/users?role=dosen"),
      ]);
      const tData = await tRes.json();
      setMeta({ years: yData || [], teachers: tData.users || [] });
    } catch {
      setMeta({ years: [], teachers: [] });
    }
  }

  function resetCourseForm() {
    setEditingCourse(null);
    setCourseForm({
      name: "",
      academicYearId: "",
      classTeacherId: "",
      capacity: 40,
    });
  }

  async function handleCourseSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!courseForm.academicYearId) {
      setNotice({
        open: true,
        title: "Data Belum Lengkap",
        message: "Tahun akademik wajib dipilih.",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: courseForm.name,
        academicYearId: courseForm.academicYearId,
        classTeacherId: courseForm.classTeacherId || null,
        capacity: courseForm.capacity,
      };

      const res = editingCourse
        ? await updateCourseAction(editingCourse.id, payload)
        : await createCourseAction(payload);

      if (!res.success) throw new Error(res.error || "Gagal menyimpan kursus");

      setShowCourseModal(false);
      resetCourseForm();
      await loadData();
    } catch (e) {
      setNotice({
        open: true,
        title: "Gagal Menyimpan",
        message: e instanceof Error ? e.message : "Gagal menyimpan kursus",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleYearSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createAcademicYearAction({
        name: yearForm.name,
        fromYear: yearForm.fromYear,
        toYear: yearForm.toYear,
        isCurrent: yearForm.isCurrent,
      });

      if (!res.success) {
        throw new Error(res.error || "Gagal menyimpan tahun akademik");
      }

      setShowYearModal(false);
      setYearForm({ name: "", fromYear: "", toYear: "", isCurrent: false });
      await loadData();
      await loadMeta();
    } catch (e) {
      setNotice({
        open: true,
        title: "Gagal Menyimpan",
        message:
          e instanceof Error ? e.message : "Gagal menyimpan tahun akademik",
      });
    } finally {
      setLoading(false);
    }
  }

  async function deleteCourse(id: string) {
    setConfirmState({
      open: true,
      title: "Hapus Kursus",
      message: "Hapus kursus ini secara permanen?",
      onConfirm: async () => {
        const res = await deleteCourseAction(id);
        if (!res.success) {
          setNotice({
            open: true,
            title: "Gagal Menghapus",
            message: res.error || "Gagal menghapus kursus",
          });
          return;
        }
        await loadData();
      },
    });
  }

  async function deleteYear(id: string) {
    setConfirmState({
      open: true,
      title: "Hapus Tahun Akademik",
      message: "Hapus tahun akademik ini? Ini dapat mempengaruhi data kelas.",
      onConfirm: async () => {
        const res = await deleteAcademicYearAction(id);
        if (!res.success) {
          setNotice({
            open: true,
            title: "Gagal Menghapus",
            message: res.error || "Gagal menghapus",
          });
          return;
        }
        await loadData();
        await loadMeta();
      },
    });
  }

  async function setYearActive(id: string) {
    const res = await setAcademicYearActiveAction(id);
    if (!res.success) {
      setNotice({
        open: true,
        title: "Gagal Mengubah Status",
        message: res.error || "Gagal mengubah status aktif.",
      });
      return;
    }
    await loadData();
  }

  const filteredClasses = classes.filter((cls) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      cls.name.toLowerCase().includes(q) ||
      cls.academicYear.name.toLowerCase().includes(q) ||
      (cls.classTeacher?.name || "").toLowerCase().includes(q)
    );
  });

  const filteredYears = years.filter((year) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return year.name.toLowerCase().includes(q);
  });

  return (
    <AdminLayout
      title="Pusat Kursus"
      headerActions={
        <div className="flex items-center gap-2">
          <Button size="sm" className="font-bold" asChild>
            <Link
              href={{
                pathname: "/admin/materials/new",
                query: { from: "courses" },
              }}
            >
              <Plus className="mr-1 size-4" />
              Upload Materi
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="font-bold"
            onClick={() => {
              if (activeTab === "courses") {
                resetCourseForm();
                setShowCourseModal(true);
              } else {
                setYearForm({
                  name: "",
                  fromYear: "",
                  toYear: "",
                  isCurrent: false,
                });
                setShowYearModal(true);
              }
            }}
          >
            <Plus className="mr-1 size-4" />
            {activeTab === "courses" ? "Tambah Kursus" : "Tambah Tahun"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-none bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <LayoutGrid className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Total Kelas
                </p>
                <p className="text-xl font-black">{classes.length}</p>
              </div>
            </div>
          </Card>
          <Card className="border-none bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Calendar className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Tahun Akademik
                </p>
                <p className="text-xl font-black">{meta.years.length}</p>
              </div>
            </div>
          </Card>
          <div className="flex items-center justify-end">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 border-border/50 bg-card pl-9"
                placeholder={
                  activeTab === "courses"
                    ? "Cari nama kelas, dosen, tahun..."
                    : "Cari tahun akademik..."
                }
              />
            </div>
          </div>
        </div>

        <div className="inline-flex rounded-lg border border-border/50 bg-muted/30 p-1">
          <button
            type="button"
            className={cn(
              "rounded-md px-3 py-2 text-xs font-black uppercase tracking-wide transition",
              activeTab === "courses"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
            onClick={() => setActiveTab("courses")}
          >
            Kelas & Kursus
          </button>
          <button
            type="button"
            className={cn(
              "rounded-md px-3 py-2 text-xs font-black uppercase tracking-wide transition",
              activeTab === "years"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
            onClick={() => setActiveTab("years")}
          >
            Tahun Akademik
          </button>
        </div>

        <Card className="hidden overflow-hidden border-none bg-card shadow-xl lg:block">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-none hover:bg-transparent">
                {activeTab === "courses" ? (
                  <>
                    <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest">
                      Kelas
                    </TableHead>
                    <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest">
                      Tahun
                    </TableHead>
                    <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest">
                      Dosen
                    </TableHead>
                    <TableHead className="h-12 text-center text-[10px] font-black uppercase tracking-widest">
                      Kuota
                    </TableHead>
                    <TableHead className="h-12 px-6 text-right text-[10px] font-black uppercase tracking-widest">
                      Aksi
                    </TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest">
                      Tahun Akademik
                    </TableHead>
                    <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest">
                      Rentang
                    </TableHead>
                    <TableHead className="h-12 text-center text-[10px] font-black uppercase tracking-widest">
                      Status
                    </TableHead>
                    <TableHead className="h-12 px-6 text-right text-[10px] font-black uppercase tracking-widest">
                      Aksi
                    </TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell colSpan={activeTab === "courses" ? 5 : 4}>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
              ) : activeTab === "courses" ? (
                filteredClasses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-6">
                      <EmptyState
                        icon={BookOpen}
                        title="Belum ada kursus ditemukan"
                        description={
                          searchQuery
                            ? "Coba kata kunci lain atau kosongkan filter pencarian."
                            : "Tambahkan kursus baru agar data kelas bisa dikelola dari halaman ini."
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClasses.map((cls) => (
                    <TableRow
                      key={cls.id}
                      className="group border-b border-border/30 transition-colors hover:bg-muted/20"
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <BookOpen className="size-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{cls.name}</p>
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                              ID: {cls.id.split("-")[0]}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm font-semibold text-muted-foreground">
                        {cls.academicYear.name}
                      </TableCell>
                      <TableCell className="py-4 text-sm font-semibold">
                        <div className="flex items-center gap-2">
                          <UserIcon className="size-3.5 text-primary/60" />
                          {cls.classTeacher?.name || "Belum ditentukan"}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <Badge
                          variant="secondary"
                          className="border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-black text-primary"
                        >
                          {cls.students.length}/{cls.capacity}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            onClick={() => {
                              setEditingCourse(cls);
                              setCourseForm({
                                name: cls.name,
                                academicYearId: cls.academicYearId,
                                classTeacherId: cls.classTeacherId || "",
                                capacity: cls.capacity,
                              });
                              setShowCourseModal(true);
                            }}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => deleteCourse(cls.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )
              ) : filteredYears.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="p-6">
                    <EmptyState
                      icon={Calendar}
                      title="Belum ada tahun akademik"
                      description={
                        searchQuery
                          ? "Tidak ada tahun akademik yang cocok dengan kata kunci pencarian."
                          : "Tambahkan periode akademik untuk mengelola kelas per semester."
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredYears.map((year) => (
                  <TableRow key={year.id}>
                    <TableCell className="px-6 py-4">
                      <p className="text-sm font-semibold">{year.name}</p>
                    </TableCell>
                    <TableCell className="py-4 text-sm font-semibold text-muted-foreground">
                      {new Date(year.fromYear).getFullYear()} -{" "}
                      {new Date(year.toYear).getFullYear()}
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      {year.isCurrent ? (
                        <Badge className="h-5 bg-emerald-500 px-3 text-[10px] font-black uppercase">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="h-5 px-3 text-[10px] font-bold text-muted-foreground/70"
                        >
                          Non-aktif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!year.isCurrent && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-emerald-500/30 bg-emerald-500/5 text-[10px] font-black uppercase text-emerald-600 hover:bg-emerald-500 hover:text-white"
                            onClick={() => setYearActive(year.id)}
                          >
                            Aktifkan
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => deleteYear(year.id)}
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
      </div>

      <Dialog
        open={showCourseModal}
        onOpenChange={(open) => {
          setShowCourseModal(open);
          if (!open) resetCourseForm();
        }}
      >
        <DialogContent className="border-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">
              {editingCourse ? "Sunting Kursus" : "Kursus Baru"}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium">
              Lengkapi formulir di bawah ini dengan informasi yang valid.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCourseSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Nama Kursus / Kelas
              </label>
              <Input
                required
                value={courseForm.name}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, name: e.target.value })
                }
                className="h-11 border-none bg-muted/30"
                placeholder="Contoh: Algoritma Lanjut A"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Tahun Akademik
                </label>
                <Select
                  value={courseForm.academicYearId}
                  onValueChange={(value) =>
                    setCourseForm({ ...courseForm, academicYearId: value })
                  }
                >
                  <SelectTrigger className="h-11 border-none bg-muted/30 font-bold">
                    <SelectValue placeholder="Pilih Tahun..." />
                  </SelectTrigger>
                  <SelectContent>
                    {meta.years.map((y) => (
                      <SelectItem key={y.id} value={y.id}>
                        {y.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Kapasitas
                </label>
                <Input
                  type="number"
                  value={courseForm.capacity}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      capacity: Number.parseInt(e.target.value || "0", 10),
                    })
                  }
                  className="h-11 border-none bg-muted/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Dosen Pengampu
              </label>
              <Select
                value={courseForm.classTeacherId || "none"}
                onValueChange={(value) =>
                  setCourseForm({
                    ...courseForm,
                    classTeacherId: value === "none" ? "" : value,
                  })
                }
              >
                <SelectTrigger className="h-11 border-none bg-muted/30 font-bold">
                  <SelectValue placeholder="Pilih Dosen (Opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tanpa Dosen</SelectItem>
                  {meta.teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                className="font-bold text-muted-foreground"
                onClick={() => {
                  setShowCourseModal(false);
                  resetCourseForm();
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[120px] font-bold"
              >
                {loading
                  ? "Menyimpan..."
                  : editingCourse
                    ? "Update Kursus"
                    : "Simpan Kursus"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showYearModal} onOpenChange={setShowYearModal}>
        <DialogContent className="border-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">
              Periode Akademik Baru
            </DialogTitle>
            <DialogDescription className="text-sm font-medium">
              Atur rentang tahun akademik untuk periode perkuliahan baru.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleYearSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Nama Tahun
              </label>
              <Input
                required
                value={yearForm.name}
                onChange={(e) =>
                  setYearForm({ ...yearForm, name: e.target.value })
                }
                className="h-11 border-none bg-muted/30"
                placeholder="Contoh: 2024/2025 Genap"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Mulai
                </label>
                <Input
                  type="date"
                  required
                  value={yearForm.fromYear}
                  onChange={(e) =>
                    setYearForm({ ...yearForm, fromYear: e.target.value })
                  }
                  className="h-11 border-none bg-muted/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Selesai
                </label>
                <Input
                  type="date"
                  required
                  value={yearForm.toYear}
                  onChange={(e) =>
                    setYearForm({ ...yearForm, toYear: e.target.value })
                  }
                  className="h-11 border-none bg-muted/30"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 py-2 pl-1">
              <input
                type="checkbox"
                id="isCurrent"
                checked={yearForm.isCurrent}
                onChange={(e) =>
                  setYearForm({ ...yearForm, isCurrent: e.target.checked })
                }
                className="size-4 rounded accent-primary"
              />
              <label
                htmlFor="isCurrent"
                className="cursor-pointer text-sm font-bold text-muted-foreground"
              >
                Set sebagai Tahun Berjalan
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                className="font-bold text-muted-foreground"
                onClick={() => setShowYearModal(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[120px] font-bold"
              >
                {loading ? "Menyimpan..." : "Simpan Tahun"}
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
