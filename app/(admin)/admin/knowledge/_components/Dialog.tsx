"use client";

import { useEffect } from "react";

import { type Material } from "@/app/(admin)/admin/knowledge/page";
import { DocumentEditor } from "@/app/(admin)/admin/knowledge/_components/DocumentEditor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface CourseOption {
  id: string;
  code: string;
  title: string;
}

interface MaterialForm {
  type: "session" | "reference";
  courseId: string;
  title: string;
  module: string;
  page: string;
  meetingNo: number;
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

export function MaterialDialog(props: MaterialDialogProps) {
  const isMobile = useIsMobile();
  const { open, onOpenChange, editingMaterial, form, setForm } = props;

  // Auto-Save Draft logic
  useEffect(() => {
    if (open && !editingMaterial && form.content.length > 10) {
      const timer = setTimeout(() => {
        localStorage.setItem("nusabelajar_material_draft", JSON.stringify(form));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [form, open, editingMaterial]);

  // Load Draft logic
  useEffect(() => {
    if (open && !editingMaterial && form.content.length === 0) {
      const draft = localStorage.getItem("nusabelajar_material_draft");
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setForm((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error("Failed to load draft");
        }
      }
    }
  }, [open, editingMaterial, setForm, form.content.length]);

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[95dvh] border-none rounded-t-3xl overflow-hidden bg-background p-0">
          <MaterialEditorContent {...props} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="mobile-drawer-full max-w-7xl h-[95dvh] flex flex-col p-0 border-none rounded-3xl overflow-hidden bg-background">
        <MaterialEditorContent {...props} />
      </DialogContent>
    </Dialog>
  );
}

function MaterialEditorContent({
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
    <>
      <DialogHeader className="p-4 md:p-6 border-b border-border/40 bg-card/30 relative">
        <div className="flex flex-col gap-6 w-full text-left">
          {/* 1. Top Section: Title & Description */}
          <div className="min-w-0 pr-10">
            <div className="flex items-center gap-2 mb-1.5">
              <div className={cn(
                "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1",
                form.type === 'session' ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <Icon name={form.type === 'session' ? "school" : "import_contacts"} size={13} />
                {form.type === 'session' ? "Sesi" : "Referensi"}
              </div>
            </div>
            <DialogTitle className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              {editingMaterial ? "Edit Materi & Pengetahuan" : "Pusat Pengetahuan Baru"}
            </DialogTitle>
            <DialogDescription className="text-[11px] md:text-xs font-medium text-muted-foreground mt-1 max-w-2xl">
              Satu workstation terpadu untuk kurikulum dan basis data AI RAG.
            </DialogDescription>
          </div>

          {/* 2. Bottom Section: Tabs (Left) & Save Action (Right) */}
          <div className="flex flex-wrap items-end justify-between gap-4 mt-1">
            <div className="bg-muted/30 p-1.5 rounded-2xl inline-flex items-center border border-border/40 overflow-x-auto">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, type: 'session' }))}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-[10px] lg:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  form.type === 'session' ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:bg-background/40"
                )}
              >
                Sesi Pertemuan
              </button>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, type: 'reference' }))}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-[10px] lg:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  form.type === 'reference' ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:bg-background/40"
                )}
              >
                Materi Referensi
              </button>
            </div>

            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    disabled={submitting}
                    className={cn(
                      "rounded-xl shadow-lg shadow-primary/30 flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-black shrink-0",
                      "h-11 px-4 lg:px-8"
                    )}
                    onClick={onSave}
                  >
                    {submitting ? (
                      <Icon name="progress_activity" className="animate-spin" size={20} />
                    ) : (
                      <Icon name="save" size={20} />
                    )}
                    <span className="text-[11px] uppercase tracking-widest hidden sm:inline">
                      {editingMaterial ? "Simpan Perbarui" : "Publikasikan"}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="font-bold text-xs shadow-lg" side="top">
                  {editingMaterial ? "Simpan Perubahan Materi" : "Publikasikan Materi Baru"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:grid lg:grid-cols-12 gap-0">
        {/* Settings Sidebar */}
        <div className="lg:col-span-3 lg:border-r border-border/40 bg-muted/20 p-4 md:p-6 lg:overflow-y-auto space-y-6 shrink-0 border-b lg:border-b-0">
          <div className="space-y-1.5">
            <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
              <span>Mata Kuliah</span>
              <span className="text-[9px] text-destructive tracking-widest uppercase font-bold">* Wajib</span>
            </label>
            <Select
              required
              value={form.courseId || ""}
              onValueChange={(value) => setForm(prev => ({ ...prev, courseId: value }))}
            >
              <SelectTrigger className="h-11 border border-border/60 bg-background rounded-xl">
                <SelectValue placeholder="Pilih mata kuliah" />
              </SelectTrigger>
              <SelectContent>
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
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="h-11 border border-border/60 bg-background rounded-xl font-bold"
              placeholder="Contoh: Pengenalan Dasar AI"
            />
          </div>

          {form.type === 'session' ? (
            <div className="space-y-1.5">
              <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                <span>Sesi Pertemuan</span>
                <span className="text-[9px] text-primary tracking-widest uppercase font-bold">Mahasiswa</span>
              </label>
              <div className="bg-background rounded-xl border border-border/60 p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Pertemuan Ke-</span>
                  <div className="flex w-full items-center gap-2 rounded-lg border border-border/50 bg-muted/40 p-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-7 rounded-md"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          meetingNo: Math.max(1, Math.min(16, prev.meetingNo - 1)),
                        }))
                      }
                    >
                      -
                    </Button>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={form.meetingNo}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          meetingNo: Math.max(
                            1,
                            Math.min(16, parseInt(e.target.value, 10) || 1),
                          ),
                        }))
                      }
                      className="h-7 border-0 bg-transparent text-center font-black text-primary shadow-none focus-visible:ring-0"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-7 rounded-md"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          meetingNo: Math.max(1, Math.min(16, prev.meetingNo + 1)),
                        }))
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground/60 italic leading-relaxed">
                  Materi ini akan tampil di tab "Sesi" mahasiswa pada mata kuliah yang dipilih.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="pl-1 text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Modul / Topik
                </label>
                <Select
                  value={moduleSuggestions.includes(form.module) ? form.module : "__none"}
                  onValueChange={(val) => val !== "__none" && setForm(prev => ({ ...prev, module: val }))}
                >
                  <SelectTrigger className="h-10 border border-border/60 bg-background rounded-xl text-xs">
                    <SelectValue placeholder="Pilih modul/topik" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">Isi Manual</SelectItem>
                    {moduleSuggestions.map(id => <SelectItem key={id} value={id}>{id}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input
                  value={form.module}
                  onChange={(e) => setForm(prev => ({ ...prev, module: e.target.value }))}
                  className="h-11 border border-border/60 bg-background rounded-xl text-sm"
                  placeholder="Isi modul manual..."
                />
              </div>
            </>
          )}

          <div className="pt-6 border-t border-border/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Statistik Dokumen</span>
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black">A4 STANDAR</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background rounded-xl border border-border/60 p-3 text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Halaman</p>
                <p className="text-lg font-black text-primary">
                  {form.content.length > 5 ? Math.max(1, Math.ceil(form.content.length / 2500)) : 0}
                </p>
              </div>
              <div className="bg-background rounded-xl border border-border/60 p-3 text-center">
                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Karakter</p>
                <p className="text-lg font-black text-primary">{form.content.length.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground/50 text-center italic">
              Data dihitung otomatis sebagai dasar RAG AI dan estimasi cetak A4.
            </p>
          </div>
        </div>

        {/* Document Workstation Editor */}
        <div className="lg:col-span-9 flex flex-col bg-background min-h-[600px] lg:h-full lg:overflow-hidden">
          <div className="flex-1 flex flex-col items-center lg:overflow-y-auto bg-muted/10 p-2 sm:p-4 md:p-8 lg:p-12">
            <div className="w-full max-w-4xl bg-background rounded-2xl shadow-2xl shadow-primary/5 min-h-full border border-border/30 flex flex-col">
              <DocumentEditor
                content={form.content}
                onChange={(val) => {
                  const autoPage = val.length > 0 ? Math.max(1, Math.ceil(val.length / 2500)).toString() : "1";
                  setForm(prev => ({ ...prev, content: val, page: autoPage }));
                }}
                className="p-4 sm:p-8 md:p-12 lg:p-20 min-h-[500px]"
                placeholder="Mulai tulis materi pengajaran atau sumber pengetahuan Anda di sini..."
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}



