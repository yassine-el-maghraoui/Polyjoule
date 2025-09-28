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
    <section className="py-5">
      <div className="container">
        <div className="section-card mx-auto" style={{ maxWidth: '900px' }}>
          <div className="text-center mb-4">
            <span className="badge badge-soft-primary">Polyjoule depuis 2005</span>
            <h1 className="mt-3 fw-bold text-primary">{data.title ?? "Présentation de l’association"}</h1>
          </div>
          <div className="fs-5 text-secondary">
            <div dangerouslySetInnerHTML={{ __html: data.bodyHtml ?? '' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
