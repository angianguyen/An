/**
 * IMPROVED CCCD OCR với Region-Based Extraction
 * Tinh chỉnh để đạt độ chính xác cao hơn
 */

/**
 * Extract text from specific region với Tesseract.js
 */
async function extractTextFromRegion(imageBuffer, region = null, lang = 'vie', psm = 6) {
  try {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker(lang);
    
    await worker.setParameters({
      tessedit_pageseg_mode: psm,
      tessedit_char_whitelist: psm === 7 ? '0123456789' : undefined,
    });
    
    const { data } = await worker.recognize(imageBuffer);
    await worker.terminate();
    
    return {
      text: data.text,
      confidence: data.confidence / 100
    };
  } catch (error) {
    console.error('Tesseract error:', error);
    return { text: '', confidence: 0 };
  }
}

/**
 * Parse CCCD front với smart text processing
 */
async function parseCCCDFrontSmart(imageBuffer, fullText, numberOnly = false) {
  console.log('📍 Smart parsing CCCD...', numberOnly ? '(NUMBER ONLY MODE)' : '');
  
  // Only log full text in normal mode (not numberOnly)
  if (!numberOnly) {
    console.log('Full OCR text:', fullText);
  }
  
  const extracted = {};
  const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  if (!numberOnly) {
    console.log('Lines:', lines);
  }
  
  // Clean common OCR errors
  let cleanText = fullText
    .replace(/CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM/gi, '')
    .replace(/CÒNG HÒA XÃ HỘI/gi, '')
    .replace(/CĂN CƯỚC CÔNG DÂN/gi, '')
    .replace(/SOCIALIST REPUBLIC/gi, '')
    .replace(/Citizen Identity Card/gi, '')
    .replace(/ĐỘC LẬP - TỰ DO - HẠNH PHÚC/gi, '');
  
  // STEP 1: Extract CCCD number (12 digits, usually has label "Số" or "No.")
  console.log('\n🔍 Extracting CCCD number...');
  
  // If numberOnly mode, use more aggressive extraction
  if (numberOnly) {
    console.log('  🎯 NUMBER ONLY MODE - Extracting all digits...');
    // Extract all digit sequences
    const allDigits = cleanText.match(/\d+/g) || [];
    console.log('  📊 Found digit sequences:', allDigits);
    
    // Find 12-digit sequence
    const twelveDigit = allDigits.find(d => d.length === 12);
    if (twelveDigit) {
      extracted.cccd_number = twelveDigit;
      console.log('  ✅ Found 12-digit CCCD:', extracted.cccd_number);
      return extracted; // Return immediately in number-only mode
    }
    
    // Try to combine adjacent digits to make 12
    for (let i = 0; i < allDigits.length - 1; i++) {
      const combined = allDigits.slice(i, i + 2).join('');
      if (combined.length === 12) {
        extracted.cccd_number = combined;
        console.log('  ✅ Found combined CCCD:', extracted.cccd_number);
        return extracted;
      }
    }
    
    // Last resort: clean all text and extract digits
    const cleanedDigits = cleanText.replace(/\D/g, '');
    if (cleanedDigits.length >= 12) {
      extracted.cccd_number = cleanedDigits.substring(0, 12);
      console.log('  ✅ Extracted first 12 digits:', extracted.cccd_number);
      return extracted;
    }
    
    // If no number found in numberOnly mode, return empty immediately
    console.log('  ❌ No CCCD number found in NUMBER ONLY mode');
    return extracted; // Return empty result, don't extract other fields
  }
  
  // Normal extraction patterns
  const cccdPatterns = [
    /(?:Số|No\.?|ID)[:\s\/]*(\d{12})/i,  // With label
    /\b(\d{12})\b/,  // Standalone 12 digits
  ];
  
  for (const pattern of cccdPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      extracted.cccd_number = match[1];
      console.log('  ✅ Found CCCD:', extracted.cccd_number);
      break;
    }
  }
  
  // STEP 2: Extract full name (UPPERCASE Vietnamese, 2-5 words, after "Họ và tên")
  console.log('\n🔍 Extracting full name...');
  
  // Find line with "Họ và tên" or "Full name"
  const nameLineIndex = lines.findIndex(l => /Họ và tên|Full name/i.test(l));
  
  if (nameLineIndex >= 0) {
    // Name might be on same line or next line
    let nameLine = lines[nameLineIndex];
    
    // Try extract from same line first
    const sameLine = nameLine.replace(/Họ và tên[:\s]*/i, '').replace(/Full name[:\s]*/i, '').trim();
    if (sameLine.length > 0 && /^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ\s]+$/.test(sameLine)) {
      extracted.full_name = sameLine.toUpperCase().trim();
      console.log('  ✅ Found name (same line):', extracted.full_name);
    } else if (nameLineIndex < lines.length - 1) {
      // Try next line
      const nextLine = lines[nameLineIndex + 1];
      if (/^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ\s]+$/.test(nextLine) && nextLine.length > 5) {
        extracted.full_name = nextLine.toUpperCase().trim();
        console.log('  ✅ Found name (next line):', extracted.full_name);
      }
    }
  }
  
  // Fallback: Find line with all uppercase Vietnamese letters (2-5 words)
  if (!extracted.full_name) {
    console.log('  ⚠️ Trying fallback name extraction...');
    for (const line of lines) {
      // Skip header lines
      if (/CỘNG|HÒA|XÃ|HỘI|CÔNG DÂN|IDENTITY|CARD|REPUBLIC/i.test(line)) continue;
      
      // Check if line is all uppercase Vietnamese (potential name)
      if (/^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ\s]+$/.test(line)) {
        const words = line.trim().split(/\s+/);
        if (words.length >= 2 && words.length <= 5 && line.length >= 8) {
          extracted.full_name = line.toUpperCase().trim();
          console.log('  ✅ Found name (fallback):', extracted.full_name);
          break;
        }
      }
    }
  }
  
  // STEP 3: Extract date of birth (format: DD/MM/YYYY or similar)
  console.log('\n🔍 Extracting date of birth...');
  
  const dobPatterns = [
    /(?:Ngày sinh|Date of birth|birth)[:\s]*(\d{1,2})[\s\/\-\.](\d{1,2})[\s\/\-\.](\d{2,4})/i,
    /\b(\d{1,2})[\s\/\-\.](\d{1,2})[\s\/\-\.](\d{4})\b/,  // DD/MM/YYYY format
  ];
  
  for (const pattern of dobPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      let year = match[3];
      
      // Convert 2-digit year to 4-digit
      if (year.length === 2) {
        year = parseInt(year) > 30 ? `19${year}` : `20${year}`;
      }
      
      // Validate date
      const d = parseInt(day);
      const m = parseInt(month);
      if (d >= 1 && d <= 31 && m >= 1 && m <= 12) {
        extracted.date_of_birth = `${day}/${month}/${year}`;
        console.log('  ✅ Found DOB:', extracted.date_of_birth);
        break;
      }
    }
  }
  
  // STEP 4: Extract gender
  console.log('\n🔍 Extracting gender...');
  
  const genderPatterns = [
    /(?:Giới tính|Sex)[:\s]*(Nam|Nữ|Male|Female|M|F|Ngm)/i,
    /\b(Nam|Nữ|Male|Female)\b/i,
  ];
  
  for (const pattern of genderPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      const g = match[1].toUpperCase();
      if (/NAM|M|MALE|NGM/.test(g)) {
        extracted.gender = 'Nam';
        console.log('  ✅ Found gender: Nam');
        break;
      } else if (/NỮ|F|FEMALE/.test(g)) {
        extracted.gender = 'Nữ';
        console.log('  ✅ Found gender: Nữ');
        break;
      }
    }
  }
  
  // Fallback: standalone gender words
  if (!extracted.gender) {
    if (/\b(Nam|Ngm)\b/i.test(fullText)) {
      extracted.gender = 'Nam';
      console.log('  ✅ Found gender: Nam (standalone)');
    } else if (/\bNữ\b/i.test(fullText)) {
      extracted.gender = 'Nữ';
      console.log('  ✅ Found gender: Nữ (standalone)');
    }
  }
  
  // Extract nationality (optional)
  const nationalityMatch = fullText.match(/(?:Quốc tịch|Nationality)[:\s]*([^\n]+)/i);
  if (nationalityMatch) {
    extracted.nationality = nationalityMatch[1].trim();
    console.log('  ✅ Nationality:', extracted.nationality);
  }
  
  // Extract place of origin (optional)
  const originMatch = fullText.match(/(?:Quê quán|Place of origin)[:\s]*([^\n]+)/i);
  if (originMatch) {
    extracted.place_of_origin = originMatch[1].trim();
    console.log('  ✅ Origin:', extracted.place_of_origin);
  }
  
  // Extract place of residence (optional)
  const residenceMatch = fullText.match(/(?:Nơi thường trú|Place of residence)[:\s]*([^\n]+(?:\n[^\n]+)?)/i);
  if (residenceMatch) {
    extracted.place_of_residence = residenceMatch[1].replace(/\n/g, ' ').trim();
    console.log('  ✅ Residence:', extracted.place_of_residence);
  }
  
  console.log('\n📊 Extraction summary:', extracted);
  return extracted;
}

