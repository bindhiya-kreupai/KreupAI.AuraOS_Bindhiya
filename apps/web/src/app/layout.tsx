import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/providers/QueryProvider';
import { SocketProvider } from '@/providers/SocketProvider';
import { FeatureFlagProvider } from '@/providers/FeatureFlagProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AuraOS - Intelligent Human Capital Platform',
  description: 'The Intelligence Around Your Workforce',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <SocketProvider>
            <FeatureFlagProvider>
              {children}
              <Toaster position="top-right" richColors />
            </FeatureFlagProvider>
          </SocketProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
