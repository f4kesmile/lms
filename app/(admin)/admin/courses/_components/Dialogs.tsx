"use client";

import { CourseStatus } from "@prisma/client";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";

import {
  type AcademicYear,
  type ClassItem,
  type SubjectCourseItem,
  type Teacher,
} from "@/app/(admin)/admin/courses/page";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CourseDialogsProps {
  showClassModal: boolean;
  setShowClassModal: (open: boolean) => void;
  editingClass: ClassItem | null;
  classForm: {
    name: string;
    academicYearId: string;
    capacity: number;
  };
  setClassForm: Dispatch<
    SetStateAction<{
      name: string;
      academicYearId: string;
      capacity: number;
    }>
  >;
  teachers: Teacher[];
  years: AcademicYear[];
  onClassSubmit: (e: React.FormEvent) => Promise<void>;

  showSubjectModal: boolean;
  setShowSubjectModal: (open: boolean) => void;
  editingSubject: SubjectCourseItem | null;
  subjectForm: {
    code: string;
    title: string;
    description: string;
    learningOutcomes: string;
    status: CourseStatus;
    bannerImage: string | null;
    teacherIds: string[];
  };
  setSubjectForm: Dispatch<
    SetStateAction<{
      code: string;
      title: string;
      description: string;
      learningOutcomes: string;
      status: CourseStatus;
      bannerImage: string | null;
      teacherIds: string[];
    }>
  >;
  onSubjectSubmit: (e: React.FormEvent) => Promise<void>;

  showYearModal: boolean;
  setShowYearModal: (open: boolean) => void;
  editingYear: AcademicYear | null;
  yearForm: {
    name: string;
    fromYear: string;
    toYear: string;
    isCurrent: boolean;
  };
  setYearForm: Dispatch<
    SetStateAction<{
      name: string;
      fromYear: string;
      toYear: string;
      isCurrent: boolean;
    }>
  >;
  onYearSubmit: (e: React.FormEvent) => Promise<void>;

  loading: boolean;
}

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
}: CourseDialogsProps) {
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setSubjectForm({ ...subjectForm, bannerImage: base64 });
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Dialog open={showClassModal} onOpenChange={setShowClassModal}>
        <DialogContent className="border-none max-w-lg rounded-3xl">
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
                <Input
                  type="number"
                  required
                  value={classForm.capacity}
                  onChange={(e) =>
                    setClassForm({
                      ...classForm,
                      capacity: parseInt(e.target.value),
                    })
                  }
                  className="h-11 rounded-xl bg-card border-border/50"
                />
              </div>
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
        <DialogContent className="border-none max-w-2xl rounded-3xl max-h-[90dvh] overflow-y-auto">
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
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="h-11 rounded-xl bg-card border-border/50 text-[10px] font-bold uppercase"
                  />
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
                  value={subjectForm.title}
                  onChange={(e) =>
                    setSubjectForm({ ...subjectForm, title: e.target.value })
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
                  value={subjectForm.teacherIds[0] || "none"}
                  onValueChange={(val) =>
                    setSubjectForm({
                      ...subjectForm,
                      teacherIds: val === "none" ? [] : [val],
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
        <DialogContent className="border-none max-w-md rounded-3xl">
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
    </>
  );
}
