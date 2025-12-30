/**
 * MockMate Server Entry Point
 * Starts the HTTP server and initializes storage
 */

import { startServer } from './app';
import { readConfig } from './services/storage';

/**
 * Main entry point
 */
async function main() {
  try {
    // Read server configuration
    const config = readConfig();
    const port = config.server?.httpPort || 3456;

    // Start the server
    await startServer(port);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
main();
