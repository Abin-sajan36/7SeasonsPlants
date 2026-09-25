/**
 * 7Seasons Nursery Image Upload Utility
 * Handles automatic compression and server-side hosting to ensure
 * product & combo images are ultra-lightweight (~50-120 KB), fast-loading,
 * and never exceed Firestore's 1MB document limit.
 */

export interface ImageCompressionStats {
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
  width: number;
  height: number;
  originalName?: string;
  dataUrl: string;
}

export const formatBytes = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Automatically compresses an image File using an HTML5 Canvas.
 * Resizes down to optimal e-commerce product dimensions (default 1080x1080)
 * and encodes with high-efficiency JPEG compression (0.82 quality).
 * Calculates exact compression savings.
 */
export const compressImageFileWithStats = (
  file: File,
  maxWidth = 1080,
  maxHeight = 1080,
  quality = 0.82
): Promise<ImageCompressionStats> => {
  return new Promise((resolve, reject) => {
    const originalSize = file.size;
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while bounding within maxWidth & maxHeight
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          const raw = e.target?.result as string;
          const compSize = Math.round(raw.length * 0.75);
          return resolve({
            originalSize,
            compressedSize: compSize,
            savingsPercent: 0,
            width: img.width,
            height: img.height,
            originalName: file.name,
            dataUrl: raw,
          });
        }

        // Configure high quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Fill crisp white background so transparent PNGs/alpha don't turn black
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const compressedSize = Math.round(dataUrl.length * 0.75);
        const savingsPercent = originalSize > compressedSize
          ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
          : 0;

        resolve({
          originalSize,
          compressedSize,
          savingsPercent,
          width,
          height,
          originalName: file.name,
          dataUrl,
        });
      };

      img.onerror = () => {
        const raw = e.target?.result as string;
        resolve({
          originalSize,
          compressedSize: originalSize,
          savingsPercent: 0,
          width: 0,
          height: 0,
          originalName: file.name,
          dataUrl: raw,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Backwards-compatible image compressor returning direct dataUrl string.
 */
export const compressImageFile = async (
  file: File,
  maxWidth = 1080,
  maxHeight = 1080,
  quality = 0.82
): Promise<string> => {
  const result = await compressImageFileWithStats(file, maxWidth, maxHeight, quality);
  return result.dataUrl;
};

/**
 * Compresses an existing Base64 Data URL to guarantee it doesn't exceed 1080x1080.
 */
export const compressDataUrl = (
  dataUrl: string,
  maxWidth = 1080,
  maxHeight = 1080,
  quality = 0.82
): Promise<string> => {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      return resolve(dataUrl);
    }

    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width <= maxWidth && height <= maxHeight && dataUrl.length < 150000) {
        return resolve(dataUrl);
      }

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

/**
 * Creates a micro-compressed thumbnail (<30 KB) as an ultra-safe fallback
 * if the server upload endpoint is temporarily unreachable.
 */
export const createMicroThumbnail = (dataUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxWidth = 500;
      const maxHeight = 500;
      let width = img.width;
      let height = img.height;
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.65));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

/**
 * Uploads an image file or base64 data URL to the backend `/api/upload-image`.
 * Automatically compresses high-resolution files at the time of uploading.
 * Can emit compression metrics via optional onStats callback.
 */
export const uploadImageWithStats = async (
  fileOrDataUrl: File | string,
  nameHint = 'plant-photo',
  onStats?: (stats: ImageCompressionStats) => void
): Promise<{ url: string; stats?: ImageCompressionStats }> => {
  if (!fileOrDataUrl) return { url: '' };

  // If already a hosted URL (Unsplash, static asset, or previously uploaded)
  if (
    typeof fileOrDataUrl === 'string' &&
    (fileOrDataUrl.startsWith('http://') ||
      fileOrDataUrl.startsWith('https://') ||
      fileOrDataUrl.startsWith('/uploads/') ||
      fileOrDataUrl.startsWith('/')) &&
    !fileOrDataUrl.startsWith('data:image/')
  ) {
    return { url: fileOrDataUrl };
  }

  try {
    let base64Data: string;
    let compressionStats: ImageCompressionStats | undefined;

    if (fileOrDataUrl instanceof File) {
      // 1. Automatically compress the raw file on the client at the time of uploading
      compressionStats = await compressImageFileWithStats(fileOrDataUrl, 1080, 1080, 0.82);
      base64Data = compressionStats.dataUrl;
      if (onStats && compressionStats) {
        onStats(compressionStats);
      }
    } else {
      // 2. If it's a data URL, compress to ensure it's not oversized
      base64Data = await compressDataUrl(fileOrDataUrl, 1080, 1080, 0.82);
    }

    // Call server upload endpoint to store compressed file on disk
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Data,
        name: nameHint,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.url) {
        return { url: data.url, stats: compressionStats };
      }
    }

    // Fallback: If server returned an error or non-200, use micro thumbnail
    console.warn('[7Seasons Upload] Server returned non-ok status, using micro-compressed fallback.');
    const fallbackUrl = await createMicroThumbnail(base64Data);
    return { url: fallbackUrl, stats: compressionStats };
  } catch (err) {
    console.warn('[7Seasons Upload] Upload endpoint error, applying micro-compressed fallback:', err);
    if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:image/')) {
      const fallbackUrl = await createMicroThumbnail(fileOrDataUrl);
      return { url: fallbackUrl };
    }
    if (fileOrDataUrl instanceof File) {
      const fallback = await compressImageFile(fileOrDataUrl, 500, 500, 0.65);
      return { url: fallback };
    }
    return { url: typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '' };
  }
};

/**
 * Standard uploadImage helper returning direct string URL
 */
export const uploadImage = async (
  fileOrDataUrl: File | string,
  nameHint = 'plant-photo'
): Promise<string> => {
  const result = await uploadImageWithStats(fileOrDataUrl, nameHint);
  return result.url;
};

/**
 * Upload multiple images concurrently
 */
export const uploadMultipleImages = async (
  items: (File | string)[],
  nameHint = 'gallery-img'
): Promise<string[]> => {
  return Promise.all(items.map((item, idx) => uploadImage(item, `${nameHint}-${idx + 1}`)));
};
