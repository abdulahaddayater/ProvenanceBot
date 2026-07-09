export type PipelineStep = 'idle' | 'fetching' | 'summarizing' | 'anchoring' | 'complete' | 'error';

const STEPS: { id: PipelineStep; label: string }[] = [
  { id: 'fetching', label: 'Fetching sources' },
  { id: 'summarizing', label: 'Summarizing' },
  { id: 'anchoring', label: 'Anchoring on-chain' },
];

export function ProgressSteps({ step }: { step: PipelineStep }) {
  if (step === 'idle' || step === 'complete' || step === 'error') return null;

  const order: PipelineStep[] = ['fetching', 'summarizing', 'anchoring'];
  const currentIdx = order.indexOf(step);

  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:gap-6" aria-label="Pipeline progress">
      {STEPS.map((s, i) => {
        const done = currentIdx > i;
        const active = s.id === step;
        return (
          <li
            key={s.id}
            className={`flex items-center gap-2 text-sm ${active ? 'text-signal-300' : done ? 'text-ink-100/60' : 'text-ink-100/30'}`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${active ? 'bg-signal-500 text-ink-950 animate-pulse' : done ? 'bg-signal-500/30 text-signal-300' : 'bg-white/10'}`}
            >
              {done ? '✓' : i + 1}
            </span>
            {s.label}
          </li>
        );
      })}
    </ol>
  );
}

export function ResultsSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-hidden>
      <div className="h-4 w-3/4 rounded bg-white/10" />
      <div className="h-4 w-full rounded bg-white/10" />
      <div className="h-4 w-5/6 rounded bg-white/10" />
      <div className="mt-6 flex gap-2">
        <div className="h-6 w-8 rounded-full bg-white/10" />
        <div className="h-6 w-8 rounded-full bg-white/10" />
      </div>
    </div>
  );
}
