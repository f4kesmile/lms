export type Source = {
  id: string;
  meetingId: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  title: string;
  meetingNo: number;
  excerpt: string;
  score: number;
};

type ComplexityLevel = "low" | "medium" | "high";

import { readChatbotSettings } from "@/lib/ai/settings";

function normalizeExcerpt(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function firstSentence(text: string, maxLength = 180): string {
  const clean = normalizeExcerpt(text);
  if (!clean) return "";
  const sentenceBreak = clean.search(/[.!?](\s|$)/);
  const base = sentenceBreak >= 0 ? clean.slice(0, sentenceBreak + 1) : clean;
  if (base.length <= maxLength) return base;
  const clipped = base.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).trim()}...`;
}

function firstNSentences(text: string, count = 2, maxLength = 280): string {
  const clean = normalizeExcerpt(text);
  if (!clean) return "";
  const parts = clean.match(/[^.!?]+[.!?]?/g) ?? [clean];
  const joined = parts.slice(0, Math.max(1, count)).join(" ").trim();
  if (joined.length <= maxLength) return joined;
  const clipped = joined.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).trim()}...`;
}

function isExerciseRequest(question: string): boolean {
  const q = question.toLowerCase();
  return /rancang|latihan|exercise|praktik|soal|tugas/.test(q);
}

function estimateComplexity(question: string): ComplexityLevel {
  const q = question.toLowerCase();
  const words = q.split(/\s+/).filter(Boolean).length;

  const hard = ["bandingkan", "analisis", "evaluasi", "kritisi", "trade-off", "implikasi", "strategi", "arsitektur", "mengapa", "kenapa"];
  const medium = ["bagaimana", "langkah", "proses", "contoh", "penerapan", "kapan", "apa perbedaan"];

  let score = 0;
  if (words >= 18) score += 2;
  else if (words >= 10) score += 1;
  if (/[?]/.test(q)) score += 1;
  if (/,| dan | atau /.test(q)) score += 1;
  if (hard.some((s) => q.includes(s))) score += 2;
  else if (medium.some((s) => q.includes(s))) score += 1;

  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}

function complexityConfig(level: ComplexityLevel) {
  if (level === "high") return { refs: 4, detailSentences: 4, summaryMax: 260 };
  if (level === "medium") return { refs: 3, detailSentences: 3, summaryMax: 220 };
  return { refs: 2, detailSentences: 2, summaryMax: 160 };
}

function uniqueByMeaning(lines: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of lines) {
    const key = normalizeExcerpt(line).toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).slice(0, 10).join(" ");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(line);
  }
  return result;
}

function getCitationNumber(id: string): string {
  const match = id.match(/^S(\d+)$/i);
  return match ? match[1] : id;
}

function toSuperscript(value: string): string {
  const map: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
  return value.split("").map((c) => map[c] || c).join("");
}

function cite(source: Source): string {
  const num = getCitationNumber(source.id);
  return /^\d+$/.test(num) ? toSuperscript(num) : `[${source.id}]`;
}

/* ── Variasi frasa agar jawaban terasa berbeda tiap kali ── */

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const OPENERS_CONCEPT = [
  "Berdasarkan materi internal yang tersedia, berikut pembahasannya.",
  "Saya rangkum dari materi perkuliahan yang relevan untuk menjawab pertanyaan Anda.",
  "Dari referensi materi yang ada, berikut penjelasan yang bisa membantu.",
  "Berikut penjelasan berdasarkan modul pembelajaran yang tersedia di sistem.",
  "Saya temukan beberapa materi yang relevan, berikut rangkumannya.",
];

const OPENERS_HOW = [
  "Untuk memahami prosesnya, berikut alur yang dijelaskan dalam materi internal.",
  "Berikut langkah-langkah yang diuraikan dalam modul pembelajaran terkait.",
  "Dari materi yang tersedia, prosesnya dapat dipahami sebagai berikut.",
  "Saya temukan penjelasan alur yang relevan dari materi perkuliahan.",
];

const OPENERS_WHY = [
  "Pertanyaan yang menarik. Berdasarkan materi internal, berikut alasan utamanya.",
  "Dari pembahasan di modul terkait, berikut penjelasan mengenai hal tersebut.",
  "Alasan di balik hal tersebut dibahas dalam materi berikut ini.",
];

const OPENERS_EXAMPLE = [
  "Berikut contoh dan penerapannya berdasarkan materi yang tersedia.",
  "Saya rangkum beberapa penerapan praktis dari materi perkuliahan terkait.",
  "Dari modul yang tersedia, berikut contoh penerapan yang bisa dijadikan acuan.",
];

const OPENERS_GENERIC = [
  "Berikut hasil pencarian saya dari materi internal yang relevan.",
  "Saya temukan beberapa referensi yang dapat membantu menjawab pertanyaan Anda.",
  "Berdasarkan materi perkuliahan, berikut pembahasan yang saya temukan.",
  "Dari database materi yang tersedia, berikut informasi relevannya.",
];

function pickOpener(question: string): string {
  const q = question.toLowerCase();
  if (/apa|pengertian|definisi|konsep/.test(q)) return pick(OPENERS_CONCEPT);
  if (/bagaimana|cara|langkah|proses/.test(q)) return pick(OPENERS_HOW);
  if (/kenapa|mengapa|alasan/.test(q)) return pick(OPENERS_WHY);
  if (/contoh|studi kasus|penerapan/.test(q)) return pick(OPENERS_EXAMPLE);
  return pick(OPENERS_GENERIC);
}

