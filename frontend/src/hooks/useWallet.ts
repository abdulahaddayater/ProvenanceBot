'use client';

import { useCallback, useEffect, useState } from 'react';
import { isConnected, getPublicKey, requestAccess } from '@stellar/freighter-api';

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    isConnected().then((connected) => {
      if (connected) {
        getPublicKey().then((key) => {
          if (key) setAddress(key);
        });
      }
    });
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const key = await requestAccess();
      if (key) {
        setAddress(key);
        if (typeof window !== 'undefined') {
          const w = window as unknown as { posthog?: { capture: (e: string, p?: object) => void } };
          w.posthog?.capture('wallet_connected', { address: key.slice(0, 8) });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  }, []);

  const truncate = (addr: string) => `${addr.slice(0, 4)}…${addr.slice(-4)}`;

  return { address, connecting, error, connect, truncate, isConnected: Boolean(address) };
}
