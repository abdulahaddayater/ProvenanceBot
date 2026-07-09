'use client';

import { useEffect } from 'react';
import { initAnalytics } from '@/hooks/useAnalytics';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAnalytics();
  }, []);
  return <>{children}</>;
}
