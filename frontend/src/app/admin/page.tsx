'use client';

import { useEffect, useState } from 'react';
import { fetchAdminData } from '@/lib/api';

export default function AdminPage() {
  const [interactions, setInteractions] = useState<unknown[]>([]);
  const [feedback, setFeedback] = useState<unknown[]>([]);

  useEffect(() => {
    fetchAdminData().then((d) => {
      setInteractions(d.interactions);
      setFeedback(d.feedback);
    });
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">Admin Dashboard</h1>
      <p className="mt-2 text-ink-100/70">Wallet interactions and pilot feedback for submission evidence.</p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-white">Wallet interactions ({interactions.length})</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-white/5 text-ink-100/60">
              <tr>
                <th className="px-4 py-3">Wallet</th>
                <th className="px-4 py-3">Entry ID</th>
                <th className="px-4 py-3">Tx Hash</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {(interactions as Array<Record<string, string>>).map((row) => (
                <tr key={row.id} className="border-t border-white/5">
                  <td className="px-4 py-3 font-mono text-xs">{row.walletAddress?.slice(0, 12)}…</td>
                  <td className="px-4 py-3">{row.entryId}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.txHash?.slice(0, 12)}…</td>
                  <td className="px-4 py-3">{row.timestamp ? new Date(row.timestamp).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-white">Feedback ({feedback.length})</h2>
        <div className="mt-4 space-y-3">
          {(feedback as Array<Record<string, string | number>>).map((f) => (
            <div key={String(f.id)} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
              <span className="font-semibold text-signal-300">{f.rating}/5</span>
              {f.comment && <p className="mt-1 text-ink-100">{f.comment}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
