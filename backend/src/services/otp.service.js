/**
 * OTP Service
 * Currently: MOCK mode — OTP is logged to console, no SMS sent.
 * Production: Swap sendOtp() to call MSG91 API with MSG91_AUTH_KEY.
 */

const bcrypt = require('bcryptjs');

// Generate a 6-digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP — mock logs to console
const sendOtp = async (phone, otp) => {
  // ─── MOCK MODE ───────────────────────────────────────────────
  console.log('\n========================================');
  console.log(`  OTP for ${phone}: ${otp}`);
  console.log('  (Mock mode — no SMS sent)');
  console.log('========================================\n');
  return { success: true, mock: true };

  // ─── PRODUCTION (uncomment when MSG91 is ready) ───────────────
  // const axios = require('axios');
  // const response = await axios.post('https://api.msg91.com/api/v5/otp', {
  //   template_id: process.env.MSG91_TEMPLATE_ID,
  //   mobile: `91${phone}`,
  //   authkey: process.env.MSG91_AUTH_KEY,
  //   otp,
  // });
  // return response.data;
};

// Hash OTP for secure storage
const hashOtp = async (otp) => {
  return await bcrypt.hash(String(otp), 10);
};

// OTP expiry — 5 minutes from now
const getOtpExpiry = () => {
  return new Date(Date.now() + 5 * 60 * 1000);
};

module.exports = { generateOtp, sendOtp, hashOtp, getOtpExpiry };
