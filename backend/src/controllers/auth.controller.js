const authService = require('../services/auth.service');
const config = require('../config');

const cookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// @desc    Check if phone already has an account
// @route   POST /api/v1/auth/check-phone
// @access  Public
const checkPhone = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const result = await authService.checkPhone(phone);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Register new user with phone + password
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const result = await authService.register(phone, password);

    res.cookie('refreshToken', result.refreshToken, cookieOptions);
    res.status(201).json({
      success: true,
      data: { user: result.user, accessToken: result.accessToken },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login with phone + password
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const result = await authService.login(phone, password);

    res.cookie('refreshToken', result.refreshToken, cookieOptions);
    res.status(200).json({
      success: true,
      data: { user: result.user, accessToken: result.accessToken },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public
const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    const tokens = await authService.refreshTokens(refreshToken);
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);
    res.status(200).json({
      success: true,
      data: { accessToken: tokens.accessToken },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout
// @route   POST /api/v1/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user._id);
    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      id: req.user._id,
      phone: req.user.phone,
      role: req.user.role,
      isVerified: req.user.isVerified,
      profile: req.user.profile,
    },
  });
};

module.exports = { checkPhone, register, login, refresh, logout, getMe };
