import Image from 'next/image';
import Link from 'next/link';
import { draftMode } from 'next/headers';

import { getCollectionEntries, getEntry } from '@/lib/content';

export default async function HomePage() {
  const { isEnabled: preview } = await draftMode();
  const hero = await getEntry('home-hero', 'principal', { includeDrafts: preview });
  const quickLinks = await getCollectionEntries('quick-links', { includeDrafts: preview });
  const partners = await getCollectionEntries('partners', { includeDrafts: preview });

  const heroData = hero?.data ?? {};

  return (
    <>
      <section className="hero-section py-5 py-lg-5">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 text-center text-lg-start">
              {heroData.badge ? (
                <span className="badge badge-soft-primary small-caps mb-3">{heroData.badge}</span>
              ) : null}
              <h1 className="display-4 fw-bold text-primary mb-3">{heroData.title ?? 'Polyjoule'}</h1>
              <p className="lead text-secondary mb-4">
                {heroData.lead ??
                  "L’association Polyjoule rassemble des étudiants qui imaginent, conçoivent et testent des véhicules sobres en énergie."}
              </p>
              <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-3">
                {heroData.primaryCtaHref && heroData.primaryCtaLabel ? (
                  <Link className="btn btn-primary btn-lg px-4" href={heroData.primaryCtaHref}>
                    {heroData.primaryCtaLabel}
                  </Link>
                ) : null}
                {heroData.secondaryCtaHref && heroData.secondaryCtaLabel ? (
                  <Link className="btn btn-outline-primary btn-lg px-4" href={heroData.secondaryCtaHref}>
                    {heroData.secondaryCtaLabel}
                  </Link>
                ) : null}
              </div>
            </div>
            <div className="col-lg-6 text-center">
              {heroData.illustrationPath ? (
                <Image
                  src={heroData.illustrationPath}
                  alt="Prototype Polyjoule"
                  width={560}
                  height={420}
                  className="img-fluid hero-illustration"
                  priority
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-white">
        <div className="container">
          <div className="row g-4">
            <div className="col-12 text-center mb-2">
              <h2 className="h3 text-primary">Explorer Polyjoule</h2>
              <p className="text-secondary mb-0">Accédez rapidement aux pages clés de l’association.</p>
            </div>
          </div>
          <div className="row g-4 mt-1">
            {quickLinks.map((item) => {
              const data = item.data ?? {};
              return (
                <div className="col-sm-6 col-xl-3" key={item.id}>
                  <Link className="card quick-link-card h-100 text-center text-decoration-none" href={data.href ?? '#'}>
                    <div className="card-body py-4">
                      {data.icon ? <i className={`${data.icon} display-5 text-primary mb-3`}></i> : null}
                      <h5 className="card-title">{data.title ?? item.title}</h5>
                      <p className="card-text text-secondary">{data.description}</p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <h2 className="h3 text-center text-primary mb-4">Nos partenaires</h2>
          <p className="text-secondary text-center mb-5">
            Polyjoule bénéficie du soutien précieux d’acteurs académiques et industriels engagés pour l’innovation.
          </p>
          <div className="row justify-content-center align-items-center g-4">
            {partners.map((partner) => {
              const data = partner.data ?? {};
              const content = (
                <Image
                  src={data.logoPath ?? '/assets/placeholder.png'}
                  alt={data.name ?? 'Partenaire Polyjoule'}
                  width={180}
                  height={80}
                  className="partner-logo"
                />
              );

              return (
                <div className="col-6 col-md-4 col-lg-3 partner-col" key={partner.id}>
                  {data.url ? (
                    <a href={data.url} className="d-flex justify-content-center align-items-center w-100 h-100" target="_blank" rel="noopener noreferrer">
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
