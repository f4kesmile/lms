const MAX_SIZE_BYTES = 500 * 1024;
const MAX_WIDTH = 1200;
const JPEG_QUALITY = 0.7;

type CompressResult = {
  data: string;
  originalSize: number;
  compressedSize: number;
  wasCompressed: boolean;
};

function getBase64Size(base64: string): number {
  const padding = (base64.match(/=+$/) || [""])[0].length;
  return Math.floor((base64.length * 3) / 4) - padding;
}

export async function compressImageBase64(
  base64Input: string
): Promise<CompressResult> {
  const raw = base64Input.includes(",") ? base64Input.split(",")[1] : base64Input;
  const originalSize = getBase64Size(raw);

  if (originalSize <= MAX_SIZE_BYTES) {
    return {
      data: base64Input,
      originalSize,
      compressedSize: originalSize,
      wasCompressed: false,
    };
  }

  const img = new Image();
  const loadPromise = new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load image"));
  });

  img.src = base64Input.startsWith("data:")
    ? base64Input
    : `data:image/jpeg;base64,${base64Input}`;
  await loadPromise;

  let { width, height } = img;
  if (width > MAX_WIDTH) {
    const ratio = MAX_WIDTH / width;
    width = MAX_WIDTH;
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.drawImage(img, 0, 0, width, height);
  const compressed = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  const compressedRaw = compressed.split(",")[1];
  const compressedSize = getBase64Size(compressedRaw);

  return {
    data: compressed,
    originalSize,
    compressedSize,
    wasCompressed: true,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
