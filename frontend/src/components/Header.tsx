'use client';

import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';

export function Header() {
  const { address, connect, disconnect, connecting, truncate } = useWallet();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-white">
          ProvenanceBot
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-ink-100/80 sm:flex">
          <Link href="/#how-it-works" className="hover:text-white">
            How it works
          </Link>
          <Link href="/pilot" className="hover:text-white">
            Pilot
          </Link>
          <Link href="/status" className="hover:text-white">
            Status
          </Link>
          <Link href="/admin" className="hover:text-white">
            Admin
          </Link>
        </nav>
        {address ? (
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-signal-400/40 bg-signal-400/10 px-3 py-1.5 font-mono text-xs text-signal-300">
              {truncate(address)}
            </span>
            <button
              type="button"
              onClick={() => disconnect()}
              className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white hover:bg-white/10"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => connect()}
            disabled={connecting}
            className="rounded-full bg-signal-500 px-4 py-2 text-sm font-medium text-ink-950 transition hover:bg-signal-400 disabled:opacity-60"
          >
            {connecting ? 'Connecting…' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </header>
  );
}
