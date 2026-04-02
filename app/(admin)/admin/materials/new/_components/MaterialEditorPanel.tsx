import type { Dispatch, MutableRefObject, SetStateAction } from "react";

import { ToolbarIcon } from "@/app/(admin)/admin/materials/new/_components/ToolbarIcon";
import {
  A4_CHAR_LIMIT,
  FONT_SIZES,
} from "@/app/(admin)/admin/materials/new/_lib/constants";
import type {
  EditorInstance,
  MaterialForm,
} from "@/app/(admin)/admin/materials/new/_lib/types";
import { Icon } from "@/components/ui/icon";
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
import { renderMaterialHtml } from "@/lib/utils/material-content";

type MaterialEditorPanelProps = {
  printPreview: boolean;
  form: MaterialForm;
  fontSizeIndex: number;
  activePageIndex: number;
  setActivePageIndex: Dispatch<SetStateAction<number>>;
  showDownloadMenu: boolean;
  setShowDownloadMenu: Dispatch<SetStateAction<boolean>>;
  editorRefs: MutableRefObject<Array<EditorInstance | null>>;
  onApplyInlineFormatting: (tag: "strong" | "em") => void;
  onApplyListFormatting: (type: "bullet" | "ordered") => void;
  onApplyCommand: (command: string, value?: string) => void;
  onUpdateFontSize: (value: string) => void;
  onFindReplace: () => void;
  onDownloadTxt: () => void;
  onDownloadDoc: () => void;
  onPageChange: (pageIndex: number, value: string) => void;
  getPlainText: (value: string) => string;
};

export function MaterialEditorPanel({
  printPreview,
  form,
  fontSizeIndex,
  activePageIndex,
  setActivePageIndex,
  showDownloadMenu,
  setShowDownloadMenu,
  editorRefs,
  onApplyInlineFormatting,
  onApplyListFormatting,
  onApplyCommand,
  onUpdateFontSize,
  onFindReplace,
  onDownloadTxt,
  onDownloadDoc,
  onPageChange,
  getPlainText,
}: MaterialEditorPanelProps) {
  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col rounded-xl border border-border/60 bg-muted/20 p-3 md:p-4">
      <TooltipProvider delayDuration={120}>
        <div className="no-print mb-3 flex shrink-0 flex-wrap items-center justify-center gap-0.5 rounded-lg border border-border/60 bg-background px-2 py-1">
          <ToolbarIcon
            title="Bold — pilih teks lalu klik"
            onClick={() => onApplyInlineFormatting("strong")}
            active={activePageIndex >= 0}
          >
            <Icon name="format_bold" size={16} />
          </ToolbarIcon>
          <ToolbarIcon
            title="Italic — pilih teks lalu klik"
            onClick={() => onApplyInlineFormatting("em")}
            active={activePageIndex >= 0}
          >
            <Icon name="format_italic" size={16} />
          </ToolbarIcon>
          <ToolbarIcon
            title="Numbered List"
            onClick={() => onApplyListFormatting("ordered")}
          >
            <Icon name="format_list_numbered" size={16} />
          </ToolbarIcon>
          <ToolbarIcon
            title="Bullet List"
            onClick={() => onApplyListFormatting("bullet")}
          >
            <Icon name="format_list_bulleted" size={16} />
          </ToolbarIcon>
          <div className="mx-1 h-5 w-px bg-border/60" />
          <ToolbarIcon title="Undo" onClick={() => onApplyCommand("undo")}>
            <Icon name="undo" size={16} />
          </ToolbarIcon>
          <ToolbarIcon title="Redo" onClick={() => onApplyCommand("redo")}>
            <Icon name="redo" size={16} />
          </ToolbarIcon>
          <div className="mx-1 h-5 w-px bg-border/60" />
          <div className="mx-1">
            <Select
              value={String(FONT_SIZES[fontSizeIndex])}
              onValueChange={onUpdateFontSize}
            >
              <SelectTrigger className="h-8 w-[84px] border-border bg-popover px-2 text-xs font-semibold text-popover-foreground shadow-sm">
                <SelectValue placeholder="Ukuran" />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover text-popover-foreground shadow-xl">
                {FONT_SIZES.map((size) => (
                  <SelectItem key={`font-size-${size}`} value={String(size)}>
                    {size} px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ToolbarIcon title="Find & Replace" onClick={onFindReplace}>
            <Icon name="search" size={16} />
          </ToolbarIcon>
          <div className="mx-1 h-5 w-px bg-border/60" />
          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  title="Unduh Dokumen"
                  onClick={() => setShowDownloadMenu((value) => !value)}
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
                      onDownloadTxt();
                      setShowDownloadMenu(false);
                    }}
                  >
                    <Icon name="download" size={16} className="shrink-0" />
                    Unduh .TXT
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => {
                      onDownloadDoc();
                      setShowDownloadMenu(false);
                    }}
                  >
                    <Icon name="description" size={16} className="shrink-0" />
                    Unduh .DOC
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => {
                      window.print();
                      setShowDownloadMenu(false);
                    }}
                  >
                    <Icon name="print" size={16} className="shrink-0" />
                    Cetak / PDF
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
                {getPlainText(page).length}/{A4_CHAR_LIMIT} karakter
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
                      onPageChange(
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
  );
}
