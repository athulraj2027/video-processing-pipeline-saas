import { app } from './app.js';
import { env } from './config/env.js';
import { createAndStartServer } from './config/httpServer.js';

function start() {
  createAndStartServer(app, env.PORT, env.HOST, () => {
    console.log(`🚀 Express Edge API Gateway running at http://${env.HOST}:${env.PORT}`);
    console.log(`🛠️  Tenant mapping configured: ${env.TENANT_MAPPING}`);
  });
}

start();