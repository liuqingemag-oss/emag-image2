
/**
 * Stitches multiple images together using Canvas.
 */
export const stitchImages = (
  images: { base64: string; mimeType: string }[],
  direction: 'horizontal' | 'vertical' = 'vertical',
  gap: number = 0,
  backgroundColor: string = '#ffffff'
): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    if (images.length === 0) {
      reject(new Error('No images to stitch'));
      return;
    }

    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === images.length) {
        performStitch();
      }
    };

    images.forEach((imgData) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = onImageLoad;
      img.onerror = () => reject(new Error('Failed to load image for stitching'));
      img.src = `data:${imgData.mimeType};base64,${imgData.base64}`;
      loadedImages.push(img);
    });

    const performStitch = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      let totalWidth = 0;
      let totalHeight = 0;

      if (direction === 'vertical') {
        totalWidth = Math.max(...loadedImages.map(img => img.width));
        totalHeight = loadedImages.reduce((sum, img) => sum + img.height, 0) + (gap * (loadedImages.length - 1));
      } else {
        totalWidth = loadedImages.reduce((sum, img) => sum + img.width, 0) + (gap * (loadedImages.length - 1));
        totalHeight = Math.max(...loadedImages.map(img => img.height));
      }

      canvas.width = totalWidth;
      canvas.height = totalHeight;

      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, totalWidth, totalHeight);

      let currentPos = 0;
      loadedImages.forEach((img) => {
        if (direction === 'vertical') {
          // Center horizontally if widths differ
          const xOffset = (totalWidth - img.width) / 2;
          ctx.drawImage(img, xOffset, currentPos);
          currentPos += img.height + gap;
        } else {
          // Center vertically if heights differ
          const yOffset = (totalHeight - img.height) / 2;
          ctx.drawImage(img, currentPos, yOffset);
          currentPos += img.width + gap;
        }
      });

      const resultDataUrl = canvas.toDataURL('image/png');
      const [prefix, base64] = resultDataUrl.split(',');
      const mimeType = prefix.match(/:(.*?);/)?.[1] || 'image/png';
      
      resolve({ base64, mimeType });
    };
  });
};
