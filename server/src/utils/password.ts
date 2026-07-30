import bcrypt from 'bcryptjs';

/**
 * Hashes a plain-text password using bcryptjs with 10 salt rounds.
 * @param password Plain-text password
 * @returns Hashed password string
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compares a plain-text password with a hashed password.
 * @param password Plain-text password input
 * @param hashedPassword Hashed password from database
 * @returns Boolean indicating whether passwords match
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
