'use client';

import { useMemo, useState } from 'react';
import type { ClaimMapping, QueryResponse, SourceResponse } from '@/lib/api';
import { SourceChip } from './SourceChip';
import { SourcePanel } from './SourcePanel';

function buildSentences(summary: string): string[] {
  return summary.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()) ?? [summary];
}

interface ResultsViewProps {
  result: QueryResponse;
}

export function ResultsView({ result }: ResultsViewProps) {
  const [activeSource, setActiveSource] = useState<SourceResponse | null>(null);
  const sentences = useMemo(() => buildSentences(result.summary), [result.summary]);

  const chipsForSentence = (idx: number): number[] => {
    const mapping = result.claimMappings.find((m: ClaimMapping) => m.sentenceIndex === idx);
    return mapping?.sourceIndices ?? [];
  };

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      {result.status === 'partial' && result.failedSources.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Some sources could not be fetched. The summary uses {result.sources.length} of{' '}
          {result.sources.length + result.failedSources.length} attempted sources.
        </div>
      )}

      <div className="prose prose-invert max-w-none text-base leading-relaxed text-ink-50">
        {sentences.map((sentence, idx) => {
          const chips = chipsForSentence(idx);
          return (
            <p key={idx} className="mb-4">
              {sentence}
              {chips.map((i) => {
                const src = result.sources.find((s) => s.index === i);
                return (
                  <SourceChip
                    key={i}
                    index={i}
                    source={src}
                    onClick={() => src && setActiveSource(src)}
                  />
                );
              })}
            </p>
          );
        })}
      </div>

      {result.provenance.entryId && (
        <footer className="mt-6 border-t border-white/10 pt-4 text-xs text-ink-100/60">
          On-chain entry #{result.provenance.entryId}
          {result.provenance.txHash && (
            <>
              {' · '}
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${result.provenance.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-signal-400 hover:underline"
              >
                View transaction
              </a>
            </>
          )}
        </footer>
      )}

      {activeSource && (
        <SourcePanel
          source={activeSource}
          entryId={result.provenance.entryId}
          open={Boolean(activeSource)}
          onClose={() => setActiveSource(null)}
        />
      )}
    </article>
  );
}
