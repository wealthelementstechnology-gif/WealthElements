const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian mobile number'],
    },
    passwordHash: {
      type: String,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: true, // no OTP step — verified on register
    },
    profile: {
      name: { type: String, trim: true },
      dateOfBirth: { type: Date },
      city: { type: String, trim: true },
      employmentType: { type: String, enum: ['Salaried', 'Self-employed', 'Business'], default: 'Salaried' },
      onboardingCompleted: { type: Boolean, default: false },
      onboardingStep: { type: Number, default: 0 },
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(String(candidatePassword), this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
