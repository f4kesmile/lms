"use client";

import { useSearchParams } from "next/navigation";

import { MaterialEditorPanel } from "@/app/(admin)/admin/materials/new/_components/MaterialEditorPanel";
import { MaterialSidebar } from "@/app/(admin)/admin/materials/new/_components/MaterialSidebar";
import { NoticeDialog } from "@/app/(admin)/admin/materials/new/_components/NoticeDialog";
import { useNewMaterialController } from "@/app/(admin)/admin/materials/new/_hooks/useNewMaterialController";
import { htmlToPlainText } from "@/app/(admin)/admin/materials/new/_lib/helpers";

export default function NewMaterialPage() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") === "courses" ? "courses" : "knowledge";
  const preselectedCourseId = searchParams.get("courseId") ?? "";

  const {
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
  } = useNewMaterialController({
    from,
    preselectedCourseId,
  });

  return (
    <div className="min-h-dvh bg-background p-3 sm:p-4 md:p-5 lg:p-6">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex h-[calc(100dvh-1.5rem)] max-w-[1860px] min-h-0 flex-col gap-4 md:h-[calc(100dvh-2.5rem)] md:flex-row"
      >
        <MaterialSidebar
          backHref={backHref}
          printPreview={printPreview}
          setPrintPreview={setPrintPreview}
          submitting={submitting}
          onSubmitMaterial={submitMaterial}
          form={form}
          setForm={setForm}
          courses={courses}
        />

        <MaterialEditorPanel
          printPreview={printPreview}
          form={form}
          fontSizeIndex={fontSizeIndex}
          activePageIndex={activePageIndex}
          setActivePageIndex={setActivePageIndex}
          showDownloadMenu={showDownloadMenu}
          setShowDownloadMenu={setShowDownloadMenu}
          editorRefs={editorRefs}
          onApplyInlineFormatting={applyInlineHtmlFormatting}
          onApplyListFormatting={applyListFormatting}
          onApplyCommand={applyCommand}
          onUpdateFontSize={updateFontSize}
          onFindReplace={handleFindReplace}
          onDownloadTxt={handleDownloadTxt}
          onDownloadDoc={handleDownloadDocx}
          onPageChange={handlePageChange}
          getPlainText={htmlToPlainText}
        />
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

      <NoticeDialog notice={notice} setNotice={setNotice} />
    </div>
  );
}
