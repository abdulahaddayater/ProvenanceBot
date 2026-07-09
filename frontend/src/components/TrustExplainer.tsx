export function TrustExplainer() {
  return (
    <section id="how-it-works" className="scroll-mt-24 border-t border-white/10 py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
          How ProvenanceBot guarantees provenance
        </h2>
        <p className="mt-4 text-ink-100/80 leading-relaxed">
          When you ask a question, ProvenanceBot fetches real sources, creates a cryptographic fingerprint
          (hash) of each one, writes an AI summary, and anchors everything together on the Stellar blockchain
          in a single batch. That means:
        </p>
        <ul className="mt-6 space-y-4 text-ink-100/90">
          <li className="flex gap-3">
            <span className="text-signal-400">①</span>
            <span>
              <strong className="text-white">Sources are locked in.</strong> Each citation chip links to a
              hash of the exact content retrieved — even if the live webpage changes later, we keep an
              archived copy.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-signal-400">②</span>
            <span>
              <strong className="text-white">Summaries cannot be swapped.</strong> The summary hash is
              stored on-chain alongside the source hashes. Recompute the hash from the displayed text and
              it must match what&apos;s on Stellar.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-signal-400">③</span>
            <span>
              <strong className="text-white">Anyone can verify.</strong> Click a chip, hit &quot;Verify
              on-chain,&quot; and see a green badge if the source hash matches the blockchain record — no
              crypto expertise required.
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}
