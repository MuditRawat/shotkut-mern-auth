import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

/**
 * @route   GET /api/user/me
 * @desc    Get currently authenticated user details
 * @access  Private
 */
export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/user/dashboard
 * @desc    Get protected dashboard content confirming authentication
 * @access  Private
 */
export const getDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Welcome to the protected dashboard!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      dashboardData: {
        welcomeMessage: `Hello, ${user.name}! You have successfully accessed protected content with a valid Access Token.`,
        sessionStatus: 'Authenticated',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};
