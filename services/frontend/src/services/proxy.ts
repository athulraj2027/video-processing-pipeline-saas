import { NextRequest, NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:4000';

export async function proxyRequest(req: NextRequest, pathSegments: string[]): Promise<NextResponse> {
  const path = pathSegments.join('/');
  const searchParams = req.nextUrl.search;
  
  // Build target URL pointing to api-gateway's /api/v1
  const targetUrl = `${API_GATEWAY_URL}/api/v1/${path}${searchParams}`;

  const headers = new Headers(req.headers);
  
  // Remove host header to avoid routing mismatch
  headers.delete('host');
  
  // In Next.js, we can get the host from headers
  const clientHost = req.headers.get('host') || 'localhost:3000';
  headers.set('X-Tenant-Host', clientHost);

  // Read request body
  let body: any = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      body = await req.arrayBuffer();
    } catch {
      // No body or error reading body
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      cache: 'no-store',
    });

    const responseData = await response.arrayBuffer();

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('connection');
    responseHeaders.delete('transfer-encoding');
    responseHeaders.delete('content-length'); // Let NextResponse recalculate

    return new NextResponse(responseData, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('Front-end API Proxy error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal front-end API proxy error' },
      { status: 500 }
    );
  }
}
