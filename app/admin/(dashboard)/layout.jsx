import { redirect } from 'next/navigation';

import AdminNav from '@/components/admin/AdminNav';
import AdminSidebar from '@/components/admin/AdminSidebar';

import { getCurrentUser } from '@/lib/auth';
import { COLLECTION_DEFINITIONS } from '@/lib/collections';

const navigationGroups = [
  {
    label: 'Publier',
    items: [
      { collection: 'events' },
      { collection: 'announcements' },
      { collection: 'gallery-slides' },
      { collection: 'palmares' },
    ],
  },
  {
    label: 'Accueil du site',
    items: [
      { collection: 'home-hero' },
      { collection: 'quick-links' },
      { collection: 'partners' },
      { collection: 'page-cagnotte' },
    ],
  },
  {
    label: 'Pages',
    items: [
      { collection: 'page-presentation' },
      { collection: 'vehicles' },
      { collection: 'timeline' },
    ],
  },
  {
    label: 'Ancien calendrier',
    items: [
      { collection: 'events-upcoming' },
      { collection: 'events-past' },
      { collection: 'event-detail' },
    ],
  },
];

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser({ allowPendingPasswordChange: true });

  if (!user) {
    redirect('/admin/login?expired=1');
  }
  if (user.mustChangePassword) {
    redirect('/admin/premiere-connexion');
  }

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <AdminNav user={user} />
      <div className="container-fluid flex-grow-1">
        <div className="row">
          <aside className="col-12 col-lg-3 col-xl-2 mb-4">
            <AdminSidebar
              navigationGroups={navigationGroups}
              collectionDefinitions={COLLECTION_DEFINITIONS}
              user={user}
            />
          </aside>
          <section className="col-12 col-lg-9 col-xl-10 mb-5">{children}</section>
        </div>
      </div>
      <footer className="border-top bg-white py-3">
        <div className="container-fluid text-center text-secondary small">
          Back-office Polyjoule — réservé à l&apos;équipe
        </div>
      </footer>
    </div>
  );
}
