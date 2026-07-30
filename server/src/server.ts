import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = Number(process.env.PORT) || 3000;

const startServer = async (): Promise<void> => {
  // 1. Connect to MongoDB Atlas
  await connectDB();

  // 2. Attach Vite middleware for SPA serving in development mode
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  // 3. Start Express server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Standalone Express Server running on http://0.0.0.0:${PORT}`);
    console.log(`📡 Health Check Endpoint: http://0.0.0.0:${PORT}/api/health`);
  });
};

startServer().catch((err) => {
  console.error('❌ Failed to start server:', err);
});
