type Source = {
  id: string;
  title: string;
  module: string;
  page: string | null;
  excerpt: string;
};

type ComplexityLevel = "low" | "medium" | "high";

import { readChatbotSettings } from "@/lib/chatbot-settings";

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

function isExerciseRequest(question: string): boolean {
  const q = question.toLowerCase();
  return /rancang|latihan|exercise|praktik|soal|tugas/.test(q);
}

function needsCaseBridge(question: string): boolean {
  const q = question.toLowerCase();
  return /studi kasus|hubungkan|kaitkan|praktis|penerapan/.test(q);
}

function uniqueByMeaning(lines: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const line of lines) {
    const normalized = normalizeExcerpt(line)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .slice(0, 10)
      .join(" ");

    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(line);
  }

  return result;
}

function estimateComplexity(question: string): ComplexityLevel {
  const q = question.toLowerCase();
  const words = q.split(/\s+/).filter(Boolean).length;

  const hardSignals = [
    "bandingkan",
    "analisis",
    "evaluasi",
    "kritisi",
    "trade-off",
    "implikasi",
    "strategi",
    "arsitektur",
    "mengapa",
    "kenapa",
  ];

  const mediumSignals = [
    "bagaimana",
    "langkah",
    "proses",
    "contoh",
    "penerapan",
    "kapan",
    "apa perbedaan",
  ];

  let score = 0;
  if (words >= 18) score += 2;
  else if (words >= 10) score += 1;

  if (/[?]/.test(q)) score += 1;
  if (/,| dan | atau /.test(q)) score += 1;
  if (hardSignals.some((item) => q.includes(item))) score += 2;
  else if (mediumSignals.some((item) => q.includes(item))) score += 1;

  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}

function complexityConfig(level: ComplexityLevel) {
  if (level === "high") {
    return {
      refs: 4,
      keyPoints: 4,
      detailSentences: 3,
      summaryMax: 220,
      includePractical: true,
      includeLimitations: true,
    };
  }

  if (level === "medium") {
    return {
      refs: 3,
      keyPoints: 3,
      detailSentences: 2,
      summaryMax: 190,
      includePractical: true,
      includeLimitations: false,
    };
  }

  return {
    refs: 2,
    keyPoints: 2,
    detailSentences: 1,
    summaryMax: 150,
    includePractical: false,
    includeLimitations: false,
  };
}

function openingLine(question: string): string {
  const q = question.toLowerCase();

  if (/apa|pengertian|definisi|konsep/.test(q)) {
    return "Baik, kita mulai dari konsep intinya terlebih dahulu.";
  }
  if (/bagaimana|cara|langkah|proses/.test(q)) {
    return "Oke, ini alur singkat yang paling penting untuk dipahami.";
  }
  if (/kenapa|mengapa|alasan/.test(q)) {
    return "Pertanyaan bagus, ini alasan utamanya berdasarkan materi internal.";
  }
  if (/contoh|studi kasus|penerapan/.test(q)) {
    return "Siap, saya rangkum dengan fokus ke penerapan praktis.";
  }

  return "Siap, ini rangkuman yang relevan dari materi internal.";
}

function getCitationNumber(id: string): string {
  const match = id.match(/^S(\d+)$/i);
  return match ? match[1] : id;
}

function toSuperscriptNumber(value: string): string {
  const supers: Record<string, string> = {
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
  };

  return value
    .split("")
    .map((char) => supers[char] || char)
    .join("");
}

function citationMark(source: Source): string {
  const number = getCitationNumber(source.id);
  if (!/^\d+$/.test(number)) {
    return `[${source.id}]`;
  }
  return toSuperscriptNumber(number);
}

