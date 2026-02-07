import Link from 'next/link';
import { draftMode } from 'next/headers';

import { getEntry } from '@/lib/content';

export const metadata = {
  title: "Présentation de l'association - Polyjoule",
};

export default async function PresentationPage() {
  const { isEnabled: preview } = await draftMode();
  const section = await getEntry('page-presentation', 'association', { includeDrafts: preview });
  const data = section?.data ?? {};

  return (
    <div className="pt-5">
      {/* Hero Section */}
      <div className="container">
        <div className="text-center mb-5">
          <span className="badge badge-soft-primary">Depuis 2005</span>
          <h1 className="mt-3 fw-bold text-primary">{data.title ?? "L'excellence énergétique"}</h1>
          <p className="text-secondary mb-0">
            Polyjoule réunit des étudiants passionnés de Polytech Nantes et de La Joliverie autour d'un objectif commun :
            concevoir les véhicules de demain.
          </p>
        </div>
      </div>


      <div className="container">
        {/* Values Grid - Static as requested */}
        <div className="row g-4 mb-5 mt-n5 position-relative z-2">
          <div className="col-md-4">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="ri-lightbulb-flash-line"></i>
              </div>
              <h3 className="h4 fw-bold mb-3">Innovation</h3>
              <p className="text-secondary mb-0">
                Nous explorons de nouvelles technologies, de l'hydrogène aux supercondensateurs, pour repousser les limites de l'efficacité.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="ri-graduation-cap-line"></i>
              </div>
              <h3 className="h4 fw-bold mb-3">Pédagogie</h3>
              <p className="text-secondary mb-0">
                Un projet étudiant avant tout, permettant d'appliquer concrètement les connaissances théoriques dans un cadre professionnel.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="ri-team-line"></i>
              </div>
              <h3 className="h4 fw-bold mb-3">Partenariat</h3>
              <p className="text-secondary mb-0">
                Une collaboration unique et historique entre une école d'ingénieurs (Polytech) et un lycée technique (La Joliverie).
              </p>
            </div>
          </div>
        </div>

        {/* Main Content & History - Swapped Columns */}
        <section className="py-5">
          <div className="row g-5 align-items-center">
            {/* History Column - Now Second (Right) */}
            <div className="col-lg-7">
              <div className="bg-white p-5 rounded-5 shadow-sm border">
                <span className="text-primary fw-bold small-caps mb-2 d-block">Notre Histoire</span>
                <h2 className="h1 fw-bold mb-4 text-dark">Une aventure humaine</h2>
                <div className="text-secondary fs-5" dangerouslySetInnerHTML={{ __html: data.bodyHtml ?? '' }} />
              </div>
            </div>
          </div>

        </section>
        {/* Stats Column - Now First (Left) */}
        <div className="col-lg-5">
          <div className="row g-4">
            <div className="col-6">
              <div className="stat-card">
                <div className="stat-number text-primary">{data.stats?.students ?? '400+'}</div>
                <div className="text-muted small fw-bold text-uppercase">Étudiants formés</div>
              </div>
            </div>
            <div className="col-6">
              <div className="stat-card text-end">
                <div className="stat-number text-primary">{data.stats?.years ?? '20+'}</div>
                <div className="text-muted small fw-bold text-uppercase">Années d'existence</div>
              </div>
            </div>
            <div className="col-12">
              <div className="bg-light rounded-4 overflow-hidden position-relative mt-3" style={{ minHeight: '300px' }}>
                <div className="d-flex align-items-center justify-content-center h-100 p-5 text-center">
                  <div>
                    <i className="ri-trophy-line display-1 text-primary opacity-25 mb-3"></i>
                    <h4 className="fw-bold text-dark opacity-50">Palmarès International</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <section className="cta-section p-5 mt-5 text-center text-lg-start">
          <div className="row align-items-center">
            <div className="col-lg-8 mb-4 mb-lg-0">
              <h2 className="fw-bold mb-3">Envie de découvrir nos prototypes ?</h2>
              <p className="lead mb-0 opacity-75">
                Plongez dans les détails techniques de Polyjoule et Cityjoule.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link href="/infos-vehicule" className="btn btn-light btn-lg rounded-pill px-5 fw-bold text-primary">
                Voir les véhicules
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}