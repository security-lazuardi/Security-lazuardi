/**
 * Lazuardi Security Management System (LSMS)
 * Client-Side Image Optimizer
 * Compresses operational photos to WebP (~150-250KB) before transmission,
 * protecting Supabase Free Plan storage and egress quotas.
 */

export interface OptimizedImageResult {
  dataUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  compressionRatioPercent: number;
}

export async function compressImageToWebP(
  file: File | Blob,
  maxDimension = 1280,
  quality = 0.75
): Promise<OptimizedImageResult> {
  const originalSizeKb = Math.round(file.size / 1024);

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);

    img.onload = () => {
      let { width, height } = img;

      // Maintain aspect ratio while bounding maximum dimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Export as WebP
      const dataUrl = canvas.toDataURL('image/webp', quality);
      // Rough base64 to byte estimation: base64 string length * 0.75
      const compressedSizeKb = Math.round((dataUrl.length * 0.75) / 1024);
      const compressionRatioPercent =
        originalSizeKb > 0 ? Math.round(((originalSizeKb - compressedSizeKb) / originalSizeKb) * 100) : 0;

      resolve({
        dataUrl,
        originalSizeKb,
        compressedSizeKb,
        compressionRatioPercent,
      });
    };

    img.onerror = (err) => reject(err);

    reader.readAsDataURL(file);
  });
}
