import Link from 'next/link';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { COLLECTION_DEFINITIONS } from '@/lib/collections';

export const metadata = {
  title: 'Back-office Polyjoule',
};

export const dynamic = 'force-dynamic';

const QUICK_ACTIONS = [
  {
    collection: 'events',
    icon: 'ri-calendar-event-line',
    title: 'Un événement',
    description: 'Course, salon, atelier… avec ses photos.',
  },
  {
    collection: 'announcements',
    icon: 'ri-megaphone-line',
    title: 'Une annonce',
    description: 'Un message dans le bandeau en haut du site.',
  },
  {
    collection: 'gallery-slides',
    icon: 'ri-image-add-line',
    title: 'Une photo',
    description: 'Dans le diaporama de la galerie.',
  },
  {
    collection: 'palmares',
    icon: 'ri-trophy-line',
    title: 'Un résultat',
    description: 'Une nouvelle ligne au palmarès.',
  },
];

const FEED_SIZE = 20;

function thumbnailOf(data) {
  const gallery = Array.isArray(data.galleryPaths) ? data.galleryPaths : [];
  return data.imagePath || data.illustrationPath || data.logoPath || gallery[0] || '';
}

function parseData(raw) {
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}

function timeAgo(date) {
  const seconds = Math.round((new Date(date).getTime() - Date.now()) / 1000);
  const units = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  const format = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) {
      return format.format(Math.round(seconds / size), unit);
    }
  }
  return 'à l’instant';
}

async function getFeed() {
  const entries = await prisma.contentEntry.findMany({
    where: { collection: { in: Object.keys(COLLECTION_DEFINITIONS) } },
    orderBy: { updatedAt: 'desc' },
    take: FEED_SIZE,
    include: {
      revisions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { author: { select: { name: true, email: true } } },
      },
    },
  });

  return entries.map((entry) => {
    const data = parseData(entry.data);
    const definition = COLLECTION_DEFINITIONS[entry.collection];
    const author = entry.revisions[0]?.author;
    return {
      id: entry.id,
      href: `/admin/collections/${entry.collection}/${entry.id}`,
      section: definition.label,
      title:
        entry.title || data.title || data.message || data.name || data.altText || 'Sans titre',
      thumbnail: thumbnailOf(data),
      status: entry.status,
      author: author ? author.name || author.email : null,
      updatedAt: entry.updatedAt,
    };
  });
}

export default async function AdminDashboardPage() {
  const [feed, drafts, user] = await Promise.all([
    getFeed(),
    prisma.contentEntry.count({ where: { status: 'draft' } }),
    getCurrentUser(),
  ]);

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h1 className="h4 fw-bold text-primary mb-1">
          Bonjour{user?.name ? ` ${user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-secondary mb-0">Que voulez-vous publier aujourd’hui ?</p>
      </div>

      <div className="row g-3">
        {QUICK_ACTIONS.map((action) => (
          <div className="col-6 col-xl-3" key={action.collection}>
            <Link
              href={`/admin/collections/${action.collection}/new`}
              className="card shadow-sm border-0 h-100 text-decoration-none admin-quick-action"
            >
              <div className="card-body">
                <i className={`${action.icon} fs-3 text-primary`} aria-hidden="true"></i>
                <h2 className="h6 fw-bold text-primary mt-2 mb-1">{action.title}</h2>
                <p className="text-secondary small mb-0">{action.description}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex flex-wrap align-items-baseline justify-content-between gap-2 mb-3">
            <h2 className="h5 fw-bold text-primary mb-0">Dernières modifications</h2>
            {drafts ? (
              <span className="badge text-bg-warning">
                {drafts} brouillon{drafts > 1 ? 's' : ''} pas encore en ligne
              </span>
            ) : null}
          </div>

          {feed.length ? (
            <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
              {feed.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="d-flex align-items-center gap-3 p-2 rounded-3 text-decoration-none admin-feed-item"
                  >
                    <div
                      className="rounded-3 bg-light flex-shrink-0 overflow-hidden d-flex align-items-center justify-content-center"
                      style={{ width: '64px', height: '64px' }}
                    >
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt="" className="w-100 h-100 object-fit-cover" loading="lazy" />
                      ) : (
                        <i className="ri-file-text-line fs-4 text-secondary" aria-hidden="true"></i>
                      )}
                    </div>
                    <div className="flex-grow-1 admin-feed-text">
                      <div className="fw-semibold text-body text-truncate">{item.title}</div>
                      <div className="small text-secondary">
                        {item.section} · {timeAgo(item.updatedAt)}
                        {item.author ? ` · par ${item.author}` : ''}
                      </div>
                    </div>
                    {item.status === 'published' ? (
                      <span className="badge text-bg-success">En ligne</span>
                    ) : (
                      <span className="badge text-bg-secondary">Brouillon</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-secondary mb-0">Rien pour l’instant. Commencez par publier un événement !</p>
          )}
        </div>
      </div>

      {user?.role === 'admin' ? (
        <p className="small text-secondary mb-0">
          Besoin d’ajouter quelqu’un de l’équipe ? <Link href="/admin/utilisateurs">Gérer les comptes</Link>
        </p>
      ) : null}
    </div>
  );
}
