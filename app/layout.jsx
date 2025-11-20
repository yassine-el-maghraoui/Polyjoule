import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Providers from '@/components/Providers';
import BootstrapClient from '@/components/BootstrapClient';

export const metadata = {
  title: 'Polyjoule',
  description: "Polyjoule - Association étudiante dédiée à l'innovation énergétique.",
  icons: {
    // On utilise ton logo existant comme icône pour l'onglet du navigateur
    icon: '/images/icons.png', 
    // Tu pourras ajouter 'apple' pour les iPhones plus tard si besoin
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/remixicon@4.2.0/fonts/remixicon.css"
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
