import { NextRequest, NextResponse } from 'next/server';
import { ensureServerEnv } from '@/lib/server-env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { sourceHash: string } },
) {
  ensureServerEnv();

  const { sourceHash } = params;
  const { hashContent } = await import('@provenancebot/agents/hash');
  const { loadArchivedSource } = await import('@provenancebot/agents/archive');

  const archived = await loadArchivedSource(sourceHash);
  if (!archived) {
    return NextResponse.json({ error: 'Source not found in archive' }, { status: 404 });
  }

  let liveMatch: boolean | null = null;
  try {
    const res = await fetch(archived.url, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const text = await res.text();
      liveMatch = hashContent(text) === sourceHash;
    } else {
      liveMatch = false;
    }
  } catch {
    liveMatch = null;
  }

  return NextResponse.json({
    sourceHash,
    archived: {
      url: archived.url,
      title: archived.title,
      content: archived.content,
      fetchedAt: archived.fetchedAt,
      archivedAt: archived.archivedAt,
    },
    liveUrlStatus: liveMatch === null ? 'unreachable' : liveMatch ? 'matches' : 'changed',
    liveContentMatchesHash: liveMatch,
  });
}
