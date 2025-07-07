// app/layout.tsx
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import '../styles/globals.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import ClientProviders from '@/components/ClientProviders';
import { Notifications } from '@mantine/notifications';

export const metadata = {
  title: 'PaperGrader',
  description: 'A project using Next.js 15 with Tailwind + Mantine',
  icons: {
    icon: '/icon/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <ClientProviders>
          <Notifications position="bottom-right" limit={3} />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