/**
 * Parse CCCD back side
 */
function parseCCCDBack(text) {
  console.log('📍 Parsing back side...');
  const extracted = {};
  
  // Extract issue date
  const issueDateMatch = text.match(/(?:Ngày|Date)[:\s]*(\d{2}[\s\/\-\.]\d{2}[\s\/\-\.]\d{4})/i);
  if (issueDateMatch) {
    extracted.issue_date = issueDateMatch[1].replace(/[\s\-\.]/g, '/');
    console.log('  ✓ Issue date:', extracted.issue_date);
  }
  
  // Extract issuing authority
  const authorityMatch = text.match(/(?:Cơ quan|Authority)[:\s]*([^\n]+)/i);
  if (authorityMatch) {
    extracted.issuing_authority = authorityMatch[1].trim();
    console.log('  ✓ Authority:', extracted.issuing_authority);
  }
  
  return extracted;
}

/**
 * Validate CCCD data
 */
function validateCCCD(data) {
  const critical = ['cccd_number', 'full_name', 'date_of_birth', 'gender'];
  const optional = ['nationality', 'place_of_origin', 'place_of_residence', 'issue_date'];
  
  const missing = [];
  
  // Check critical fields
  critical.forEach(field => {
    if (!data[field]) {
      missing.push(field);
    }
  });
  
  return {
    valid: missing.length === 0,
    missing,
    optional_missing: optional.filter(f => !data[f])
  };
}

