import type { Route } from "next";
import { useEffect, useMemo, useRef, useState } from "react";

import { FONT_SIZES } from "@/app/(admin)/admin/materials/new/_lib/constants";
import {
  downloadMaterialDoc,
  downloadMaterialTxt,
  htmlToPlainText,
} from "@/app/(admin)/admin/materials/new/_lib/helpers";
import type {
  CourseOption,
  EditorInstance,
  MaterialForm,
  NoticeState,
} from "@/app/(admin)/admin/materials/new/_lib/types";
import { joinMaterialPages } from "@/lib/utils/material-content";
import { notifyError, toastSaveFailed, toastSaved } from "@/lib/utils/toast";

type UseNewMaterialControllerOptions = {
  from: "courses" | "knowledge";
  preselectedCourseId: string;
  prefilledType: "session" | "reference";
  prefilledMeetingNo: number;
};

export function useNewMaterialController({
  from,
  preselectedCourseId,
  prefilledType,
  prefilledMeetingNo,
}: UseNewMaterialControllerOptions) {
  const [submitting, setSubmitting] = useState(false);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [printPreview, setPrintPreview] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [fontSizeIndex, setFontSizeIndex] = useState(3);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [notice, setNotice] = useState<NoticeState>({
    open: false,
    title: "",
    message: "",
  });
  const [form, setForm] = useState<MaterialForm>({
    courseId: preselectedCourseId,
    title: "",
    module:
      prefilledType === "session"
        ? `Pertemuan ${prefilledMeetingNo}`
        : "",
    pages: [""],
  });

  const editorRefs = useRef<Array<EditorInstance | null>>([]);

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

  function handleDownloadTxt() {
    downloadMaterialTxt(form.title, form.pages);
  }

  function handleDownloadDocx() {
    downloadMaterialDoc(form.title, form.module, form.pages);
  }

  async function submitMaterial() {
    const normalizedPages = form.pages.filter(
      (page) => htmlToPlainText(page).length > 0,
    );

    if (!form.courseId) {
      notifyError("Materi wajib dikaitkan dengan mata kuliah");
      setNotice({
        open: true,
        title: "Mata Kuliah Belum Dipilih",
        message: "Materi wajib dikaitkan dengan mata kuliah tertentu.",
      });
      return;
    }

    if (!form.title.trim() || !form.module.trim()) {
      notifyError("Judul dan modul materi wajib diisi");
      setNotice({
        open: true,
        title: "Data Belum Lengkap",
        message: "Judul dan modul materi wajib diisi.",
      });
      return;
    }

    if (normalizedPages.length === 0) {
      notifyError("Isi materi belum diisi");
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
      const response = await fetch("/api/kb/materials", {
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

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.message || "Gagal menyimpan materi");
      }

      toastSaved("materi");
      setNotice({
        open: true,
        title: "Berhasil",
        message: "Materi berhasil disimpan ke Bank Materi.",
        redirectTo: "/admin/knowledge",
      });
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitMaterial();
  }

  return {
    backHref,
    submitting,
    courses,
    printPreview,
    setPrintPreview,
    activePageIndex,
    setActivePageIndex,
    fontSizeIndex,
    showDownloadMenu,
    setShowDownloadMenu,
    notice,
    setNotice,
    form,
    setForm,
    editorRefs,
    handlePageChange,
    applyCommand,
    applyInlineHtmlFormatting,
    applyListFormatting,
    updateFontSize,
    handleFindReplace,
    handleDownloadTxt,
    handleDownloadDocx,
    submitMaterial,
    handleSubmit,
  };
}
