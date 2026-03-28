"use client";

import Link from "next/link";
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

export type Material = {
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
    loadData();
    loadCourses();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(search, selectedCourseId);
    }, 250);

    return () => clearTimeout(timer);
  }, [search, selectedCourseId]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedCourseId, rowsPerPage]);

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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="font-bold border border-border text-primary hover:bg-primary/5 shadow-sm  transition-all rounded-md bg-card"
            onClick={() => loadData(search, selectedCourseId)}
          >
            <Icon name="sync" size={16} className="sm:mr-1" />
            <span className="hidden sm:inline">Sync Data</span>
          </Button>
          <Button
            size="sm"
            className="font-bold border border-border shadow-sm  transition-all rounded-md"
            asChild
          >
            <Link
              href={{
                pathname: "/admin/materials/new",
                query: { from: "knowledge" },
              }}
            >
              <Icon name="upload_file" size={16} className="sm:mr-1" />
              <span className="hidden sm:inline">Upload Materi</span>
            </Link>
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

        <Dialog
          open={notice.open}
          onOpenChange={(open) => setNotice((prev) => ({ ...prev, open }))}
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
      </Suspense>
    </AdminLayout>
  );
}
