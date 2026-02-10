import Image from 'next/image';
import { draftMode } from 'next/headers';
import { getCollectionEntries } from '@/lib/content';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Galerie Photos',
  description: "Retour en images sur la vie de l'association Polyjoule : compétitions, ateliers, événements et moments de partage.",
};

export default async function GalleryPage() {
  const { isEnabled: preview } = await draftMode();
  const slides = await getCollectionEntries('gallery-slides', { includeDrafts: preview });

  return (
    <section className="py-5">
      <div className="container">
        <div className="text-center mb-5">
          <span className="badge badge-soft-primary">Souvenirs</span>
          <h1 className="mt-3 fw-bold text-primary">Galerie Polyjoule</h1>
          <p className="text-secondary mb-0">
            Moments de compétition, préparation en atelier et temps forts de la vie de l'équipe.
          </p>
        </div>

        <div className="gallery-slideshow">
          <div id="galleryCarousel" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-indicators">
              {slides.map((slide, index) => (
                <button
                  type="button"
                  data-bs-target="#galleryCarousel"
                  data-bs-slide-to={index}
                  className={index === 0 ? 'active' : ''}
                  aria-label={`Slide ${index + 1}`}
                  aria-current={index === 0 ? 'true' : undefined}
                  key={slide.id}
                ></button>
              ))}
            </div>
            <div className="carousel-inner">
              {slides.map((slide, index) => {
                const data = slide.data ?? {};
                return (
                  <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={slide.id} data-bs-interval="4000">
                    {data.imagePath ? (
                      <Image
                        src={data.imagePath}
                        alt={data.altText ?? 'Galerie Polyjoule'}
                        width={1200}
                        height={600}
                        className="d-block w-100"
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#galleryCarousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Précédent</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#galleryCarousel" data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Suivant</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
