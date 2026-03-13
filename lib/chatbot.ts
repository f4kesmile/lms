type Source = {
  id: string;
  title: string;
  module: string;
  page: string | null;
  excerpt: string;
};

function fallbackAnswer(question: string, sources: Source[]): string {
  if (sources.length === 0) {
    return "Maaf, saya belum menemukan materi yang relevan untuk menjawab pertanyaan ini.";
  }

  const lines = sources.map((source) => {
    const pageInfo = source.page ? ` (hal. ${source.page})` : "";
    return `- [${source.id}] ${source.module}${pageInfo}: ${source.excerpt}`;
  });

  return [
    `Berdasarkan materi internal, jawaban untuk pertanyaan \"${question}\" adalah:`,
    "",
    ...lines,
    "",
    "Silakan cek referensi sumber di atas untuk detail lengkap.",
  ].join("\n");
}

export async function generateChatAnswer(params: {
  question: string;
  sources: Source[];
}): Promise<string> {
  const { question, sources } = params;
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    return fallbackAnswer(question, sources);
  }

  const context = sources
    .map((source) => {
      const page = source.page ? `halaman ${source.page}` : "halaman tidak diketahui";
      return `${source.id} | Modul: ${source.module} | Judul: ${source.title} | ${page}\n${source.excerpt}`;
    })
    .join("\n\n");

  const prompt = [
    "Kamu adalah asisten belajar virtual.",
    "Jawab hanya berdasarkan konteks materi internal di bawah ini.",
    "Jika konteks kurang, katakan keterbatasannya.",
    "Setiap klaim utama harus menyertakan sitasi [Sx].",
    "Gunakan Bahasa Indonesia yang jelas dan ringkas.",
    "",
    `Pertanyaan: ${question}`,
    "",
    `Konteks:\n${context}`,
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 450,
        },
      }),
    }
  );

  if (!response.ok) {
    return fallbackAnswer(question, sources);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  return text || fallbackAnswer(question, sources);
}
