import { Router } from 'express';
import { getMe, getDashboard } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Apply JWT authentication middleware to all routes in this router
router.use(authenticateToken);

/**
 * @route GET /api/user/me
 * @route GET /api/user/dashboard
 */
router.get('/me', getMe);
router.get('/dashboard', getDashboard);

export default router;
