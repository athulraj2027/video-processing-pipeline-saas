import { Server } from 'http';

type CleanupTask = () => Promise<void> | void;

const cleanupTasks: CleanupTask[] = [];

export function registerCleanupTask(task: CleanupTask) {
    cleanupTasks.push(task);
}

export function setupGracefulShutdown(server: Server) {
    const handleShutdown = async (signal: string) => {
        console.warn(`\nReceived ${signal}, starting graceful shutdown...`);

        server.close(async () => {
            console.log('HTTP server closed.');

            for (const task of cleanupTasks) {
                try {
                    await task();
                } catch (err) {
                    console.error('Error during cleanup task:', err);
                }
            }

            console.log('Tenant service shutdown completed cleanly.');
            process.exit(0);
        });

        setTimeout(() => {
            console.error('Forced shutdown due to timed-out connections.');
            process.exit(1);
        }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
}
