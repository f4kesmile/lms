/**
 * Memecah teks panjang menjadi potongan-potongan (chunks) untuk keperluan RAG.
 * Dioptimalkan untuk menjaga konteks kalimat.
 */

export function splitIntoChunks(text: string, maxChunkSize: number = 800): string[] {
  if (!text) return [];

  const chunks: string[] = [];
  const paragraphs = text.split(/\n\s*\n/);
  
  let currentChunk = "";

  for (const para of paragraphs) {
    if (currentChunk.length + para.length <= maxChunkSize) {
      currentChunk += (currentChunk ? "\n\n" : "") + para;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      
      if (para.length > maxChunkSize) {
        // Jika paragraf itu sendiri lebih besar dari maxChunkSize, pecah paksa per kalimat
        const sentences = para.split(/(?<=[.!?])\s+/);
        let tempChunk = "";
        for (const sentence of sentences) {
          if (tempChunk.length + sentence.length <= maxChunkSize) {
            tempChunk += (tempChunk ? " " : "") + sentence;
          } else {
            if (tempChunk) chunks.push(tempChunk.trim());
            tempChunk = sentence;
          }
        }
        currentChunk = tempChunk;
      } else {
        currentChunk = para;
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
