import Image from 'next/image';
import { draftMode } from 'next/headers';

import { getCollectionEntries } from '@/lib/content';

export const metadata = {
  title: 'Historique - Polyjoule',
};

export default async function HistoriquePage() {
  const { isEnabled: preview } = await draftMode();
  const timeline = await getCollectionEntries('timeline', { includeDrafts: preview });

  return (
    <section className="py-5">
      <div className="container">
        <div className="text-center mb-5">
          <span className="badge badge-soft-primary">Depuis 2005</span>
          <h1 className="mt-3 fw-bold text-primary">L’histoire de Polyjoule</h1>
          <p className="text-secondary mb-0">
            Une progression continue portée par l’innovation étudiante et des partenaires fidèles.
          </p>
        </div>

        <div className="timeline-vertical">
          {timeline.map((item, index) => {
            const data = item.data ?? {};
            const isAlternate = index % 2 === 1;

            return (
              <article className="timeline-item" key={item.id}>
                <div className="row g-4 align-items-center">
                  <div className={`col-lg-6 ${isAlternate ? 'order-lg-2' : ''}`}>
                    <span className="timeline-year">{data.year ?? item.slug}</span>
                    <h2 className="h5 fw-bold text-primary">{data.title ?? item.title}</h2>
                    <p className="text-secondary mb-0">{data.description}</p>
                  </div>
                  <div className={`col-lg-6 text-center ${isAlternate ? 'order-lg-1' : ''}`}>
                    {data.imagePath ? (
                      <Image
                        src={data.imagePath}
                        alt={data.imageAlt ?? data.title ?? 'Polyjoule'}
                        width={560}
                        height={380}
                        className="img-fluid rounded-4 shadow"
                      />
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
