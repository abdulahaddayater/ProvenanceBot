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
    const { fetchUrlMatchesHash } = await import('@provenancebot/agents/fetch');
    liveMatch = await fetchUrlMatchesHash(archived.url, sourceHash, hashContent);
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
