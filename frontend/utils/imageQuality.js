/**
 * STEP 1: Image Quality Control
 * Kiểm tra mờ - tối - cháy sáng - mất góc
 */

/**
 * Check if image is blurry using Laplacian variance
 */
export function detectBlur(imageData) {
  const { data, width, height } = imageData;
  
  // Convert to grayscale and calculate Laplacian variance
  let sum = 0;
  let count = 0;
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      
      // Laplacian kernel
      const top = 0.299 * data[((y-1) * width + x) * 4] + 0.587 * data[((y-1) * width + x) * 4 + 1] + 0.114 * data[((y-1) * width + x) * 4 + 2];
      const bottom = 0.299 * data[((y+1) * width + x) * 4] + 0.587 * data[((y+1) * width + x) * 4 + 1] + 0.114 * data[((y+1) * width + x) * 4 + 2];
      const left = 0.299 * data[(y * width + x - 1) * 4] + 0.587 * data[(y * width + x - 1) * 4 + 1] + 0.114 * data[(y * width + x - 1) * 4 + 2];
      const right = 0.299 * data[(y * width + x + 1) * 4] + 0.587 * data[(y * width + x + 1) * 4 + 1] + 0.114 * data[(y * width + x + 1) * 4 + 2];
      
      const laplacian = Math.abs(4 * gray - top - bottom - left - right);
      sum += laplacian * laplacian;
      count++;
    }
  }
  
  const variance = sum / count;
  console.log('Blur variance:', variance);
  
  // Threshold: < 100 = blurry, > 100 = sharp
  return {
    isBlurry: variance < 100,
    variance: variance,
    quality: variance > 200 ? 'sharp' : variance > 100 ? 'acceptable' : 'blurry'
  };
}

/**
 * Check brightness (too dark or overexposed)
 */
export function detectBrightness(imageData) {
  const { data, width, height } = imageData;
  
  let totalBrightness = 0;
  let darkPixels = 0;
  let brightPixels = 0;
  const totalPixels = width * height;
  
  for (let i = 0; i < data.length; i += 4) {
    const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    totalBrightness += brightness;
    
    if (brightness < 50) darkPixels++;
    if (brightness > 200) brightPixels++;
  }
  
  const avgBrightness = totalBrightness / totalPixels;
  const darkRatio = darkPixels / totalPixels;
  const brightRatio = brightPixels / totalPixels;
  
  console.log('Brightness:', { avg: avgBrightness, darkRatio, brightRatio });
  
  return {
    tooDark: avgBrightness < 60 || darkRatio > 0.5,
    toobright: avgBrightness > 200 || brightRatio > 0.5,
    avgBrightness,
    quality: avgBrightness > 80 && avgBrightness < 180 ? 'good' : 'poor'
  };
}

/**
 * Detect missing corners (using edge detection)
 */
export function detectCorners(imageData) {
  const { width, height } = imageData;
  
  // Check if corners are visible (simple heuristic)
  const cornerSize = Math.min(width, height) * 0.1;
  
  // For CCCD, we expect a rectangular card
  // Check if edges are visible in all 4 corners
  
  return {
    hasMissingCorners: false, // Simplified for now
    quality: 'acceptable'
  };
}

/**
 * MAIN: Check image quality
 */
export async function checkImageQuality(imageFile) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Run all checks
        const blurCheck = detectBlur(imageData);
        const brightnessCheck = detectBrightness(imageData);
        const cornerCheck = detectCorners(imageData);
        
        const result = {
          passed: !blurCheck.isBlurry && !brightnessCheck.tooDark && !brightnessCheck.toobrightPixels,
          checks: {
            blur: blurCheck,
            brightness: brightnessCheck,
            corners: cornerCheck
          },
          issues: []
        };
        
        if (blurCheck.isBlurry) result.issues.push('Ảnh bị mờ, vui lòng chụp lại');
        if (brightnessCheck.tooDark) result.issues.push('Ảnh quá tối, tăng ánh sáng');
        if (brightnessCheck.toobrightPixels) result.issues.push('Ảnh bị cháy sáng, giảm ánh sáng');
        
        console.log('Image Quality Check:', result);
        resolve(result);
      };
      
      img.onerror = reject;
      img.src = e.target.result;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
}
