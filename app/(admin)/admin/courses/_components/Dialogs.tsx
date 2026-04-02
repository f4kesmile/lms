"use client";

import { CourseStatus } from "@prisma/client";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";

import {
  type AcademicYear,
  type ClassForm,
  type ClassItem,
  type SubjectCourseItem,
  type SubjectForm,
  type Teacher,
  type YearForm,
} from "@/app/(admin)/admin/courses/_lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CourseDialogsProps {
  showClassModal: boolean;
  setShowClassModal: (open: boolean) => void;
  editingClass: ClassItem | null;
  classForm: ClassForm;
  setClassForm: Dispatch<SetStateAction<ClassForm>>;
  teachers: Teacher[];
  years: AcademicYear[];
  onClassSubmit: (e: React.FormEvent) => Promise<void>;

  showSubjectModal: boolean;
  setShowSubjectModal: (open: boolean) => void;
  editingSubject: SubjectCourseItem | null;
  subjectForm: SubjectForm;
  setSubjectForm: Dispatch<SetStateAction<SubjectForm>>;
  onSubjectSubmit: (e: React.FormEvent) => Promise<void>;

  showYearModal: boolean;
  setShowYearModal: (open: boolean) => void;
  editingYear: AcademicYear | null;
  yearForm: YearForm;
  setYearForm: Dispatch<SetStateAction<YearForm>>;
  onYearSubmit: (e: React.FormEvent) => Promise<void>;

  loading: boolean;

  // New props
  showManageSubjectsModal?: boolean;
  setShowManageSubjectsModal?: (open: boolean) => void;
  classSubjects?: ClassSubjectAssignment[];
  allSubjects?: SubjectOption[];
  onAssignSubject?: (data: AssignSubjectPayload) => Promise<void>;
  onRemoveSubject?: (id: string) => Promise<void>;
}

type SubjectOption = { id: string; code: string; name: string };

type AssignSubjectPayload = {
  subjectId: string;
  teacherUserId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
};

type ClassSubjectAssignment = {
  subject: SubjectOption;
  teacher?: { id: string; name: string } | null;
  dayOfWeek?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  room?: string | null;
};

