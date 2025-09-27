import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';

export default function SiteLayout({ children }) {
  return (
    <>
      <SiteNav />
      <main className="flex-grow-1">{children}</main>
      <SiteFooter />
    </>
  );
}