/**
 * Main processing function
 */
export async function processCCCD(frontImageBuffer, backImageBuffer, options = {}) {
  const { numberOnly = false } = options;
  console.log('=== IMPROVED CCCD PROCESSING ===');
  console.log('Strategy: MRZ First → Regex Fallback → Validation');
  console.log('Number Only Mode:', numberOnly);
  console.log('Image buffer type:', typeof frontImageBuffer);
  console.log('Image buffer preview:', frontImageBuffer?.substring?.(0, 100));
  
  try {
    // Extract full text first
    console.log('\n📸 Processing front side...');
    const { createWorker } = await import('tesseract.js');
    
    // Use optimized config for number-only mode
    if (numberOnly) {
      console.log('🔢 Using NUMBER OPTIMIZED config (eng, PSM 8, digits only)');
      const worker = await createWorker('eng', 1, {
        logger: m => console.log(m)
      });
      
      await worker.setParameters({
        tessedit_pageseg_mode: '7', // Single text line (standard for ID numbers)
        tessedit_char_whitelist: '0123456789', // Only digits
        tessedit_ocr_engine_mode: '1', // Neural nets LSTM only (best accuracy)
      });
      
      const { data } = await worker.recognize(frontImageBuffer);
      await worker.terminate();
      
      const fullText = data.text;
      console.log('📊 Extracted digits:', fullText.trim());
      console.log('Raw confidence:', (data.confidence / 100).toFixed(2));
      
      const frontData = await parseCCCDFrontSmart(frontImageBuffer, fullText, numberOnly);
      
      return {
        success: frontData.cccd_number ? true : false,
        extracted_data: frontData,
        confidence: data.confidence / 100,
        missing_fields: frontData.cccd_number ? [] : ['cccd_number'],
        format_valid: frontData.cccd_number ? true : false
      };
    }
    
    // Normal mode with Vietnamese language
    const worker = await createWorker('vie');
    const { data } = await worker.recognize(frontImageBuffer);
    await worker.terminate();
    
    const fullText = data.text;
    console.log('Full text extracted, length:', fullText.length);
    console.log('Raw confidence:', (data.confidence / 100).toFixed(2));
    console.log('=== RAW OCR TEXT START ===');
    console.log(fullText);
    console.log('=== RAW OCR TEXT END ===');
    
    // Parse with smart logic
    const frontData = await parseCCCDFrontSmart(frontImageBuffer, fullText, numberOnly);
    
    // Process back side if available
    let backData = {};
    if (backImageBuffer) {
      console.log('\n📸 Processing back side...');
      const backWorker = await createWorker('vie');
      const { data: backFullData } = await backWorker.recognize(backImageBuffer);
      await backWorker.terminate();
      
      backData = parseCCCDBack(backFullData.text);
    }
    
    // Merge data
    const mergedData = {
      ...frontData,
      ...backData
    };
    
    console.log('\n✅ Extraction complete!');
    console.log('Extracted fields:', Object.keys(mergedData).filter(k => mergedData[k]));
    
    // Validate
    const validation = validateCCCD(mergedData);
    
    // Calculate confidence - ONLY check CCCD number
    const criticalFields = ['cccd_number']; // Only require CCCD number
    const extractedCritical = criticalFields.filter(f => mergedData[f]).length;
    const confidence = extractedCritical / criticalFields.length;
    
    console.log(`\n📊 Results:`);
    console.log(`  - Confidence: ${(confidence * 100).toFixed(1)}%`);
    console.log(`  - Critical fields: ${extractedCritical}/${criticalFields.length}`);
    console.log(`  - CCCD Number: ${mergedData.cccd_number || 'NOT FOUND'}`);
    console.log(`  - Format valid: ${validation.valid}`);
    
    // Filter missing fields - only show missing CCCD number
    const missingCritical = criticalFields.filter(f => !mergedData[f]);
    
    if (missingCritical.length > 0) {
      console.warn(`  ⚠️ Missing critical: ${missingCritical.join(', ')}`);
    }
    
    return {
      success: mergedData.cccd_number ? true : false, // Success if CCCD found
      extracted_data: mergedData,
      confidence_score: confidence,
      format_valid: validation.valid,
      missing_fields: missingCritical // Only show missing critical fields
    };
    
  } catch (error) {
    console.error('❌ Processing error:', error);
    return {
      success: false,
      error: error.message,
      extracted_data: {},
      confidence_score: 0,
      format_valid: false,
      missing_fields: []
    };
  }
}
