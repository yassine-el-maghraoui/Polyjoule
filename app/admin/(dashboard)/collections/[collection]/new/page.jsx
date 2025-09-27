import { redirect, notFound } from 'next/navigation';

import ContentForm from '@/components/admin/ContentForm';
import { getCollectionDefinition } from '@/lib/collections';

export default function NewCollectionEntryPage({ params }) {
  const { collection } = params;
  const definition = getCollectionDefinition(collection);

  if (!definition) {
    notFound();
  }

  if (definition.type === 'singleton') {
    redirect(`/admin/collections/${collection}`);
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h1 className="h4 fw-bold text-primary mb-1">{definition.label}</h1>
        <p className="text-secondary mb-0">Créer un nouveau contenu</p>
      </div>
      <ContentForm collection={collection} definition={definition} entry={null} revisions={[]} />
    </div>
  );
}
