import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/providers/QueryProvider';
import { SocketProvider } from '@/providers/SocketProvider';
import { FeatureFlagProvider } from '@/providers/FeatureFlagProvider';
import { AuthProvider } from '@/lib/auth/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AuraOS - Intelligent Human Capital Platform',
  description: 'The Intelligence Around Your Workforce',
  manifest: '/manifest.json',
  themeColor: '#4f46e5',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AuraOS',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Service worker only in production — in dev it caches stale
              // webpack chunks across Prisma/code regenerations and breaks
              // hot-reload with "Cannot read properties of undefined (reading 'call')".
              if ('serviceWorker' in navigator) {
                if (${process.env.NODE_ENV === 'production'}) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').catch(function() {});
                  });
                } else {
                  // Dev: unregister any leftover SW from a prior prod build / earlier dev session.
                  navigator.serviceWorker.getRegistrations().then(function(rs) {
                    rs.forEach(function(r) { r.unregister(); });
                  });
                }
              }
            `,
          }}
        />
        <QueryProvider>
          <AuthProvider>
            <SocketProvider>
              <FeatureFlagProvider>
                {children}
                <Toaster position="top-right" richColors />
              </FeatureFlagProvider>
            </SocketProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
