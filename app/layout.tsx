export const metadata = {
  title: 'Visual Contract Demo',
  description: 'Figma→Code visual alignment harness',
};

import './globals.css';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
