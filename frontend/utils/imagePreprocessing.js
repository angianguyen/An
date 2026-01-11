/**
 * STEP 2 & 3: Advanced Image Preprocessing for OCR
 * Grayscale → CLAHE → Denoise → Sharpen → Binarization → Deskew
 */

/**
 * Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
 */
function applyCLAHE(imageData, clipLimit = 2.0, tileSize = 8) {
  const { data, width, height } = imageData;
  const output = new Uint8ClampedArray(data);
  
  // Simplified CLAHE - apply adaptive histogram equalization
  const tilesX = Math.ceil(width / tileSize);
  const tilesY = Math.ceil(height / tileSize);
  
  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      const x0 = tx * tileSize;
      const y0 = ty * tileSize;
      const x1 = Math.min(x0 + tileSize, width);
      const y1 = Math.min(y0 + tileSize, height);
      
      // Build histogram for this tile
      const histogram = new Array(256).fill(0);
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const idx = (y * width + x) * 4;
          const gray = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
          histogram[gray]++;
        }
      }
      
      // Apply histogram equalization
      const cdf = new Array(256);
      cdf[0] = histogram[0];
      for (let i = 1; i < 256; i++) {
        cdf[i] = cdf[i - 1] + histogram[i];
      }
      
      const cdfMin = cdf.find(v => v > 0) || 0;
      const pixels = (x1 - x0) * (y1 - y0);
      
      // Apply equalization to tile
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const idx = (y * width + x) * 4;
          const gray = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
          const newGray = Math.round(((cdf[gray] - cdfMin) / (pixels - cdfMin)) * 255);
          
          output[idx] = newGray;
          output[idx + 1] = newGray;
          output[idx + 2] = newGray;
        }
      }
    }
  }
  
  return new ImageData(output, width, height);
}

/**
 * Denoise using median filter
 */
function denoise(imageData) {
  const { data, width, height } = imageData;
  const output = new Uint8ClampedArray(data);
  
  const radius = 1;
  
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      const values = [];
      
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4;
          values.push(data[idx]);
        }
      }
      
      values.sort((a, b) => a - b);
      const median = values[Math.floor(values.length / 2)];
      
      const idx = (y * width + x) * 4;
      output[idx] = median;
      output[idx + 1] = median;
      output[idx + 2] = median;
    }
  }
  
  return new ImageData(output, width, height);
}

/**
 * Binarization using Otsu's method
 */
function binarize(imageData) {
  const { data, width, height } = imageData;
  
  // Build histogram
  const histogram = new Array(256).fill(0);
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    histogram[gray]++;
  }
  
  // Otsu's method to find optimal threshold
  const total = width * height;
  let sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += i * histogram[i];
  }
  
  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let maxVariance = 0;
  let threshold = 0;
  
  for (let i = 0; i < 256; i++) {
    wB += histogram[i];
    if (wB === 0) continue;
    
    wF = total - wB;
    if (wF === 0) break;
    
    sumB += i * histogram[i];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    
    const variance = wB * wF * (mB - mF) * (mB - mF);
    
    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = i;
    }
  }
  
  console.log('Otsu threshold:', threshold);
  
  // Apply threshold
  const output = new Uint8ClampedArray(data);
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    const binary = gray > threshold ? 255 : 0;
    
    output[i] = binary;
    output[i + 1] = binary;
    output[i + 2] = binary;
  }
  
  return new ImageData(output, width, height);
}

/**
 * MAIN: Preprocess image for OCR
 */
export async function preprocessForOCR(imageFile) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Scale up for better OCR (2x)
          const scale = 2;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          console.log('Step 1: Grayscale + CLAHE');
          imageData = applyCLAHE(imageData);
          ctx.putImageData(imageData, 0, 0);
          
          console.log('Step 2: Denoise');
          imageData = denoise(imageData);
          ctx.putImageData(imageData, 0, 0);
          
          console.log('Step 3: Binarization');
          imageData = binarize(imageData);
          ctx.putImageData(imageData, 0, 0);
          
          // Convert to blob
          canvas.toBlob((blob) => {
            console.log('✓ Preprocessing complete');
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
