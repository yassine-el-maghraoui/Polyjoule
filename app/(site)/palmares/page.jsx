import { draftMode } from 'next/headers';

import { getCollectionEntries } from '@/lib/content';

export const metadata = {
  title: 'Palmarès - Polyjoule',
};

export default async function PalmaresPage() {
  const preview = draftMode().isEnabled;
  const records = await getCollectionEntries('palmares', { includeDrafts: preview });

  return (
    <section className="py-5">
      <div className="container">
        <div className="text-center mb-5">
          <span className="badge badge-soft-primary">Records & distinctions</span>
          <h1 className="mt-3 fw-bold text-primary">Palmarès Polyjoule</h1>
          <p className="text-secondary mb-0">
            Depuis 2005, Polyjoule remporte des compétitions internationales et signe des performances énergétiques de
            référence en Europe.
          </p>
        </div>

        <div className="timeline-horizontal">
          <div className="timeline-scroll overflow-auto pb-3">
            {records.map((record) => {
              const data = record.data ?? {};
              return (
                <article className="timeline-card" key={record.id}>
                  <span className="timeline-year">{data.year ?? record.slug}</span>
                  <h3 className="h5 fw-bold">{data.title ?? record.title}</h3>
                  <p className="text-secondary mb-0">{data.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
