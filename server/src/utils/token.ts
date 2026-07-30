import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import mongoose from 'mongoose';

/**
 * Generates a short-lived JWT Access Token.
 * @param userId User's MongoDB ObjectId or string ID
 * @returns Signed JWT access token
 */
export const generateAccessToken = (userId: string | mongoose.Types.ObjectId): string => {
  const secret: Secret = process.env.ACCESS_TOKEN_SECRET || 'fallback_access_secret_32_chars_min';
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRE || '15m';

  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign({ userId: userId.toString() }, secret, options);
};

/**
 * Generates a long-lived JWT Refresh Token.
 * @param userId User's MongoDB ObjectId or string ID
 * @returns Signed JWT refresh token
 */
export const generateRefreshToken = (userId: string | mongoose.Types.ObjectId): string => {
  const secret: Secret = process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret_32_chars_min';
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRE || '7d';

  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign({ userId: userId.toString() }, secret, options);
};

/**
 * Verifies a JWT Access Token.
 * @param token JWT token string
 * @returns Decoded payload object containing userId
 */
export const verifyAccessToken = (token: string): { userId: string } => {
  const secret: Secret = process.env.ACCESS_TOKEN_SECRET || 'fallback_access_secret_32_chars_min';
  return jwt.verify(token, secret) as { userId: string };
};

/**
 * Verifies a JWT Refresh Token.
 * @param token JWT token string
 * @returns Decoded payload object containing userId
 */
export const verifyRefreshToken = (token: string): { userId: string } => {
  const secret: Secret = process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret_32_chars_min';
  return jwt.verify(token, secret) as { userId: string };
};
