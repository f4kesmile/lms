"use client";

import { type Material } from "../page";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CourseOption {
  id: string;
  code: string;
  title: string;
}

interface MaterialForm {
  courseId: string;
  title: string;
  module: string;
  page: string;
  content: string;
}

interface MaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMaterial: Material | null;
  form: MaterialForm;
  setForm: React.Dispatch<React.SetStateAction<MaterialForm>>;
  courses: CourseOption[];
  moduleSuggestions: string[];
  submitting: boolean;
  onSave: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
}

export function MaterialDialog({
  open,
  onOpenChange,
  editingMaterial,
  form,
  setForm,
  courses,
  moduleSuggestions,
  submitting,
  onSave,
  onCancel,
}: MaterialDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-none max-w-2xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight">
            {editingMaterial ? "Edit Materi" : "Upload Materi Baru"}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium">
            Materi ini akan dipecah menjadi chunk dan dipakai sebagai sumber
            AI RAG.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSave} className="space-y-4">
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
              <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3">
                <Select
                  value={
                    moduleSuggestions.includes(form.module)
                      ? form.module
                      : "__none"
                  }
                  onValueChange={(value) => {
                    if (value !== "__none") {
                      setForm((prev) => ({ ...prev, module: value }));
                    }
                  }}
                >
                  <SelectTrigger className="h-10 border border-border/70 bg-background rounded-lg">
                    <SelectValue placeholder="Pilih topik/modul" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">
                      Tidak pilih (isi manual)
                    </SelectItem>
                    {moduleSuggestions.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  required
                  value={form.module}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, module: e.target.value }))
                  }
                  className="h-11 border border-border/70 bg-background rounded-lg"
                  placeholder="Atau isi manual di sini..."
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
              className="w-full min-h-64 rounded-xl border border-border/70 bg-background p-4 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
              placeholder="Tempelkan konten materi lengkap di sini..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/30">
            <Button
              type="button"
              variant="ghost"
              className="font-bold text-muted-foreground hover:bg-muted"
              onClick={onCancel}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="min-w-[140px] font-bold shadow-lg shadow-primary/20"
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
  );
}
