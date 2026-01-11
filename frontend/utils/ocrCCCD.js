// OCR CCCD Utilities - CLIENT-SIDE ONLY
import { parseMRZ } from './mrzParser';

/**
 * Extract text from CCCD image using Tesseract.js (CLIENT-SIDE ONLY)
 */
export async function extractTextFromImage(imageBuffer) {
  // Ensure running in browser
  if (typeof window === 'undefined') {
    throw new Error('OCR can only run in browser');
  }

  try {
    // Dynamic import
    const Tesseract = (await import('tesseract.js')).default;
    
    const { data: { text, confidence } } = await Tesseract.recognize(
      imageBuffer,
      'vie', // Vietnamese language
      {
        logger: (m) => console.log(m)
      }
    );

    return {
      text: text.trim(),
      confidence: confidence / 100 // Convert to 0-1
    };
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image: ' + error.message);
  }
}

/**
 * Parse CCCD front side
 */
export function parseCCCDFront(text) {
  console.log('=== RAW TEXT FROM FRONT SIDE ===');
  console.log(text);
  console.log('=================================');

  const data = {
    cccd_number: '',
    full_name: '',
    date_of_birth: '',
    gender: '',
    nationality: 'Việt Nam',
    place_of_origin: ''
  };

  // Normalize text: remove extra spaces, normalize newlines
  const normalizedText = text.replace(/\s+/g, ' ').trim();

  // Extract CCCD Number (12 digits, anywhere in text)
  const cccdMatch = normalizedText.match(/\b(\d{12})\b/);
  if (cccdMatch) {
    data.cccd_number = cccdMatch[1];
    console.log('Found CCCD:', cccdMatch[1]);
  }

  // Extract Name - try multiple patterns, AVOID matching header text
  let nameMatch = null;
  
  // Pattern 1: After "Họ và tên" label
  nameMatch = normalizedText.match(/(?:Họ\s*và\s*tên|Full\s*name)[:\s\/]+([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]+(?:\s+[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]+)+)/i);
  
  if (!nameMatch) {
    // Pattern 2: Look for Vietnamese name pattern (2-4 words, all caps, NOT containing common header words)
    const lines = text.split('\n');
    for (const line of lines) {
      // Skip lines with header keywords
      if (/CỘNG\s*HÒA|SOCIALIST|CĂN\s*CƯỚC|Citizen|Identity/i.test(line)) continue;
      
      // Look for capitalized Vietnamese name (2-4 words)
      const match = line.match(/\b([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]{2,})(\s+[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]{2,}){1,3}\b/);
      
      if (match && match[0].length >= 6 && match[0].length <= 30) {
        nameMatch = match;
        break;
      }
    }
  }
  
  if (nameMatch) {
    data.full_name = nameMatch[0] || nameMatch[1];
    data.full_name = data.full_name.trim();
    console.log('Found Name:', data.full_name);
  }

  // Extract Date of Birth - flexible format
  const dobMatch = normalizedText.match(/(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/);
  if (dobMatch) {
    data.date_of_birth = dobMatch[1].replace(/[\-\.]/g, '/');
    console.log('Found DOB:', data.date_of_birth);
  }

  // Extract Gender - case insensitive, flexible spacing
  if (/\bNam\b/i.test(normalizedText) && !/Việt\s*Nam/i.test(normalizedText.slice(normalizedText.toLowerCase().indexOf('nam')))) {
    data.gender = 'Nam';
    console.log('Found Gender: Nam');
  } else if (/\bNữ\b/i.test(normalizedText)) {
    data.gender = 'Nữ';
    console.log('Found Gender: Nữ');
  }

  // Extract Place of Origin - everything after "Quê quán" until next label or newline
  const originMatch = normalizedText.match(/(?:Quê\s*quán|Place\s*of\s*origin)[:\s\/]*([^:\/\n]+?)(?:Nơi\s*thường\s*trú|Place\s*of\s*residence|$)/i);
  if (originMatch) {
    data.place_of_origin = originMatch[1].trim().replace(/\s+/g, ' ');
    console.log('Found Origin:', data.place_of_origin);
  }

  console.log('Parsed Front Data:', data);
  return data;
}

/**
 * Parse CCCD back side
 */
export function parseCCCDBack(text) {
  console.log('=== RAW TEXT FROM BACK SIDE ===');
  console.log(text);
  console.log('================================');

  const data = {
    place_of_residence: '',
    issue_date: '',
    issuing_authority: ''
  };

  // Normalize text
  const normalizedText = text.replace(/\s+/g, ' ').trim();

  // Extract Place of Residence - flexible pattern
  const residenceMatch = normalizedText.match(/(?:Nơi\s*thường\s*trú|Place\s*of\s*residence)[:\s\/]*([^:\/]+?)(?:Ngày|Date|$)/i);
  if (residenceMatch) {
    data.place_of_residence = residenceMatch[1].trim().replace(/\s+/g, ' ');
    console.log('Found Residence:', data.place_of_residence);
  }

  // Extract Issue Date - flexible format
  const issueDateMatch = normalizedText.match(/(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/);
  if (issueDateMatch) {
    data.issue_date = issueDateMatch[1].replace(/[\-\.]/g, '/');
    console.log('Found Issue Date:', data.issue_date);
  }

  // Extract Issuing Authority
  const authorityMatch = normalizedText.match(/(?:Cục|Công\s*an)/i);
  if (authorityMatch) {
    // Try to get full authority text
    const fullAuthorityMatch = normalizedText.match(/([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][^\n]+?(?:Cục|cục|CỤC)[^\n]+)/i);
    if (fullAuthorityMatch) {
      data.issuing_authority = fullAuthorityMatch[1].trim();
    } else {
      data.issuing_authority = 'Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư';
    }
    console.log('Found Authority:', data.issuing_authority);
  }

  console.log('Parsed Back Data:', data);
  return data;
}

/**
 * Validate CCCD format - RELAXED validation
 */
export function validateCCCD(data) {
  const missingFields = [];

  // Only validate CRITICAL fields for format_valid
  if (!data.cccd_number || !/^\d{12}$/.test(data.cccd_number)) {
    missingFields.push('cccd_number');
  }

  if (!data.full_name || data.full_name.trim() === '') {
    missingFields.push('full_name');
  }

  if (!data.date_of_birth || !/\d{2}\/\d{2}\/\d{4}/.test(data.date_of_birth)) {
    missingFields.push('date_of_birth');
  }

  if (!data.gender || (data.gender !== 'Nam' && data.gender !== 'Nữ')) {
    missingFields.push('gender');
  }

  // Optional fields - track but don't invalidate
  const optionalMissing = [];
  if (!data.place_of_origin) optionalMissing.push('place_of_origin');
  if (!data.place_of_residence) optionalMissing.push('place_of_residence');
  if (!data.issue_date) optionalMissing.push('issue_date');
  if (!data.issuing_authority) optionalMissing.push('issuing_authority');

  // Only fail if critical fields are missing
  const criticalMissing = missingFields.filter(f => 
    ['cccd_number', 'full_name', 'date_of_birth', 'gender'].includes(f)
  );

  console.log('Validation:', {
    critical_missing: criticalMissing,
    optional_missing: optionalMissing,
    format_valid: criticalMissing.length === 0
  });

  return {
    format_valid: criticalMissing.length === 0,
    missing_fields: [...criticalMissing, ...optionalMissing], // Report all but only fail on critical
    critical_missing: criticalMissing
  };
}

/**
 * Process both front and back CCCD images
 */
export async function processCCCD(frontImage, backImage) {
  try {
    console.log('=== PROCESSING CCCD ===');
    
    // Extract text from both images
    const [frontResult, backResult] = await Promise.all([
      extractTextFromImage(frontImage),
      extractTextFromImage(backImage)
    ]);

    console.log('Front confidence:', frontResult.confidence);
    console.log('Back confidence:', backResult.confidence);

    // Try MRZ parsing first (most accurate!)
    console.log('Attempting MRZ parse on front image...');
    const mrzData = parseMRZ(frontResult.text);
    
    let extractedData = {};
    let confidence = 0;
    
    if (mrzData && mrzData.cccd_number && mrzData.full_name) {
      // MRZ success! Use MRZ data
      console.log('✅ MRZ parsing successful! Using MRZ data.');
      extractedData = {
        cccd_number: mrzData.cccd_number,
        full_name: mrzData.full_name,
        date_of_birth: mrzData.date_of_birth,
        gender: mrzData.gender,
        nationality: mrzData.nationality || 'Việt Nam',
        place_of_origin: '', 
        place_of_residence: '',
        issue_date: '',
        issuing_authority: ''
      };
      confidence = 0.95;
      
      // Try to get additional fields from OCR text
      const frontData = parseCCCDFront(frontResult.text);
      if (frontData.place_of_origin) {
        extractedData.place_of_origin = frontData.place_of_origin;
      }
      
      const backData = parseCCCDBack(backResult.text);
      if (backData.place_of_residence) {
        extractedData.place_of_residence = backData.place_of_residence;
      }
      if (backData.issue_date) {
        extractedData.issue_date = backData.issue_date;
      }
      if (backData.issuing_authority) {
        extractedData.issuing_authority = backData.issuing_authority;
      }
      
    } else {
      // MRZ failed, fallback to regular OCR
      console.log('⚠️ MRZ failed, using regular OCR...');
      const frontData = parseCCCDFront(frontResult.text);
      const backData = parseCCCDBack(backResult.text);

      extractedData = {
        ...frontData,
        ...backData
      };
      
      confidence = (frontResult.confidence + backResult.confidence) / 2;
    }

    // Validate
    const validation = validateCCCD(extractedData);

    console.log('=== FINAL OCR RESULT ===');
    console.log('Confidence:', confidence);
    console.log('Valid:', validation.format_valid);
    console.log('Missing:', validation.missing_fields);
    console.log('Data:', extractedData);
    console.log('========================');

    return {
      extracted_data: extractedData,
      format_valid: validation.format_valid,
      missing_fields: validation.missing_fields,
      confidence_score: confidence
    };
  } catch (error) {
    console.error('CCCD Processing Error:', error);
    throw error;
  }
}
