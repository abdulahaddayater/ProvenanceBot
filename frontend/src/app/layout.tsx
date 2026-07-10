import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import { FeedbackWidget } from '@/components/FeedbackWidget';
import { WalletProvider } from '@/hooks/useWallet';

export const metadata: Metadata = {
  title: 'ProvenanceBot — Verifiable research answers',
  description: 'AI summaries with source citations anchored on Stellar/Soroban',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AnalyticsProvider>
          <WalletProvider>
            <Header />
            <main>{children}</main>
            <FeedbackWidget />
          </WalletProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
