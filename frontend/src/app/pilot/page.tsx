export default function PilotPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">Pilot Program</h1>
      <p className="mt-4 text-ink-100/80 leading-relaxed">
        Help us test ProvenanceBot before launch. We&apos;re looking for journalists and researchers to
        try verifiable AI summaries with on-chain source proof.
      </p>

      <ol className="mt-8 list-decimal space-y-4 pl-5 text-ink-100/90">
        <li>
          Install{' '}
          <a href="https://freighter.app" className="text-signal-400 hover:underline" target="_blank" rel="noopener noreferrer">
            Freighter
          </a>{' '}
          and switch to <strong className="text-white">Testnet</strong>.
        </li>
        <li>
          Go to the{' '}
          <a href="/" className="text-signal-400 hover:underline">
            home page
          </a>{' '}
          and connect your wallet.
        </li>
        <li>Ask 2–3 real research questions you&apos;d use in your work.</li>
        <li>Click a citation chip and verify it on-chain (green badge = verified).</li>
        <li>Leave feedback via the floating button (rating + optional comment).</li>
      </ol>

      <section className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="font-display text-lg font-semibold text-white">Recruitment message (copy & paste)</h2>
        <blockquote className="mt-4 text-sm leading-relaxed text-ink-100/80">
          Hi everyone — I&apos;m building ProvenanceBot, a research tool that anchors AI summary citations
          on the Stellar blockchain so you can verify sources weren&apos;t swapped after the fact. Looking
          for 10 journalists/researchers to pilot on testnet (~10 min): connect Freighter wallet, ask a few
          real questions, click a citation chip to verify on-chain, and leave quick feedback. Pilot page:{' '}
          [YOUR_LIVE_URL]/pilot — thanks!
        </blockquote>
      </section>
    </div>
  );
}
