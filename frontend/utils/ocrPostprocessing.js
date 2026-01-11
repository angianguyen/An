/**
 * STEP 5: Post-processing & Validation
 * Sửa lỗi OCR + Validate logic
 */

/**
 * Fix common OCR errors
 */
export function fixOCRErrors(text) {
  if (!text) return text;
  
  return text
    // Common OCR mistakes
    .replace(/[Oo]/g, (match, offset, string) => {
      // If surrounded by digits, likely should be 0
      const before = string[offset - 1];
      const after = string[offset + 1];
      if (/\d/.test(before) || /\d/.test(after)) {
        return '0';
      }
      return match;
    })
    .replace(/[Il|]/g, (match, offset, string) => {
      // If surrounded by digits, likely should be 1
      const before = string[offset - 1];
      const after = string[offset + 1];
      if (/\d/.test(before) || /\d/.test(after)) {
        return '1';
      }
      return match;
    })
    .replace(/[Ss]/g, (match, offset, string) => {
      // If surrounded by digits, might be 5
      const before = string[offset - 1];
      const after = string[offset + 1];
      if (/\d/.test(before) && /\d/.test(after)) {
        return '5';
      }
      return match;
    })
    .replace(/[Zz]/g, (match, offset, string) => {
      // If surrounded by digits, might be 2
      const before = string[offset - 1];
      const after = string[offset + 1];
      if (/\d/.test(before) && /\d/.test(after)) {
        return '2';
      }
      return match;
    })
    .replace(/[Bb]/g, (match, offset, string) => {
      // If surrounded by digits, might be 8
      const before = string[offset - 1];
      const after = string[offset + 1];
      if (/\d/.test(before) && /\d/.test(after)) {
        return '8';
      }
      return match;
    });
}

/**
 * Validate CCCD number (must be exactly 12 digits)
 */
export function validateCCCDNumber(cccdNumber) {
  if (!cccdNumber) return { valid: false, error: 'CCCD number is missing' };
  
  // Apply OCR error fixes
  const fixed = fixOCRErrors(cccdNumber);
  
  // Remove all non-digits
  const digits = fixed.replace(/\D/g, '');
  
  if (digits.length !== 12) {
    return { valid: false, error: `CCCD must be 12 digits, got ${digits.length}`, fixed: digits };
  }
  
  return { valid: true, fixed: digits };
}

/**
 * Validate date format and logic
 */
export function validateDate(dateString, fieldName = 'Date') {
  if (!dateString) return { valid: false, error: `${fieldName} is missing` };
  
  const match = dateString.match(/(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})/);
  if (!match) {
    return { valid: false, error: `${fieldName} format invalid, expected DD/MM/YYYY` };
  }
  
  const [_, day, month, year] = match.map(Number);
  
  // Check valid ranges
  if (month < 1 || month > 12) {
    return { valid: false, error: `Invalid month: ${month}` };
  }
  
  if (day < 1 || day > 31) {
    return { valid: false, error: `Invalid day: ${day}` };
  }
  
  if (year < 1900 || year > 2100) {
    return { valid: false, error: `Invalid year: ${year}` };
  }
  
  // Check if date exists
  const date = new Date(year, month - 1, day);
  if (date.getDate() !== day || date.getMonth() !== month - 1) {
    return { valid: false, error: `Date does not exist: ${day}/${month}/${year}` };
  }
  
  return { valid: true, fixed: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}` };
}

/**
 * Post-process and validate extracted data
 */
export function postprocessOCRData(data) {
  const result = {
    ...data,
    validationErrors: [],
    needsManualReview: false
  };
  
  // Fix and validate CCCD number
  if (data.cccd_number) {
    const cccdValidation = validateCCCDNumber(data.cccd_number);
    if (!cccdValidation.valid) {
      result.validationErrors.push(cccdValidation.error);
      result.needsManualReview = true;
    } else {
      result.cccd_number = cccdValidation.fixed;
    }
  }
  
  // Validate date of birth
  if (data.date_of_birth) {
    const dobValidation = validateDate(data.date_of_birth, 'Date of birth');
    if (!dobValidation.valid) {
      result.validationErrors.push(dobValidation.error);
      result.needsManualReview = true;
    } else {
      result.date_of_birth = dobValidation.fixed;
    }
  }
  
  // Validate issue date
  if (data.issue_date) {
    const issueValidation = validateDate(data.issue_date, 'Issue date');
    if (!issueValidation.valid) {
      result.validationErrors.push(issueValidation.error);
    } else {
      result.issue_date = issueValidation.fixed;
      
      // Check if issue date is >= 2021 (new chip CCCD)
      const year = parseInt(result.issue_date.split('/')[2]);
      if (year < 2021) {
        result.validationErrors.push('Issue date must be >= 2021 for chip-based CCCD');
        result.needsManualReview = true;
      }
    }
  }
  
  console.log('Post-processing result:', {
    errors: result.validationErrors,
    needsManualReview: result.needsManualReview
  });
  
  return result;
}
