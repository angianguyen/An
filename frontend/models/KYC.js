import mongoose from 'mongoose';

const KYCSchema = new mongoose.Schema({
  // Wallet Address (primary key)
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true
  },

  // CCCD Data
  cccd_number: {
    type: String,
    required: true,
    unique: true
  },
  full_name: {
    type: String,
    required: false,
    trim: true
  },
  date_of_birth: {
    type: String,
    required: false
  },
  gender: {
    type: String,
    required: false
  },
  nationality: {
    type: String,
    default: 'Việt Nam'
  },
  place_of_origin: {
    type: String,
    required: false
  },
  place_of_residence: {
    type: String,
    required: false
  },
  issue_date: {
    type: String,
    required: false
  },
  issuing_authority: {
    type: String,
    required: false
  },

  // Verification Status
  verification_status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  confidence_score: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  missing_fields: [String],
  format_valid: {
    type: Boolean,
    default: false
  },

  // Image URLs (IPFS)
  front_image_url: String,
  back_image_url: String,
  
  // QR Code Data
  qr_code_data: String,

  // Metadata
  verified_at: Date,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
KYCSchema.pre('save', function() {
  this.updated_at = Date.now();
});

export default mongoose.models.KYC || mongoose.model('KYC', KYCSchema);
