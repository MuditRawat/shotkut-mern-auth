import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app: Express = express();

// 1. CORS Configuration - Restricted strictly to CLIENT_URL with credentials enabled
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 2. Body Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Cookie Parser Middleware
app.use(cookieParser());

// 4. Base Endpoint
app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'MERN Authentication Backend API',
  });
});

// 5. Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend API is healthy and operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// 6. Authentication Routes
app.use('/api/auth', authRoutes);

// 7. Protected User Routes
app.use('/api/user', userRoutes);

// 8. Global Error Handler Middleware
app.use(errorHandler);

export default app;
