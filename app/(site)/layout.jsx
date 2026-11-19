import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';

export default function SiteLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="flex-grow-1">{children}</main>
      <Footer />
    </>
  );
}
