import Image from 'next/image';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import { getEntry } from '@/lib/content';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const entry = await getEntry('event-detail', slug);

  if (!entry) {
    return { title: 'Événement - Polyjoule' };
  }


  const ogImage = entry.data?.imagePath
    ? [{ url: entry.data.imagePath, width: 1200, height: 630, alt: entry.title }]
    : [];

  return {
    title: `${entry.data?.title ?? 'Événement'} - Polyjoule`,
    description: entry.data?.intro,
    openGraph: {
      images: ogImage,
    },
  };
}

export default async function EventDetailPage({ params }) {
  const { slug } = await params;
  const { isEnabled: preview } = await draftMode();
  const entry = await getEntry('event-detail', slug, { includeDrafts: preview });

  if (!entry) {
    notFound();
  }

  const data = entry.data ?? {};

  // Schema.org Event
  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: data.title ?? entry.title,
    startDate: data.date, // Assumes 'date' field exists in ISO format or similar
    endDate: data.dateEnd ?? data.date, // Optional end date
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: data.location ?? 'Nantes',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Nantes', // Default or dynamic if available
        addressCountry: 'FR',
      },
    },
    image: data.imagePath ? [data.imagePath] : undefined,
    description: data.intro,
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
              {data.imagePath ? (
                <Image
                  src={data.imagePath}
                  alt={data.title ?? entry.title}
                  width={560}
                  height={360}
                  className="img-fluid rounded-4 shadow"
                />
              ) : null}
            </div>
            <div className="col-lg-6 order-lg-1">
              <span className="badge badge-soft-primary">Calendrier</span>
              <h1 className="h3 fw-bold text-primary mt-3">{data.title ?? entry.title}</h1>
              {data.intro ? <p className="text-secondary fs-5">{data.intro}</p> : null}
              {data.bodyHtml ? (
                <div className="text-secondary fs-5" dangerouslySetInnerHTML={{ __html: data.bodyHtml }} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
