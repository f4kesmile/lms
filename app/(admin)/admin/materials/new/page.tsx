"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

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
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  joinMaterialPages,
  renderMaterialHtml,
} from "@/lib/utils/material-content";

const A4_CHAR_LIMIT = 1900;

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

type MaterialForm = {
  courseId: string;
  title: string;
  module: string;
  pages: string[];
};

type CourseOption = {
  id: string;
  code: string;
  title: string;
  status: string;
};

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 22, 24];

type EditorInstance = HTMLDivElement;

function ToolbarIcon({
  title,
  onClick,
  children,
  active,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          title={title}
          onClick={onClick}
          className={`flex h-8 min-w-8 items-center justify-center rounded px-1.5 text-foreground transition-colors hover:bg-muted ${
            active
              ? "bg-muted/70 text-primary ring-1 ring-inset ring-border"
              : ""
          }`}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{title}</TooltipContent>
    </Tooltip>
  );
}

export default function NewMaterialPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") === "courses" ? "courses" : "knowledge";
  const preselectedCourseId = searchParams.get("courseId") ?? "";

  const [submitting, setSubmitting] = useState(false);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [printPreview, setPrintPreview] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [fontSizeIndex, setFontSizeIndex] = useState(3);
  const [notice, setNotice] = useState<{
    open: boolean;
    title: string;
    message: string;
    redirectTo?: Route;
  }>({
    open: false,
    title: "",
    message: "",
  });
  const [form, setForm] = useState<MaterialForm>({
    courseId: preselectedCourseId,
    title: "",
    module: "",
    pages: [""],
  });
  const editorRefs = useRef<Array<EditorInstance | null>>([]);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const backHref = useMemo<Route>(
    () => (from === "courses" ? "/admin/courses" : "/admin/knowledge"),
    [from],
  );

  useEffect(() => {
    fetch("/api/kb/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data.courses || []))
      .catch(() => setCourses([]));
  }, []);

  function handlePageChange(pageIndex: number, value: string) {
    const nextPages = [...form.pages];
    nextPages[pageIndex] = value;

    setForm((prev) => ({ ...prev, pages: nextPages }));
  }

  function withActiveEditor(action: (editor: EditorInstance) => void) {
    const editor = editorRefs.current[activePageIndex];
    if (!editor || printPreview) return;
    action(editor);
    editor.focus();
  }

  function htmlToPlainText(value: string) {
    return value
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function applyCommand(command: string, value?: string) {
    withActiveEditor((editor) => {
      editor.focus();
      document.execCommand(command, false, value);
      handlePageChange(activePageIndex, editor.innerHTML);
    });
  }

  function applyInlineHtmlFormatting(tag: "strong" | "em") {
    applyCommand(tag === "strong" ? "bold" : "italic");
  }

  function applyListFormatting(type: "bullet" | "ordered") {
    applyCommand(
      type === "ordered" ? "insertOrderedList" : "insertUnorderedList",
    );
  }

  function updateFontSize(value: string) {
    const nextSize = Number.parseInt(value, 10);
    if (!Number.isFinite(nextSize)) return;
    const targetIndex = FONT_SIZES.findIndex((size) => size === nextSize);
    if (targetIndex !== -1) {
      setFontSizeIndex(targetIndex);
      withActiveEditor((editor) => {
        editor.style.fontSize = `${nextSize}px`;
      });
    }
  }

  function handleDownloadTxt() {
    const normalizedPages = form.pages.filter((page) => page.trim().length > 0);
    const documentContent = joinMaterialPages(
      normalizedPages.length > 0 ? normalizedPages : form.pages,
    );
    const plainTextContent = htmlToPlainText(documentContent);
    const safeTitle =
      (form.title || "materi")
        .trim()
        .replace(/[^a-z0-9]+/gi, "-")
        .toLowerCase() || "materi";
    const blob = new Blob([plainTextContent], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeTitle}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleDownloadDocx() {
    const normalizedPages = form.pages.filter((page) => page.trim().length > 0);
    const documentContent = joinMaterialPages(
      normalizedPages.length > 0 ? normalizedPages : form.pages,
    );
    const safeTitle =
      (form.title || "materi")
        .trim()
        .replace(/[^a-z0-9]+/gi, "-")
        .toLowerCase() || "materi";
    const safeHtmlTitle = (form.title || "Materi")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const safeHtmlModule = form.module
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const htmlBody = renderMaterialHtml(documentContent);
    const wordDoc = [
      "<!DOCTYPE html>",
      "<html xmlns:o='urn:schemas-microsoft-com:office:office'",
      "  xmlns:w='urn:schemas-microsoft-com:office:word'",
      "  xmlns='http://www.w3.org/TR/REC-html40'>",
      "<head><meta charset='utf-8'><title>" + safeHtmlTitle + "</title>",
      "<style>",
      "  body { font-family: Calibri, sans-serif; font-size: 12pt; margin: 2.5cm; line-height: 1.6; }",
      "  h1, h2, h3 { font-family: Calibri, sans-serif; }",
      "  p { margin: 0 0 10pt; }",
      "  ul, ol { margin: 0 0 10pt 1.2em; }",
      "  li { margin: 2pt 0; }",
      "</style>",
      "</head><body>",
      "<h1 style='font-size:18pt;margin-bottom:6pt'>" + safeHtmlTitle + "</h1>",
      safeHtmlModule
        ? "<p style='opacity:.7;margin-bottom:18pt'>" + safeHtmlModule + "</p>"
        : "",
      htmlBody,
      "</body></html>",
    ].join("\n");
    const blob = new Blob([wordDoc], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeTitle}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleFindReplace() {
    withActiveEditor((editor) => {
      const findText = window.prompt("Cari teks:");
      if (!findText) return;
      const replaceText = window.prompt("Ganti dengan:", "") ?? "";
      const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "g");
      editor.innerHTML = editor.innerHTML.replace(regex, replaceText);
      handlePageChange(activePageIndex, editor.innerHTML);
    });
  }

  async function submitMaterial() {
    const normalizedPages = form.pages.filter(
      (page) => htmlToPlainText(page).length > 0,
    );

    if (!form.title.trim() || !form.module.trim()) {
      setNotice({
        open: true,
        title: "Data Belum Lengkap",
        message: "Judul dan modul materi wajib diisi.",
      });
      return;
    }

    if (normalizedPages.length === 0) {
      setNotice({
        open: true,
        title: "Isi Materi Kosong",
        message: "Isi materi belum diisi.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const content = joinMaterialPages(normalizedPages);
      const res = await fetch("/api/kb/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: form.courseId || undefined,
          title: form.title,
          module: form.module,
          page: `1-${normalizedPages.length}`,
          content,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Gagal menyimpan materi");
      }

      setNotice({
        open: true,
        title: "Berhasil",
        message: "Materi berhasil disimpan ke Bank Materi.",
        redirectTo: "/admin/knowledge",
      });
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await submitMaterial();
  }

  return (
    <div className="min-h-dvh bg-background p-3 sm:p-4 md:p-5 lg:p-6">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex h-[calc(100dvh-1.5rem)] max-w-[1860px] min-h-0 flex-col gap-4 md:h-[calc(100dvh-2.5rem)] md:flex-row"
      >
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
                onClick={() => void submitMaterial()}
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
                Atur identitas materi dengan jarak yang lebih lega dan mudah
                dibaca.
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
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title: e.target.value }))
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
                          MODULE_SUGGESTIONS.includes(form.module)
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
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            module: e.target.value,
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
              Semua data dari halaman ini langsung tersimpan ke Bank Materi per
              mata kuliah.
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-xl border border-border/60 bg-muted/20 p-3 md:p-4">
          <TooltipProvider delayDuration={120}>
            <div className="no-print mb-3 flex shrink-0 flex-wrap items-center justify-center gap-0.5 rounded-lg border border-border/60 bg-background px-2 py-1">
              <ToolbarIcon
                title="Bold — pilih teks lalu klik"
                onClick={() => applyInlineHtmlFormatting("strong")}
              >
                <Icon name="format_bold" size={16} />
              </ToolbarIcon>
              <ToolbarIcon
                title="Italic — pilih teks lalu klik"
                onClick={() => applyInlineHtmlFormatting("em")}
              >
                <Icon name="format_italic" size={16} />
              </ToolbarIcon>
              <ToolbarIcon
                title="Numbered List"
                onClick={() => applyListFormatting("ordered")}
              >
                <Icon name="format_list_numbered" size={16} />
              </ToolbarIcon>
              <ToolbarIcon
                title="Bullet List"
                onClick={() => applyListFormatting("bullet")}
              >
                <Icon name="format_list_bulleted" size={16} />
              </ToolbarIcon>
              <div className="mx-1 h-5 w-px bg-border/60" />
              <ToolbarIcon title="Undo" onClick={() => applyCommand("undo")}>
                <Icon name="undo" size={16} />
              </ToolbarIcon>
              <ToolbarIcon title="Redo" onClick={() => applyCommand("redo")}>
                <Icon name="redo" size={16} />
              </ToolbarIcon>
              <div className="mx-1 h-5 w-px bg-border/60" />
              <div className="mx-1">
                <Select
                  value={String(FONT_SIZES[fontSizeIndex])}
                  onValueChange={updateFontSize}
                >
                  <SelectTrigger className="h-8 w-[84px] border-border bg-popover px-2 text-xs font-semibold text-popover-foreground shadow-sm">
                    <SelectValue placeholder="Ukuran" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-popover text-popover-foreground shadow-xl">
                    {FONT_SIZES.map((size) => (
                      <SelectItem
                        key={`font-size-${size}`}
                        value={String(size)}
                      >
                        {size} px
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ToolbarIcon title="Find & Replace" onClick={handleFindReplace}>
                <Icon name="search" size={16} />
              </ToolbarIcon>
              <div className="mx-1 h-5 w-px bg-border/60" />
              <div className="relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      title="Unduh Dokumen"
                      onClick={() => setShowDownloadMenu((v) => !v)}
                      className="flex h-8 items-center gap-1 rounded px-2 text-foreground hover:bg-muted"
                    >
                      <Icon name="download" size={16} />
                      <Icon name="expand_more" size={12} className="opacity-80" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Unduh Dokumen</TooltipContent>
                </Tooltip>
                {showDownloadMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowDownloadMenu(false)}
                    />
                    <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] overflow-hidden rounded-md border border-border bg-card text-card-foreground opacity-100 shadow-2xl">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                        onClick={() => {
                          handleDownloadTxt();
                          setShowDownloadMenu(false);
                        }}
                      >
                        <Icon name="download" size={16} className="shrink-0" /> Unduh .TXT
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                        onClick={() => {
                          handleDownloadDocx();
                          setShowDownloadMenu(false);
                        }}
                      >
                        <Icon name="description" size={16} className="shrink-0" /> Unduh .DOC
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                        onClick={() => {
                          window.print();
                          setShowDownloadMenu(false);
                        }}
                      >
                        <Icon name="print" size={16} className="shrink-0" /> Cetak / PDF
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </TooltipProvider>
          <div className="a4-print-root min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            {form.pages.map((page, index) => (
              <div
                key={`a4-editor-page-${index}`}
                className="mx-auto w-full max-w-[860px]"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Halaman {index + 1}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {htmlToPlainText(page).length}/{A4_CHAR_LIMIT} karakter
                  </span>
                </div>

                <div className="a4-sheet relative overflow-hidden rounded-md border border-border/60 bg-card px-[68px] pb-[72px] pt-[64px] shadow-sm">
                  {printPreview ? (
                    <div
                      className="editor-content min-h-[calc(100dvh-19rem)] text-[15px] leading-7 text-foreground"
                      dangerouslySetInnerHTML={{
                        __html: renderMaterialHtml(page),
                      }}
                    />
                  ) : (
                    <div className="h-[calc(100dvh-19rem)] min-h-[520px] w-full overflow-hidden">
                      <div
                        ref={(node) => {
                          editorRefs.current[index] = node;
                        }}
                        contentEditable
                        suppressContentEditableWarning
                        className="editor-wysiwyg h-full w-full overflow-y-auto rounded-sm border border-border bg-card px-2 py-1 text-foreground outline-none"
                        style={{ fontSize: `${FONT_SIZES[fontSizeIndex]}px` }}
                        onFocus={() => setActivePageIndex(index)}
                        onInput={(event) => {
                          setActivePageIndex(index);
                          handlePageChange(
                            index,
                            (event.currentTarget as HTMLDivElement).innerHTML,
                          );
                        }}
                        dangerouslySetInnerHTML={{ __html: page }}
                      />
                    </div>
                  )}

                  <div className="a4-footer pointer-events-none absolute bottom-0 left-[68px] right-[68px] flex items-center justify-between border-t border-border py-2 text-xs text-muted-foreground">
                    <span>{form.title || "Judul Materi"}</span>
                    <span>Halaman {index + 1}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </form>

      <style jsx global>{`
        .editor-wysiwyg {
          line-height: 1.75;
        }

        .editor-wysiwyg p {
          margin: 0 0 0.9rem;
        }

        .editor-wysiwyg ul,
        .editor-wysiwyg ol {
          margin: 0 0 0.9rem 1.35rem;
          padding: 0;
        }

        .editor-wysiwyg li {
          margin: 0.25rem 0;
        }

        .editor-content p {
          margin: 0 0 1rem;
        }

        .editor-content ul,
        .editor-content ol {
          margin: 0 0 1rem 1.35rem;
          padding: 0;
        }

        .editor-content li {
          margin: 0.25rem 0;
        }

        @media print {
          .no-print {
            display: none !important;
          }

          body * {
            visibility: hidden !important;
          }

          .a4-print-root,
          .a4-print-root * {
            visibility: visible !important;
          }

          .a4-print-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .a4-sheet {
            box-shadow: none !important;
            border: 1px solid var(--border-primary) !important;
            break-inside: avoid;
            page-break-inside: avoid;
            margin: 0 0 12mm 0 !important;
          }

          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>

      <Dialog
        open={notice.open}
        onOpenChange={(open) => {
          setNotice((prev) => ({ ...prev, open }));
          if (!open && notice.redirectTo) {
            router.push(notice.redirectTo);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{notice.title}</DialogTitle>
            <DialogDescription>{notice.message}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button
              onClick={() => {
                const redirectTo = notice.redirectTo;
                setNotice((prev) => ({
                  ...prev,
                  open: false,
                  redirectTo: undefined,
                }));
                if (redirectTo) router.push(redirectTo);
              }}
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
