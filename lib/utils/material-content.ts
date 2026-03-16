const PAGE_BREAK_DELIMITER = "\n\n=== HALAMAN BARU ===\n\n";

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function sanitizeBasicHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:/gi, "");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>");
}

function renderParagraph(paragraph: string) {
  const lines = paragraph
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return "";
  }

  const isBulletList = lines.every((line) => /^[-*]\s+/.test(line));
  if (isBulletList) {
    return `<ul>${lines
      .map((line) => `<li>${renderInlineMarkdown(line.replace(/^[-*]\s+/, ""))}</li>`)
      .join("")}</ul>`;
  }

  const isOrderedList = lines.every((line) => /^\d+\.\s+/.test(line));
  if (isOrderedList) {
    return `<ol>${lines
      .map((line) => `<li>${renderInlineMarkdown(line.replace(/^\d+\.\s+/, ""))}</li>`)
      .join("")}</ol>`;
  }

  return `<p>${lines.map((line) => renderInlineMarkdown(line)).join("<br />")}</p>`;
}

export function splitMaterialContent(content: string) {
  return content
    .split(/\n\n=== HALAMAN BARU ===\n\n|\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinMaterialPages(pages: string[]) {
  return pages.join(PAGE_BREAK_DELIMITER);
}

export function renderMaterialHtml(content: string) {
  const normalized = content.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return "<p>(Halaman kosong)</p>";
  }

  if (looksLikeHtml(normalized)) {
    return sanitizeBasicHtml(normalized);
  }

  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => renderParagraph(paragraph))
    .filter(Boolean)
    .join("");
}