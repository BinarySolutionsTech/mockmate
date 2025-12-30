/**
 * Express application setup
 * Configures the MockMate server with routes and middleware
 */

import express, { type Application } from 'express';
import cors from 'cors';
import adminRouter from './routes/admin';
import { mockRequestHandler } from './routes/mock';
import { initializeStorage } from './services/storage';

/**
 * Create and configure Express application
 */
export function createApp(): Application {
  const app = express();

  // Initialize storage on app creation
  initializeStorage();

  // ============================================================================
  // Middleware
  // ============================================================================

  // Parse JSON bodies
  app.use(express.json());

  // Enable CORS for all origins (mock server should be accessible from anywhere)
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'X-MockMate-Scenario', 'Authorization'],
      exposedHeaders: ['Content-Type'],
      credentials: false,
    })
  );

  // ============================================================================
  // Admin API Routes
  // ============================================================================

  // Mount admin router on /api/admin prefix
  app.use('/api/admin', adminRouter);

  // ============================================================================
  // Health Check
  // ============================================================================

  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  // ============================================================================
  // Mock API Handler (Catch-all)
  // ============================================================================

  // This must be last! It catches all remaining routes
  // Handle all HTTP methods for mock API
  app.all('*', mockRequestHandler);

  return app;
}

/**
 * Start the HTTP server
 */
export function startServer(port: number = 3456): Promise<any> {
  const app = createApp();

  return new Promise((resolve, reject) => {
    try {
      const server = app.listen(port, () => {
        console.log('');
        console.log('🚀 MockMate Server Started');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📡 Mock API:  http://localhost:${port}`);
        console.log(`⚙️  Admin API: http://localhost:${port}/api/admin`);
        console.log(`💚 Health:    http://localhost:${port}/health`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log('💡 Tip: Use X-MockMate-Scenario header to override scenarios');
        console.log('');

        resolve(server);
      });

      server.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
}
