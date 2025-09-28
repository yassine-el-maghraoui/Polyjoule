import Image from 'next/image';
import { draftMode } from 'next/headers';

import { getCollectionEntries } from '@/lib/content';

export const metadata = {
  title: 'Informations sur les véhicules - Polyjoule',
};

function normaliseGallery(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
}

export default async function InfosVehiculePage() {
  const { isEnabled: preview } = await draftMode();
  const vehicles = await getCollectionEntries('vehicles', { includeDrafts: preview });

  return (
    <section className="py-5">
      <div className="container">
        <div className="text-center mb-5">
          <span className="badge badge-soft-primary">Nos prototypes</span>
          <h1 className="mt-3 fw-bold text-primary">Les véhicules Polyjoule</h1>
          <p className="text-secondary mb-0">
            Urban Concept ou prototype électrique : deux plateformes complémentaires pour repousser les limites de
            l’efficacité énergétique.
          </p>
        </div>

        {vehicles.map((vehicle, index) => {
          const data = vehicle.data ?? {};
          const gallery = normaliseGallery(data.galleryPaths);
          const isAlternate = index % 2 === 1;

          return (
            <article className="mb-5" key={vehicle.id}>
              <div className="row g-5 align-items-center">
                <div className={`col-lg-6 ${isAlternate ? 'order-lg-2' : ''}`}>
                  {data.category ? <span className="timeline-year">{data.category}</span> : null}
                  <h2 className="h3 fw-bold text-primary mt-3">{data.title ?? vehicle.title}</h2>
                  <p className="text-secondary fs-5">{data.intro}</p>
                  {data.bodyHtml ? (
                    <div className="text-secondary fs-5" dangerouslySetInnerHTML={{ __html: data.bodyHtml }} />
                  ) : null}
                </div>
                <div className={`col-lg-6 text-center ${isAlternate ? 'order-lg-1' : ''}`}>
                  {data.imagePath ? (
                    <Image
                      src={data.imagePath}
                      alt={data.title ?? vehicle.title}
                      width={560}
                      height={360}
                      className="img-fluid rounded-4 shadow"
                    />
                  ) : null}
                </div>
              </div>

              {gallery.length ? (
                <div className="row g-4 mt-4">
                  {gallery.map((imagePath) => (
                    <div className="col-sm-6 col-lg-4" key={`${vehicle.id}-${imagePath}`}>
                      <Image
                        src={imagePath}
                        alt={`${data.title ?? vehicle.title} - galerie`}
                        width={420}
                        height={280}
                        className="img-fluid rounded-4 shadow"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
