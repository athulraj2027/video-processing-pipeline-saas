import { app } from './app.js';
import { env } from './config/env.js';
import { init, prisma } from './config/db.js';
import { createAndStartServer } from './config/httpServer.js';
import { registerCleanupTask } from './config/globalShutdown.js';

async function start() {
  try {
    // 1. Initialize Database
    await init();

    // 2. Register Database Cleanup Task
    registerCleanupTask(async () => {
      try {
        console.log('🔌 Disconnecting Prisma database client...');
        await prisma.$disconnect();
        console.log('Database connections closed.');
      } catch (err) {
        console.error('Error disconnecting database client:', err);
      }
    });

    // 3. Create & Start HTTP Server
    createAndStartServer(app, env.PORT, env.HOST, () => {
      console.log(`🚀 Identity Service running at http://${env.HOST}:${env.PORT}`);
      console.log(`📡 Health-check endpoint: http://${env.HOST}:${env.PORT}/api/v1/auth/health`);
    });

  } catch (err) {
    console.error('❌ Failed to start Identity Service:', err);
    process.exit(1);
  }
}

start();

