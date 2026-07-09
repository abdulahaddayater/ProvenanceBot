import { NextResponse } from 'next/server';
import { ensureServerEnv } from '@/lib/server-env';

export const runtime = 'nodejs';

export async function GET() {
  ensureServerEnv();

  const { listWalletInteractions } = await import('@provenancebot/agents/store');
  const interactions = await listWalletInteractions();
  return NextResponse.json({ interactions });
}
