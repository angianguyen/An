/**
 * Image preprocessing utilities for better OCR accuracy
 */

/**
 * Preprocess image before OCR
 * - Convert to grayscale
 * - Increase contrast
 * - Sharpen text
 * - Deskew if needed
 */
export async function preprocessImage(imageFile) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        try {
          // Create canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Set canvas size (scale up for better OCR)
          const scale = 2;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          // Draw image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // 1. Convert to grayscale and increase contrast
          for (let i = 0; i < data.length; i += 4) {
            // Grayscale
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            
            // Increase contrast (threshold)
            const threshold = 128;
            const contrast = 1.5;
            let adjusted = (gray - threshold) * contrast + threshold;
            adjusted = Math.max(0, Math.min(255, adjusted));

            data[i] = adjusted;     // R
            data[i + 1] = adjusted; // G
            data[i + 2] = adjusted; // B
          }

          // Put processed image back
          ctx.putImageData(imageData, 0, 0);

          // 2. Sharpen (unsharp mask)
          sharpenCanvas(ctx, canvas.width, canvas.height);

          // Convert to blob
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/png');

        } catch (error) {
          reject(error);
        }
      };

      img.onerror = reject;
      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Sharpen canvas using convolution
 */
function sharpenCanvas(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const output = new Uint8ClampedArray(data);

  // Sharpen kernel
  const kernel = [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      for (let c = 0; c < 3; c++) { // RGB only
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4 + c;
            const kernelIdx = (ky + 1) * 3 + (kx + 1);
            sum += data[idx] * kernel[kernelIdx];
          }
        }
        output[(y * width + x) * 4 + c] = sum;
      }
    }
  }

  // Copy sharpened data back
  for (let i = 0; i < data.length; i++) {
    data[i] = output[i];
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Auto-rotate image to correct orientation
 * Detects text orientation and rotates if needed
 */
export function autoRotateImage(imageFile) {
  // TODO: Implement deskew algorithm
  // For now, return as-is
  return Promise.resolve(imageFile);
}

/**
 * Crop to focus area (remove QR code, logo, etc.)
 * Focus on text region only
 */
export function cropToTextRegion(imageFile, region = 'center') {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Define crop regions for CCCD
        let cropX, cropY, cropW, cropH;

        if (region === 'center') {
          // Focus on main text area (avoid edges with QR/logo)
          cropX = img.width * 0.1;
          cropY = img.height * 0.2;
          cropW = img.width * 0.7;
          cropH = img.height * 0.7;
        } else {
          // Full image
          cropX = 0;
          cropY = 0;
          cropW = img.width;
          cropH = img.height;
        }

        canvas.width = cropW;
        canvas.height = cropH;

        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

        canvas.toBlob(resolve, 'image/png');
      };

      img.onerror = reject;
      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
}
