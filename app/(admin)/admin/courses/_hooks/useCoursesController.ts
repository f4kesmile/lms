import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  EMPTY_CLASS_FORM,
  EMPTY_SUBJECT_FORM,
  EMPTY_YEAR_FORM,
} from "@/app/(admin)/admin/courses/_lib/forms";
import type {
  AcademicYear,
  ActiveTab,
  ClassForm,
  ClassItem,
  SubjectCourseItem,
  SubjectForm,
  Teacher,
  YearForm,
} from "@/app/(admin)/admin/courses/_lib/types";
import {
  createAcademicYearAction,
  createClassAction,
  createSubjectCourseAction,
  deleteAcademicYearAction,
  deleteClassAction,
  deleteSubjectCourseAction,
  setAcademicYearActiveAction,
  updateAcademicYearAction,
  updateClassAction,
  updateSubjectCourseAction,
} from "@/lib/actions/course";

type NoticeState = {
  open: boolean;
  title: string;
  message: string;
};

type ConfirmState = {
  open: boolean;
  title: string;
  message: string;
  onConfirm: null | (() => Promise<void> | void);
};

export function useCoursesController() {
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
  const [yearForm, setYearForm] = useState<YearForm>(EMPTY_YEAR_FORM);

  const [meta, setMeta] = useState<{
    years: AcademicYear[];
    teachers: Teacher[];
  }>({
    years: [],
    teachers: [],
  });

  const [notice, setNotice] = useState<NoticeState>({
    open: false,
    title: "",
    message: "",
  });

  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const fetchClasses = useCallback(async () => {
    const res = await fetch("/api/classes?limit=100");
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Gagal mengambil data kelas");
    return data.classes ?? [];
  }, []);

  const fetchSubjectCourses = useCallback(async () => {
    const res = await fetch("/api/kb/courses");
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || "Gagal mengambil data mata kuliah");
    }
    return data.courses ?? [];
  }, []);

  const fetchAcademicYears = useCallback(async () => {
    const res = await fetch("/api/academic-years?limit=100");
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || "Gagal mengambil data tahun akademik");
    }
    return data.years ?? [];
  }, []);

  const loadData = useCallback(async () => {
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
  }, [activeTab, fetchAcademicYears, fetchClasses, fetchSubjectCourses]);

  const loadMeta = useCallback(async () => {
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
  }, [fetchAcademicYears]);

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
  }, [loadData, roleChecked]);

  useEffect(() => {
    if (!roleChecked) return;
    void loadMeta();
  }, [loadMeta, roleChecked]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery, rowsPerPage]);

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
        name: subjectForm.name.trim(),
        description: subjectForm.description.trim() || null,
        learningOutcomes: subjectForm.learningOutcomes.trim() || null,
        credits: subjectForm.credits,
        status: subjectForm.status,
        bannerImage: subjectForm.bannerImage,
        teacherId: subjectForm.teacherId,
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
          error instanceof Error ? error.message : "Gagal menyimpan mata kuliah",
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

  function openCreateDialog() {
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
    setYearForm(EMPTY_YEAR_FORM);
    setEditingYear(null);
    setShowYearModal(true);
  }

  function handleEditItem(item: SubjectCourseItem | ClassItem | AcademicYear) {
    if (activeTab === "mataKuliah") {
      const subject = item as SubjectCourseItem;
      setEditingSubject(subject);
      setSubjectForm({
        code: subject.code,
        name: subject.name,
        description: subject.description || "",
        learningOutcomes: subject.learningOutcomes || "",
        credits: subject.credits,
        status: subject.status,
        bannerImage: subject.bannerImage,
        teacherId: subject.teachers[0]?.user.id || null,
      });
      setShowSubjectModal(true);
      return;
    }

    if (activeTab === "kelas") {
      const classItem = item as ClassItem;
      setEditingClass(classItem);
      setClassForm({
        name: classItem.name,
        academicYearId: classItem.academicYearId,
        capacity: classItem.capacity,
      });
      setShowClassModal(true);
      return;
    }

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

  function handleDeleteItem(id: string) {
    if (activeTab === "mataKuliah") {
      deleteSubject(id);
      return;
    }
    if (activeTab === "kelas") {
      deleteClass(id);
      return;
    }
    deleteYear(id);
  }

  const currentData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (activeTab === "mataKuliah") {
      return q
        ? subjectCourses.filter((item) =>
            [item.code, item.name].join(" ").toLowerCase().includes(q),
          )
        : subjectCourses;
    }
    if (activeTab === "kelas") {
      return q
        ? classes.filter((item) =>
            [item.name, item.academicYear.name]
              .join(" ")
              .toLowerCase()
              .includes(q),
          )
        : classes;
    }
    return q
      ? years.filter((item) => item.name.toLowerCase().includes(q))
      : years;
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

  const searchPlaceholder =
    activeTab === "mataKuliah"
      ? "Cari kode atau nama MK..."
      : activeTab === "kelas"
        ? "Cari kelas atau dosen..."
        : "Cari tahun...";

  const entityLabel =
    activeTab === "mataKuliah"
      ? "mata kuliah"
      : activeTab === "kelas"
        ? "kelas"
        : "tahun akademik";

  return {
    activeTab,
    setActiveTab,
    activeYearLabel,
    addButtonLabel,
    classForm,
    classes,
    confirmState,
    editingClass,
    editingSubject,
    editingYear,
    endItem,
    entityLabel,
    handleClassSubmit,
    handleDeleteItem,
    handleEditItem,
    handleSubjectSubmit,
    handleYearSubmit,
    loading,
    meta,
    notice,
    onRowsPerPageChange: setRowsPerPage,
    onYearActive: setYearActive,
    openCreateDialog,
    page: safePage,
    pagedData,
    roleChecked,
    rowsPerPage,
    searchPlaceholder,
    searchQuery,
    setConfirmState,
    setNotice,
    setPage,
    setSearchQuery,
    setShowClassModal,
    setShowSubjectModal,
    setShowYearModal,
    showClassModal,
    showSubjectModal,
    showYearModal,
    startItem,
    subjectCourses,
    subjectForm,
    totalItems,
    totalPages,
    yearForm,
    setClassForm,
    setSubjectForm,
    setYearForm,
  };
}