const TRANSITIONS = [
  "Selain itu,",
  "Lebih lanjut,",
  "Perlu diketahui juga bahwa",
  "Dalam konteks yang lebih luas,",
  "Untuk melengkapi,"  ,
  "Di sisi lain,",
  "Yang juga penting dipahami,",
  "Sebagai tambahan,",
];

const PRACTICAL_INTROS = [
  "Secara praktis, konsep ini dapat diterapkan",
  "Dalam penerapannya, materi ini relevan",
  "Untuk penggunaan di dunia nyata, topik ini berkaitan",
  "Dari sisi implementasi, pembahasan ini berhubungan",
];

const CLOSERS = [
  "Jika ada bagian yang ingin dibahas lebih detail, silakan tanyakan kembali.",
  "Apabila butuh penjelasan lebih mendalam pada topik tertentu, saya siap membantu.",
  "Silakan tanyakan jika ada konsep spesifik yang perlu diperjelas.",
  "Semoga membantu! Jangan ragu bertanya lagi jika ada yang kurang jelas.",
  "Jika ingin eksplorasi topik ini lebih jauh, saya bisa membantu dengan detail tambahan.",
];

/* ── Builder Utama ── */

function buildExerciseAnswer(primary: Source, references: Source[]): string {
  const concept = firstSentence(primary.excerpt, 140).replace(/[.!?]+$/, "");
  const lines: string[] = [
    `Berikut latihan yang dirancang berdasarkan materi **${primary.title}** pada mata kuliah ${primary.subjectName}. ${cite(primary)}`,
    "",
    `**Tujuan:** Memahami konsep utama terkait ${primary.title.toLowerCase()}.`,
    "",
    "**Instruksi:**",
    `1. Tuliskan ulang konsep berikut dengan bahasa Anda sendiri: "*${concept}*". ${cite(primary)}`,
    "2. Berikan 2 contoh penerapan atau situasi nyata yang relevan dengan topik ini.",
  ];

  if (references.length > 1) {
    lines.push(`3. Bandingkan pendekatan di atas dengan pembahasan pada ${references[1].title} (${references[1].subjectName}). ${cite(references[1])}`);
  } else {
    lines.push("3. Identifikasi 2 poin evaluasi: apa yang harus benar agar jawaban dianggap kuat.");
  }

  lines.push("", "**Output yang diharapkan:** Jawaban terstruktur (maksimal 1 halaman) dengan 3 insight utama.");
  lines.push("", pick(CLOSERS));
  return lines.join("\n");
}

function buildNaturalAnswer(
  question: string,
  primary: Source,
  references: Source[],
  cfg: ReturnType<typeof complexityConfig>,
): string {
  const lines: string[] = [];

  // Opening
  lines.push(pickOpener(question));
  lines.push("");

  // Core explanation from primary source
  const coreExcerpt = firstNSentences(primary.excerpt, cfg.detailSentences, cfg.summaryMax);
  lines.push(
    `Pada topik **${primary.title}** dalam mata kuliah ${primary.subjectName} (Pertemuan ${primary.meetingNo}), ` +
    `${coreExcerpt} ${cite(primary)}`
  );

  // Additional sources woven naturally
  const usedTransitions = new Set<number>();
  const additionalRefs = references.slice(1);

  for (const ref of additionalRefs) {
    const excerpt = firstNSentences(ref.excerpt, cfg.detailSentences - 1, cfg.summaryMax - 40);
    if (!excerpt) continue;

    lines.push("");

    // Pick unique transition
    let transIdx: number;
    do { transIdx = Math.floor(Math.random() * TRANSITIONS.length); } while (usedTransitions.has(transIdx) && usedTransitions.size < TRANSITIONS.length);
    usedTransitions.add(transIdx);

    lines.push(
      `${TRANSITIONS[transIdx]} pada materi **${ref.title}** (${ref.subjectName}, Pertemuan ${ref.meetingNo}), ` +
      `${excerpt.charAt(0).toLowerCase()}${excerpt.slice(1)} ${cite(ref)}`
    );
  }

  // Practical connection (for medium/high complexity)
  if (cfg.refs >= 3 && additionalRefs.length > 0) {
    lines.push("");
    const practicalRef = additionalRefs[0];
    lines.push(
      `${pick(PRACTICAL_INTROS)} dengan topik ${practicalRef.title} pada mata kuliah ${practicalRef.subjectName}. ` +
      `Memahami kedua konsep ini secara bersamaan akan memberikan perspektif yang lebih utuh. ${cite(practicalRef)}`
    );
  }

  // References section (clean)
  lines.push("");
  lines.push("**Sumber Referensi:**");
  for (const ref of references) {
    lines.push(`- ${ref.subjectCode} – ${ref.subjectName}, Pertemuan ${ref.meetingNo}: *${ref.title}*`);
  }

  // Closing
  lines.push("");
  lines.push(pick(CLOSERS));

  return lines.join("\n");
}

export async function generateChatAnswer(params: {
  question: string;
  sources: Source[];
}): Promise<string> {
  const { question, sources } = params;
  await readChatbotSettings(); // keep settings loaded but don't expose prompt to user

  if (sources.length === 0) {
    return "Maaf, saya belum menemukan materi yang relevan untuk menjawab pertanyaan ini. Coba perjelas pertanyaan Anda atau pastikan materi terkait sudah tersedia di sistem.";
  }

  const complexity = estimateComplexity(question);
  const cfg = complexityConfig(complexity);
  const primary = sources[0];
  const references = sources.slice(0, cfg.refs);

  if (isExerciseRequest(question)) {
    return buildExerciseAnswer(primary, references);
  }

  return buildNaturalAnswer(question, primary, references, cfg);
}
