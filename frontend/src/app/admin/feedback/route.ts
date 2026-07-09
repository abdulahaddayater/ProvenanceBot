import { NextResponse } from 'next/server';
import { ensureServerEnv } from '@/lib/server-env';

export const runtime = 'nodejs';

export async function GET() {
  ensureServerEnv();

  const { listFeedback } = await import('@provenancebot/agents/store');
  const feedback = await listFeedback();
  return NextResponse.json({ feedback });
}
