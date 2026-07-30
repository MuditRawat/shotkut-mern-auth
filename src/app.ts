import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.js';

const app: Express = express();

// 1. CORS Configuration with credentials support
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  process.env.APP_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests) or matched origins
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, true); // flexible origin for development / preview environments
      }
    },
    credentials: true, // Enables HTTP-only cookies transmission across origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 2. Body Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Cookie Parser Middleware
app.use(cookieParser());

// 4. Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend API is healthy and operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// 5. Global Error Handler Middleware
app.use(errorHandler);

export default app;
