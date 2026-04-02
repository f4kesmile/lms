"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { DataViewportControls } from "@/app/(admin)/admin/_components/Controls";
import { MaterialDialog } from "@/app/(admin)/admin/knowledge/_components/Dialog";
import { Filters } from "@/app/(admin)/admin/knowledge/_components/Filters";
import { List } from "@/app/(admin)/admin/knowledge/_components/List";
import { Table } from "@/app/(admin)/admin/knowledge/_components/Table";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
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
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/index";
import {
  notifyError,
  toastDeleted,
  toastDeleteFailed,
  toastSaved,
  toastSaveFailed,
  toastUpdated,
} from "@/lib/utils/toast";

export type Material = {
  id: string;
  courseId: string | null;
  title: string;
  module: string | null;
  page: string | null;
  meetingNo: number | null;
  content: string;
  type: "session" | "reference";
  createdAt: string;
  updatedAt: string;
  _count: { chunks: number };
  course: { id: string; code: string; title: string } | null;
  createdBy: { id: string; name: string | null; email: string } | null;
};

type MaterialForm = {
  type: "session" | "reference";
  courseId: string;
  title: string;
  module: string;
  page: string;
  meetingNo: number;
  content: string;
};

type CourseOption = {
  id: string;
  code: string;
  title: string;
  status: string;
};

const EMPTY_FORM: MaterialForm = {
  type: "reference",
  courseId: "",
  title: "",
  module: "",
  page: "",
  meetingNo: 1,
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

export default function KnowledgePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
      }
    >
      <KnowledgeContent />
    </Suspense>
  );
}

