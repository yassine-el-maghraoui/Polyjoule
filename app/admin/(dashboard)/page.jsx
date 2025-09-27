import Link from 'next/link';

import prisma from '@/lib/prisma';

export const metadata = {
  title: 'Back-office Polyjoule',
};

async function getStats() {
  const [publishedEntries, draftEntries, users] = await Promise.all([
    prisma.contentEntry.count({ where: { status: 'published' } }),
    prisma.contentEntry.count({ where: { status: 'draft' } }),
    prisma.user.count(),
  ]);

  return { publishedEntries, draftEntries, users };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className="container-fluid px-0">
      <div className="row g-4">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h1 className="h4 fw-bold text-primary mb-2">Tableau de bord</h1>
              <p className="text-secondary mb-0">
                Gérez les contenus du site Polyjoule : actualités, pages, palmarès, galeries et partenaires.
              </p>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-4">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body">
              <p className="text-uppercase text-secondary small fw-semibold">Contenus publiés</p>
              <h2 className="display-6 fw-bold text-primary">{stats.publishedEntries}</h2>
              <p className="text-secondary">Entrées visibles sur le site public.</p>
              <Link href="/admin/collections/palmares" className="btn btn-sm btn-outline-primary">
                Voir les contenus
              </Link>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-4">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body">
              <p className="text-uppercase text-secondary small fw-semibold">Brouillons</p>
              <h2 className="display-6 fw-bold text-primary">{stats.draftEntries}</h2>
              <p className="text-secondary">Contenus en cours de rédaction ou en attente de validation.</p>
              <Link href="/admin/collections/events-upcoming" className="btn btn-sm btn-outline-primary">
                Gérer les brouillons
              </Link>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-4">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body">
              <p className="text-uppercase text-secondary small fw-semibold">Comptes éditeurs</p>
              <h2 className="display-6 fw-bold text-primary">{stats.users}</h2>
              <p className="text-secondary mb-0">Contactez l’administrateur pour gérer les accès.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
