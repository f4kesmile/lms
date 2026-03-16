"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CourseStatus } from "@prisma/client";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  createAcademicYearAction,
  createCourseAction,
  createSubjectCourseAction,
  deleteAcademicYearAction,
  deleteCourseAction,
  deleteSubjectCourseAction,
  setAcademicYearActiveAction,
  updateCourseAction,
  updateSubjectCourseAction,
} from "@/lib/actions/courseActions";
import {
  BookOpen,
  Calendar,
  Edit,
  GraduationCap,
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

type ActiveTab = "mataKuliah" | "kelas" | "years";

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

type SubjectCourseItem = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  learningOutcomes: string | null;
  status: CourseStatus;
  updatedAt: string;
  _count?: { materials: number };
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

type ClassForm = {
  name: string;
  academicYearId: string;
  classTeacherId: string;
  capacity: number;
};

type SubjectForm = {
  code: string;
  title: string;
  description: string;
  learningOutcomes: string;
  status: CourseStatus;
};

const EMPTY_CLASS_FORM: ClassForm = {
  name: "",
  academicYearId: "",
  classTeacherId: "",
  capacity: 40,
};

const EMPTY_SUBJECT_FORM: SubjectForm = {
  code: "",
  title: "",
  description: "",
  learningOutcomes: "",
  status: CourseStatus.published,
};

export default function AdminCoursesPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("mataKuliah");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjectCourses, setSubjectCourses] = useState<SubjectCourseItem[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [showClassModal, setShowClassModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [editingSubject, setEditingSubject] = useState<SubjectCourseItem | null>(null);

  const [classForm, setClassForm] = useState<ClassForm>(EMPTY_CLASS_FORM);
  const [subjectForm, setSubjectForm] = useState<SubjectForm>(EMPTY_SUBJECT_FORM);
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
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    void loadMeta();
  }, []);

  async function fetchClasses() {
    const res = await fetch("/api/classes?limit=100");
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Gagal mengambil data kelas");
    return data.classes ?? [];
  }

  async function fetchSubjectCourses() {
    const res = await fetch("/api/kb/courses");
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || "Gagal mengambil data mata kuliah");
    }
    return data.courses ?? [];
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
      if (activeTab === "mataKuliah") {
        const data = await fetchSubjectCourses();
        setSubjectCourses(data);
      } else if (activeTab === "kelas") {
        const data = await fetchClasses();
        setClasses(data);
      } else {
        const data = await fetchAcademicYears();
        setYears(data);
      }
    } catch {
      if (activeTab === "mataKuliah") setSubjectCourses([]);
      if (activeTab === "kelas") setClasses([]);
      if (activeTab === "years") setYears([]);
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

  function resetClassForm() {
    setEditingClass(null);
    setClassForm(EMPTY_CLASS_FORM);
  }

  function resetSubjectForm() {
    setEditingSubject(null);
    setSubjectForm(EMPTY_SUBJECT_FORM);
  }

  async function handleClassSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!classForm.academicYearId) {
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
        name: classForm.name,
        academicYearId: classForm.academicYearId,
        classTeacherId: classForm.classTeacherId || null,
        capacity: classForm.capacity,
      };

      const res = editingClass
        ? await updateCourseAction(editingClass.id, payload)
        : await createCourseAction(payload);

      if (!res.success) throw new Error(res.error || "Gagal menyimpan kelas");

      setShowClassModal(false);
      resetClassForm();
      await loadData();
    } catch (error) {
      setNotice({
        open: true,
        title: "Gagal Menyimpan",
        message:
          error instanceof Error ? error.message : "Gagal menyimpan kelas",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubjectSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        code: subjectForm.code.trim().toUpperCase(),
        title: subjectForm.title.trim(),
        description: subjectForm.description.trim() || null,
        learningOutcomes: subjectForm.learningOutcomes.trim() || null,
        status: subjectForm.status,
      };

      const res = editingSubject
        ? await updateSubjectCourseAction(editingSubject.id, payload)
        : await createSubjectCourseAction(payload);

      if (!res.success) {
        throw new Error(res.error || "Gagal menyimpan mata kuliah");
      }

      setShowSubjectModal(false);
      resetSubjectForm();
      await loadData();
    } catch (error) {
      setNotice({
        open: true,
        title: "Gagal Menyimpan",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan mata kuliah",
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
    } catch (error) {
      setNotice({
        open: true,
        title: "Gagal Menyimpan",
        message:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan tahun akademik",
      });
    } finally {
      setLoading(false);
    }
  }

  function deleteClass(id: string) {
    setConfirmState({
      open: true,
      title: "Hapus Kelas",
      message: "Hapus kelas ini secara permanen?",
      onConfirm: async () => {
        const res = await deleteCourseAction(id);
        if (!res.success) {
          setNotice({
            open: true,
            title: "Gagal Menghapus",
            message: res.error || "Gagal menghapus kelas",
          });
          return;
        }
        await loadData();
      },
    });
  }

  function deleteSubject(id: string) {
    setConfirmState({
      open: true,
      title: "Hapus Mata Kuliah",
      message:
        "Hapus mata kuliah ini? Materi yang terhubung akan menjadi tidak terikat ke mata kuliah mana pun.",
      onConfirm: async () => {
        const res = await deleteSubjectCourseAction(id);
        if (!res.success) {
          setNotice({
            open: true,
            title: "Gagal Menghapus",
            message: res.error || "Gagal menghapus mata kuliah",
          });
          return;
        }
        await loadData();
      },
    });
  }

  function deleteYear(id: string) {
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
            message: res.error || "Gagal menghapus tahun akademik",
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

  const filteredSubjectCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return subjectCourses;
    return subjectCourses.filter((item) => {
      return [item.code, item.title, item.description || "", item.status]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [searchQuery, subjectCourses]);

  const filteredClasses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return classes;
    return classes.filter((cls) => {
      return [cls.name, cls.academicYear.name, cls.classTeacher?.name || ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [classes, searchQuery]);

  const filteredYears = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return years;
    return years.filter((year) => year.name.toLowerCase().includes(q));
  }, [searchQuery, years]);

  const searchPlaceholder =
    activeTab === "mataKuliah"
      ? "Cari kode atau nama mata kuliah..."
      : activeTab === "kelas"
        ? "Cari nama kelas, dosen, tahun..."
        : "Cari tahun akademik...";

  const addButtonLabel =
    activeTab === "mataKuliah"
      ? "Tambah Mata Kuliah"
      : activeTab === "kelas"
        ? "Tambah Kelas"
        : "Tambah Tahun";

  const uploadQuery =
    activeTab === "mataKuliah" ? { from: "courses" } : { from: "knowledge" };

  return (
    <AdminLayout
      title="Pusat Akademik"
      headerActions={
        <div className="flex items-center gap-2">
          {activeTab !== "years" && (
            <Button size="sm" className="font-bold" asChild>
              <Link
                href={{
                  pathname: "/admin/materials/new",
                  query: uploadQuery,
                }}
              >
                <Plus className="mr-1 size-4" />
                Upload Materi
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="font-bold"
            onClick={() => {
              if (activeTab === "mataKuliah") {
                resetSubjectForm();
                setShowSubjectModal(true);
                return;
              }

              if (activeTab === "kelas") {
                resetClassForm();
                setShowClassModal(true);
                return;
              }

              setYearForm({
                name: "",
                fromYear: "",
                toYear: "",
                isCurrent: false,
              });
              setShowYearModal(true);
            }}
          >
            <Plus className="mr-1 size-4" />
            {addButtonLabel}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-none bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <GraduationCap className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Total Mata Kuliah
                </p>
                <p className="text-xl font-black">{subjectCourses.length}</p>
              </div>
            </div>
          </Card>
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
          <div className="flex items-center justify-end">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 border-border/50 bg-card pl-9"
                placeholder={searchPlaceholder}
              />
            </div>
          </div>
        </div>

        <div className="inline-flex rounded-lg border border-border/50 bg-muted/30 p-1">
          <button
            type="button"
            className={cn(
              "rounded-md px-3 py-2 text-xs font-black uppercase tracking-wide transition",
              activeTab === "mataKuliah"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
            onClick={() => setActiveTab("mataKuliah")}
          >
            Mata Kuliah
          </button>
          <button
            type="button"
            className={cn(
              "rounded-md px-3 py-2 text-xs font-black uppercase tracking-wide transition",
              activeTab === "kelas"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground",
            )}
            onClick={() => setActiveTab("kelas")}
          >
            Kelas
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

        <Card className="overflow-hidden border-none bg-card shadow-xl">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-none hover:bg-transparent">
                {activeTab === "mataKuliah" ? (
                  <>
                    <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest">
                      Mata Kuliah
                    </TableHead>
                    <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest">
                      Status
                    </TableHead>
                    <TableHead className="h-12 text-center text-[10px] font-black uppercase tracking-widest">
                      Materi
                    </TableHead>
                    <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest">
                      Diperbarui
                    </TableHead>
                    <TableHead className="h-12 px-6 text-right text-[10px] font-black uppercase tracking-widest">
                      Aksi
                    </TableHead>
                  </>
                ) : activeTab === "kelas" ? (
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
                  .map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell colSpan={activeTab === "years" ? 4 : 5}>
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
              ) : activeTab === "mataKuliah" ? (
                filteredSubjectCourses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-6">
                      <EmptyState
                        icon={GraduationCap}
                        title="Belum ada mata kuliah"
                        description={
                          searchQuery
                            ? "Tidak ada mata kuliah yang cocok dengan pencarian."
                            : "Tambahkan mata kuliah agar Bank Materi dan AI bisa dikelompokkan dengan rapi."
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubjectCourses.map((item) => (
                    <TableRow
                      key={item.id}
                      className="group border-b border-border/30 transition-colors hover:bg-muted/20"
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <BookOpen className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold">
                              {item.code} - {item.title}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {item.description || "Belum ada deskripsi mata kuliah."}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant={item.status === CourseStatus.published ? "default" : "outline"}>
                          {item.status === CourseStatus.published
                            ? "Dipublikasikan"
                            : item.status === CourseStatus.draft
                              ? "Draft"
                              : "Diarsipkan"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-center text-sm font-semibold">
                        {item._count?.materials ?? 0}
                      </TableCell>
                      <TableCell className="py-4 text-sm font-semibold text-muted-foreground">
                        {new Date(item.updatedAt).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            onClick={() => {
                              setEditingSubject(item);
                              setSubjectForm({
                                code: item.code,
                                title: item.title,
                                description: item.description || "",
                                learningOutcomes: item.learningOutcomes || "",
                                status: item.status,
                              });
                              setShowSubjectModal(true);
                            }}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => deleteSubject(item.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )
              ) : activeTab === "kelas" ? (
                filteredClasses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-6">
                      <EmptyState
                        icon={LayoutGrid}
                        title="Belum ada kelas"
                        description={
                          searchQuery
                            ? "Coba kata kunci lain atau kosongkan pencarian."
                            : "Tambahkan kelas baru setelah mata kuliah dan tahun akademik siap."
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
                            <LayoutGrid className="size-4" />
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
                              setEditingClass(cls);
                              setClassForm({
                                name: cls.name,
                                academicYearId: cls.academicYearId,
                                classTeacherId: cls.classTeacherId || "",
                                capacity: cls.capacity,
                              });
                              setShowClassModal(true);
                            }}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => deleteClass(cls.id)}
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
                          ? "Tidak ada tahun akademik yang cocok dengan pencarian."
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
                      {new Date(year.fromYear).getFullYear()} - {" "}
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
        open={showSubjectModal}
        onOpenChange={(open) => {
          setShowSubjectModal(open);
          if (!open) resetSubjectForm();
        }}
      >
        <DialogContent className="border border-border/60">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">
              {editingSubject ? "Sunting Mata Kuliah" : "Mata Kuliah Baru"}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium">
              Mata kuliah ini akan menjadi pengelompokan utama untuk Bank Materi dan referensi AI.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubjectSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Kode Mata Kuliah
                </label>
                <Input
                  required
                  value={subjectForm.code}
                  onChange={(e) =>
                    setSubjectForm((prev) => ({ ...prev, code: e.target.value }))
                  }
                  className="h-11 border border-border bg-background focus-visible:ring-2 focus-visible:ring-primary/30"
                  placeholder="Contoh: IF301"
                />
              </div>
              <div className="space-y-1.5">
                <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Status
                </label>
                <Select
                  value={subjectForm.status}
                  onValueChange={(value: CourseStatus) =>
                    setSubjectForm((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className="h-11 border border-border bg-background font-bold focus:ring-2 focus:ring-primary/30">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CourseStatus.published}>Dipublikasikan</SelectItem>
                    <SelectItem value={CourseStatus.draft}>Draft</SelectItem>
                    <SelectItem value={CourseStatus.archived}>Diarsipkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Nama Mata Kuliah
              </label>
              <Input
                required
                value={subjectForm.title}
                onChange={(e) =>
                  setSubjectForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="h-11 border border-border bg-background focus-visible:ring-2 focus-visible:ring-primary/30"
                placeholder="Contoh: Rekayasa Perangkat Lunak"
              />
            </div>

            <div className="space-y-1.5">
              <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Deskripsi
              </label>
              <textarea
                value={subjectForm.description}
                onChange={(e) =>
                  setSubjectForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="min-h-24 w-full rounded-md border border-border bg-background p-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary/30"
                placeholder="Ringkasan singkat tentang mata kuliah ini."
              />
            </div>

            <div className="space-y-1.5">
              <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Capaian Pembelajaran
              </label>
              <textarea
                value={subjectForm.learningOutcomes}
                onChange={(e) =>
                  setSubjectForm((prev) => ({
                    ...prev,
                    learningOutcomes: e.target.value,
                  }))
                }
                className="min-h-28 w-full rounded-md border border-border bg-background p-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary/30"
                placeholder="Tuliskan hasil belajar utama yang harus dicapai mahasiswa."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                className="font-bold text-muted-foreground"
                onClick={() => {
                  setShowSubjectModal(false);
                  resetSubjectForm();
                }}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading} className="min-w-[140px] font-bold">
                {loading
                  ? "Menyimpan..."
                  : editingSubject
                    ? "Update Mata Kuliah"
                    : "Simpan Mata Kuliah"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showClassModal}
        onOpenChange={(open) => {
          setShowClassModal(open);
          if (!open) resetClassForm();
        }}
      >
        <DialogContent className="border border-border/60">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">
              {editingClass ? "Sunting Kelas" : "Kelas Baru"}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium">
              Kelas adalah wadah operasional per periode akademik untuk mahasiswa dan dosen.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleClassSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Nama Kelas
              </label>
              <Input
                required
                value={classForm.name}
                onChange={(e) =>
                  setClassForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="h-11 border border-border bg-background focus-visible:ring-2 focus-visible:ring-primary/30"
                placeholder="Contoh: IF301 - A"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Tahun Akademik
                </label>
                <Select
                  value={classForm.academicYearId}
                  onValueChange={(value) =>
                    setClassForm((prev) => ({ ...prev, academicYearId: value }))
                  }
                >
                  <SelectTrigger className="h-11 border border-border bg-background font-bold focus:ring-2 focus:ring-primary/30">
                    <SelectValue placeholder="Pilih tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {meta.years.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name}
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
                  min={1}
                  value={classForm.capacity}
                  onChange={(e) =>
                    setClassForm((prev) => ({
                      ...prev,
                      capacity: Number.parseInt(e.target.value || "0", 10),
                    }))
                  }
                  className="h-11 border border-border bg-background focus-visible:ring-2 focus-visible:ring-primary/30"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Dosen Pengampu
              </label>
              <Select
                value={classForm.classTeacherId || "none"}
                onValueChange={(value) =>
                  setClassForm((prev) => ({
                    ...prev,
                    classTeacherId: value === "none" ? "" : value,
                  }))
                }
              >
                <SelectTrigger className="h-11 border border-border bg-background font-bold focus:ring-2 focus:ring-primary/30">
                  <SelectValue placeholder="Pilih dosen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tanpa Dosen</SelectItem>
                  {meta.teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
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
                  setShowClassModal(false);
                  resetClassForm();
                }}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading} className="min-w-[120px] font-bold">
                {loading
                  ? "Menyimpan..."
                  : editingClass
                    ? "Update Kelas"
                    : "Simpan Kelas"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showYearModal} onOpenChange={setShowYearModal}>
        <DialogContent className="border border-border/60">
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
                  setYearForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="h-11 border border-border bg-background focus-visible:ring-2 focus-visible:ring-primary/30"
                placeholder="Contoh: 2025/2026 Genap"
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
                    setYearForm((prev) => ({ ...prev, fromYear: e.target.value }))
                  }
                  className="h-11 border border-border bg-background focus-visible:ring-2 focus-visible:ring-primary/30"
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
                    setYearForm((prev) => ({ ...prev, toYear: e.target.value }))
                  }
                  className="h-11 border border-border bg-background focus-visible:ring-2 focus-visible:ring-primary/30"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <input
                type="checkbox"
                checked={yearForm.isCurrent}
                onChange={(e) =>
                  setYearForm((prev) => ({ ...prev, isCurrent: e.target.checked }))
                }
              />
              Jadikan periode aktif
            </label>
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setShowYearModal(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={loading} className="font-bold">
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
            <Button onClick={() => setNotice((prev) => ({ ...prev, open: false }))}>
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmState.open}
        onOpenChange={(open) =>
          setConfirmState((prev) => ({ ...prev, open, onConfirm: open ? prev.onConfirm : null }))
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{confirmState.title}</DialogTitle>
            <DialogDescription>{confirmState.message}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() =>
                setConfirmState({ open: false, title: "", message: "", onConfirm: null })
              }
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await confirmState.onConfirm?.();
                setConfirmState({ open: false, title: "", message: "", onConfirm: null });
              }}
            >
              Ya, hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