export function CourseDialogs({
  showClassModal,
  setShowClassModal,
  editingClass,
  classForm,
  setClassForm,
  teachers,
  years,
  onClassSubmit,
  showSubjectModal,
  setShowSubjectModal,
  editingSubject,
  subjectForm,
  setSubjectForm,
  onSubjectSubmit,
  showYearModal,
  setShowYearModal,
  editingYear,
  yearForm,
  setYearForm,
  onYearSubmit,
  loading,

  showManageSubjectsModal,
  setShowManageSubjectsModal,
  classSubjects = [],
  allSubjects = [],
  onAssignSubject,
  onRemoveSubject,
}: CourseDialogsProps) {
  const [bannerFileName, setBannerFileName] = useState("");

  const [confirmRemoval, setConfirmRemoval] = useState<{
    open: boolean;
    subjectId: string | null;
    subjectName: string;
  }>({ open: false, subjectId: null, subjectName: "" });

  const [assignForm, setAssignForm] = useState({
    subjectId: "",
    teacherUserId: "none",
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    room: "",
  });

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBannerFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setSubjectForm((prev) => ({ ...prev, bannerImage: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const clampCredits = (value: number) => Math.min(8, Math.max(1, value));
  const updateCredits = (nextValue: number) => {
    setSubjectForm((prev) => ({
      ...prev,
      credits: clampCredits(nextValue),
    }));
  };

  return (
    <>
      <Dialog open={showClassModal} onOpenChange={setShowClassModal}>
        <DialogContent className="mobile-drawer-md border-none max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-black tracking-tight">
              {editingClass ? "Edit Data Kelas" : "Tambah Kelas Baru"}
            </DialogTitle>
            <DialogDescription className="font-medium">
              Kelompokkan mahasiswa ke dalam unit kelas dan tentukan
              kapasitasnya.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onClassSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Nama Kelas
              </label>
              <Input
                required
                value={classForm.name}
                onChange={(e) =>
                  setClassForm({ ...classForm, name: e.target.value })
                }
                className="h-11 rounded-xl bg-card border-border/50"
                placeholder="Contoh: IF-A 2024"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Tahun Akademik
                </label>
                <Select
                  value={classForm.academicYearId}
                  onValueChange={(val) =>
                    setClassForm({ ...classForm, academicYearId: val })
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl bg-card border-border/50 font-bold">
                    <SelectValue placeholder="Pilih tahun" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/50">
                    {years.map((y) => (
                      <SelectItem
                        key={y.id}
                        value={y.id}
                        className="rounded-lg"
                      >
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
                <div className="flex h-11 items-center rounded-xl border border-border/50 bg-card">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-full rounded-r-none px-3 font-black"
                    onClick={() =>
                      setClassForm({
                        ...classForm,
                        capacity: Math.max(
                          1,
                          Number(classForm.capacity || 1) - 1,
                        ),
                      })
                    }
                  >
                    <Icon name="remove" size={18} />
                  </Button>
                  <Input
                    required
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={classForm.capacity}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
                      setClassForm({
                        ...classForm,
                        capacity: digitsOnly ? Number(digitsOnly) : 1,
                      });
                    }}
                    className="h-full rounded-none border-0 bg-transparent text-center font-black shadow-none focus-visible:ring-0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-full rounded-l-none px-3 font-black"
                    onClick={() =>
                      setClassForm({
                        ...classForm,
                        capacity: Number(classForm.capacity || 0) + 1,
                      })
                    }
                  >
                    <Icon name="add" size={18} />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Enrollment Key
              </label>
              <Input
                value={classForm.enrollmentKey}
                onChange={(e) =>
                  setClassForm({ ...classForm, enrollmentKey: e.target.value })
                }
                className="h-11 rounded-xl bg-card border-border/50"
                placeholder="Kosongkan jika kelas publik"
                autoComplete="off"
              />
              <p className="pl-1 text-[10px] font-semibold text-muted-foreground">
                Jika diisi, mahasiswa wajib memasukkan key ini saat mendaftar.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
              <Button
                type="button"
                variant="ghost"
                className="font-black text-[11px] uppercase tracking-widest hover:bg-muted/50 rounded-xl"
                onClick={() => setShowClassModal(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="font-black text-[11px] uppercase tracking-widest min-w-[140px] shadow-lg shadow-primary/20 rounded-xl"
              >
                {loading
                  ? "Menyimpan..."
                  : editingClass
                    ? "Update Kelas"
                    : "Tambah Kelas"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showSubjectModal} onOpenChange={setShowSubjectModal}>
        <DialogContent className="mobile-drawer-lg border-none max-w-2xl rounded-3xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-black tracking-tight">
              {editingSubject ? "Edit Mata Kuliah" : "Tambah Mata Kuliah Baru"}
            </DialogTitle>
            <DialogDescription className="font-medium">
              Definisikan kurikulum, unggah banner, dan tentukan dosen pengampu.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubjectSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Banner Mata Kuliah
              </label>
              <div className="flex items-center gap-4">
                {subjectForm.bannerImage && (
                  <div className="size-20 rounded-xl overflow-hidden border border-border shadow-sm">
                    <Image
                      src={subjectForm.bannerImage}
                      alt="Banner Preview"
                      width={80}
                      height={80}
                      unoptimized
                      className="size-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <input
                    id="subject-banner-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="subject-banner-upload"
                      className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border border-border/50 bg-card px-4 text-[11px] font-black uppercase tracking-widest transition-colors hover:bg-muted/40"
                    >
                      Pilih Banner
                    </label>
                    {subjectForm.bannerImage && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-11 rounded-xl px-3 text-[10px] font-black uppercase tracking-widest"
                        onClick={() => {
                          setSubjectForm((prev) => ({
                            ...prev,
                            bannerImage: null,
                          }));
                          setBannerFileName("");
                        }}
                      >
                        Hapus
                      </Button>
                    )}
                  </div>
                  <p className="px-1 text-[11px] font-medium text-muted-foreground">
                    {bannerFileName ||
                      (subjectForm.bannerImage
                        ? "Banner tersimpan."
                        : "Belum ada file dipilih")}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-1">
                <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Kode MK
                </label>
                <Input
                  required
                  value={subjectForm.code}
                  onChange={(e) =>
                    setSubjectForm({ ...subjectForm, code: e.target.value })
                  }
                  className="h-11 rounded-xl bg-card border-border/50 font-mono font-bold"
                  placeholder="IF101"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Nama Mata Kuliah
                </label>
                <Input
                  required
                  value={subjectForm.name}
                  onChange={(e) =>
                    setSubjectForm({ ...subjectForm, name: e.target.value })
                  }
                  className="h-11 rounded-xl bg-card border-border/50"
                  placeholder="Contoh: Pemrograman Dasar"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Dosen Pengampu
                </label>
                <Select
                  value={subjectForm.teacherId || "none"}
                  onValueChange={(val) =>
                    setSubjectForm({
                      ...subjectForm,
                      teacherId: val === "none" ? null : val,
                    })
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl bg-card border-border/50 font-bold">
                    <SelectValue placeholder="Pilih dosen" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/50">
                    <SelectItem
                      value="none"
                      className="rounded-lg text-muted-foreground"
                    >
                      Belum ditentukan
                    </SelectItem>
                    {teachers.map((t) => (
                      <SelectItem
                        key={t.id}
                        value={t.id}
                        className="rounded-lg"
                      >
                        <div className="flex flex-col items-start py-0.5">
                          <span className="font-black text-sm">{t.name}</span>
                          <span className="text-[10px] opacity-70">
                            NIP: {t.nip || "-"}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Status Publikasi
                </label>
                <Select
                  value={subjectForm.status}
                  onValueChange={(val) =>
                    setSubjectForm({
                      ...subjectForm,
                      status: val as CourseStatus,
                    })
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl bg-card border-border/50 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/50">
                    <SelectItem
                      value={CourseStatus.published}
                      className="rounded-lg"
                    >
                      Dipublikasikan (Tersedia untuk AI)
                    </SelectItem>
                    <SelectItem
                      value={CourseStatus.draft}
                      className="rounded-lg"
                    >
                      Draft (Hanya Admin)
                    </SelectItem>
                    <SelectItem
                      value={CourseStatus.archived}
                      className="rounded-lg"
                    >
                      Diarsipkan
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Beban SKS
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card p-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-8 rounded-lg"
                  onClick={() => updateCredits(subjectForm.credits - 1)}
                >
                  -
                </Button>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  value={subjectForm.credits}
                  onChange={(e) =>
                    updateCredits(parseInt(e.target.value, 10) || 1)
                  }
                  className="h-8 border-0 bg-transparent text-center font-black shadow-none focus-visible:ring-0"
                  placeholder="3"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-8 rounded-lg"
                  onClick={() => updateCredits(subjectForm.credits + 1)}
                >
                  +
                </Button>
              </div>
              <p className="px-1 text-[10px] font-medium text-muted-foreground">
                Gunakan tombol + / - atau ketik langsung (rentang 1-8 SKS).
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Deskripsi Singkat
              </label>
              <textarea
                value={subjectForm.description}
                onChange={(e) =>
                  setSubjectForm({
                    ...subjectForm,
                    description: e.target.value,
                  })
                }
                className="w-full min-h-24 rounded-2xl bg-card border border-border/50 p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Ringkasan apa yang dipelajari di MK ini..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Capaian Pembelajaran (Opsional)
              </label>
              <textarea
                value={subjectForm.learningOutcomes}
                onChange={(e) =>
                  setSubjectForm({
                    ...subjectForm,
                    learningOutcomes: e.target.value,
                  })
                }
                className="w-full min-h-32 rounded-2xl bg-card border border-border/50 p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Target kompetensi mahasiswa setelah mengikuti MK ini..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
              <Button
                type="button"
                variant="ghost"
                className="font-black text-[11px] uppercase tracking-widest hover:bg-muted/50 rounded-xl"
                onClick={() => setShowSubjectModal(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="font-black text-[11px] uppercase tracking-widest min-w-[180px] shadow-lg shadow-primary/20 rounded-xl"
              >
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

      <Dialog open={showYearModal} onOpenChange={setShowYearModal}>
        <DialogContent className="mobile-drawer-sm border-none max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-black tracking-tight">
              {editingYear ? "Edit Tahun Akademik" : "Tambah Tahun Akademik"}
            </DialogTitle>
            <DialogDescription className="font-medium">
              Definisikan periode akademik baru untuk pengelolaan kelas.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onYearSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Nama Periode
              </label>
              <Input
                required
                value={yearForm.name}
                onChange={(e) =>
                  setYearForm({ ...yearForm, name: e.target.value })
                }
                className="h-11 rounded-xl bg-card border-border/50"
                placeholder="Contoh: Ganjil 2024/2025"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Dari Tahun
                </label>
                <Input
                  required
                  type="date"
                  value={
                    yearForm.fromYear
                      ? new Date(yearForm.fromYear).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setYearForm({ ...yearForm, fromYear: e.target.value })
                  }
                  className="h-11 rounded-xl bg-card border-border/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Hingga Tahun
                </label>
                <Input
                  required
                  type="date"
                  value={
                    yearForm.toYear
                      ? new Date(yearForm.toYear).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setYearForm({ ...yearForm, toYear: e.target.value })
                  }
                  className="h-11 rounded-xl bg-card border-border/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 bg-muted/30 p-4 rounded-2xl border border-border/50">
              <input
                type="checkbox"
                id="isCurrentYear"
                title="Set Aktif Sekarang"
                checked={yearForm.isCurrent}
                onChange={(e) =>
                  setYearForm({ ...yearForm, isCurrent: e.target.checked })
                }
                className="size-5 rounded border-primary bg-background text-primary focus:ring-primary/20 transition-all cursor-pointer"
              />
              <label
                htmlFor="isCurrentYear"
                className="text-sm font-black tracking-tight cursor-pointer"
              >
                Set sebagai Tahun Aktif sekarang
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
              <Button
                type="button"
                variant="ghost"
                className="font-black text-[11px] uppercase tracking-widest hover:bg-muted/50 rounded-xl"
                onClick={() => setShowYearModal(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="font-black text-[11px] uppercase tracking-widest min-w-[120px] shadow-lg shadow-primary/20 rounded-xl"
              >
                {loading
                  ? "Menyimpan..."
                  : editingYear
                    ? "Update Tahun"
                    : "Simpan Tahun"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showManageSubjectsModal}
        onOpenChange={setShowManageSubjectsModal}
      >
        <DialogContent className="mobile-drawer-full border-none max-w-4xl rounded-3xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-black tracking-tight">
              Kelola Mata Kuliah & Jadwal: {editingClass?.name}
            </DialogTitle>
            <DialogDescription className="font-medium">
              Tentukan mata kuliah apa saja yang tersedia di kelas ini beserta
              jadwal dan dosen pengampunya.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 pt-4">
            {/* Form Penugasan */}
            <div className="space-y-4 p-6 rounded-2xl bg-muted/20 border border-border">
              <h4 className="text-xs font-black uppercase tracking-widest text-primary">
                Penugasan Baru/Edit
              </h4>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Pilih Mata Kuliah
                  </label>
                  <Select
                    value={assignForm.subjectId}
                    onValueChange={(val) =>
                      setAssignForm({ ...assignForm, subjectId: val })
                    }
                  >
                    <SelectTrigger className="h-10 rounded-xl bg-card">
                      <SelectValue placeholder="Pilih MK" />
                    </SelectTrigger>
                    <SelectContent>
                      {allSubjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.code} - {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Dosen Pengampu
                  </label>
                  <Select
                    value={assignForm.teacherUserId}
                    onValueChange={(val) =>
                      setAssignForm({ ...assignForm, teacherUserId: val })
                    }
                  >
                    <SelectTrigger className="h-10 rounded-xl bg-card">
                      <SelectValue placeholder="Pilih Dosen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        Default (Koordinator MK)
                      </SelectItem>
                      {Array.from(
                        new Map(teachers.map((t) => [t.id, t])).values(),
                      ).map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Hari
                    </label>
                    <Select
                      value={assignForm.dayOfWeek}
                      onValueChange={(val) =>
                        setAssignForm({ ...assignForm, dayOfWeek: val })
                      }
                    >
                      <SelectTrigger className="h-10 rounded-xl bg-card">
                        <SelectValue placeholder="Pilih Hari" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="senin">Senin</SelectItem>
                        <SelectItem value="selasa">Selasa</SelectItem>
                        <SelectItem value="rabu">Rabu</SelectItem>
                        <SelectItem value="kamis">Kamis</SelectItem>
                        <SelectItem value="jumat">Jumat</SelectItem>
                        <SelectItem value="sabtu">Sabtu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Ruangan
                    </label>
                    <Input
                      value={assignForm.room}
                      onChange={(e) =>
                        setAssignForm({ ...assignForm, room: e.target.value })
                      }
                      placeholder="Contoh: R.401"
                      className="h-10 rounded-xl bg-card"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Jam Mulai
                    </label>
                    <Input
                      type="time"
                      value={assignForm.startTime}
                      onChange={(e) =>
                        setAssignForm({
                          ...assignForm,
                          startTime: e.target.value,
                        })
                      }
                      className="h-10 rounded-xl bg-card"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Jam Selesai
                    </label>
                    <Input
                      type="time"
                      value={assignForm.endTime}
                      onChange={(e) =>
                        setAssignForm({
                          ...assignForm,
                          endTime: e.target.value,
                        })
                      }
                      className="h-10 rounded-xl bg-card"
                    />
                  </div>
                </div>

                <Button
                  className="w-full h-11 rounded-xl font-black text-[10px] uppercase tracking-widest mt-2"
                  disabled={!assignForm.subjectId || loading}
                  onClick={async () => {
                    await onAssignSubject?.({
                      ...assignForm,
                      teacherUserId:
                        assignForm.teacherUserId === "none"
                          ? undefined
                          : assignForm.teacherUserId,
                    });
                    setAssignForm({
                      subjectId: "",
                      teacherUserId: "none",
                      dayOfWeek: "",
                      startTime: "",
                      endTime: "",
                      room: "",
                    });
                  }}
                >
                  {loading ? "Proses..." : "Simpan Penugasan"}
                </Button>
              </div>
            </div>

            {/* List MK Aktif */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Mata Kuliah Terdaftar
              </h4>
              <div className="space-y-3">
                {classSubjects.length > 0 ? (
                  classSubjects.map((cs) => (
                    <div
                      key={cs.subject.id}
                      className="p-4 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-primary/10 text-primary rounded-md">
                              {cs.subject.code}
                            </span>
                            <h5 className="text-sm font-black">
                              {cs.subject.name}
                            </h5>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 opacity-70">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold">
                              <Icon
                                name="person"
                                size={12}
                                className="text-primary"
                              />
                              <span>{cs.teacher?.name || "Default"}</span>
                            </div>
                            {cs.dayOfWeek && (
                              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                                <Icon
                                  name="schedule"
                                  size={12}
                                  className="text-secondary-brand"
                                />
                                <span className="uppercase">
                                  {cs.dayOfWeek}{" "}
                                  {cs.startTime && `- ${cs.startTime}`}
                                </span>
                              </div>
                            )}
                            {cs.room && (
                              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                                <Icon
                                  name="location_on"
                                  size={12}
                                  className="text-destructive"
                                />
                                <span>{cs.room}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-9 rounded-xl border border-border/40 bg-background/50 hover:bg-primary/10 hover:text-primary transition-all shadow-sm"
                                onClick={() => {
                                  setAssignForm({
                                    subjectId: cs.subject.id,
                                    teacherUserId: cs.teacher?.id || "none",
                                    dayOfWeek: cs.dayOfWeek || "",
                                    startTime: cs.startTime || "",
                                    endTime: cs.endTime || "",
                                    room: cs.room || "",
                                  });
                                  // Scroll to top of dialog to see the form
                                  const container =
                                    document.querySelector(".overflow-y-auto");
                                  if (container)
                                    container.scrollTo({
                                      top: 0,
                                      behavior: "smooth",
                                    });
                                }}
                              >
                                <Icon name="edit" size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="font-bold">
                              Edit Jadwal
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-9 rounded-xl border border-destructive/10 bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm"
                                disabled={loading}
                                onClick={() =>
                                  setConfirmRemoval({
                                    open: true,
                                    subjectId: cs.subject.id,
                                    subjectName: cs.subject.name,
                                  })
                                }
                              >
                                <Icon name="delete" size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="font-bold">
                              Hapus MK dari Kelas
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center border-2 border-dashed border-border rounded-3xl opacity-50 flex flex-col items-center gap-3">
                    <Icon name="history_edu" size={32} />
                    <p className="text-xs font-bold">Belum ada mata kuliah</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Konfirmasi Hapus MK dari Kelas */}
          <Dialog
            open={confirmRemoval.open}
            onOpenChange={(o) => setConfirmRemoval((p) => ({ ...p, open: o }))}
          >
            <DialogContent className="mobile-drawer-sm sm:max-w-[400px] border-none rounded-3xl shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase text-destructive">
                  Hapus Penugasan?
                </DialogTitle>
                <DialogDescription className="font-bold text-muted-foreground pt-2">
                  Anda akan menghapus mata kuliah{" "}
                  <span className="text-foreground">
                    {confirmRemoval.subjectName}
                  </span>{" "}
                  dari kelas ini. Data nilai atau presensi yang terkait mungkin
                  akan terpengaruh.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-3 pt-6">
                <Button
                  variant="ghost"
                  className="font-black text-[11px] uppercase tracking-widest border border-border h-11 px-6 rounded-xl"
                  onClick={() =>
                    setConfirmRemoval((p) => ({ ...p, open: false }))
                  }
                >
                  Batal
                </Button>
                <Button
                  className="font-black text-[11px] uppercase tracking-widest bg-destructive hover:bg-destructive/90 text-destructive-foreground px-8 rounded-xl border-none shadow-xl h-11"
                  onClick={() => {
                    if (confirmRemoval.subjectId) {
                      onRemoveSubject?.(confirmRemoval.subjectId);
                    }
                    setConfirmRemoval((p) => ({
                      ...p,
                      open: false,
                      subjectId: null,
                    }));
                  }}
                >
                  Ya, Lepas Penugasan
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </DialogContent>
      </Dialog>
    </>
  );
}
