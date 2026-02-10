import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Providers from '@/components/Providers';
import BootstrapClient from '@/components/BootstrapClient';

import { siteConfig } from '@/lib/site.config';

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ['Polyjoule', 'Polytech Nantes', 'Énergie', 'Hydrogène', 'Véhicule électrique', 'Association étudiante'],
  authors: [{ name: 'Polyjoule Team', url: siteConfig.url }],
  creator: 'Polyjoule',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.assets.logo,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.assets.logo],
    creator: '@Polyjoule',
  },
  icons: {
    icon: '/images/icons.png',
    shortcut: '/images/icons.png',
    apple: '/images/icons.png',
  },
  manifest: '/site.webmanifest',
};

import { Noto_Sans_JP } from 'next/font/google';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-noto',
  display: 'swap',
});

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    alternateName: ['Polyjoule', 'Association Polyjoule'],
    url: siteConfig.url,
  };

  return (
    <html lang="fr" className={notoSansJP.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-light d-flex flex-column min-vh-100">
        <Providers>
          <BootstrapClient />
          {children}
        </Providers>
      </body>
    </html>
  );
}
