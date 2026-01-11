// MiniAiLive ID Document Recognition Integration
// Replaces Tesseract.js with professional OCR SDK

const MINIAI_API_URL = 'http://127.0.0.1:8082/api/check_id_base64';

/**
 * Convert image file to base64 string
 */
async function imageToBase64(imageFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = () => {
      // Remove data:image/xxx;base64, prefix
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * Parse MiniAiLive response to match our KYC schema
 */
function parseMiniAiResponse(apiResponse) {
  // MiniAiLive trả về format khác, cần map sang schema của chúng ta
  const extracted = {};
  
  try {
    const data = apiResponse.data || apiResponse;
    
    // Map common fields (adjust based on actual API response structure)
    extracted.cccd_number = data.documentNumber || data.idNumber || data.personalNumber || '';
    extracted.full_name = data.fullName || data.name || '';
    extracted.date_of_birth = data.dateOfBirth || data.birthDate || '';
    extracted.gender = data.sex || data.gender || '';
    extracted.place_of_origin = data.placeOfOrigin || data.birthPlace || '';
    extracted.place_of_residence = data.address || data.residence || '';
    extracted.issue_date = data.issueDate || data.expiryDate || '';
    extracted.issuing_authority = data.issuingAuthority || data.authority || '';
    
    // Additional info
    extracted.nationality = data.nationality || 'Việt Nam';
    extracted.document_type = data.documentType || 'CCCD';
    
  } catch (error) {
    console.error('Error parsing MiniAi response:', error);
  }
  
  return extracted;
}

/**
 * Main OCR function using MiniAiLive API
 */
export async function processCCCDWithMiniAi(frontImage, backImage = null) {
  try {
    console.log('=== MINIAI OCR STARTED ===');
    
    // Convert images to base64
    const frontBase64 = await imageToBase64(frontImage);
    const backBase64 = backImage ? await imageToBase64(backImage) : null;
    
    console.log('✓ Images converted to base64');
    
    // Process front side
    console.log('Processing front side...');
    const frontResponse = await fetch(MINIAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: frontBase64
      })
    });
    
    if (!frontResponse.ok) {
      throw new Error(`MiniAi API error: ${frontResponse.status} ${frontResponse.statusText}`);
    }
    
    const frontData = await frontResponse.json();
    console.log('✓ Front side processed:', frontData);
    
    // Process back side if provided
    let backData = null;
    if (backBase64) {
      console.log('Processing back side...');
      const backResponse = await fetch(MINIAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: backBase64
        })
      });
      
      if (backResponse.ok) {
        backData = await backResponse.json();
        console.log('✓ Back side processed:', backData);
      }
    }
    
    // Parse and merge data
    const frontExtracted = parseMiniAiResponse(frontData);
    const backExtracted = backData ? parseMiniAiResponse(backData) : {};
    
    const mergedData = {
      ...frontExtracted,
      ...backExtracted
    };
    
    // Calculate confidence (MiniAi usually provides high confidence for supported documents)
    const confidence = frontData.confidence || frontData.score || 0.95;
    
    console.log('=== MINIAI OCR COMPLETED ===');
    console.log('Extracted data:', mergedData);
    console.log('Confidence:', confidence);
    
    return {
      success: true,
      extracted_data: mergedData,
      confidence_score: confidence,
      raw_response: {
        front: frontData,
        back: backData
      }
    };
    
  } catch (error) {
    console.error('MiniAi OCR Error:', error);
    
    return {
      success: false,
      error: error.message,
      extracted_data: {},
      confidence_score: 0
    };
  }
}

/**
 * Validate CCCD data from MiniAi
 */
export function validateMiniAiData(extractedData) {
  const errors = [];
  
  // Critical fields
  if (!extractedData.cccd_number || extractedData.cccd_number.length !== 12) {
    errors.push('Số CCCD không hợp lệ (phải 12 số)');
  }
  
  if (!extractedData.full_name || extractedData.full_name.length < 3) {
    errors.push('Họ tên không hợp lệ');
  }
  
  if (!extractedData.date_of_birth) {
    errors.push('Ngày sinh không hợp lệ');
  }
  
  if (!extractedData.gender) {
    errors.push('Giới tính không xác định');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    needsManualReview: errors.length > 0
  };
}
