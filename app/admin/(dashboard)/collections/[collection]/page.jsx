import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import prisma from '@/lib/prisma';
import { getCollectionEntries } from '@/lib/content';
import { COLLECTION_DEFINITIONS } from '@/lib/collections';

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('fr-FR');
}

export default async function CollectionPage({ params }) {
  const { collection } = params;
  const definition = COLLECTION_DEFINITIONS[collection];

  if (!definition) {
    notFound();
  }

  if (definition.type === 'singleton') {
    const slug = definition.defaultSlug ?? 'unique';
    let entry = await prisma.contentEntry.findUnique({
      where: { collection_slug: { collection, slug } },
    });

    if (!entry) {
      entry = await prisma.contentEntry.create({
        data: {
          collection,
          slug,
          title: definition.label,
          data: JSON.stringify({}),
          status: 'draft',
        },
      });
    }

    redirect(`/admin/collections/${collection}/${entry.id}`);
  }

  const entries = await getCollectionEntries(collection, { includeDrafts: true });

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <h1 className="h4 fw-bold text-primary mb-1">{definition.label}</h1>
            <p className="text-secondary mb-0">
              Gérez les contenus de la collection « {definition.label} ».
            </p>
          </div>
          <Link href={`/admin/collections/${collection}/new`} className="btn btn-primary">
            Ajouter un contenu
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th scope="col">Titre</th>
                <th scope="col">Slug</th>
                <th scope="col">Statut</th>
                <th scope="col">Position</th>
                <th scope="col">Mis à jour</th>
                <th scope="col" className="text-end">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.title ?? entry.data?.title ?? 'Sans titre'}</td>
                  <td><code>{entry.slug}</code></td>
                  <td>
                    <span className={`badge ${entry.status === 'published' ? 'text-bg-success' : 'text-bg-secondary'}`}>
                      {entry.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td>{entry.position}</td>
                  <td>{formatDate(entry.updatedAt)}</td>
                  <td className="text-end">
                    <Link href={`/admin/collections/${collection}/${entry.id}`} className="btn btn-sm btn-outline-primary">
                      Modifier
                    </Link>
                  </td>
                </tr>
              ))}
              {!entries.length ? (
                <tr>
                  <td colSpan={6} className="text-center text-secondary py-4">
                    Aucun contenu pour le moment.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
