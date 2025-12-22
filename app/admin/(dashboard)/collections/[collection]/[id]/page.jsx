import { notFound } from 'next/navigation';

import ContentForm from '@/components/admin/ContentForm';
import prisma from '@/lib/prisma';
import { getCollectionDefinition } from '@/lib/collections';
import { getRevisions } from '@/lib/content';

export default async function EditCollectionEntryPage({ params }) {
  const { collection, id } = await params;
  const definition = getCollectionDefinition(collection);

  if (!definition) {
    notFound();
  }

  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    notFound();
  }

  const entry = await prisma.contentEntry.findUnique({ where: { id: numericId } });
  if (!entry) {
    notFound();
  }

  const parsedEntry = {
    ...entry,
    data: (() => {
      try {
        return JSON.parse(entry.data ?? '{}');
      } catch (error) {
        return {};
      }
    })(),
  };

  const revisions = await getRevisions(numericId);

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
        <div>
          <h1 className="h4 fw-bold text-primary mb-1">{definition.label}</h1>
          <p className="text-secondary mb-0">Modifiez ce contenu puis cliquez sur Enregistrer.</p>
        </div>
      </div>

      <ContentForm
        collection={collection}
        definition={definition}
        entry={parsedEntry}
        revisions={revisions}
      />
    </div>
  );
}
