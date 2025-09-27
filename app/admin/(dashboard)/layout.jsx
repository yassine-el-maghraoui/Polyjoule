import Link from 'next/link';
import { redirect } from 'next/navigation';

import AdminNav from '@/components/admin/AdminNav';
import { getSession } from '@/lib/auth';
import { COLLECTION_DEFINITIONS } from '@/lib/collections';

const navigationGroups = [
  {
    label: 'Accueil',
    items: [
      { collection: 'home-hero' },
      { collection: 'quick-links' },
      { collection: 'partners' },
    ],
  },
  {
    label: 'Pages clés',
    items: [
      { collection: 'palmares' },
      { collection: 'timeline' },
      { collection: 'vehicles' },
      { collection: 'page-presentation' },
    ],
  },
  {
    label: 'Calendrier & galerie',
    items: [
      { collection: 'events-upcoming' },
      { collection: 'events-past' },
      { collection: 'event-detail' },
      { collection: 'gallery-slides' },
    ],
  },
];

export default async function AdminLayout({ children }) {
  const session = await getSession();

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="bg-light min-vh-100">
      <AdminNav user={session.user} />
      <div className="container-fluid">
        <div className="row">
          <aside className="col-12 col-lg-3 col-xl-2 mb-4">
            <div className="card shadow-sm">
              <div className="card-body">
                {navigationGroups.map((group) => (
                  <div key={group.label} className="mb-4">
                    <p className="text-uppercase text-secondary small fw-semibold mb-2">{group.label}</p>
                    <ul className="list-unstyled d-grid gap-2">
                      {group.items.map((item) => {
                        const definition = COLLECTION_DEFINITIONS[item.collection];
                        if (!definition) return null;
                        return (
                          <li key={item.collection}>
                            <Link href={`/admin/collections/${item.collection}`} className="btn btn-outline-primary w-100">
                              {definition.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </aside>
          <section className="col-12 col-lg-9 col-xl-10 mb-5">{children}</section>
        </div>
      </div>
    </div>
  );
}
