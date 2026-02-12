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
  alternates: {
    canonical: './',
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
  manifest: '/manifest.json',
};

import { Noto_Sans_JP } from 'next/font/google';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-noto',
  display: 'swap',
});

import GoogleAnalytics from '@/components/GoogleAnalytics';

export default function RootLayout({ children }) {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteConfig.name,
      alternateName: ['Polyjoule', 'Association Polyjoule'],
      url: siteConfig.url,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}${siteConfig.assets.logo}`,
      sameAs: [
        siteConfig.social.facebook,
        siteConfig.social.instagram,
        siteConfig.social.linkedin,
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: siteConfig.address.street,
        addressLocality: siteConfig.address.city,
        postalCode: siteConfig.address.zipCode,
        addressCountry: siteConfig.address.country,
      },
      email: siteConfig.email,
    }
  ];

  return (
    <html lang="fr" className={notoSansJP.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css"
        />
        <meta name="apple-mobile-web-app-title" content="Polyjoule" />
        {process.env.NEXT_PUBLIC_GSC_VERIFICATION && (
          <meta
            name="google-site-verification"
            content={process.env.NEXT_PUBLIC_GSC_VERIFICATION}
          />
        )}
        {/* <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        /> */}
      </head>
      <body className="bg-light d-flex flex-column min-vh-100">
        <Providers>
          <GoogleAnalytics />
          <BootstrapClient />
          {children}
        </Providers>
      </body>
    </html>
  );
}
