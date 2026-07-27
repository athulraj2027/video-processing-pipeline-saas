import { NextRequest } from 'next/server';
import { proxyRequest } from '@/services/proxy';

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(req, resolvedParams.path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(req, resolvedParams.path);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(req, resolvedParams.path);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(req, resolvedParams.path);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return proxyRequest(req, resolvedParams.path);
}
