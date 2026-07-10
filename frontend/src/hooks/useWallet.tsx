'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { isConnected, getPublicKey, requestAccess } from '@stellar/freighter-api';

const DISCONNECT_KEY = 'provenancebot.walletDisconnected';

interface WalletContextValue {
  address: string | null;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  truncate: (addr: string) => string;
  isConnected: boolean;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem(DISCONNECT_KEY) === '1') {
      return;
    }

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
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(DISCONNECT_KEY);
      }
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

  const disconnect = useCallback(() => {
    setAddress(null);
    setError(null);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(DISCONNECT_KEY, '1');
      const w = window as unknown as { posthog?: { capture: (e: string) => void } };
      w.posthog?.capture('wallet_disconnected');
    }
  }, []);

  const truncate = useCallback((addr: string) => `${addr.slice(0, 4)}…${addr.slice(-4)}`, []);

  const value = useMemo(
    () => ({
      address,
      connecting,
      error,
      connect,
      disconnect,
      truncate,
      isConnected: Boolean(address),
    }),
    [address, connecting, connect, disconnect, error, truncate],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return ctx;
}
