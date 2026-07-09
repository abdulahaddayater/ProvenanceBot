export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
      <p className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
        ProvenanceBot
      </p>
      <h1 className="mt-4 max-w-xl text-lg text-ink-100 sm:text-xl">
        Verifiable answers with sources hashed and anchored on Stellar/Soroban.
      </h1>
      <p className="mt-6 text-sm text-ink-100/70">
        Frontend scaffolding only — query UI and verify-source chips land in a later commit.
      </p>
    </main>
  );
}
