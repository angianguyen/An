'use client';

import { useState, useCallback } from 'react';
import { Upload, CheckCircle2, AlertTriangle, RefreshCw, ShieldCheck, X, FileText, Crop, Scan } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { processCCCD } from '@/utils/ocrCCCDv2';
import { enhanceImageForOCR } from '@/utils/imageEnhance';

export default function KYCUpload({ walletAddress, onVerified }) {
  const [step, setStep] = useState(1); // 1: upload, 2: processing, 3: result
  const [frontImage, setFrontImage] = useState(null);
  const [frontPreview, setFrontPreview] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    // Create preview and store file
    const reader = new FileReader();
    reader.onloadend = () => {
      setFrontImage(file);
      setFrontPreview(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };
  
  const getCroppedImg = async () => {
    const image = new Image();
    image.src = frontPreview;
    
    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Scale up 3x for better quality (increased from 2x)
        const scale = 3;
        canvas.width = croppedAreaPixels.width * scale;
        canvas.height = croppedAreaPixels.height * scale;
        
        console.log('📐 Cropped canvas size:', canvas.width, 'x', canvas.height);
        
        // Ensure minimum size for OCR (at least 600x600 after scaling)
        if (canvas.width < 600 || canvas.height < 600) {
          console.warn('⚠️ Canvas too small, Tesseract may fail!');
        }
        
        // Enable high quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          canvas.width,
          canvas.height
        );
        
        // Apply sharpening filter
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Sharpen kernel
        const sharpenKernel = [
          0, -1, 0,
          -1, 5, -1,
          0, -1, 0
        ];
        
        const sharpened = new Uint8ClampedArray(data.length);
        const width = canvas.width;
        const height = canvas.height;
        
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            for (let c = 0; c < 3; c++) {
              let sum = 0;
              for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                  const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                  const kernelIdx = (ky + 1) * 3 + (kx + 1);
                  sum += data[idx] * sharpenKernel[kernelIdx];
                }
              }
              const idx = (y * width + x) * 4 + c;
              sharpened[idx] = Math.max(0, Math.min(255, sum));
            }
            sharpened[(y * width + x) * 4 + 3] = 255; // Alpha
          }
        }
        
        // Apply brightness adjustment
        for (let i = 0; i < sharpened.length; i += 4) {
          sharpened[i] = Math.max(0, Math.min(255, sharpened[i] * brightness));     // Red
          sharpened[i + 1] = Math.max(0, Math.min(255, sharpened[i + 1] * brightness)); // Green
          sharpened[i + 2] = Math.max(0, Math.min(255, sharpened[i + 2] * brightness)); // Blue
          // Alpha channel (i + 3) unchanged
        }
        
        imageData.data.set(sharpened);
        ctx.putImageData(imageData, 0, 0);
        
        canvas.toBlob((blob) => {
          resolve(new File([blob], 'cccd-crop.png', { type: 'image/png' }));
        }, 'image/png');
      };
    });
  };

