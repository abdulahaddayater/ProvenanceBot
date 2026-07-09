'use client';

import { useEffect, useState } from 'react';
import type { SourceResponse } from '@/lib/api';
import { verifyArchive, verifyOnChain } from '@/lib/api';
import { trackEvent } from '@/hooks/useAnalytics';

interface SourcePanelProps {
  source: SourceResponse;
  entryId: number | null;
  open: boolean;
  onClose: () => void;
}

export function SourcePanel({ source, entryId, open, onClose }: SourcePanelProps) {
  const [onChain, setOnChain] = useState<boolean | null>(null);
  const [liveStatus, setLiveStatus] = useState<string>('—');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!open) return;
    trackEvent('chip_click', { sourceIndex: source.index });
    verifyArchive(source.sourceHash).then((r) => {
      setLiveStatus(r.liveUrlStatus);
    });
  }, [open, source]);

  const handleVerify = async () => {
    if (!entryId) return;
    setVerifying(true);
    try {
      const res = await verifyOnChain(entryId, source.sourceHash);
      setOnChain(res.verified);
      trackEvent('onchain_verify', { verified: res.verified });
    } finally {
      setVerifying(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={onClose} aria-hidden />
      <aside
        className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl border border-white/10 bg-ink-900 p-6 shadow-2xl lg:inset-y-0 lg:right-0 lg:left-auto lg:max-h-none lg:w-[28rem] lg:rounded-none lg:rounded-l-2xl"
        role="dialog"
        aria-label={`Source ${source.index} details`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-signal-400">
              Source {source.index}
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-white">{source.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-ink-100/60 hover:text-white" aria-label="Close">
            ✕
          </button>
        </div>

        <dl className="space-y-4 text-sm">
          {source.publisher && (
            <div>
              <dt className="text-ink-100/50">Publisher</dt>
              <dd className="text-ink-100">{source.publisher}</dd>
            </div>
          )}
          {source.publishedAt && (
            <div>
              <dt className="text-ink-100/50">Published</dt>
              <dd className="text-ink-100">
                {new Date(source.publishedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-ink-100/50">URL</dt>
            <dd>
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="break-all text-signal-300 hover:underline">
                {source.url}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-ink-100/50">Retrieved by ProvenanceBot</dt>
            <dd className="text-ink-100">{new Date(source.fetchedAt).toLocaleString()}</dd>
          </div>
          {source.trustNote && (
            <div>
              <dt className="text-ink-100/50">Why this source</dt>
              <dd className="leading-relaxed text-ink-100">{source.trustNote}</dd>
            </div>
          )}
          <div>
            <dt className="text-ink-100/50">Content hash</dt>
            <dd className="font-mono text-xs text-ink-100" title={source.sourceHash}>
              {source.sourceHash.slice(0, 16)}…
              <button
                type="button"
                className="ml-2 text-signal-400 hover:underline"
                onClick={() => navigator.clipboard.writeText(source.sourceHash)}
              >
                Copy
              </button>
            </dd>
          </div>
          <div>
            <dt className="text-ink-100/50">Live URL status</dt>
            <dd className="capitalize text-ink-100">{liveStatus}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleVerify}
            disabled={!entryId || verifying}
            className="rounded-full bg-signal-500 px-4 py-2 text-sm font-medium text-ink-950 hover:bg-signal-400 disabled:opacity-50"
          >
            {verifying ? 'Verifying…' : 'Verify on-chain'}
          </button>
          {onChain === true && (
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-medium text-emerald-300">
              Verified ✓
            </span>
          )}
          {onChain === false && (
            <span className="rounded-full bg-red-500/20 px-3 py-1 text-sm font-medium text-red-300">
              Mismatch
            </span>
          )}
        </div>
      </aside>
    </>
  );
}
