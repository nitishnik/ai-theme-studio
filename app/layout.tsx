import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Chromatic — AI Theme Studio',
  description: 'Generate, refine and export complete design-system themes.',
  icons: { icon: '/favicon.svg' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
