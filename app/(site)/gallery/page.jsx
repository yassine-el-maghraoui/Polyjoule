import Image from 'next/image';
import Link from 'next/link';
import { draftMode } from 'next/headers';
import { getCollectionEntries } from '@/lib/content';
import { getEventAlbums } from '@/lib/events';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Galerie Photos',
  description: "Retour en images sur la vie de l'association Polyjoule : compétitions, ateliers, événements et moments de partage.",
};

export default async function GalleryPage() {
  const { isEnabled: preview } = await draftMode();
  const [slides, albums] = await Promise.all([
    getCollectionEntries('gallery-slides', { includeDrafts: preview }),
    getEventAlbums({ includeDrafts: preview }),
  ]);

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

        {slides.length ? (
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
        ) : null}

        {albums.length ? (
          <div className="mt-5">
            <h2 className="h4 fw-bold text-primary mb-4">Albums des événements</h2>
            <div className="row g-4">
              {albums.map((album) => (
                <div className="col-sm-6 col-lg-4" key={album.id}>
                  <Link href={album.href} className="card event-card h-100 text-decoration-none">
                    <Image
                      src={album.imagePath}
                      alt={album.title}
                      width={480}
                      height={320}
                      className="card-img-top"
                    />
                    <div className="card-body">
                      <span className="text-uppercase text-secondary fw-semibold small">{album.date}</span>
                      <h3 className="h5 fw-bold text-primary mt-1 mb-1">{album.title}</h3>
                      <p className="text-secondary small mb-0">
                        {album.photos.length} photo{album.photos.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