function firstNSentences(text: string, sentenceCount = 2, maxLength = 240): string {
  const clean = normalizeExcerpt(text);
  if (!clean) return "";

  const parts = clean.match(/[^.!?]+[.!?]?/g) ?? [clean];
  const joined = parts.slice(0, Math.max(1, sentenceCount)).join(" ").trim();
  if (joined.length <= maxLength) return joined;

  const clipped = joined.slice(0, maxLength);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).trim()}...`;
}

function buildExerciseBlock(primary: Source, references: Source[]) {
  const citePrimary = citationMark(primary);
  const citeSecondary = references[1] ? citationMark(references[1]) : citePrimary;

  const concept = firstSentence(primary.excerpt, 110).replace(/[.!?]+$/, "");

  return [
    "Latihan singkat (berdasarkan materi internal):",
    `- Tujuan: memahami konsep utama pada ${primary.title.toLowerCase()} (${primary.module}). ${citePrimary}`,
    "- Instruksi:",
    `  1) Tulis ulang konsep inti berikut dengan bahasamu sendiri: "${concept}". ${citePrimary}`,
    "  2) Buat 2 contoh penerapan atau situasi nyata yang relevan dengan topik ini.",
    `  3) Sebutkan 2 poin evaluasi: apa yang harus benar agar jawaban dianggap kuat. ${citeSecondary}`,
    "- Output: jawaban terstruktur (maks. 1 halaman) + 3 bullet insight utama.",
    `- Kriteria cek: konsep tepat, contoh relevan, dan istilah kunci konsisten dengan materi. ${citePrimary}`,
  ];
}

function buildCaseBridgeBlock(primary: Source, references: Source[]) {
  const focus = references.slice(0, 2);
  const rows = focus.map((source, index) => {
    const concept = firstSentence(source.excerpt, 140).replace(/[.!?]+$/, "");
    const scenario =
      index === 0
        ? "prediksi hasil, klasifikasi data, atau rekomendasi sederhana"
        : "evaluasi performa model lewat metrik yang relevan";

    return `- Konsep: ${concept} -> Studi kasus: terapkan pada ${scenario}. ${citationMark(source)}`;
  });

  return [
    "Hubungan konsep dengan studi kasus:",
    ...rows,
    "- Langkah praktik: definisikan masalah, siapkan data, pilih model dasar, lalu evaluasi hasil sebelum iterasi berikutnya.",
  ];
}

export async function generateChatAnswer(params: {
  question: string;
  sources: Source[];
}): Promise<string> {
  const { question, sources } = params;
  const settings = await readChatbotSettings();
  const _promptGuidance = settings.systemPrompt;

  if (sources.length === 0) {
    return "Maaf, saya belum menemukan materi yang relevan untuk menjawab pertanyaan ini. Silakan unggah materi atau perjelas pertanyaan.";
  }

  const complexity = estimateComplexity(question);
  const cfg = complexityConfig(complexity);

  const primary = sources[0];
  const references = sources.slice(0, cfg.refs);
  const coreSummary = firstSentence(primary.excerpt, cfg.summaryMax);

  const referenceLines = references.map((source) => {
    const pageInfo = source.page ? `, hal. ${source.page}` : "";
    return `- [${source.id}] ${source.module} - ${source.title}${pageInfo}`;
  });

  const pointSources = references.length > 1 ? references.slice(1) : references;

  const keyPoints = pointSources
    .map((source) => {
      const excerpt = firstSentence(source.excerpt, cfg.summaryMax - 20);
      return excerpt ? `- ${excerpt} ${citationMark(source)}` : "";
    })
    .filter(Boolean);

  const uniqueKeyPoints = uniqueByMeaning(keyPoints)
    .slice(0, cfg.keyPoints);

  const deepDivePoints = references
    .map((source) => {
      const excerpt = firstNSentences(
        source.excerpt,
        cfg.detailSentences,
        cfg.summaryMax + 80,
      );
      return excerpt ? `- ${excerpt} ${citationMark(source)}` : "";
    })
    .filter(Boolean);

  const uniqueDeepDivePoints = uniqueByMeaning(deepDivePoints);

  const practicalPoints = references
    .slice(0, 2)
    .map((source) => `- Penerapan praktis dapat dimulai dari topik ${source.title} pada ${source.module}. ${citationMark(source)}`);

  const bodyBlock = isExerciseRequest(question)
    ? buildExerciseBlock(primary, references)
    : [
        "Penjelasan ringkas:",
        `- ${coreSummary || normalizeExcerpt(primary.excerpt)} ${citationMark(primary)}`,
        "",
        "Uraian lebih panjang:",
        ...(uniqueDeepDivePoints.length > 0
          ? uniqueDeepDivePoints
          : ["- Materi tambahan belum cukup untuk memperluas pembahasan."]),
        "",
        "Poin penting:",
        ...(uniqueKeyPoints.length > 0
          ? uniqueKeyPoints
          : ["- Detail rinci dapat dilihat pada referensi sumber."]),
        ...(needsCaseBridge(question)
          ? ["", ...buildCaseBridgeBlock(primary, references)]
          : []),
        ...(cfg.includePractical
          ? ["", "Kaitan praktis:", ...practicalPoints]
          : []),
        ...(cfg.includeLimitations
          ? [
              "",
              "Batasan jawaban:",
              "- Jawaban ini dibatasi pada materi internal yang tersedia; jika butuh pembahasan lintas topik, tambahkan konteks atau materi terkait.",
            ]
          : []),
      ];

  return [
    openingLine(question),
    "",
    `Inti jawaban berdasarkan materi internal: ${coreSummary || normalizeExcerpt(primary.excerpt)} ${citationMark(primary)}`,
    "",
    ...bodyBlock,
    "",
    "Referensi:",
    ...referenceLines,
    "",
    "Keterangan sitasi: angka kecil di atas (mis. 1, 2) merujuk ke daftar Referensi [S1], [S2], dst.",
    "Jika konteks belum cukup spesifik, saya bisa jelaskan lebih rinci dari sumber yang tersedia.",
  ].join("\n");
}
