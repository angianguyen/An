/**
 * Simple image enhancement for better OCR
 * Using Canvas API (client-side only)
 */

/**
 * Enhance image: increase contrast, denoise, sharpen
 * @param {string|File|Blob} imageInput - Can be data URL string, File, or Blob
 */
export async function enhanceImageForOCR(imageInput) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Check if input is already a data URL string
    if (typeof imageInput === 'string') {
      img.onload = () => processImage(img, resolve, reject);
      img.onerror = reject;
      img.src = imageInput;
    } else {
      // Input is File or Blob
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = () => processImage(img, resolve, reject);
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageInput);
    }
  });
}

function processImage(img, resolve, reject) {
  try {
    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Scale up 6x for better OCR (larger = more accurate)
    const scale = 6;
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    
    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Draw image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // ONLY grayscale - no sharpening, no threshold
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = data[i + 1] = data[i + 2] = gray;
    }
    
    // Put data back
    ctx.putImageData(imageData, 0, 0);
    
    // Return as data URL string for compatibility
    const dataUrl = canvas.toDataURL('image/png');
    console.log('✓ Image enhanced for OCR (simple grayscale + 6x scale)');
    resolve(dataUrl);
  } catch (error) {
    reject(error);
  }
}
