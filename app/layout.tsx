import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Leelanau Cellars Wine Hub',
  description: 'Wine knowledge, tasting-room guides and sales tech sheets for Leelanau Cellars.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script src="https://dev-center.platform.commerce7.com/v2/commerce7.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