const handleScanOCR = async () => {
    if (!frontImage) {
      setError('Vui lòng upload ảnh CCCD trước');
      return;
    }

    if (!walletAddress) {
      setError('Vui lòng kết nối ví trước');
      return;
    }

    setIsProcessing(true);
    setStep(2);
    setError('');

    try {
      console.log('=== OCR SCAN START ===');
      setProcessingStatus('📸 Đang tăng cường chất lượng ảnh...');
      
      // Enhance image for better OCR
      const enhancedImage = await enhanceImageForOCR(frontImage);
      
      setProcessingStatus('🔍 Đang quét số CCCD...');
      console.log('Running OCR on enhanced image...');
      
      // Run OCR - only extract CCCD number
      const ocrResult = await processCCCD(enhancedImage, null);
      
      if (!ocrResult.success || !ocrResult.extracted_data.cccd_number) {
        throw new Error('Không thể đọc số CCCD. Vui lòng chụp lại ảnh rõ hơn.');
      }
      
      console.log('✓ OCR completed!');
      console.log('CCCD number:', ocrResult.extracted_data.cccd_number);
      
      await processOCRResult(ocrResult);
      
    } catch (err) {
      console.error('OCR Scan Error:', err);
      setError(err.message || 'Có lỗi xảy ra khi quét CCCD');
      setStep(1); // Back to upload step
    console.log('  - Format valid:', ocrResult.format_valid);
    console.log('  - Extracted:', extracted);
    
    if (ocrResult.missing_fields && ocrResult.missing_fields.length > 0) {
      console.log('  ⚠️ Missing:', ocrResult.missing_fields.join(', '));
    }
    
    setProcessingStatus('✓ Quét thành công! Đang lưu dữ liệu...');
    
    // Save to backend
    const response = await fetch('/api/kyc/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        walletAddress,
        ocrData: ocrResult
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Xác thực thất bại');
    }

    setResult(data);
    setStep(4); // Move to result step

    if (onVerified && data.data.verification_status === 'verified') {
      onVerified(data.data);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFrontImage(null);
    setFrontPreview('');
    setResult(null);
    setError('');
    setProcessingStatus('');
  };

  return (
    <div className="glass-panel rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
          <ShieldCheck className="text-cyan-400" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Xác thực KYC</h3>
          <p className="text-sm text-slate-400">Upload CCCD để xác minh danh tính</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3">
          <AlertTriangle className="text-rose-400" size={20} />
          <p className="text-sm text-rose-400">{error}</p>
        </div>
      )}

      {/* Step 1: Upload Images */}
      {step === 1 && (
        <>
          <div className="mb-6">
            {/* Front Image Only */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <FileText size={18} className="text-cyan-400" />
                Mặt trước CCCD
              </label>
              <div className="relative">
                {frontPreview ? (
                  <div className="relative group">
                    <img 
                      src={frontPreview} 
                      alt="Front" 
                      className="w-full h-64 object-cover rounded-xl border-2 border-cyan-500/30"
                    />
                    <button
                      onClick={() => {
                        setFrontImage(null);
                        setFrontPreview('');
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-700 rounded-xl hover:border-cyan-500/50 transition cursor-pointer bg-slate-800/30">
                    <FileText className="text-cyan-500 mb-2" size={48} />
                    <span className="text-sm text-slate-400">Click để upload mặt trước CCCD</span>
                    <span className="text-xs text-slate-500 mt-1">Đảm bảo ảnh CCCD rõ nét, không bị mờ</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!frontImage || isProcessing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Crop size={18} />
            Tiếp tục - Chọn vùng CCCD
          </button>
        </>
      )}

      {/* Step 2: Crop CCCD Text Area */}
      {step === 2 && (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Crop size={20} className="text-cyan-400" />
                  Di chuyển khung vào vùng thông tin CCCD
                </h3>
                <p className="text-sm text-slate-400 mt-1">Chọn vùng chứa thông tin cá nhân (tên, số CCCD, ngày sinh...)</p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Cropper */}
            <div className="relative h-[500px] bg-slate-900 rounded-xl overflow-hidden border-2 border-cyan-500/30">
              <Cropper
                image={frontPreview}
                crop={crop}
                zoom={zoom}
                aspect={1.586}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="rect"
                showGrid={true}
                style={{
                  containerStyle: {
                    background: '#0f172a'
                  },
                  cropAreaStyle: {
                    border: '2px solid #06b6d4',
                    boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)'
                  }
                }}
              />
              
              {/* Hint overlay */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg bg-slate-900/90 border border-cyan-500/50 text-sm text-cyan-400 z-10">
                ✋ Kéo và zoom để chọn vùng thông tin CCCD
              </div>
              
              {/* Size warning */}
              {croppedAreaPixels && (croppedAreaPixels.width < 200 || croppedAreaPixels.height < 200) && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg bg-red-900/90 border border-red-500/50 text-sm text-red-400 z-10 animate-pulse">
                  ⚠️ Vùng chọn quá nhỏ! Zoom out để chọn vùng lớn hơn
                </div>
              )}
            </div>
            
            {/* Zoom control */}
            <div className="mt-4 flex items-center gap-4">
              <span className="text-sm text-slate-400">Zoom:</span>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-white min-w-[60px]">{(zoom * 100).toFixed(0)}%</span>
            </div>
            
            {/* Brightness control */}
            <div className="mt-3 flex items-center gap-4">
              <span className="text-sm text-slate-400">Độ sáng:</span>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={brightness}
                onChange={(e) => setBrightness(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-white min-w-[60px]">{brightness.toFixed(1)}x</span>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2">
              <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}
          
          <button
            onClick={handleScanOCR}
            disabled={isProcessing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Scan size={18} />
            Quét thông tin CCCD ngay
          </button>
        </>
      )}

      {/* Step 3: Processing */}
      {step === 3 && (
        <div className="flex gap-6">
          {/* Left: Processing Status */}
          <div className="flex-1 text-center py-12">
            <RefreshCw className="animate-spin text-cyan-400 mx-auto mb-4" size={48} />
            <p className="text-lg font-medium text-white mb-2">Đang xử lý CCCD...</p>
            <p className="text-sm text-slate-400 mb-4">{processingStatus || 'Đang chuẩn bị...'}</p>
            
            {/* Progress indicator */}
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Quét OCR & Giải mã</span>
                <span>5-10s</span>
              </div>
              <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          </div>
          
          {/* Right: Image Preview */}
          {frontPreview && (
            <div className="w-96 glass-panel rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">Preview CCCD</span>
                <div className="px-2 py-1 rounded bg-cyan-500/20 border border-cyan-500/50 text-xs text-cyan-400">
                  OCR Scanner
                </div>
              </div>
              
              <div className="relative h-[500px] overflow-hidden bg-slate-900/50 rounded-lg border border-slate-700">
                <img 
                  src={frontPreview} 
                  alt="CCCD Preview" 
                  className="w-full h-full object-contain"
                />
                
                {/* OCR processing indicator */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-xs text-cyan-400 animate-pulse">
                  🔍 Đang quét thông tin CCCD...
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Result */}
      {step === 4 && result && (
        <div>
          {result.data.verification_status === 'verified' ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="text-emerald-400" size={32} />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Xác thực thành công!</h4>
              <div className="bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500">Họ tên:</span>
                    <p className="text-white font-medium">{result.data.full_name}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Số CCCD:</span>
                    <p className="text-white font-medium font-mono">{result.data.cccd_number}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Độ chính xác:</span>
                    <p className="text-emerald-400 font-medium">{(result.data.confidence_score * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-4">Bạn có thể tiếp tục mint Collateral NFT</p>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-amber-400" size={32} />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Cần xác thực thủ công</h4>
              <p className="text-slate-400 mb-4">
                Độ chính xác: {(result.data.confidence_score * 100).toFixed(1)}%
              </p>
              {result.data.missing_fields.length > 0 && (
                <div className="bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
                  <p className="text-sm text-slate-400 mb-2">Các trường thiếu:</p>
                  <ul className="text-sm text-amber-400 space-y-1">
                    {result.data.missing_fields.map((field, i) => (
                      <li key={i}>• {field}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <button
            onClick={resetForm}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            Upload lại
          </button>
        </div>
      )}
    </div>
  );
}
