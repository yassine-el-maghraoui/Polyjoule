import Image from 'next/image';
import Link from 'next/link';
import { draftMode } from 'next/headers';

import { getCollectionEntries } from '@/lib/content';

export const metadata = {
  title: 'Calendrier - Polyjoule',
};

function EventCard({ event, variant = 'primary' }) {
  const data = event.data ?? {};
  const buttonClass = variant === 'primary' ? 'btn btn-primary' : 'btn btn-outline-primary';

  return (
    <div className="col-sm-6 col-lg-4">
      <div className="card event-card h-100">
        {data.imagePath ? (
          <Image
            src={data.imagePath}
            alt={data.title ?? event.title}
            width={480}
            height={320}
            className="card-img-top"
          />
        ) : null}
        <div className="card-body d-flex flex-column">
          <span className="text-uppercase text-secondary fw-semibold small mb-2">{data.date}</span>
          <h3 className="h5 fw-bold">{data.title ?? event.title}</h3>
          <p className="text-secondary">{data.summary}</p>
          {data.ctaHref ? (
            <Link className={`${buttonClass} mt-auto`} href={data.ctaHref}>
              {data.ctaLabel ?? 'Explorer'}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default async function CalendrierPage() {
  const { isEnabled: preview } = await draftMode();
  const upcoming = await getCollectionEntries('events-upcoming', { includeDrafts: preview });
  const past = await getCollectionEntries('events-past', { includeDrafts: preview });

  return (
    <section className="py-5">
      <div className="container">
        <div className="text-center mb-5">
          <span className="badge badge-soft-primary">Vie associative</span>
          <h1 className="mt-3 fw-bold text-primary">Calendrier Polyjoule</h1>
          <p className="text-secondary mb-0">
            Ateliers, compétitions et temps forts : suivez nos prochains rendez-vous et redécouvrez ceux qui ont marqué la saison.
          </p>
        </div>

        <div className="mb-5">
          <h2 className="h4 fw-bold text-primary mb-4">Événements à venir</h2>
          <div className="row g-4">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} variant="primary" />
            ))}
          </div>
        </div>

        <div>
          <h2 className="h4 fw-bold text-primary mb-4">Événements passés</h2>
          <div className="row g-4">
            {past.map((event) => (
              <EventCard key={event.id} event={event} variant="outline" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
