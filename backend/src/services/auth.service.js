const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const config = require('../config');

// ─── Token Generators ────────────────────────────────────────────────────────

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpire,
  });
};

// ─── Check Phone ─────────────────────────────────────────────────────────────

const checkPhone = async (phone) => {
  const user = await User.findOne({ phone });
  return { exists: !!user };
};

// ─── Register ────────────────────────────────────────────────────────────────

const register = async (phone, password) => {
  const existing = await User.findOne({ phone });
  if (existing) {
    throw { statusCode: 409, message: 'An account with this number already exists. Please log in.' };
  }

  const passwordHash = await bcrypt.hash(String(password), 12);
  const user = await User.create({ phone, passwordHash });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: { id: user._id, phone: user.phone, role: user.role, profile: user.profile },
    accessToken,
    refreshToken,
  };
};

// ─── Login ───────────────────────────────────────────────────────────────────

const login = async (phone, password) => {
  const user = await User.findOne({ phone }).select('+passwordHash +refreshToken');

  if (!user) {
    throw { statusCode: 401, message: 'No account found with this number. Please register first.' };
  }

  if (!user.passwordHash) {
    throw { statusCode: 401, message: 'Account setup incomplete. Please register again.' };
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw { statusCode: 401, message: 'Incorrect password' };
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: { id: user._id, phone: user.phone, role: user.role, profile: user.profile },
    accessToken,
    refreshToken,
  };
};

// ─── Refresh Tokens ──────────────────────────────────────────────────────────

const refreshTokens = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      throw { statusCode: 401, message: 'Invalid refresh token' };
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw { statusCode: 401, message: 'Invalid refresh token' };
  }
};

// ─── Logout ──────────────────────────────────────────────────────────────────

const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

module.exports = {
  checkPhone,
  register,
  login,
  refreshTokens,
  logout,
};
