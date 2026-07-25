import { Server } from 'http';
import { Application } from 'express';
import { setupGracefulShutdown } from './globalShutdown.js';

let server: Server;

export function createAndStartServer(
    app: Application,
    port: number,
    host: string,
    onStartCallback?: () => void
): Server {
    server = app.listen(port, host, () => {
        if (onStartCallback) {
            onStartCallback();
        }
    });
    setupGracefulShutdown(server);

    return server;
}

export function getServer(): Server {
    return server;
}