import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';

// Le site consomme des contenus modifiables via le back-office (Prisma).
// En production (Vercel), sans config explicite Next peut servir une version mise en cache.
// On force donc le rendu dynamique pour refléter les changements immédiatement.

export default function SiteLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="flex-grow-1">{children}</main>
      <Footer />
    </>
  );
}
