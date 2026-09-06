import type { Metadata } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://kenyaIsNepal.org'),
  title: 'kenyaIsNepal.org — Two Civilizations, One Family',
  description: 'East African youth from Kipsaraman standing with Nepal. A living digital pledge for food, shelter, medicine, rescue, and transparent solidarity.',
  openGraph: {
    title: 'kenyaIsNepal.org — Two Civilizations, One Family',
    description: 'East African youth from Kipsaraman standing with Nepal.',
    type: 'website',
    siteName: 'kenyaIsNepal.org',
  },
  twitter: { card: 'summary_large_image', title: 'kenyaIsNepal.org — Two Civilizations, One Family' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}