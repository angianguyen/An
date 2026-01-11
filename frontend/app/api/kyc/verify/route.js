import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

// Force delete cached model to reload schema
if (mongoose.models.KYC) {
  delete mongoose.models.KYC;
}

import KYC from '@/models/KYC';

export async function POST(request) {
  try {
    console.log('=== KYC VERIFICATION API CALLED ===');
    
    await dbConnect();
    console.log('✓ MongoDB connected');

    const body = await request.json();
    const { walletAddress, ocrData } = body;
    
    console.log('Wallet:', walletAddress);
    console.log('OCR Data:', JSON.stringify(ocrData, null, 2));

    // Validation
    if (!walletAddress || !ocrData) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: walletAddress, ocrData' },
        { status: 400 }
      );
    }

    // Check if wallet already has KYC
    const existingKYC = await KYC.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (existingKYC && existingKYC.verification_status === 'verified') {
      console.log('❌ Wallet already verified');
      return NextResponse.json(
        { error: 'Wallet already has verified KYC', data: existingKYC },
        { status: 400 }
      );
    }

    console.log('OCR format valid:', ocrData.format_valid);

    // Check if format is valid
    if (!ocrData.format_valid) {
      console.error('❌ Invalid CCCD format:', ocrData.missing_fields);
      return NextResponse.json({
        success: false,
        error: 'Invalid CCCD format or missing fields',
        data: ocrData
      }, { status: 400 });
    }

    // Check if CCCD number already exists
    if (ocrData.extracted_data && ocrData.extracted_data.cccd_number) {
      const existingCCCD = await KYC.findOne({ 
        cccd_number: ocrData.extracted_data.cccd_number 
      });
      
      if (existingCCCD) {
        console.error('❌ CCCD already registered');
        return NextResponse.json(
          { error: 'CCCD number already registered to another wallet' },
          { status: 400 }
        );
      }
    }

    console.log('✓ Validation passed, saving to DB...');

    // Save to database
    const kycData = {
      walletAddress: walletAddress.toLowerCase(),
      ...ocrData.extracted_data,
      verification_status: ocrData.confidence > 0.7 ? 'verified' : 'pending',
      confidence_score: ocrData.confidence || 0,
      missing_fields: ocrData.missing_fields || [],
      format_valid: ocrData.format_valid,
      verified_at: ocrData.confidence > 0.7 ? new Date() : null
    };

    const kyc = existingKYC 
      ? await KYC.findOneAndUpdate(
          { walletAddress: walletAddress.toLowerCase() },
          kycData,
          { new: true }
        )
      : await KYC.create(kycData);
    
    console.log('✓ KYC saved:', kyc._id);
    console.log('Status:', kyc.verification_status);
    console.log('===================================');

    return NextResponse.json({
      success: true,
      message: 'KYC verification completed',
      data: {
        verification_status: kyc.verification_status,
        confidence_score: kyc.confidence_score,
        full_name: kyc.full_name,
        cccd_number: kyc.cccd_number,
        missing_fields: kyc.missing_fields
      }
    });

  } catch (error) {
    console.error('❌ KYC VERIFICATION ERROR:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to process KYC verification', details: error.message },
      { status: 500 }
    );
  }
}

// GET: Check KYC status
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Missing walletAddress parameter' },
        { status: 400 }
      );
    }

    const kyc = await KYC.findOne({ 
      walletAddress: walletAddress.toLowerCase() 
    });

    if (!kyc) {
      return NextResponse.json({
        verified: false,
        message: 'No KYC record found'
      });
    }

    return NextResponse.json({
      verified: kyc.verification_status === 'verified',
      status: kyc.verification_status,
      confidence_score: kyc.confidence_score,
      full_name: kyc.full_name,
      cccd_number: kyc.cccd_number,
      verified_at: kyc.verified_at
    });

  } catch (error) {
    console.error('KYC Check Error:', error);
    return NextResponse.json(
      { error: 'Failed to check KYC status' },
      { status: 500 }
    );
  }
}
