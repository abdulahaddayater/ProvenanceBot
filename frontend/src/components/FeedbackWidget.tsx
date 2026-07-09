'use client';

import { useState } from 'react';
import { submitFeedback } from '@/lib/api';
import { useWallet } from '@/hooks/useWallet';
import { trackEvent } from '@/hooks/useAnalytics';

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);
  const { address } = useWallet();

  const submit = async () => {
    if (rating < 1) return;
    await submitFeedback({ rating, comment, walletAddress: address ?? undefined });
    trackEvent('feedback_submitted', { rating });
    setSent(true);
    setTimeout(() => {
      setOpen(false);
      setSent(false);
      setRating(0);
      setComment('');
    }, 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-signal-500 px-4 py-3 text-sm font-semibold text-ink-950 shadow-lg hover:bg-signal-400"
      >
        Feedback
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-900 p-6">
            <h3 className="font-display text-lg font-semibold text-white">How was your experience?</h3>
            {sent ? (
              <p className="mt-4 text-signal-300">Thank you for your feedback!</p>
            ) : (
              <>
                <div className="mt-4 flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className={`h-10 w-10 rounded-full text-lg ${rating >= n ? 'bg-signal-500 text-ink-950' : 'bg-white/10 text-white'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Optional comments…"
                  rows={3}
                  className="mt-4 w-full rounded-xl border border-white/10 bg-ink-950/50 px-3 py-2 text-sm text-white"
                />
                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-ink-100/60">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    className="rounded-full bg-signal-500 px-4 py-2 text-sm font-medium text-ink-950"
                  >
                    Submit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
