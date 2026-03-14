"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  createCourseAction,
  updateCourseAction,
  deleteCourseAction,
  createAcademicYearAction,
  deleteAcademicYearAction,
  setAcademicYearActiveAction,
} from "@/lib/actions/courseActions";
import {
  Plus,
  Search,
  Calendar,
  BookOpen,
  User as UserIcon,
  Edit,
  Trash2,
  LayoutGrid,
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

  // Modals
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<ClassItem | null>(null);

  // Form States
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
    if (!res.ok)
      throw new Error(data?.message || "Gagal mengambil data tahun akademik");
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
    } catch {}
  }

  async function handleCourseSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!courseForm.academicYearId) {
      alert("Tahun akademik wajib dipilih.");
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

      let res;
      if (editingCourse) {
        res = await updateCourseAction(editingCourse.id, payload);
      } else {
        res = await createCourseAction(payload);
      }

      if (!res.success) throw new Error(res.error || "Gagal menyimpan kursus");

      setShowCourseModal(false);
      setEditingCourse(null);
      await loadData();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan kursus");
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

      if (!res.success)
        throw new Error(res.error || "Gagal menyimpan tahun akademik");
      setShowYearModal(false);
      await loadData();
      await loadMeta();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan tahun akademik");
    } finally {
      setLoading(false);
    }
  }

  async function deleteCourse(id: string) {
    if (!confirm("Hapus kursus ini secara permanen?")) return;
    try {
      await deleteCourseAction(id);
      await loadData();
    } catch {}
  }

  async function deleteYear(id: string) {
    if (
      !confirm("Hapus tahun akademik ini? Ini dapat mempengaruhi data kelas.")
    )
      return;
    try {
      const res = await deleteAcademicYearAction(id);
      if (!res.success) {
        alert(res.error || "Gagal menghapus");
      } else {
        await loadData();
        await loadMeta();
      }
    } catch {}
  }

  async function setYearActive(id: string) {
    try {
      await setAcademicYearActiveAction(id);
      await loadData();
    } catch {}
  }

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.classTeacher?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const filteredYears = years.filter((year) =>
    year.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <AdminLayout
      title="Manajemen Kurikulum & Kelas"
      headerActions={
        <Button
          onClick={() =>
            activeTab === "courses"
              ? setShowCourseModal(true)
              : setShowYearModal(true)
          }
          className="font-bold shadow-md"
        >
          <Plus className="mr-1 size-4" />
          {activeTab === "courses" ? "Kursus Baru" : "Tahun Baru"}
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Modern Tabs & Search Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex p-1 bg-muted/50 rounded-lg border border-border/50">
            <button
              onClick={() => setActiveTab("courses")}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 text-sm font-bold transition-all rounded-md",
                activeTab === "courses"
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="size-4" />
              Daftar Kursus
            </button>
            <button
              onClick={() => setActiveTab("years")}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 text-sm font-bold transition-all rounded-md",
                activeTab === "years"
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Calendar className="size-4" />
              Tahun Akademik
            </button>
          </div>

          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              className="pl-9 h-10 bg-card border-border/50 focus-visible:ring-primary/20"
              placeholder={
                activeTab === "courses"
                  ? "Cari kelas atau dosen..."
                  : "Cari tahun ajaran..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Desktop Table (lg+) */}
        <Card className="hidden overflow-hidden border-none bg-card shadow-xl lg:block">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-none">
                {activeTab === "courses" ? (
                  <>
                    <TableHead className="w-[30%] text-[10px] font-bold uppercase tracking-wider px-6 h-12">
                      Detail Kelas
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider h-12">
                      Periode
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider h-12">
                      Dosen Pengampu
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-center h-12">
                      Kapasitas
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider px-6 h-12">
                      Aksi
                    </TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="w-[40%] text-[10px] font-bold uppercase tracking-wider px-6 h-12">
                      Nama Tahun
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider h-12">
                      Rentang Waktu
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-center h-12">
                      Status
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider px-6 h-12">
                      Aksi
                    </TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={i}>
                      <TableCell
                        colSpan={activeTab === "courses" ? 5 : 4}
                        className="h-16"
                      >
                        <Skeleton className="h-10 w-full" />
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
                        action={
                          !searchQuery ? (
                            <Button
                              onClick={() => setShowCourseModal(true)}
                              size="sm"
                            >
                              <Plus className="mr-1 size-4" /> Tambah Kursus
                            </Button>
                          ) : undefined
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
                      <TableCell className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
                            <BookOpen className="size-5" />
                          </div>
                          <div className="flex flex-col gap-1 leading-relaxed">
                            <span className="font-semibold tracking-wide text-sm leading-5">
                              {cls.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground uppercase font-medium tracking-wide">
                              ID: {cls.id.split("-")[0]}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 font-semibold text-sm text-muted-foreground tracking-wide">
                        {cls.academicYear.name}
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex items-center gap-2.5 leading-relaxed">
                          <UserIcon className="size-3.5 text-primary/60" />
                          <span className="text-sm font-semibold tracking-wide">
                            {cls.classTeacher?.name || "Belum ditentukan"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-5 text-center">
                        <Badge
                          variant="secondary"
                          className="bg-primary/5 text-primary border-primary/20 font-black px-2 py-0.5 text-[10px]"
                        >
                          {cls.students.length} / {cls.capacity}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            onClick={() => {
                              setEditingCourse(cls);
                              setCourseForm({
                                name: cls.name,
                                academicYearId: cls.academicYear.id,
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
                      action={
                        !searchQuery ? (
                          <Button
                            onClick={() => setShowYearModal(true)}
                            size="sm"
                          >
                            <Plus className="mr-1 size-4" /> Tambah Tahun
                            Akademik
                          </Button>
                        ) : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredYears.map((y) => (
                  <TableRow
                    key={y.id}
                    className="group border-b border-border/30 transition-colors hover:bg-muted/20"
                  >
                    <TableCell className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shadow-inner">
                          <Calendar className="size-5" />
                        </div>
                        <span className="font-semibold tracking-wide leading-5">
                          {y.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 text-sm font-semibold text-muted-foreground tracking-wide">
                      {new Date(y.fromYear).getFullYear()} —{" "}
                      {new Date(y.toYear).getFullYear()}
                    </TableCell>
                    <TableCell className="py-5 text-center">
                      {y.isCurrent ? (
                        <Badge className="bg-emerald-500 text-[10px] font-black uppercase h-5 px-3">
                          Aktif Sekarang
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-bold text-muted-foreground/60 h-5 px-3"
                        >
                          Non-aktif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                        {!y.isCurrent && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-[10px] font-black uppercase text-emerald-600 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white"
                            onClick={() => setYearActive(y.id)}
                          >
                            Aktifkan
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => deleteYear(y.id)}
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
            Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton
                  key={`mobile-course-skeleton-${i}`}
                  className="h-36 w-full"
                />
              ))
          ) : activeTab === "courses" ? (
            filteredClasses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Belum ada kursus ditemukan"
                description={
                  searchQuery
                    ? "Coba kata kunci lain atau kosongkan filter pencarian."
                    : "Tambahkan kursus baru agar data kelas bisa dikelola dari halaman ini."
                }
                action={
                  !searchQuery ? (
                    <Button onClick={() => setShowCourseModal(true)} size="sm">
                      <Plus className="mr-1 size-4" /> Tambah Kursus
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              filteredClasses.map((cls) => (
                <Card key={cls.id} className="border-border/50 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold tracking-tight">
                        {cls.name}
                      </p>
                      <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        {cls.academicYear.name}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-primary/5 text-primary border-primary/20 font-black px-2 py-0.5 text-[10px]"
                    >
                      {cls.students.length}/{cls.capacity}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <UserIcon className="size-3.5" />
                    <span>{cls.classTeacher?.name || "Belum ditentukan"}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      onClick={() => {
                        setEditingCourse(cls);
                        setCourseForm({
                          name: cls.name,
                          academicYearId: cls.academicYear.id,
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
                </Card>
              ))
            )
          ) : filteredYears.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Belum ada tahun akademik"
              description={
                searchQuery
                  ? "Tidak ada tahun akademik yang cocok dengan kata kunci pencarian."
                  : "Tambahkan periode akademik untuk mengelola kelas per semester."
              }
              action={
                !searchQuery ? (
                  <Button onClick={() => setShowYearModal(true)} size="sm">
                    <Plus className="mr-1 size-4" /> Tambah Tahun Akademik
                  </Button>
                ) : undefined
              }
            />
          ) : (
            filteredYears.map((year) => (
              <Card key={year.id} className="border-border/50 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold tracking-tight">
                      {year.name}
                    </p>
                    <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {new Date(year.fromYear).getFullYear()} -{" "}
                      {new Date(year.toYear).getFullYear()}
                    </p>
                  </div>
                  {year.isCurrent ? (
                    <Badge className="bg-emerald-500 text-[10px] font-black uppercase h-5 px-3">
                      Aktif
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold text-muted-foreground/60 h-5 px-3"
                    >
                      Non-aktif
                    </Badge>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-end gap-2">
                  {!year.isCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-[10px] font-black uppercase text-emerald-600 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white"
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
              </Card>
            ))
          )}
        </div>
      </div>

      <Dialog open={showCourseModal} onOpenChange={setShowCourseModal}>
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
                className="h-11 border-none bg-muted/30 focus-visible:ring-primary/20"
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
                  className="h-11 border-none bg-muted/30 focus-visible:ring-primary/20"
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
                  setEditingCourse(null);
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
                className="h-11 border-none bg-muted/30 focus-visible:ring-primary/20"
                placeholder="e.g. 2024/2025 Genap"
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
                  className="h-11 border-none bg-muted/30 focus-visible:ring-primary/20"
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
                  className="h-11 border-none bg-muted/30 focus-visible:ring-primary/20"
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
    </AdminLayout>
  );
}
