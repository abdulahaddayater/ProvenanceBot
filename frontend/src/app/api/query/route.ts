import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureServerEnv } from '@/lib/server-env';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  query: z.string().min(1).max(2000),
  walletAddress: z.string().optional(),
  demoMode: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  ensureServerEnv();

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { query, walletAddress, demoMode } = parsed.data;

  if (!demoMode && !walletAddress) {
    return NextResponse.json(
      {
        error: 'Wallet required',
        message: 'Connect your Freighter wallet before submitting a query for on-chain anchoring.',
      },
      { status: 400 },
    );
  }

  try {
    const { orchestrateQuery } = await import('@provenancebot/agents/pipeline');
    const result = await orchestrateQuery(query, {
      walletAddress,
      skipAnchor: demoMode === true,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error('Pipeline failed:', err);
    return NextResponse.json(
      {
        error: 'Pipeline failed',
        message: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
