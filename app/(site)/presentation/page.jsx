import Link from 'next/link';
import Image from 'next/image';
import { draftMode } from 'next/headers';
import { getEntry, getCollectionEntries } from '@/lib/content';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Présentation de l'association",
  description: "Qui sommes-nous ? Tout savoir sur l'association Polyjoule Nantes, nos membres, notre mission et nos partenaires académiques et industriels.",
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

      <div className="container-fluid">
        <div className="row g-4 mb-5 z-2" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
          <div className="col-md-4">
            <div className="feature-card h-100">
              <div className="feature-icon">
                <i className="ri-lightbulb-flash-line"></i>
              </div>
              <h2 className="h4 fw-bold mb-3">Innovation</h2>
              <p className="text-secondary mb-0">
                Nous explorons de nouvelles technologies, de l'hydrogène aux supercondensateurs, pour repousser les limites de l'efficacité.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card h-100">
              <div className="feature-icon">
                <i className="ri-graduation-cap-line"></i>
              </div>
              <h2 className="h4 fw-bold mb-3">Pédagogie</h2>
              <p className="text-secondary mb-0">
                Un projet étudiant avant tout, permettant d'appliquer concrètement les connaissances théoriques dans un cadre professionnel.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="feature-card h-100">
              <div className="feature-icon">
                <i className="ri-team-line"></i>
              </div>
              <h2 className="h4 fw-bold mb-3">Partenariat</h2>
              <p className="text-secondary mb-0">
                Une collaboration unique et historique entre une école d'ingénieurs (Polytech) et un lycée technique (La Joliverie).
              </p>
            </div>
          </div>
        </div>
      </div>


      <div className="container">
        {/* Values Grid */}
        {/* Main Content & History */}
        <section className="py-5">
          {/* History Section - Full Width */}
          <div className="bg-white p-5 rounded-5 shadow-sm border mb-5">
            <span className="text-primary fw-bold small-caps mb-2 d-block">Notre Histoire</span>
            <h2 className="h1 fw-bold mb-4 text-dark">Une aventure humaine</h2>
            <div className="text-secondary fs-5" dangerouslySetInnerHTML={{ __html: data.bodyHtml ?? '' }} />
          </div>

          {/* Stats Section - Full Width Grid */}
          <div className="row g-4">
            <div className="col-12">
              <div className="row g-4">
                <div className="col-md-6 col-6">
                  <div className="stat-card bg-white shadow-sm border rounded-4 text-start p-4 h-100">
                    <div className="stat-number text-primary">{data.stats_students ?? data.stats?.students ?? '400+'}</div>
                    <div className="text-secondary small fw-bold text-uppercase mt-2">Étudiants<br />formés</div>
                  </div>
                </div>
                <div className="col-md-6 col-6">
                  <div className="stat-card bg-white shadow-sm border rounded-4 text-end p-4 h-100">
                    <div className="stat-number text-primary">{data.stats_years ?? data.stats?.years ?? '20+'}</div>
                    <div className="text-secondary small fw-bold text-uppercase mt-2">Années<br />d'existence</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TeamSection */}
        {data.showTeamSection && data.teamMembers?.length > 0 ? (
          <TeamSection members={data.teamMembers} />
        ) : null}

        {/* Call to Action */}
        <section className="cta-section p-5 mt-4 mb-5 text-center">
          <h2 className="fw-bold mb-3">Envie de découvrir nos prototypes ?</h2>
          <p className="lead mb-4 opacity-75">
            Plongez dans les détails techniques de Polyjoule et Cityjoule.
          </p>
          <Link href="/infos-vehicule" className="btn btn-light btn-lg rounded-pill px-5 fw-bold text-primary">
            Voir les véhicules
          </Link>
        </section>
      </div>
    </div>
  );
}

function TeamSection({ members }) {
  if (!members || !members.length) return null;

  // Grouping Logic
  const groups = [];
  let currentGroup = { title: null, members: [] };

  members.forEach((item) => {
    if (item.type === 'break') {
      if (currentGroup.members.length > 0) groups.push(currentGroup);
      currentGroup = { title: item.title, members: [] };
    } else {
      currentGroup.members.push(item);
    }
  });
  if (currentGroup.members.length > 0) groups.push(currentGroup);

  const Card = ({ member, className = '' }) => (
    <div className={`card h-100 border-0 shadow-sm text-center p-4 hover-card-lift bg-white ${className}`}>
      <div className="mx-auto mb-4 position-relative" style={{ width: '160px', height: '160px' }}>
        {member.imagePath ? (
          <div className="rounded-circle overflow-hidden w-100 h-100 border border-4 border-white shadow bg-white position-relative">
            <Image
              src={member.imagePath}
              alt={member.name}
              fill
              className="object-fit-cover"
              sizes="(max-width: 768px) 160px, 160px"
            />
          </div>
        ) : (
          <div className="rounded-circle bg-white w-100 h-100 d-flex align-items-center justify-content-center text-secondary fs-2 fw-bold border border-4 border-light shadow-sm">
            {member.name?.charAt(0) ?? '?'}
          </div>
        )}
      </div>
      <h3 className="h5 fw-bold mb-2 text-dark">{member.name}</h3>
      <p className="text-primary fw-bold mb-0 text-uppercase small">{member.role}</p>
    </div>
  );

  return (
    <section className="py-5">
      <div className="text-center mb-5">
        <span className="text-primary fw-bold small-caps mb-2 d-block">L'Équipe</span>
        <h2 className="h2 fw-bold mb-3">Ceux qui font Polyjoule</h2>
        <p className="text-secondary">Les étudiants et encadrants derrière chaque innovation.</p>
      </div>

      <div className="d-flex flex-column gap-5">
        {groups.map((group, groupIndex) => (
          <div key={groupIndex} className="position-relative">
            {group.title && (
              <div className="text-center mb-4">
                <h3 className="h4 fw-bold text-primary border-bottom border-primary border-opacity-25 d-inline-block pb-2 px-4">
                  {group.title}
                </h3>
              </div>
            )}

            <div className="row g-4 justify-content-center">
              {group.members.map((member, memberIndex) => {
                const isFullWidth = member.layout === 'full';
                return (
                  <div
                    key={memberIndex}
                    className={isFullWidth ? "col-12 d-flex justify-content-center" : "col-12 col-sm-6 col-md-4 col-lg-3"}
                  >
                    <div style={isFullWidth ? { width: '100%', maxWidth: '300px' } : { width: '100%' }}>
                      <Card member={member} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
