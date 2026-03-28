"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CourseStatus } from "@prisma/client";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  createAcademicYearAction,
  createClassAction,
  createSubjectCourseAction,
  deleteAcademicYearAction,
  deleteClassAction,
  deleteSubjectCourseAction,
  setAcademicYearActiveAction,
  updateClassAction,
  updateSubjectCourseAction,
  updateAcademicYearAction,
} from "@/lib/actions/course";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Filters } from "./_components/Filters";
import { Table } from "./_components/Table";
import { List } from "./_components/List";
import { CourseDialogs } from "./_components/Dialogs";
import { DataViewportControls } from "../_components/Controls";

export type ActiveTab = "mataKuliah" | "kelas" | "years";

export type ClassItem = {
  id: string;
  name: string;
  academicYear: { id: string; name: string };
  academicYearId: string;
  capacity: number;
  students: Array<{ userId: string }>;
  createdAt: string;
};

export type SubjectCourseItem = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  learningOutcomes: string | null;
  bannerImage: string | null;
  status: CourseStatus;
  updatedAt: string;
  teachers: Array<{
    user: {
      id: string;
      name: string;
      nip: string | null;
      specialization: string | null;
    };
  }>;
  _count?: { meetings: number };
};

export type AcademicYear = {
  id: string;
  name: string;
  fromYear: string;
  toYear: string;
  isCurrent: boolean;
};

export type Teacher = {
  id: string;
  name: string;
  nip: string | null;
  specialization: string | null;
};

type ClassForm = {
  name: string;
  academicYearId: string;
  capacity: number;
};

type SubjectForm = {
  code: string;
  title: string;
  description: string;
  learningOutcomes: string;
  status: CourseStatus;
  bannerImage: string | null;
  teacherIds: string[];
};

type YearForm = {
  name: string;
  fromYear: string;
  toYear: string;
  isCurrent: boolean;
};

const EMPTY_CLASS_FORM: ClassForm = {
  name: "",
  academicYearId: "",
  capacity: 40,
};

const EMPTY_SUBJECT_FORM: SubjectForm = {
  code: "",
  title: "",
  description: "",
  learningOutcomes: "",
  status: CourseStatus.published,
  bannerImage: null,
  teacherIds: [],
};

const EMPTY_YEAR_FORM: YearForm = {
  name: "",
  fromYear: "",
  toYear: "",
  isCurrent: false,
};

