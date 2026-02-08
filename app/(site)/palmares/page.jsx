import Image from 'next/image';
import { draftMode } from 'next/headers';

import { getCollectionEntries } from '@/lib/content';

export const metadata = {
  title: 'Palmarès - Polyjoule',
};

export const dynamic = 'force-dynamic';

export default async function PalmaresPage() {
  const { isEnabled: preview } = await draftMode();
  let records = await getCollectionEntries('palmares', { includeDrafts: preview });

  // Trier par année décroissante (le plus récent en haut)
  records.sort((a, b) => {
    const yearA = parseInt(a.data?.year || a.slug || '0', 10);
    const yearB = parseInt(b.data?.year || b.slug || '0', 10);
    return yearB - yearA;
  });

  return (
    <section className="py-5">
      <div className="container">
        <div className="text-center mb-5">
          <span className="badge badge-soft-primary">Records & distinctions</span>
          <h1 className="mt-3 fw-bold text-primary">Palmarès Polyjoule</h1>
          <p className="text-secondary mb-0">
            Depuis 2005, Polyjoule remporte des compétitions internationales et signe des performances énergétiques de
            référence en Europe.
          </p>
        </div>

        <div className="timeline-centered">
          {records.map((record, index) => {
            const data = record.data ?? {};
            const isLeft = index % 2 === 0;

            return (
              <div className="row g-0 align-items-center justify-content-center mb-5 position-relative" key={record.id}>
                {/* Ligne centrale (dot) */}
                <div className="timeline-dot" />

                {/* Colonne Gauche */}
                <div className="col-md-5 d-flex justify-content-md-end justify-content-start">
                  {isLeft && (
                    <div className="timeline-card-content me-md-4">
                      <span className="timeline-year mb-2">{data.year ?? record.slug}</span>
                      <h2 className="h5 fw-bold text-primary mb-2">{data.title ?? record.title}</h2>
                      <p className="text-secondary small mb-0">{data.description}</p>
                      {data.location && (
                        <div className="d-flex align-items-center justify-content-end mt-2 text-secondary small">
                          <span className="me-2">{data.location}</span>
                          <i className="ri-map-pin-line"></i>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Espace Central (Spacer) */}
                <div className="col-md-2"></div>

                {/* Colonne Droite */}
                <div className="col-md-5 d-flex justify-content-md-start justify-content-start">
                  {!isLeft && (
                    <div className="timeline-card-content ms-md-4">
                      <span className="timeline-year mb-2">{data.year ?? record.slug}</span>
                      <h2 className="h5 fw-bold text-primary mb-2">{data.title ?? record.title}</h2>
                      <p className="text-secondary small mb-0">{data.description}</p>
                      {data.location && (
                        <div className="d-flex align-items-center mt-2 text-secondary small">
                          <i className="ri-map-pin-line me-2"></i>
                          <span>{data.location}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
