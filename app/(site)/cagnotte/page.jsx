import { draftMode } from 'next/headers';
import { getEntry } from '@/lib/content';
import { siteConfig } from '@/lib/site.config';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: `Cagnotte — ${siteConfig.name}`,
  description: "Une cagnotte arrive bientôt pour soutenir les projets de l'association Polyjoule.",
};

export default async function CagnottePage() {
  const { isEnabled: preview } = await draftMode();
  const entry = await getEntry('page-cagnotte', 'cagnotte', { includeDrafts: preview });
  const data = entry?.data ?? {};

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="text-center mb-5">
            <span className="badge badge-soft-primary">Cagnotte</span>
            <h1 className="display-5 fw-bold text-primary mt-3 mb-3">
              {data.title || 'Une cagnotte arrive bientôt'}
            </h1>
            <p className="lead text-secondary">
              {data.intro ||
                "Nous préparons une cagnotte pour soutenir les projets de l'association. Les détails seront publiés ici dès son lancement."}
            </p>
          </div>

          {data.bodyHtml ? (
            <div className="section-card">
              <div className="text-secondary fs-5" dangerouslySetInnerHTML={{ __html: data.bodyHtml }} />
            </div>
          ) : (
            <div className="section-card text-center">
              <p className="text-secondary mb-0">
                Revenez bientôt ou suivez nos réseaux pour être prévenu dès l'ouverture de la cagnotte.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