export default function AdminCoursesPage() {
  const router = useRouter();
  const [roleChecked, setRoleChecked] = useState(false);
  const [activeYearLabel, setActiveYearLabel] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("years");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjectCourses, setSubjectCourses] = useState<SubjectCourseItem[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [showClassModal, setShowClassModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [editingSubject, setEditingSubject] =
    useState<SubjectCourseItem | null>(null);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);

  const [classForm, setClassForm] = useState<ClassForm>(EMPTY_CLASS_FORM);
  const [subjectForm, setSubjectForm] =
    useState<SubjectForm>(EMPTY_SUBJECT_FORM);
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
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.role === "dosen") {
          router.replace("/admin/teaching-schedule" as Route);
          return;
        }
        setRoleChecked(true);
      })
      .catch(() => setRoleChecked(true));
  }, [router]);

  useEffect(() => {
    fetch("/api/academic-years/current")
      .then(async (res) => {
        if (!res.ok) {
          setActiveYearLabel(null);
          return;
        }
        const data = (await res.json()) as { name?: string };
        setActiveYearLabel(data.name || null);
      })
      .catch(() => setActiveYearLabel(null));
  }, []);

  useEffect(() => {
    if (!roleChecked) return;
    void loadData();
  }, [activeTab, roleChecked]);

  useEffect(() => {
    if (!roleChecked) return;
    void loadMeta();
  }, [roleChecked]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery, rowsPerPage]);

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
        capacity: classForm.capacity,
      };
      const res = editingClass
        ? await updateClassAction(editingClass.id, payload)
        : await createClassAction(payload);
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
        bannerImage: subjectForm.bannerImage,
        teacherIds: subjectForm.teacherIds,
      };
      const res = editingSubject
        ? await updateSubjectCourseAction(editingSubject.id, payload)
        : await createSubjectCourseAction(payload);
      if (!res.success)
        throw new Error(res.error || "Gagal menyimpan mata kuliah");
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
      const res = editingYear
        ? await updateAcademicYearAction(editingYear.id, {
            name: yearForm.name,
            fromYear: yearForm.fromYear,
            toYear: yearForm.toYear,
            isCurrent: yearForm.isCurrent,
          })
        : await createAcademicYearAction({
            name: yearForm.name,
            fromYear: yearForm.fromYear,
            toYear: yearForm.toYear,
            isCurrent: yearForm.isCurrent,
          });
      if (!res.success)
        throw new Error(res.error || "Gagal menyimpan tahun akademik");
      setShowYearModal(false);
      setEditingYear(null);
      setYearForm(EMPTY_YEAR_FORM);
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
        const res = await deleteClassAction(id);
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

  const currentData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (activeTab === "mataKuliah") {
      return q
        ? subjectCourses.filter((i) =>
            [i.code, i.title].join(" ").toLowerCase().includes(q),
          )
        : subjectCourses;
    }
    if (activeTab === "kelas") {
      return q
        ? classes.filter((i) =>
            [i.name, i.academicYear.name].join(" ").toLowerCase().includes(q),
          )
        : classes;
    }
    return q ? years.filter((i) => i.name.toLowerCase().includes(q)) : years;
  }, [activeTab, searchQuery, subjectCourses, classes, years]);

  const totalItems = currentData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const pagedData = useMemo(() => {
    const start = (safePage - 1) * rowsPerPage;
    return currentData.slice(start, start + rowsPerPage);
  }, [currentData, safePage, rowsPerPage]);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const endItem =
    totalItems === 0 ? 0 : Math.min(safePage * rowsPerPage, totalItems);

  const addButtonLabel =
    activeTab === "mataKuliah"
      ? "Tambah Mata Kuliah"
      : activeTab === "kelas"
        ? "Tambah Kelas"
        : "Tambah Tahun";

  return (
    <AdminLayout
      title="Pusat Akademik"
      headerActions={
        <div className="flex items-center gap-2">
          {activeTab === "mataKuliah" && (
            <Button
              size="sm"
              className="font-bold border border-border shadow-sm  transition-all rounded-md"
              asChild
            >
              <Link
                href={{
                  pathname: "/admin/materials/new",
                  query:
                    activeTab === "mataKuliah"
                      ? { from: "courses" }
                      : { from: "knowledge" },
                }}
              >
                <Icon name="upload_file" size={16} className="sm:mr-1" />{" "}
                <span className="hidden sm:inline">Upload Materi</span>
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="font-bold border border-border text-primary hover:bg-primary/5 shadow-sm  transition-all rounded-md bg-card"
            onClick={() => {
              if (activeTab === "mataKuliah") {
                resetSubjectForm();
                setShowSubjectModal(true);
              } else if (activeTab === "kelas") {
                resetClassForm();
                setShowClassModal(true);
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
            <Icon name="add_circle" size={16} className="sm:mr-1" />{" "}
            <span className="hidden sm:inline">{addButtonLabel}</span>
          </Button>
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="h-[60dvh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        }
      >
        <div className="space-y-6">
          {activeYearLabel && (
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-primary">
              <Icon name="calendar_month" size={14} />
              Tahun Aktif: {activeYearLabel}
            </div>
          )}

          <Filters
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            subjectCoursesCount={subjectCourses.length}
            classesCount={classes.length}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder={
              activeTab === "mataKuliah"
                ? "Cari kode atau nama MK..."
                : activeTab === "kelas"
                  ? "Cari kelas atau dosen..."
                  : "Cari tahun..."
            }
          />

          <Table
            activeTab={activeTab}
            loading={loading}
            data={pagedData}
            onEdit={(item) => {
              if (activeTab === "mataKuliah") {
                const subject = item as SubjectCourseItem;
                setEditingSubject(subject);
                setSubjectForm({
                  code: subject.code,
                  title: subject.title,
                  description: subject.description || "",
                  learningOutcomes: subject.learningOutcomes || "",
                  status: subject.status,
                  bannerImage: subject.bannerImage,
                  teacherIds: subject.teachers.map((t) => t.user.id),
                });
                setShowSubjectModal(true);
              } else if (activeTab === "kelas") {
                const classItem = item as ClassItem;
                setEditingClass(classItem);
                setClassForm({
                  name: classItem.name,
                  academicYearId: classItem.academicYearId,
                  capacity: classItem.capacity,
                });
                setShowClassModal(true);
              } else if (activeTab === "years") {
                const year = item as AcademicYear;
                setEditingYear(year);
                setYearForm({
                  name: year.name,
                  fromYear: year.fromYear,
                  toYear: year.toYear,
                  isCurrent: year.isCurrent,
                });
                setShowYearModal(true);
              }
            }}
            onDelete={(id) => {
              if (activeTab === "mataKuliah") deleteSubject(id);
              else if (activeTab === "kelas") deleteClass(id);
              else deleteYear(id);
            }}
            onYearActive={setYearActive}
            searchQuery={searchQuery}
          />

          <List
            activeTab={activeTab}
            loading={loading}
            data={pagedData}
            onEdit={(item) => {
              if (activeTab === "mataKuliah") {
                const subject = item as SubjectCourseItem;
                setEditingSubject(subject);
                setSubjectForm({
                  code: subject.code,
                  title: subject.title,
                  description: subject.description || "",
                  learningOutcomes: subject.learningOutcomes || "",
                  status: subject.status,
                  bannerImage: subject.bannerImage,
                  teacherIds: subject.teachers.map((t) => t.user.id),
                });
                setShowSubjectModal(true);
              } else if (activeTab === "kelas") {
                const classItem = item as ClassItem;
                setEditingClass(classItem);
                setClassForm({
                  name: classItem.name,
                  academicYearId: classItem.academicYearId,
                  capacity: classItem.capacity,
                });
                setShowClassModal(true);
              } else if (activeTab === "years") {
                const year = item as AcademicYear;
                setEditingYear(year);
                setYearForm({
                  name: year.name,
                  fromYear: year.fromYear,
                  toYear: year.toYear,
                  isCurrent: year.isCurrent,
                });
                setShowYearModal(true);
              }
            }}
            onDelete={(id) => {
              if (activeTab === "mataKuliah") deleteSubject(id);
              else if (activeTab === "kelas") deleteClass(id);
              else deleteYear(id);
            }}
            onYearActive={setYearActive}
            searchQuery={searchQuery}
          />

          <DataViewportControls
            startItem={startItem}
            endItem={endItem}
            totalItems={totalItems}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={setRowsPerPage}
            entityLabel={
              activeTab === "mataKuliah"
                ? "mata kuliah"
                : activeTab === "kelas"
                  ? "kelas"
                  : "tahun akademik"
            }
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
            loading={loading}
          />
        </div>

        <CourseDialogs
          showClassModal={showClassModal}
          setShowClassModal={setShowClassModal}
          editingClass={editingClass}
          classForm={classForm}
          setClassForm={setClassForm}
          teachers={meta.teachers}
          years={meta.years}
          onClassSubmit={handleClassSubmit}
          showSubjectModal={showSubjectModal}
          setShowSubjectModal={setShowSubjectModal}
          editingSubject={editingSubject}
          subjectForm={subjectForm}
          setSubjectForm={setSubjectForm}
          onSubjectSubmit={handleSubjectSubmit}
          showYearModal={showYearModal}
          setShowYearModal={setShowYearModal}
          editingYear={editingYear}
          yearForm={yearForm}
          setYearForm={setYearForm}
          onYearSubmit={handleYearSubmit}
          loading={loading}
        />

        <Dialog
          open={notice.open}
          onOpenChange={(o) => setNotice((p) => ({ ...p, open: o }))}
        >
          <DialogContent className="sm:max-w-md border border-border rounded-md shadow-sm">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase">
                {notice.title}
              </DialogTitle>
              <DialogDescription className="font-bold text-muted-foreground">
                {notice.message}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end pt-4">
              <Button
                className="font-black px-10 rounded-md border border-border shadow-sm"
                onClick={() => setNotice((p) => ({ ...p, open: false }))}
              >
                OK
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
              <DialogTitle className="text-xl font-black uppercase">
                {confirmState.title}
              </DialogTitle>
              <DialogDescription className="font-bold text-muted-foreground">
                {confirmState.message}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 pt-6">
              <Button
                variant="ghost"
                className="font-black text-[11px] uppercase tracking-widest border border-border"
                onClick={() => setConfirmState((p) => ({ ...p, open: false }))}
              >
                Batal
              </Button>
              <Button
                className="font-black text-[11px] uppercase tracking-widest bg-destructive hover:bg-destructive/90 text-destructive-foreground px-8 rounded-md border border-border shadow-sm"
                onClick={async () => {
                  if (confirmState.onConfirm) await confirmState.onConfirm();
                  setConfirmState((p) => ({ ...p, open: false }));
                }}
              >
                Ya, Hapus
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </Suspense>
    </AdminLayout>
  );
}
