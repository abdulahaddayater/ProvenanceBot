'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { submitQuery, type QueryResponse } from '@/lib/api';
import { trackEvent } from '@/hooks/useAnalytics';
import { ProgressSteps, ResultsSkeleton, type PipelineStep } from './ProgressSteps';
import { ResultsView } from './ResultsView';

export function QueryForm() {
  const [query, setQuery] = useState('');
  const [step, setStep] = useState<PipelineStep>('idle');
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected, connect, disconnect } = useWallet();

  const runQuery = async () => {
    if (!query.trim()) return;
    if (!isConnected) {
      setError('Connect your Freighter wallet to anchor provenance on-chain.');
      return;
    }

    setError(null);
    setResult(null);
    setStep('fetching');
    trackEvent('query_submitted');

    try {
      setTimeout(() => setStep((s) => (s === 'fetching' ? 'summarizing' : s)), 800);
      setTimeout(() => setStep((s) => (s === 'summarizing' ? 'anchoring' : s)), 1600);
      const res = await submitQuery(query.trim(), address ?? undefined);
      setResult(res);
      setStep('complete');
      trackEvent('query_complete', { entryId: res.provenance.entryId ?? 0 });
    } catch (err) {
      setStep('error');
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Check your connection and try again.',
      );
    }
  };

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
        <label htmlFor="query" className="sr-only">
          Research question
        </label>
        <textarea
          id="query"
          rows={3}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a research question… e.g. What are the latest findings on coral reef recovery?"
          className="w-full resize-none rounded-xl border border-white/10 bg-ink-950/50 px-4 py-3 text-base text-white placeholder:text-ink-100/40 focus:border-signal-400/50 focus:outline-none focus:ring-1 focus:ring-signal-400/30"
        />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {!isConnected ? (
            <p className="text-sm text-amber-200/90">
              Connect Freighter (testnet) to submit queries with on-chain provenance.
            </p>
          ) : (
            <p className="text-sm text-ink-100/60">Submitting as {address?.slice(0, 8)}…</p>
          )}
          <div className="flex gap-2">
            {isConnected ? (
              <button
                type="button"
                onClick={() => disconnect()}
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
              >
                Disconnect Wallet
              </button>
            ) : (
              <button
                type="button"
                onClick={() => connect()}
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
              >
                Connect Wallet
              </button>
            )}
            <button
              type="button"
              onClick={runQuery}
              disabled={step !== 'idle' && step !== 'complete' && step !== 'error'}
              className="rounded-full bg-signal-500 px-6 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-signal-400 disabled:opacity-50"
            >
              {step !== 'idle' && step !== 'complete' && step !== 'error' ? 'Working…' : 'Ask ProvenanceBot'}
            </button>
          </div>
        </div>
      </div>

      {step !== 'idle' && step !== 'complete' && step !== 'error' && (
        <ProgressSteps step={step} />
      )}

      {step !== 'idle' && step !== 'complete' && step !== 'error' && <ResultsSkeleton />}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
          <button type="button" onClick={runQuery} className="ml-3 underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {result && step === 'complete' && <ResultsView result={result} />}
    </section>
  );
}
