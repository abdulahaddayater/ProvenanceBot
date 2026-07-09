'use client';

export function trackEvent(name: string, props?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { posthog?: { capture: (e: string, p?: object) => void } };
  if (w.posthog) {
    w.posthog.capture(name, props);
  }
}

export function initAnalytics() {
  if (typeof window === 'undefined') return;
  const key = process.env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY;
  if (!key) return;
  import('posthog-js').then(({ default: posthog }) => {
    posthog.init(key, {
      api_host: 'https://app.posthog.com',
      capture_pageview: true,
    });
    (window as unknown as { posthog: typeof posthog }).posthog = posthog;
  });
}
