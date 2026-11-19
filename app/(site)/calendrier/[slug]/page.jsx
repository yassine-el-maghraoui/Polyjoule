import Image from 'next/image';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import { getEventPage } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const event = await getEventPage(slug);

  if (!event) {
    return { title: 'Événement - Polyjoule' };
  }

  const ogImage = event.imagePath
    ? [{ url: event.imagePath, width: 1200, height: 630, alt: event.title }]
    : [];

  return {
    title: `${event.title ?? 'Événement'} - Polyjoule`,
    description: event.intro,
    openGraph: {
      images: ogImage,
    },
  };
}

export default async function EventDetailPage({ params }) {
  const { slug } = await params;
  const { isEnabled: preview } = await draftMode();
  const event = await getEventPage(slug, { includeDrafts: preview });

  if (!event) {
    notFound();
  }

  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.location || 'Nantes',
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.location || 'Nantes',
        addressCountry: 'FR',
      },
    },
    image: event.imagePath ? [event.imagePath] : undefined,
    description: event.intro,
    organizer: {
      '@type': 'Organization',
      name: 'Polyjoule',
      url: 'https://polyjoule.fr',
    },
  };

  return (
    <section className="py-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <div className="container">
        <div className="section-card mx-auto" style={{ maxWidth: '960px' }}>
          <div className="row g-4 align-items-center">
            <div className="col-lg-6 order-lg-2 text-center">
              {event.imagePath ? (
                <Image
                  src={event.imagePath}
                  alt={event.title}
                  width={560}
                  height={360}
                  className="img-fluid rounded-4 shadow"
                />
              ) : null}
            </div>
            <div className="col-lg-6 order-lg-1">
              <span className="badge badge-soft-primary">Calendrier</span>
              <h1 className="h3 fw-bold text-primary mt-3">{event.title}</h1>
              {event.date || event.location ? (
                <p className="text-uppercase text-secondary fw-semibold small">
                  {[event.date, event.location].filter(Boolean).join(' · ')}
                </p>
              ) : null}
              {event.intro ? <p className="text-secondary fs-5">{event.intro}</p> : null}
              {event.bodyHtml ? (
                <div className="text-secondary fs-5" dangerouslySetInnerHTML={{ __html: event.bodyHtml }} />
              ) : null}
            </div>
          </div>
        </div>

        {event.photos.length ? (
          <div className="mx-auto mt-5" style={{ maxWidth: '960px' }}>
            <h2 className="h4 fw-bold text-primary mb-4">Album photos</h2>
            <div className="row g-3">
              {event.photos.map((photo, index) => (
                <div className="col-6 col-md-4" key={photo}>
                  <a href={photo} target="_blank" rel="noreferrer" className="d-block ratio ratio-4x3 rounded-4 overflow-hidden shadow-sm">
                    <Image
                      src={photo}
                      alt={`${event.title} — photo ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 320px"
                      className="object-fit-cover"
                    />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
