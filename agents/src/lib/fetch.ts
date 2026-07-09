/** Fetch helper — explicit typing avoids Fastify/global Response name collisions on Vercel. */
interface FetchResponse {
  ok: boolean;
  status: number;
  text(): Promise<string>;
}

export async function fetchUrlText(url: string, timeoutMs = 5000): Promise<string | null> {
  try {
    const res = (await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })) as FetchResponse;
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export async function fetchUrlMatchesHash(
  url: string,
  expectedHash: string,
  hashFn: (content: string) => string,
): Promise<boolean | null> {
  const text = await fetchUrlText(url);
  if (text === null) return null;
  return hashFn(text) === expectedHash;
}
