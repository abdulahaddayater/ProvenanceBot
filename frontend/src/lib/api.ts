export interface SourceResponse {
  index: number;
  url: string;
  title: string;
  sourceHash: string;
  uriHash: string;
  fetchedAt: string;
}

export interface ClaimMapping {
  sentenceIndex: number;
  sourceIndices: number[];
}

export interface QueryResponse {
  query: string;
  status: 'success' | 'partial' | 'error';
  stage: string;
  message?: string;
  sources: SourceResponse[];
  failedSources: Array<{ index: number; reason: string }>;
  summary: string;
  claimMappings: ClaimMapping[];
  provenance: {
    queryHash: string;
    summaryHash: string;
    entryId: number | null;
    txHash: string | null;
    contractId: string;
  };
}

export interface VerifyArchiveResponse {
  sourceHash: string;
  archived: {
    url: string;
    title: string;
    content: string;
    fetchedAt: string;
    archivedAt: string;
  };
  liveUrlStatus: 'matches' | 'changed' | 'unreachable';
  liveContentMatchesHash: boolean | null;
}

export interface OnChainVerifyResponse {
  entryId: number;
  sourceHash: string;
  verified: boolean;
  contractId: string;
}

/** Resolve agents API base URL — same-origin /api routes when no external backend is configured. */
function getApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_AGENTS_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  if (typeof window !== 'undefined') return '';
  return (process.env.AGENTS_API_URL?.trim() || 'http://localhost:3001').replace(/\/$/, '');
}

export async function submitQuery(
  query: string,
  walletAddress?: string,
  demoMode = false,
): Promise<QueryResponse> {
  const res = await fetch(`${getApiBase()}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, walletAddress, demoMode }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? err.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export async function verifyArchive(sourceHash: string): Promise<VerifyArchiveResponse> {
  const res = await fetch(`${getApiBase()}/api/verify/${sourceHash}`);
  if (!res.ok) throw new Error('Archive lookup failed');
  return res.json();
}

export async function verifyOnChain(
  entryId: number,
  sourceHash: string,
): Promise<OnChainVerifyResponse> {
  const params = new URLSearchParams({ entryId: String(entryId), sourceHash });
  const res = await fetch(`${getApiBase()}/api/verify-onchain?${params}`);
  if (!res.ok) throw new Error('On-chain verification failed');
  return res.json();
}

export async function submitFeedback(data: {
  rating: number;
  comment?: string;
  walletAddress?: string;
}): Promise<void> {
  await fetch(`${getApiBase()}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function fetchStatus(): Promise<Record<string, unknown>> {
  const res = await fetch(`${getApiBase()}/api/status`);
  return res.json();
}

export async function fetchAdminData(): Promise<{
  interactions: unknown[];
  feedback: unknown[];
}> {
  const [interactionsRes, feedbackRes] = await Promise.all([
    fetch(`${getApiBase()}/admin/interactions`),
    fetch(`${getApiBase()}/admin/feedback`),
  ]);
  return {
    interactions: interactionsRes.ok ? await interactionsRes.json().then((d) => d.interactions) : [],
    feedback: feedbackRes.ok ? await feedbackRes.json().then((d) => d.feedback) : [],
  };
}
