import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProvenanceBot',
  description: 'Verifiable content-sourcing agent on Stellar/Soroban',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
