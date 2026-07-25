import { Options, fixRequestBody } from "http-proxy-middleware";

export const buildProxyOptions = (targetUrl: string, prefix?: string): Options => {
    return {
        target: targetUrl,
        changeOrigin: true,
        pathRewrite: prefix ? {
            '^/': prefix.endsWith('/') ? prefix : `${prefix}/`
        } : {},
        on: {
            proxyReq: (proxyReq, req: any) => {
                // 1. Forward the dynamically resolved Tenant ID
                if (req.tenantId) {
                    proxyReq.setHeader('x-tenant-id', req.tenantId);
                }

                // 2. Forward authorized user context (validated by gateway auth middleware)
                if (req.headers['x-user-id']) {
                    proxyReq.setHeader('x-user-id', req.headers['x-user-id'] as string);
                }
                if (req.headers['x-user-role']) {
                    proxyReq.setHeader('x-user-role', req.headers['x-user-role'] as string);
                }
                if (req.headers['x-user-email']) {
                    proxyReq.setHeader('x-user-email', req.headers['x-user-email'] as string);
                }

                // 3. Re-stream body since Express body-parser (express.json()) consumed the stream
                fixRequestBody(proxyReq, req);
            },
            error: (err, req, res: any) => {
                console.error('Proxy Error:', err);
                if (res && typeof res.writeHead === 'function' && !res.headersSent) {
                    res.writeHead(502, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Bad Gateway', message: 'Downstream service unavailable.' }));
                }
            }
        }
    };
};