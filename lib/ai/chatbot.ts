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

type PromptControls = {
  concise: boolean;
  mentionLimits: boolean;
};

function parsePromptControls(systemPrompt: string): PromptControls {
  const normalized = systemPrompt.toLowerCase();
  return {
    concise: /ringkas|singkat|padat/.test(normalized),
    mentionLimits: /batasan|konteks kurang|keterbatasan/.test(normalized),
  };
}

function normalizeExcerpt(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

// Returns full content, NOT trimmed — let answers be as long as needed
function fullExcerpt(text: string): string {
  return normalizeExcerpt(text);
}

function firstNSentences(text: string, count = 3, maxLength = 500): string {
  const clean = normalizeExcerpt(text);
  if (!clean) return "";
  const parts = clean.match(/[^.!?]+[.!?]?/g) ?? [clean];
  const joined = parts.slice(0, Math.max(1, count)).join(" ").trim();
  if (joined.length <= maxLength) return joined;
  return joined.slice(0, maxLength).trim();
}

function isExerciseRequest(question: string): boolean {
  const q = question.toLowerCase();
  return /rancang|latihan|exercise|praktik|soal|tugas/.test(q);
}

// Detect conversational / greeting messages that don't need RAG
export function isConversational(question: string): boolean {
  const q = question.toLowerCase().trim();
  return /^(halo|hai|hi|hello|hey|pagi|siang|sore|malam|hei|assalamu|selamat)\b/.test(q) ||
    /^(saya\s+(akan|mau|ingin|ada|punya)\s+(bertanya|tanya|pertanyaan|ngobrol|diskusi|chat))/i.test(q) ||
    /^(mau\s+(tanya|bertanya|diskusi|ngobrol))/.test(q) ||
    /^(ada\s+(pertanyaan|yang\s+ingin\s+saya\s+tanyakan))/.test(q) ||
    /^(oke|ok|siap|lanjut|boleh|bisa\s+bantu|tolong\s+bantu)/.test(q) ||
    /^(terima\s+kasih|makasih|thanks|thank\s+you|mantap|bagus|keren|oke\s+deh)/.test(q) ||
    (q.split(/\s+/).length <= 4 && !/apa|bagaimana|kenapa|mengapa|jelaskan|ceritakan/.test(q));
}

function estimateComplexity(question: string): ComplexityLevel {
  const q = question.toLowerCase();
  const words = q.split(/\s+/).filter(Boolean).length;

  const hard = [
    "bandingkan", "analisis", "evaluasi", "kritisi", "trade-off",
    "implikasi", "strategi", "arsitektur", "mengapa", "kenapa",
    "hubungan", "perbedaan", "perbandingan", "jelaskan", "uraikan",
  ];
  const medium = [
    "bagaimana", "langkah", "proses", "contoh", "penerapan",
    "kapan", "apa perbedaan", "seperti apa", "maksud",
  ];

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
  // Removed artificial sentence caps — let content flow naturally
  if (level === "high") return { refs: 4, detailSentences: 99, summaryMax: 9999 };
  if (level === "medium") return { refs: 3, detailSentences: 99, summaryMax: 9999 };
  return { refs: 2, detailSentences: 5, summaryMax: 9999 };
}

function getCitationNumber(id: string): string {
  const match = id.match(/^S(\d+)$/i);
  return match ? match[1] : id;
}

function toSuperscript(value: string): string {
  const map: Record<string, string> = {
    "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
    "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
  };
  return value.split("").map((c) => map[c] || c).join("");
}

function cite(source: Source, controls: PromptControls): string {
  void controls;
  const num = getCitationNumber(source.id);
  return /^\d+$/.test(num) ? toSuperscript(num) : `[${source.id}]`;
}

/* ── Variasi frasa ── */

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Friendly greetings that respond to conversational openers
const GREETINGS = [
  "Halo! Senang bisa membantu. Silakan ajukan pertanyaan Anda seputar materi kuliah — saya siap menjelaskannya.",
  "Hai! Saya Liona, asisten belajar Anda. Ada yang ingin ditanyakan tentang materi perkuliahan? Silakan langsung tanyakan saja!",
  "Halo! Dengan senang hati saya akan membantu. Apa yang ingin Anda pelajari hari ini?",
];

const READY_RESPONSES = [
  "Tentu! Silakan tuliskan pertanyaannya, saya siap membantu menjelaskan materi yang Anda butuhkan.",
  "Siap! Langsung saja, apa yang ingin Anda tanyakan? Saya akan coba jawab sebaik mungkin berdasarkan materi yang tersedia.",
  "Dengan senang hati! Apa pertanyaan Anda? Saya di sini untuk membantu.",
];

const THANKS_RESPONSES = [
  "Sama-sama! Jangan ragu untuk bertanya lagi jika ada yang masih kurang jelas.",
  "Senang bisa membantu! Kalau ada pertanyaan lain seputar materi kuliah, saya siap membantu kapan saja.",
  "Sama-sama! Semangat belajarnya ya. Jika ada yang ingin didiskusikan, silakan untuk bertanya kembali.",
];

const OPENERS_CONCEPT = [
  "Berdasarkan materi internal yang tersedia, berikut penjelasannya.",
  "Saya temukan referensi yang relevan dari materi perkuliahan. Mari kita bahas.",
  "Dari modul pembelajaran yang ada, berikut penjelasan lengkapnya.",
  "Saya rangkum dari materi kuliah terkait untuk menjawab pertanyaan Anda.",
];

const OPENERS_HOW = [
  "Untuk memahami prosesnya secara utuh, berikut penjelasan berdasarkan materi internal.",
  "Berikut alur dan langkah-langkah yang diuraikan dalam modul pembelajaran terkait.",
  "Dari materi yang tersedia, prosesnya dapat dipahami sebagai berikut.",
];

const OPENERS_WHY = [
  "Pertanyaan yang menarik! Berdasarkan materi internal, berikut penjelasan mengenai hal tersebut.",
  "Dari pembahasan di modul terkait, berikut alasan dan latar belakangnya.",
  "Materi perkuliahan membahas hal ini secara cukup mendalam. Berikut penjelasannya.",
];

const OPENERS_EXAMPLE = [
  "Berikut contoh dan penerapan dari materi yang tersedia.",
  "Saya rangkum penerapan praktis dari materi perkuliahan terkait.",
  "Dari modul yang ada, berikut contoh konkret yang bisa dijadikan acuan.",
];

const OPENERS_GENERIC = [
  "Saya temukan beberapa referensi yang relevan dengan pertanyaan Anda. Berikut pembahasannya.",
  "Berdasarkan materi perkuliahan yang tersedia, berikut informasi yang bisa saya sampaikan.",
  "Dari database materi internal, berikut penjelasan yang saya temukan.",
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
  "Untuk melengkapi pemahaman,",
  "Di sisi lain,",
  "Yang juga penting dipahami,",
  "Sebagai tambahan informasi,",
  "Menariknya,",
  "Kaitannya dengan hal ini,",
];

const PRACTICAL_INTROS = [
  "Secara praktis, konsep ini dapat diterapkan",
  "Dalam penerapannya, materi ini berkaitan langsung",
  "Untuk konteks dunia nyata, topik ini relevan",
  "Dari sisi implementasi, pembahasan ini berhubungan erat",
];

const CLOSERS = [
  "Jika ada bagian yang ingin dibahas lebih mendalam, jangan ragu untuk bertanya kembali.",
  "Apabila butuh penjelasan lebih lanjut atau ada konsep yang masih belum jelas, saya siap membantu.",
  "Semoga penjelasan ini membantu! Kalau ada pertanyaan lain atau ingin mengeksplorasi topik lebih jauh, silakan tanyakan.",
  "Jika ingin membahas aspek lain dari topik ini atau berdiskusi lebih lanjut, saya di sini untuk membantu.",
  "Kalau ada yang kurang jelas atau ingin diperdalam lebih lanjut, langsung saja tanyakan!",
];

/* ── Builder Utama ── */

export function handleConversational(question: string): string {
  const q = question.toLowerCase().trim();

  // Thanks / appreciation
  if (/terima\s+kasih|makasih|thanks|thank\s+you/.test(q)) {
    return pick(THANKS_RESPONSES);
  }

  // "Saya akan bertanya" / "Ada pertanyaan" / "Mau tanya"
  if (/saya\s+(akan|mau|ingin|ada|punya)\s+(bertanya|tanya|pertanyaan)|mau\s+(tanya|bertanya)|ada\s+(pertanyaan|yang\s+ingin)/.test(q)) {
    return pick(READY_RESPONSES);
  }

  // Short casual messages / greetings
  return pick(GREETINGS);
}

function buildExerciseAnswer(
  primary: Source,
  references: Source[],
  controls: PromptControls,
): string {
  const concept = firstNSentences(primary.excerpt, 2, 200).replace(/[.!?]+$/, "");
  const lines: string[] = [
    `Berikut latihan yang dirancang berdasarkan materi **${primary.title}** pada mata kuliah ${primary.subjectName}. ${cite(primary, controls)}`,
    "",
    `**Tujuan:** Memahami konsep utama terkait ${primary.title.toLowerCase()} dan mampu menerapkannya dalam konteks praktis.`,
    "",
    "**Instruksi:**",
    `1. Tuliskan ulang konsep berikut dengan bahasa Anda sendiri: "*${concept}*" ${cite(primary, controls)}`,
    "2. Berikan 2–3 contoh penerapan atau situasi nyata yang relevan dengan topik ini.",
  ];

  if (references.length > 1) {
    lines.push(
      `3. Bandingkan pendekatan di atas dengan pembahasan pada **${references[1].title}** (${references[1].subjectName}). ${cite(references[1], controls)}`,
    );
    lines.push("4. Identifikasi persamaan dan perbedaan utama antara kedua topik tersebut.");
  } else {
    lines.push("3. Identifikasi minimal 2 poin evaluasi: apa yang harus terpenuhi agar jawaban Anda dianggap kuat dan akurat.");
    lines.push("4. Tuliskan satu pertanyaan lanjutan yang ingin Anda eksplorasi lebih jauh dari topik ini.");
  }

  lines.push(
    "",
    "**Output yang diharapkan:** Jawaban terstruktur dengan argumen yang jelas, disertai contoh konkret.",
  );
  lines.push("", pick(CLOSERS));
  return lines.join("\n");
}

function buildNaturalAnswer(
  question: string,
  primary: Source,
  references: Source[],
  cfg: ReturnType<typeof complexityConfig>,
  controls: PromptControls,
): string {
  const lines: string[] = [];

  // Opening
  lines.push(pickOpener(question));
  lines.push("");

  // Core explanation from primary source — use full excerpt, not trimmed
  const coreExcerpt = fullExcerpt(primary.excerpt);
  lines.push(
    `Pada topik **${primary.title}** dalam mata kuliah **${primary.subjectName}** (Pertemuan ${primary.meetingNo}), ` +
      `${coreExcerpt} ${cite(primary, controls)}`,
  );

  // Additional sources woven naturally
  const usedTransitions = new Set<number>();
  const additionalRefs = references.slice(1);

  for (const ref of additionalRefs) {
    const excerpt = fullExcerpt(ref.excerpt);
    if (!excerpt) continue;

    lines.push("");

    let transIdx: number;
    do {
      transIdx = Math.floor(Math.random() * TRANSITIONS.length);
    } while (
      usedTransitions.has(transIdx) &&
      usedTransitions.size < TRANSITIONS.length
    );
    usedTransitions.add(transIdx);

    lines.push(
      `${TRANSITIONS[transIdx]} pada materi **${ref.title}** (${ref.subjectName}, Pertemuan ${ref.meetingNo}), ` +
        `${excerpt.charAt(0).toLowerCase()}${excerpt.slice(1)} ${cite(ref, controls)}`,
    );
  }

  // Practical connection (for medium/high complexity)
  if (cfg.refs >= 3 && additionalRefs.length > 0) {
    lines.push("");
    const practicalRef = additionalRefs[0];
    lines.push(
      `${pick(PRACTICAL_INTROS)} dengan topik **${practicalRef.title}** pada mata kuliah **${practicalRef.subjectName}**. ` +
        `Memahami kedua konsep ini secara bersamaan akan memberikan perspektif yang lebih utuh dan komprehensif. ${cite(practicalRef, controls)}`,
    );
  }

  if (controls.mentionLimits && references.length < 2) {
    lines.push("");
    lines.push(
      "Catatan: Materi yang ditemukan masih terbatas pada referensi yang tersedia. Jika ingin eksplorasi lebih dalam, pastikan materi terkait sudah diunggah ke sistem.",
    );
  }

  // References section
  lines.push("");
  lines.push("**Sumber Referensi:**");
  for (const ref of references) {
    lines.push(
      `- ${ref.subjectCode} – ${ref.subjectName}, Pertemuan ${ref.meetingNo}: *${ref.title}*`,
    );
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
  const settings = await readChatbotSettings();
  const controls = parsePromptControls(settings.systemPrompt);

  // Handle conversational / greeting inputs before hitting RAG
  if (isConversational(question)) {
    return handleConversational(question);
  }

  if (sources.length === 0) {
    return [
      "Maaf, saya belum menemukan materi yang cukup relevan untuk menjawab pertanyaan ini.",
      "",
      "Ada beberapa kemungkinan yang bisa dicoba:",
      "- Coba perjelas pertanyaan dengan kata kunci yang lebih spesifik",
      "- Pastikan materi terkait sudah tersedia di sistem",
      "- Gunakan istilah yang sesuai dengan terminologi dalam modul kuliah",
      "",
      "Saya siap membantu jika Anda ingin mencoba formulasi pertanyaan yang berbeda.",
    ].join("\n");
  }

  const complexity = estimateComplexity(question);
  const cfg = complexityConfig(complexity);
  const effectiveCfg = controls.concise
    ? {
        ...cfg,
        refs: Math.max(1, cfg.refs - 1),
        detailSentences: Math.max(2, cfg.detailSentences - 1),
      }
    : cfg;
  const primary = sources[0];
  const references = sources.slice(0, effectiveCfg.refs);

  if (isExerciseRequest(question)) {
    return buildExerciseAnswer(primary, references, controls);
  }

  return buildNaturalAnswer(
    question,
    primary,
    references,
    effectiveCfg,
    controls,
  );
}
