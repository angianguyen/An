'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, CheckCircle2, AlertTriangle, ShieldCheck, X, FileText, Scan } from 'lucide-react';
import { processCCCD } from '@/utils/ocrCCCDv2';
import { enhanceImageForOCR } from '@/utils/imageEnhance';

export default function KYCUpload({ walletAddress, onVerified }) {
  const [step, setStep] = useState(1); // 1: upload, 2: processing, 3: result
  const [frontImage, setFrontImage] = useState(null);
  const [frontPreview, setFrontPreview] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null); // {x, y, width, height}
  const [croppedPreview, setCroppedPreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  const imageRef = useRef(null);
  const scanButtonRef = useRef(null);

  // Auto-scroll to scan button when preview is ready
  useEffect(() => {
    if (croppedPreview && scanButtonRef.current) {
      setTimeout(() => {
        scanButtonRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);
    }
  }, [croppedPreview]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    // Verify file is a valid Blob before reading
    if (!(file instanceof Blob)) {
      setError('File không hợp lệ');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFrontImage(file);
      setFrontPreview(reader.result);
      setSelectedArea(null);
      setCroppedPreview(null);
      setError('');
    };
    reader.onerror = () => {
      setError('Không thể đọc file ảnh');
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsSelecting(true);
    setSelectionStart({ x, y });
    setSelectionEnd({ x, y });
  };

  const handleMouseMove = (e) => {
    if (!isSelecting || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    
    setSelectionEnd({ x, y });
  };

  const handleMouseUp = async () => {
    if (!isSelecting || !selectionStart || !selectionEnd) return;
    
    setIsSelecting(false);
    
    const x = Math.min(selectionStart.x, selectionEnd.x);
    const y = Math.min(selectionStart.y, selectionEnd.y);
    const width = Math.abs(selectionEnd.x - selectionStart.x);
    const height = Math.abs(selectionEnd.y - selectionStart.y);
    
    // Minimum selection size
    if (width < 50 || height < 30) {
      setError('Vùng chọn quá nhỏ, vui lòng chọn lại');
      setSelectionStart(null);
      setSelectionEnd(null);
      return;
    }
    
    const area = { x, y, width, height };
    setSelectedArea(area);
    
    // Create cropped preview
    try {
      const cropped = await createCroppedPreview(area);
      setCroppedPreview(cropped);
      setError('');
    } catch (err) {
      console.error('Error creating preview:', err);
      setError('Không thể tạo preview');
    }
  };

  const createCroppedPreview = async (area) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const imageElement = imageRef.current;
        const scaleX = img.naturalWidth / imageElement.clientWidth;
        const scaleY = img.naturalHeight / imageElement.clientHeight;
        
        // Set canvas to cropped size with 3x scaling
        canvas.width = area.width * scaleX * 3;
        canvas.height = area.height * scaleY * 3;
        
        ctx.drawImage(
          img,
          area.x * scaleX,
          area.y * scaleY,
          area.width * scaleX,
          area.height * scaleY,
          0,
          0,
          canvas.width,
          canvas.height
        );
        
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.src = frontPreview;
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

    if (!croppedPreview) {
      setError('Vui lòng chọn vùng cần quét');
      return;
    }

    setIsProcessing(true);
    setStep(2);
    setError('');

    try {
      console.log('=== OCR SCAN START ===');
      setProcessingStatus('📸 Đang tăng cường ảnh...');
      
      const enhancedImage = await enhanceImageForOCR(croppedPreview);
      
      setProcessingStatus('🔍 Đang quét số CCCD...');
      console.log('Running OCR with NUMBER ONLY mode...');
      
      const ocrResult = await processCCCD(enhancedImage, null, { numberOnly: true });
      
      console.log('📋 OCR Result:', ocrResult);
      
      // Validate CCCD number - must be 12 digits
      const cccdNumber = ocrResult.extracted_data?.cccd_number;
      
      if (!ocrResult.success || !cccdNumber) {
        throw new Error('Không thể đọc số CCCD. Vui lòng chọn vùng khác hoặc chụp lại.');
      }
      
      // Remove all non-digit characters
      const cleanNumber = cccdNumber.replace(/\D/g, '');
      
      // Check if exactly 12 digits
      if (cleanNumber.length !== 12) {
        throw new Error(`Số CCCD không hợp lệ (${cleanNumber.length} số). Cần đúng 12 chữ số. Vui lòng chọn vùng rõ hơn.`);
      }
      
      // Update with clean number
      ocrResult.extracted_data.cccd_number = cleanNumber;
      
      console.log('✓ CCCD number validated:', cleanNumber);
      
      await processOCRResult(ocrResult);
      
    } catch (err) {
      console.error('OCR Error:', err);
      setError(err.message || 'Có lỗi xảy ra khi quét CCCD');
      setStep(1);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };
  
  const processOCRResult = async (ocrResult) => {
    setProcessingStatus('✓ Quét thành công! Đang lưu dữ liệu...');
    
    console.log('=== SENDING TO API ===');
    console.log('Wallet:', walletAddress);
    console.log('OCR Result:', JSON.stringify(ocrResult, null, 2));
    
    const response = await fetch('/api/kyc/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        walletAddress,
        ocrData: ocrResult
      })
    });

    const data = await response.json();
    console.log('=== API RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('API Error:', data);
      throw new Error(data.error || data.details || 'Xác thực thất bại');
    }

    setResult(data);
    setStep(3);

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
          <p className="text-sm text-slate-400">Upload CCCD để quét số căn cước</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3">
          <AlertTriangle className="text-rose-400" size={20} />
          <p className="text-sm text-rose-400">{error}</p>
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <FileText size={18} className="text-cyan-400" />
              Mặt trước CCCD
            </label>
            <div className="relative">
              {frontPreview ? (
                <div className="space-y-4">
                  {/* Image with selection */}
                  <div className="relative">
                    <div 
                      className="relative rounded-xl overflow-hidden border-2 border-cyan-500/30 cursor-crosshair bg-slate-900"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={() => {
                        if (isSelecting) {
                          handleMouseUp();
                        }
                      }}
                    >
                      <img 
                        ref={imageRef}
                        src={frontPreview} 
                        alt="CCCD" 
                        className="w-full h-auto select-none"
                        draggable={false}
                      />
                      
                      {/* Selection rectangle */}
                      {isSelecting && selectionStart && selectionEnd && (
                        <div
                          className="absolute border-2 border-cyan-400 bg-cyan-400/20"
                          style={{
                            left: Math.min(selectionStart.x, selectionEnd.x),
                            top: Math.min(selectionStart.y, selectionEnd.y),
                            width: Math.abs(selectionEnd.x - selectionStart.x),
                            height: Math.abs(selectionEnd.y - selectionStart.y),
                          }}
                        />
                      )}
                      
                      {/* Show selected area */}
                      {selectedArea && !isSelecting && (
                        <div
                          className="absolute border-2 border-green-400 bg-green-400/10"
                          style={{
                            left: selectedArea.x,
                            top: selectedArea.y,
                            width: selectedArea.width,
                            height: selectedArea.height,
                          }}
                        >
                          <div className="absolute -top-6 left-0 px-2 py-1 bg-green-500 text-white text-xs rounded">
                            ✓ Đã chọn
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        setFrontImage(null);
                        setFrontPreview('');
                        setSelectedArea(null);
                        setCroppedPreview(null);
                        setSelectionStart(null);
                        setSelectionEnd(null);
                      }}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-slate-900/90 text-slate-400 hover:text-white transition border border-slate-700"
                    >
                      <X size={16} />
                    </button>
                    
                    {!selectedArea && (
                      <div className="absolute bottom-2 left-2 px-3 py-1.5 rounded-lg bg-slate-900/90 text-xs text-cyan-400 border border-cyan-500/30">
                        🖱️ Kéo chuột để chọn vùng có số CCCD
                      </div>
                    )}
                  </div>
                  
                  {/* Cropped Preview */}
                  {croppedPreview && (
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-green-500/30 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-400">Vùng đã chọn (Phóng to 3x)</span>
                      </div>
                      
                      <div className="relative bg-slate-900 rounded-lg overflow-hidden border-2 border-green-500/30">
                        <img 
                          src={croppedPreview} 
                          alt="Cropped preview" 
                          className="w-full h-auto"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                          ✓ Vùng này sẽ được quét để lấy số CCCD
                        </p>
                        <button
                          onClick={() => {
                            setSelectedArea(null);
                            setCroppedPreview(null);
                            setSelectionStart(null);
                            setSelectionEnd(null);
                          }}
                          className="text-xs text-cyan-400 hover:text-cyan-300"
                        >
                          Chọn lại
                        </button>
                      </div>

                      {/* Scan Button - Inside Preview Box */}
                      <div className="pt-2 space-y-2">
                        <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
                          <p className="text-xs text-green-400 font-medium">
                            ⬇️ Sẵn sàng quét! Nhấn nút bên dưới
                          </p>
                        </div>
                        
                        <button
                          ref={scanButtonRef}
                          type="button"
                          onClick={handleScanOCR}
                          disabled={isProcessing}
                          className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/50"
                        >
                          <Scan size={24} />
                          QUÉT SỐ CCCD NGAY
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-700 rounded-xl hover:border-cyan-500/50 transition cursor-pointer bg-slate-800/30">
                  <FileText className="text-cyan-500 mb-2" size={48} />
                  <span className="text-sm text-slate-400">Click để upload mặt trước CCCD</span>
                  <span className="text-xs text-slate-500 mt-1">Đảm bảo ảnh CCCD rõ nét</span>
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
      )}

      {/* Step 2: Processing */}
      {step === 2 && (
        <div className="text-center py-8">
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 opacity-20 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-slate-900 flex items-center justify-center">
              <Scan className="text-cyan-400 animate-pulse" size={32} />
            </div>
          </div>
          <h4 className="text-xl font-bold text-white mb-2">Đang xử lý...</h4>
          <p className="text-slate-400 text-sm mb-6">{processingStatus}</p>
          
          {frontPreview && (
            <div className="mt-6">
              <div className="relative h-[400px] overflow-hidden bg-slate-900/50 rounded-lg border border-slate-700">
                <img 
                  src={frontPreview} 
                  alt="Processing" 
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/50 text-xs text-cyan-400 animate-pulse">
                  🔍 Đang quét...
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Result */}
      {step === 3 && result && (
        <div>
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="text-emerald-400" size={32} />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Quét thành công!</h4>
            <div className="bg-slate-800/50 rounded-xl p-6 mb-6 text-center">
              <div className="space-y-2">
                <span className="text-slate-400 text-sm">Số CCCD</span>
                <p className="text-white font-bold font-mono text-3xl tracking-wider">{result.data.cccd_number}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-500">Trạng thái: </span>
                <span className="text-emerald-400 font-medium">✓ Đã xác thực</span>
              </div>
            </div>
          </div>

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
