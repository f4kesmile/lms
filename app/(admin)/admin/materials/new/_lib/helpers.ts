import {
  joinMaterialPages,
  renderMaterialHtml,
} from "@/lib/utils/material-content";

export function htmlToPlainText(value: string) {
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

function toDownloadFileName(title: string, fallback: string) {
  return (
    title
      .trim()
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase() || fallback
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function triggerDownload(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadMaterialTxt(title: string, pages: string[]) {
  const normalizedPages = pages.filter((page) => page.trim().length > 0);
  const documentContent = joinMaterialPages(
    normalizedPages.length > 0 ? normalizedPages : pages,
  );
  const plainTextContent = htmlToPlainText(documentContent);
  const safeTitle = toDownloadFileName(title || "materi", "materi");
  const blob = new Blob([plainTextContent], {
    type: "text/plain;charset=utf-8",
  });
  triggerDownload(`${safeTitle}.txt`, blob);
}

export function downloadMaterialDoc(
  title: string,
  module: string,
  pages: string[],
) {
  const normalizedPages = pages.filter((page) => page.trim().length > 0);
  const documentContent = joinMaterialPages(
    normalizedPages.length > 0 ? normalizedPages : pages,
  );
  const safeTitle = toDownloadFileName(title || "materi", "materi");
  const safeHtmlTitle = escapeHtml(title || "Materi");
  const safeHtmlModule = escapeHtml(module);
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
  triggerDownload(`${safeTitle}.doc`, blob);
}
