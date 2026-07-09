'use client';

import { useEffect, useState } from 'react';
import { fetchStatus } from '@/lib/api';
import { publicConfig } from '@/lib/config';

export default function StatusPage() {
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetchStatus().then(setStatus).catch(() => setStatus(null));
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">System Status</h1>
      <dl className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div>
          <dt className="text-sm text-ink-100/50">Network</dt>
          <dd className="text-white">Stellar Testnet</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-100/50">Contract ID</dt>
          <dd className="break-all font-mono text-sm text-signal-300">
            {publicConfig.provenanceContractId || 'Not configured'}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-ink-100/50">Agents API</dt>
          <dd className="text-white">{publicConfig.agentsApiUrl}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-100/50">Backend health</dt>
          <dd className={status?.status === 'ok' ? 'text-emerald-300' : 'text-amber-300'}>
            {status ? String(status.status) : 'Unreachable'}
          </dd>
        </div>
      </dl>
    </div>
  );
}
