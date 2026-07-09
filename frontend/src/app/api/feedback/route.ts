import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureServerEnv } from '@/lib/server-env';

export const runtime = 'nodejs';

const bodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional().default(''),
  walletAddress: z.string().optional(),
});

export async function POST(req: NextRequest) {
  ensureServerEnv();

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid feedback', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { saveFeedback } = await import('@provenancebot/agents/store');
  const record = await saveFeedback({
    rating: parsed.data.rating,
    comment: parsed.data.comment ?? '',
    walletAddress: parsed.data.walletAddress ?? null,
  });

  return NextResponse.json(record, { status: 201 });
}
