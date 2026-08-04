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
        console.log('🔌 Disconnecting Prisma Notification database client...');
        await prisma.$disconnect();
        console.log('Database connections closed.');
      } catch (err) {
        console.error('Error disconnecting database client:', err);
      }
    });

    // 3. Start HTTP Server
    createAndStartServer(app, env.PORT, env.HOST, () => {
      console.log(`🚀 Notification Service running at http://${env.HOST}:${env.PORT}`);
    });

  } catch (err) {
    console.error('❌ Failed to start Notification Service:', err);
    process.exit(1);
  }
}

start();
