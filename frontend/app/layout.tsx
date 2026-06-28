import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import '@cloudscape-design/global-styles/index.css';
import './globals.css';

import { AppProviders } from '@/providers/app-providers';

export const metadata: Metadata = {
  title: 'Route 53 — Console (Clone)',
  description: 'AWS Route 53 console clone built with Next.js + Cloudscape',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
