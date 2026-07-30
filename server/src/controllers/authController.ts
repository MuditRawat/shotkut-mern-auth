import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/token.js';

// Cookie options for HTTP-only Refresh Token
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
};

const getClearCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
  };
};

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Basic Input Validation
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    // Hash Password
    const hashedPassword = await hashPassword(password);

    // Create User
    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get tokens
 * @access  Public
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Basic Input Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user and explicitly select password and refreshToken
    const user = await User.findOne({ email: normalizedEmail }).select('+password +refreshToken');
    if (!user || !user.password) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Verify Password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Generate Tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store Refresh Token in User Document
    user.refreshToken = refreshToken;
    await user.save();

    // Set Refresh Token as HTTP-Only Cookie
    res.cookie('refreshToken', refreshToken, getCookieOptions());

    // Send Response with Access Token and User Info
    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh Access Token using HTTP-only Refresh Token cookie
 * @access  Public
 */
export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token not provided',
      });
      return;
    }

    // Verify Refresh Token
    let decoded: { userId: string };
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
      return;
    }

    // Find User by ID and verify stored refreshToken
    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
      return;
    }

    // Generate New Tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Update Refresh Token in User Document
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set Updated HTTP-Only Cookie
    res.cookie('refreshToken', newRefreshToken, getCookieOptions());

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user & clear tokens
 * @access  Public
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      // Find user with this refresh token and clear it
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }

    // Clear HTTP-Only Cookie
    res.clearCookie('refreshToken', getClearCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};
