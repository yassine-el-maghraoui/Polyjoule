import Image from 'next/image';
import Link from 'next/link';
import { draftMode } from 'next/headers';
import { getCollectionEntries, getEntry } from '@/lib/content';
import ScrollReveal from '@/components/ScrollReveal';
import AnimatedCounter from '@/components/AnimatedCounter';
import AnnouncementBar from '@/components/AnnouncementBar';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Accueil',
  description:
    "Polyjoule Nantes - Association etudiante de Polytech Nantes qui concoit des vehicules a haute efficacite energetique.",
};

export default async function HomePage() {
  const { isEnabled: preview } = await draftMode();
  const hero = await getEntry('home-hero', 'principal', { includeDrafts: preview });
  const quickLinks = await getCollectionEntries('quick-links', { includeDrafts: preview });
  const partners = await getCollectionEntries('partners', { includeDrafts: preview });
  const partnersConfigEntry = await getEntry('partners-config', 'config', { includeDrafts: preview });
  const announcements = await getCollectionEntries('announcements', { includeDrafts: preview });

  const heroData = hero?.data ?? {};
  const enablePartnersSlider = partnersConfigEntry?.data?.enablePartnersSlider ?? false;

  return (
    <>
      <AnnouncementBar announcements={announcements} />

      {/* ===== HERO ===== */}
      <section className="hero-section" id="hero">
        {/* Full-width Background Photo */}
        <div className="hero-main-bg" aria-hidden="true">
          <Image
            src="/assets/polyjoule-2.jpg"
            alt="Arrière-plan Polyjoule"
            fill
            className="hero-main-bg-img"
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className="hero-main-bg-overlay"></div>
        </div>

        {/* Animated particles */}
        <div className="hero-particles" aria-hidden="true">
          <span className="particle particle-1"></span>
          <span className="particle particle-2"></span>
          <span className="particle particle-3"></span>
          <span className="particle particle-4"></span>
          <span className="particle particle-5"></span>
          <span className="particle particle-6"></span>
        </div>

        <div className="container">
          <div className="hero-inner">
            <div className="hero-content">
              {heroData.badge ? (
                <span className="hero-badge">
                  <span className="hero-badge-dot" aria-hidden="true"></span>
                  {heroData.badge}
                </span>
              ) : null}
              <h1 className="hero-title">
                {heroData.title ?? 'Polyjoule'}
              </h1>
              <p className="hero-lead">
                {heroData.lead ??
                  "L'association Polyjoule rassemble des etudiants qui imaginent, concoivent et testent des vehicules sobres en energie."}
              </p>
              <div className="hero-ctas">
                {heroData.primaryCtaHref && heroData.primaryCtaLabel ? (
                  <Link
                    className="btn btn-primary btn-lg hero-btn-primary"
                    href={heroData.primaryCtaHref}
                  >
                    {heroData.primaryCtaLabel}
                    <i className="ri-arrow-right-line" aria-hidden="true"></i>
                  </Link>
                ) : null}
                {heroData.secondaryCtaHref && heroData.secondaryCtaLabel ? (
                  <Link
                    className="btn btn-outline-light btn-lg hero-btn-secondary"
                    href={heroData.secondaryCtaHref}
                  >
                    {heroData.secondaryCtaLabel}
                  </Link>
                ) : null}
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-image-glow" aria-hidden="true"></div>
              {heroData.illustrationPath ? (
                <Image
                  src={heroData.illustrationPath}
                  alt="Prototype Polyjoule"
                  width={600}
                  height={450}
                  className="hero-image-car-only"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : null}
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="hero-wave" aria-hidden="true">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path
              d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,70 L1440,120 L0,120 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="section-stats" id="stats">
        <div className="container">
          <div className="stats-grid">
            <ScrollReveal animation="scale-in" delay={0}>
              <div className="stat-card-v2">
                <div className="stat-icon-wrap">
                  <i className="ri-calendar-line" aria-hidden="true"></i>
                </div>
                <AnimatedCounter value={19} prefix="" suffix="" duration={2000} />
                <span className="stat-label">Années d'existence</span>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="scale-in" delay={100}>
              <div className="stat-card-v2">
                <div className="stat-icon-wrap">
                  <i className="ri-car-line" aria-hidden="true"></i>
                </div>
                <AnimatedCounter value={10} prefix="" suffix="+" duration={1500} />
                <span className="stat-label">Véhicules conçus</span>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="scale-in" delay={200}>
              <div className="stat-card-v2">
                <div className="stat-icon-wrap">
                  <i className="ri-trophy-line" aria-hidden="true"></i>
                </div>
                <AnimatedCounter value={50} prefix="" suffix="+" duration={2000} />
                <span className="stat-label">Compétitions</span>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="scale-in" delay={300}>
              <div className="stat-card-v2">
                <div className="stat-icon-wrap">
                  <i className="ri-team-line" aria-hidden="true"></i>
                </div>
                <AnimatedCounter value={200} prefix="" suffix="+" duration={2500} />
                <span className="stat-label">Membres au fil des ans</span>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== QUICK LINKS ===== */}
      <section className="section-quicklinks" id="explorer">
        <div className="container">
          <ScrollReveal animation="fade-up">
            <div className="section-header">
              <span className="section-tag">Navigation</span>
              <h2>Explorer Polyjoule</h2>
              <p>Les pages essentielles de l'association.</p>
            </div>
          </ScrollReveal>
          <div className="quicklinks-grid">
            {quickLinks.map((item, index) => {
              const data = item.data ?? {};
              return (
                <ScrollReveal key={item.id} animation="fade-up" delay={index * 80}>
                  <Link className="qlink-card" href={data.href ?? '#'}>
                    <span className="qlink-number" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {data.icon ? (
                      <div className="qlink-icon">
                        <i className={data.icon} aria-hidden="true"></i>
                      </div>
                    ) : null}
                    <h3 className="qlink-title">{data.title ?? item.title}</h3>
                    <p className="qlink-desc">{data.description}</p>
                    <span className="qlink-arrow" aria-hidden="true">
                      <i className="ri-arrow-right-s-line"></i>
                    </span>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== ABOUT PREVIEW ===== */}
      <section className="section-about" id="about">
        <div className="container">
          <div className="about-grid">
            <ScrollReveal animation="fade-right">
              <div className="about-image-wrap">
                {/* 📷 REMPLACEZ le src ci-dessous par votre propre photo d'équipe/véhicule */}
                <Image
                  src="/assets/equipe.JPG"
                  alt="L'équipe Polyjoule en action"
                  width={600}
                  height={450}
                  className="about-image"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="about-image-accent" aria-hidden="true"></div>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-left">
              <div className="about-text">
                <span className="section-tag">À propos</span>
                <h2>L'excellence étudiante au service de <span className="text-gradient">l'énergie de demain</span></h2>
                <p>
                  Depuis 2006, Polyjoule rassemble des étudiants passionnés de
                  <strong> Polytech Nantes</strong> autour d'un projet commun :
                  concevoir des véhicules à haute efficacité énergétique et
                  concourir dans les plus grandes compétitions internationales.
                </p>
                <p>
                  Notre association est un véritable laboratoire d'innovation,
                  où chaque membre développe des compétences en ingénierie,
                  management et travail d'équipe.
                </p>
                <Link href="/presentation" className="btn-modern">
                  En savoir plus
                  <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ===== GALLERY SHOWCASE ===== */}
      <section className="section-gallery-showcase" id="gallery-showcase">
        <div className="container">
          <ScrollReveal animation="fade-up">
            <div className="section-header">
              <span className="section-tag">Galerie</span>
              <h2>Nos Prototypes en Images</h2>
              <p>Découvrez les véhicules conçus par notre équipe au fil des ans.</p>
            </div>
          </ScrollReveal>
          <div className="gallery-mosaic">
            <ScrollReveal animation="scale-in" delay={0} className="mosaic-item mosaic-large">
              <div className="mosaic-card">
                <Image
                  src="/assets/track1.jpg"
                  alt="Véhicule Polyjoule sur piste"
                  width={800}
                  height={500}
                  className="mosaic-img"
                  sizes="(max-width: 768px) 100vw, 60vw"
                />
                <div className="mosaic-overlay">
                  <span>Prototype</span>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="scale-in" delay={100} className="mosaic-item">
              <div className="mosaic-card">
                <Image
                  src="/assets/vehicule3.JPG"
                  alt="Détail technique"
                  width={400}
                  height={400}
                  className="mosaic-img"
                  sizes="(max-width: 768px) 100vw, 30vw"
                />
                <div className="mosaic-overlay">
                  <span>Technique</span>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="scale-in" delay={200} className="mosaic-item">
              <div className="mosaic-card">
                {/* 📷 Remplacez par une photo d'équipe pour plus de variété */}
                <Image
                  src="/assets/track2.jpg"
                  alt="Action Shell Eco Marathon"
                  width={400}
                  height={400}
                  className="mosaic-img"
                  sizes="(max-width: 768px) 100vw, 30vw"
                />
                <div className="mosaic-overlay">
                  <span>Équipe</span>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="scale-in" delay={300} className="mosaic-item mosaic-wide">
              <div className="mosaic-card">
                <Image
                  src="/assets/track3.jpg"
                  alt="Course Shell Eco Marathon"
                  width={800}
                  height={350}
                  className="mosaic-img"
                  sizes="(max-width: 768px) 100vw, 60vw"
                />
                <div className="mosaic-overlay">
                  <span>Compétition</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
          <ScrollReveal animation="fade-up" delay={400}>
            <div className="gallery-cta">
              <Link href="/gallery" className="btn-modern">
                Voir toute la galerie
                <i className="ri-arrow-right-line" aria-hidden="true"></i>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== PARTNERS ===== */}
      <section className="section-partners" id="partenaires">
        <div className="container">
          <ScrollReveal animation="fade-up">
            <div className="section-header">
              <span className="section-tag">Partenaires</span>
              <h2>Ils nous font confiance</h2>
              <p>Des acteurs académiques et industriels engagés pour l'innovation.</p>
            </div>
          </ScrollReveal>
          <div className="partners-slider-container">
            <div className="partners-slider-track">
              {[...partners, ...partners, ...partners, ...partners].map(
                (partner, index) => {
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
                    <div
                      className="partner-slide-item"
                      key={`${partner.id}-${index}`}
                    >
                      {data.url ? (
                        <a
                          href={data.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="section-cta-final" id="rejoindre">
        <div className="cta-particles" aria-hidden="true">
          <span className="cta-particle cta-particle-1"></span>
          <span className="cta-particle cta-particle-2"></span>
          <span className="cta-particle cta-particle-3"></span>
        </div>
        <div className="container">
          <ScrollReveal animation="scale-in">
            <div className="cta-content">
              <h2>Rejoignez l'aventure <span className="text-gradient-light">Polyjoule</span></h2>
              <p>
                Étudiant·e à Polytech Nantes ? Passionné·e par l'ingénierie et
                l'énergie de demain ? Rejoignez une équipe qui repousse les
                limites de l'innovation.
              </p>
              <div className="cta-buttons">
                <Link href="/presentation" className="btn-cta-primary">
                  Découvrir l'association
                  <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </Link>
                <a href="mailto:contact@polyjoule.org" className="btn-cta-secondary">
                  Nous contacter
                  <i className="ri-mail-line" aria-hidden="true"></i>
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
