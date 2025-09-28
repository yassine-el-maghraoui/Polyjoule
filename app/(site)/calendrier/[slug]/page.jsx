import Image from 'next/image';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';

import { getEntry } from '@/lib/content';

export async function generateMetadata({ params }) {
  const entry = await getEntry('event-detail', params.slug);

  if (!entry) {
    return { title: 'Événement - Polyjoule' };
  }

  return {
    title: `${entry.data?.title ?? 'Événement'} - Polyjoule`,
    description: entry.data?.intro,
  };
}

export default async function EventDetailPage({ params }) {
  const { isEnabled: preview } = await draftMode();
  const entry = await getEntry('event-detail', params.slug, { includeDrafts: preview });

  if (!entry) {
    notFound();
  }

  const data = entry.data ?? {};

  return (
    <section className="py-5">
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
