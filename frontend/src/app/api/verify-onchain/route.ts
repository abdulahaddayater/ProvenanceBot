import { NextRequest, NextResponse } from 'next/server';
import { ensureServerEnv } from '@/lib/server-env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  ensureServerEnv();

  const entryId = Number(req.nextUrl.searchParams.get('entryId'));
  const sourceHash = req.nextUrl.searchParams.get('sourceHash');

  if (!entryId || !sourceHash) {
    return NextResponse.json({ error: 'entryId and sourceHash required' }, { status: 400 });
  }

  const { getSorobanClient } = await import('@provenancebot/agents/soroban');
  const client = getSorobanClient();
  const verified = await client.verifySource(entryId, sourceHash);

  return NextResponse.json({
    entryId,
    sourceHash,
    verified,
    contractId: client.getContractId(),
  });
}
