import Image from 'next/image';
import { draftMode } from 'next/headers';
import { getCollectionEntries } from '@/lib/content';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Nos Véhicules',
  description: "Détails techniques et photos de nos véhicules : Urban Concept (City Joule) et Prototype. Découvrez l'ingénierie derrière la performance énergétique.",
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
          const isLast = index === vehicles.length - 1;

          return (
            <article className="mb-5" key={vehicle.id}>
              <div className="row g-4 g-lg-5 align-items-center">
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

              {gallery.length > 0 ? (
                <div className="my-5">
                  <h3 className="h5 fw-bold text-primary mb-4 text-center">Galerie photos</h3>
                  <div className="mx-auto" style={{ maxWidth: '800px' }}>
                    <div className="gallery-slideshow shadow rounded-4 overflow-hidden">
                      <div id={`carousel-${vehicle.slug}`} className="carousel slide" data-bs-ride="carousel">
                        <div className="carousel-indicators">
                          {gallery.map((_, idx) => (
                            <button
                              type="button"
                              data-bs-target={`#carousel-${vehicle.slug}`}
                              data-bs-slide-to={idx}
                              className={idx === 0 ? 'active' : ''}
                              aria-label={`Slide ${idx + 1}`}
                              aria-current={idx === 0 ? 'true' : undefined}
                              key={idx}
                            ></button>
                          ))}
                        </div>
                        <div className="carousel-inner">
                          {gallery.map((imagePath, idx) => (
                            <div
                              className={`carousel-item ${idx === 0 ? 'active' : ''}`}
                              key={`${vehicle.id}-slide-${idx}`}
                              data-bs-interval="4000"
                            >
                              <div className="ratio ratio-16x9">
                                <Image
                                  src={imagePath}
                                  alt={`${data.title ?? vehicle.title} - photo ${idx + 1}`}
                                  fill
                                  className="d-block w-100 object-fit-cover"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          className="carousel-control-prev"
                          type="button"
                          data-bs-target={`#carousel-${vehicle.slug}`}
                          data-bs-slide="prev"
                        >
                          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                          <span className="visually-hidden">Précédent</span>
                        </button>
                        <button
                          className="carousel-control-next"
                          type="button"
                          data-bs-target={`#carousel-${vehicle.slug}`}
                          data-bs-slide="next"
                        >
                          <span className="carousel-control-next-icon" aria-hidden="true"></span>
                          <span className="visually-hidden">Suivant</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {!isLast && <hr className="my-5 border-secondary opacity-25" />}
            </article>
          );
        })}
      </div>
    </section>
  );
}
