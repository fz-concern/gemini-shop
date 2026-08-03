import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TeleShop Premium - Gemini 18-Month Links & Digital Market',
  description: 'Automated digital products marketplace with 18-month Gemini AI subscription links, VPN vouchers, and instant key delivery.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased selection:bg-gold-500/30 selection:text-espresso-900">
        {children}
      </body>
    </html>
  );
}