function KnowledgeContent() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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

  const [isDesktop, setIsDesktop] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

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
      const data: {
        courses?: Array<{
          id: string;
          code: string;
          name: string;
          status: string;
        }>;
      } = await res.json();

      if (!res.ok) {
        setCourses([]);
        return;
      }

      const coursesData: CourseOption[] = (data.courses || []).map((c) => ({
        id: c.id,
        code: c.code,
        title: c.name || "",
        status: c.status,
      }));
      setCourses(coursesData);
    } catch {
      setCourses([]);
    }
  }

  useEffect(() => {
    loadData();
    loadCourses();
  }, []);

  const searchParams = useSearchParams();

  // Handle Redirection Params
  useEffect(() => {
    const isNew = searchParams.get("new") === "true";
    const editId = searchParams.get("edit");
    const courseId = searchParams.get("courseId");
    const type = searchParams.get("type") as "session" | "reference";
    const meetingNo = searchParams.get("meetingNo");

    if (isNew) {
      setForm({
        ...EMPTY_FORM,
        courseId: courseId || "",
        type: type || "reference",
        meetingNo: parseInt(meetingNo || "1"),
      });
      setShowModal(true);
      window.history.replaceState(null, "", window.location.pathname);
    } else if (editId) {
      // Find from already loaded materials or wait for them
      const found = materials.find((m) => m.id === editId);
      if (found) {
        openEditModal(found);
        window.history.replaceState(null, "", window.location.pathname);
      }
    }
  }, [searchParams, materials]); // Wait for materials to load if editing
  function openCreateModal() {
    setEditingMaterial(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(search, selectedCourseId);
    }, 250);

    return () => clearTimeout(timer);
  }, [search, selectedCourseId]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedCourseId, rowsPerPage]);

  function openEditModal(item: Material) {
    setEditingMaterial(item);
    setForm({
      type: item.type,
      courseId: item.course?.id ?? "",
      title: item.title,
      module: item.module ?? "",
      page: item.page ?? "",
      meetingNo: item.meetingNo ?? 1,
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
          toastDeleteFailed("materi", null);
          setNotice({
            open: true,
            title: "Gagal Menghapus",
            message: "Materi tidak dapat dihapus.",
          });
          return;
        }
        toastDeleted("materi");
        setMaterials((prev) => prev.filter((k) => k.id !== id));
      },
    });
  }

  async function saveMaterial(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!form.courseId) {
        notifyError("Harap pilih mata kuliah untuk materi ini");
        setNotice({
          open: true,
          title: "Mata Kuliah Wajib",
          message: "Harap pilih mata kuliah untuk materi ini.",
        });
        return;
      }

      const payload = {
        type: form.type,
        courseId: form.courseId,
        title: form.title,
        content: form.content,
        // Only include specific fields based on type
        ...(form.type === "session"
          ? { meetingNo: form.meetingNo }
          : { module: form.module, page: form.page || "1" }),
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

      if (editingMaterial) {
        toastUpdated("materi");
      } else {
        toastSaved("materi");
      }
      setShowModal(false);
      setEditingMaterial(null);
      setForm(EMPTY_FORM);
      await loadData(search, selectedCourseId);
    } catch (error) {
      toastSaveFailed("materi", error);
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

  const totalItems = materials.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const pagedMaterials = useMemo(() => {
    const start = (safePage - 1) * rowsPerPage;
    return materials.slice(start, start + rowsPerPage);
  }, [materials, safePage, rowsPerPage]);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const endItem =
    totalItems === 0 ? 0 : Math.min(safePage * rowsPerPage, totalItems);

  return (
    <AdminLayout
      title="Basis Pengetahuan & Training AI"
      headerActions={
        <div className="flex items-center gap-3">
          <Tooltip open={mounted && !isDesktop ? undefined : false}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-10 border border-border/40 bg-card/50 px-4 font-extrabold tracking-wide text-muted-foreground shadow-sm transition-all hover:bg-card hover:text-primary hover:shadow-md",
                  !isDesktop && "px-0 w-10",
                )}
                onClick={() => loadData(search, selectedCourseId)}
              >
                <Icon name="sync" size={18} />
                {isDesktop && (
                  <span className="ml-2 uppercase text-[10px]">Sync Data</span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="font-bold">
              Sinkronisasi Data
            </TooltipContent>
          </Tooltip>

          <Tooltip open={mounted && !isDesktop ? undefined : false}>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className={cn(
                  "h-10 border border-transparent bg-primary px-5 font-extrabold tracking-wider text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]",
                  !isDesktop && "px-0 w-10",
                )}
                onClick={openCreateModal}
              >
                <>
                  <Icon name="upload_file" size={18} />
                  {isDesktop && (
                    <span className="ml-2 uppercase text-[10px]">
                      Upload Materi
                    </span>
                  )}
                </>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="font-bold">
              Upload Materi Baru
            </TooltipContent>
          </Tooltip>
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
        <div className="flex flex-col gap-6">
          <Filters
            materialsCount={materials.length}
            search={search}
            setSearch={setSearch}
            selectedCourseId={selectedCourseId}
            setSelectedCourseId={setSelectedCourseId}
            courses={courses}
          />

          <Table
            materials={pagedMaterials}
            loading={loading}
            search={search}
            openCreateModal={openCreateModal}
            openEditModal={openEditModal}
            deleteMaterial={deleteMaterial}
          />

          <List
            materials={pagedMaterials}
            loading={loading}
            search={search}
            openCreateModal={openCreateModal}
            openEditModal={openEditModal}
            deleteMaterial={deleteMaterial}
          />

          <DataViewportControls
            startItem={startItem}
            endItem={endItem}
            totalItems={totalItems}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={setRowsPerPage}
            entityLabel="materi"
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
            loading={loading}
          />
        </div>

        <MaterialDialog
          open={showModal}
          onOpenChange={setShowModal}
          editingMaterial={editingMaterial}
          form={form}
          setForm={setForm}
          courses={courses}
          moduleSuggestions={MODULE_SUGGESTIONS}
          submitting={submitting}
          onSave={saveMaterial}
          onCancel={() => {
            setShowModal(false);
            setEditingMaterial(null);
            setForm(EMPTY_FORM);
          }}
        />
      </Suspense>

      <Dialog
        open={notice.open}
        onOpenChange={(open) => setNotice((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="mobile-drawer-sm sm:max-w-md border border-border rounded-md shadow-sm">
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
        <DialogContent className="mobile-drawer-sm sm:max-w-md border border-border rounded-md shadow-sm">
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
              onClick={() =>
                setConfirmState((prev) => ({ ...prev, open: false }))
              }
            >
              Batal
            </Button>
            <Button
              className="font-black text-[11px] uppercase tracking-widest bg-destructive hover:bg-destructive/90 text-destructive-foreground px-6 border border-border rounded-md shadow-sm"
              onClick={async () => {
                if (confirmState.onConfirm) await confirmState.onConfirm();
                setConfirmState((prev) => ({ ...prev, open: false }));
              }}
            >
              Ya, Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
