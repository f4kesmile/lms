import type { Route } from "next";
import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";

import { MODULE_SUGGESTIONS } from "@/app/(admin)/admin/materials/new/_lib/constants";
import type {
  CourseOption,
  MaterialForm,
} from "@/app/(admin)/admin/materials/new/_lib/types";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MaterialSidebarProps = {
  backHref: Route;
  printPreview: boolean;
  setPrintPreview: Dispatch<SetStateAction<boolean>>;
  submitting: boolean;
  onSubmitMaterial: () => Promise<void>;
  form: MaterialForm;
  setForm: Dispatch<SetStateAction<MaterialForm>>;
  courses: CourseOption[];
};

export function MaterialSidebar({
  backHref,
  printPreview,
  setPrintPreview,
  submitting,
  onSubmitMaterial,
  form,
  setForm,
  courses,
}: MaterialSidebarProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col overflow-hidden rounded-xl border border-border/60 bg-card md:w-[460px] lg:w-[520px]">
      <div className="border-b border-border/60 p-4">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" asChild className="h-11 font-bold">
            <Link href={backHref}>
              <Icon name="arrow_back" size={16} className="mr-1" />
              Kembali
            </Link>
          </Button>
          <Button
            variant="outline"
            className="h-11 font-bold"
            onClick={() => setPrintPreview((prev) => !prev)}
            type="button"
          >
            {printPreview ? (
              <Icon name="edit" size={16} className="mr-1" />
            ) : (
              <Icon name="visibility" size={16} className="mr-1" />
            )}
            {printPreview ? "Edit" : "Preview"}
          </Button>
          <Button
            variant="outline"
            className="h-11 font-bold"
            onClick={() => window.print()}
            type="button"
          >
            <Icon name="print" size={16} className="mr-1" />
            Cetak
          </Button>
          <Button
            className="h-11 font-bold"
            type="button"
            onClick={() => void onSubmitMaterial()}
            disabled={submitting}
          >
            <Icon name="save" size={16} className="mr-1" />
            {submitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>

      <div className="space-y-5 overflow-y-auto p-4">
        <div className="rounded-lg border border-border/60 bg-background p-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">
            Informasi Materi
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Atur identitas materi dengan jarak yang lebih lega dan mudah dibaca.
          </p>

          <div className="mt-4 space-y-4">
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
                <SelectTrigger className="h-11 border border-border bg-background">
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
              <p className="pl-1 text-[11px] text-muted-foreground">
                Materi ini dikelompokkan per mata kuliah, bukan per kelas.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Judul Materi
              </label>
              <Input
                required
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
                className="h-11 border border-border bg-background"
                placeholder="Contoh: Pengantar Basis Data"
              />
            </div>

            <div className="space-y-1.5">
              <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Topik/Modul
              </label>
              <div className="space-y-3 rounded-md border border-border bg-background p-3">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Pilih dari daftar (opsional)
                  </p>
                  <Select
                    value={
                      MODULE_SUGGESTIONS.some((item) => item === form.module)
                        ? form.module
                        : "__none"
                    }
                    onValueChange={(value) => {
                      if (value !== "__none") {
                        setForm((prev) => ({ ...prev, module: value }));
                      }
                    }}
                  >
                    <SelectTrigger className="mt-2 h-10 border border-border bg-background">
                      <SelectValue placeholder="Pilih topik/modul" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">
                        Tidak pilih (isi manual)
                      </SelectItem>
                      {MODULE_SUGGESTIONS.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Atau isi sendiri
                  </p>
                  <Input
                    required
                    value={form.module}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        module: event.target.value,
                      }))
                    }
                    className="mt-2 h-11 border border-border bg-background"
                    placeholder="Contoh: Pertemuan 3 - Normalisasi Database"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground">
          Semua data dari halaman ini langsung tersimpan ke Bank Materi per mata
          kuliah.
        </div>
      </div>
    </aside>
  );
}
