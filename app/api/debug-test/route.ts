import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ 
    status: 'working',
    message: 'Debug route is accessible',
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  return NextResponse.json({ 
    status: 'working',
    method: 'POST',
    message: 'POST debug route is accessible',
    timestamp: new Date().toISOString()
  });
}
