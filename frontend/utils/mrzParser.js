/**
 * MRZ (Machine Readable Zone) Parser for Vietnamese CCCD
 * MRZ format is international standard - much more accurate than OCR
 * 
 * Vietnamese CCCD uses TD1 format (3 lines):
 * Line 1: IDVNM + Document Number (12 digits) + Check digit + Filler
 * Line 2: Birth Date (YYMMDD) + Sex (M/F) + Expiry Date (YYMMDD) + Nationality + Filler
 * Line 3: Surname << Given Names << Filler
 */

/**
 * Parse MRZ from CCCD
 * @param {string} text - Raw OCR text containing MRZ
 * @returns {object} Parsed data
 */
export function parseMRZ(text) {
  console.log('=== PARSING MRZ ===');
  
  // Find MRZ lines (lines with << or continuous uppercase/numbers)
  const lines = text.split(/[\r\n]+/);
  const mrzLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Clean line: keep only A-Z, 0-9, <
    const cleaned = line.replace(/[^A-Z0-9<]/gi, '').toUpperCase();
    
    // MRZ line characteristics:
    // 1. Must be at least 30 chars
    // 2. Contains << OR starts with ID/IDVNM OR has 12-digit sequence OR all caps+numbers
    if (cleaned.length >= 30) {
      const hasMRZPattern = 
        cleaned.includes('<<') ||
        cleaned.startsWith('ID') ||
        cleaned.startsWith('VNM') ||
        /\d{12}/.test(cleaned) ||
        /^[A-Z0-9<]{30,}$/.test(cleaned);
      
      if (hasMRZPattern) {
        mrzLines.push(cleaned);
        console.log(`Found MRZ line ${mrzLines.length}:`, cleaned);
      }
    }
  }
  
  console.log(`Total MRZ lines found: ${mrzLines.length}`);
  
  if (mrzLines.length < 2) {
    console.warn('❌ Not enough MRZ lines found (need at least 2)');
    return null;
  }
  
  // Parse each line
  const data = {
    cccd_number: '',
    full_name: '',
    date_of_birth: '',
    gender: '',
    nationality: 'Việt Nam',
    expiry_date: ''
  };
  
  // Line 1: Document number
  for (const line of mrzLines) {
    if (line.startsWith('ID') || line.startsWith('VNM')) {
      // Extract 12-digit CCCD number
      const match = line.match(/(\d{12})/);
      if (match) {
        data.cccd_number = match[1];
        console.log('✓ CCCD from MRZ:', data.cccd_number);
      }
    }
  }
  
  // Line 2: Birth date, sex, expiry
  for (const line of mrzLines) {
    // Format: YYMMDDXYYMMDDCOUNTRY
    // Example: 0508218N3008214VNM (DOB: 21/08/2005, Sex: Male, Expiry: 14/08/2030)
    const dateMatch = line.match(/(\d{6})([MFN])(\d{6})/);
    if (dateMatch) {
      const [_, birthDate, sex, expiryDate] = dateMatch;
      
      // Parse birth date (YYMMDD)
      const birthYear = parseInt(birthDate.substring(0, 2));
      const birthMonth = birthDate.substring(2, 4);
      const birthDay = birthDate.substring(4, 6);
      
      // Convert YY to YYYY (assume 2000s if < 50, else 1900s)
      const fullYear = birthYear < 50 ? 2000 + birthYear : 1900 + birthYear;
      data.date_of_birth = `${birthDay}/${birthMonth}/${fullYear}`;
      
      // Parse gender
      data.gender = sex === 'M' ? 'Nam' : (sex === 'F' ? 'Nữ' : 'Nam');
      
      // Parse expiry date
      const expiryYear = parseInt(expiryDate.substring(0, 2)) + 2000;
      const expiryMonth = expiryDate.substring(2, 4);
      const expiryDay = expiryDate.substring(4, 6);
      data.expiry_date = `${expiryDay}/${expiryMonth}/${expiryYear}`;
      
      console.log('✓ DOB from MRZ:', data.date_of_birth);
      console.log('✓ Gender from MRZ:', data.gender);
      console.log('✓ Expiry from MRZ:', data.expiry_date);
    }
  }
  
  // Line 3: Name (Surname << Given Names)
  for (const line of mrzLines) {
    if (line.includes('<<')) {
      // Parse name: SURNAME<<GIVENNAME<<FILLER
      const nameParts = line.split('<<');
      if (nameParts.length >= 2) {
        const surname = nameParts[0].replace(/[^A-Z]/g, '').trim();
        const givenNames = nameParts[1].replace(/[^A-Z<]/g, '').replace(/</g, ' ').trim();
        
        if (surname && givenNames) {
          data.full_name = `${surname} ${givenNames}`.trim();
          console.log('✓ Name from MRZ:', data.full_name);
        }
      }
    }
  }
  
  console.log('=== MRZ PARSE COMPLETE ===');
  return data;
}

/**
 * Extract CCCD data using MRZ (fallback to regular OCR if MRZ fails)
 */
export async function extractWithMRZ(text) {
  // Try MRZ first (most accurate)
  const mrzData = parseMRZ(text);
  
  if (mrzData && mrzData.cccd_number && mrzData.full_name && mrzData.date_of_birth) {
    console.log('✓ MRZ parsing successful!');
    return {
      ...mrzData,
      method: 'MRZ',
      confidence: 0.95 // MRZ is very reliable
    };
  }
  
  console.log('⚠ MRZ parsing failed, fallback to regular OCR');
  return null;
}
