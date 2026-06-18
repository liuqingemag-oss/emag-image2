
/**
 * Resizes an image to a maximum dimension while maintaining aspect ratio.
 * Returns a base64 string without the prefix.
 */
export const resizeImage = (
  base64WithPrefix: string,
  maxDimension: number = 1024,
  quality: number = 0.7
): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let width = img.width;
      let height = img.height;

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

      const ctx = canvas.getContext('2d', { alpha: false }); // Disable alpha for speed
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Use a slightly better scaling algorithm
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'low'; // 'low' is faster and usually enough for AI
      ctx.drawImage(img, 0, 0, width, height);
      
      // Try WebP first, then JPEG
      let mimeType = 'image/webp';
      let resizedDataUrl = canvas.toDataURL('image/webp', quality);
      
      if (resizedDataUrl.length < 100) { // Fallback if webp failed
        mimeType = 'image/jpeg';
        resizedDataUrl = canvas.toDataURL('image/jpeg', quality);
      }

      const [_, base64] = resizedDataUrl.split(',');
      resolve({ base64, mimeType });
    };
    img.onerror = reject;
    img.src = base64WithPrefix;
  });
};
