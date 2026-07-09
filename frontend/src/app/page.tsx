import { QueryForm } from '@/components/QueryForm';
import { TrustExplainer } from '@/components/TrustExplainer';

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
        <p className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Verifiable answers for journalists & researchers
        </p>
        <p className="mt-4 max-w-xl text-lg text-ink-100/80">
          Ask a question. Get a cited summary. Every source and summary hash is anchored on Stellar —
          so citations can be independently verified.
        </p>
        <div className="mt-10">
          <QueryForm />
        </div>
      </section>
      <TrustExplainer />
    </>
  );
}
