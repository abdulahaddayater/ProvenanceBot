'use client';

import type { SourceResponse } from '@/lib/api';

interface SourceChipProps {
  index: number;
  source?: SourceResponse;
  onClick: () => void;
}

export function SourceChip({ index, source, onClick }: SourceChipProps) {
  const label = source?.publisher
    ? `[${index}] ${source.publisher}`
    : source?.title
      ? `[${index}] ${source.title.slice(0, 40)}${source.title.length > 40 ? '…' : ''}`
      : `[${index}]`;

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="mx-0.5 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full border border-signal-400/50 bg-signal-400/10 px-1.5 font-mono text-xs font-semibold text-signal-300 transition hover:bg-signal-400/25 hover:text-signal-200"
      aria-label={`View source ${index}${source?.publisher ? `: ${source.publisher}` : ''}`}
    >
      [{index}]
    </button>
  );
}
