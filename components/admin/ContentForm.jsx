'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function slugify(value) {
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function normaliseInitialData(fields, data) {
  const initial = {};
  for (const field of fields) {
    let value = data?.[field.name];
    if (field.list) {
      if (Array.isArray(value)) {
        value = value.join('\n');
      } else if (typeof value === 'string') {
        value = value;
      } else {
        value = '';
      }
    } else if (Array.isArray(value)) {
      value = value.join(', ');
    } else if (value === undefined || value === null) {
      value = '';
    }
    initial[field.name] = value;
  }
  return initial;
}

function prepareValues(fields, values) {
  const prepared = {};
  for (const field of fields) {
    let value = values[field.name];
    if (field.list) {
      if (Array.isArray(value)) {
        prepared[field.name] = value.filter(Boolean);
      } else if (typeof value === 'string') {
        prepared[field.name] = value
          .split(/\r?\n/)
          .map((item) => item.trim())
          .filter(Boolean);
      } else {
        prepared[field.name] = [];
      }
    } else {
      prepared[field.name] = value;
    }
  }
  return prepared;
}

export default function ContentForm({ collection, definition, entry, revisions = [] }) {
  const router = useRouter();
  const fields = definition.fields ?? [];
  const [title, setTitle] = useState(entry?.title ?? entry?.data?.title ?? '');
  const [slug, setSlug] = useState(entry?.slug ?? definition.defaultSlug ?? '');
  const [position, setPosition] = useState(entry?.position ?? 0);
  const [status, setStatus] = useState(entry?.status ?? 'draft');
  const [values, setValues] = useState(() => normaliseInitialData(fields, entry?.data));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFieldChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutoSlug = () => {
    if (title && !entry) {
      setSlug(slugify(title));
    }
  };

  const handleUpload = async (name, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('altText', '');

    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erreur lors du téléversement');
    }

    const result = await response.json();
    handleFieldChange(name, result.path);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      const preparedValues = prepareValues(fields, values);
      const payload = {
        collection,
        slug: slug || slugify(title || '') || 'element',
        title: title || null,
        position: Number(position) || 0,
        status,
        data: preparedValues,
      };

      const response = await fetch(entry ? `/api/admin/content/${entry.id}` : '/api/admin/content', {
        method: entry ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details.error || 'Enregistrement impossible');
      }

      const result = await response.json();

      setMessage('Contenu enregistré.');

      if (!entry && result.entry?.id) {
        router.replace(`/admin/collections/${collection}/${result.entry.id}`);
        router.refresh();
        return;
      }

      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = (newStatus) => {
    setStatus(newStatus);
  };

  const handleRestore = async (revisionId) => {
    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`/api/admin/content/${entry.id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revisionId }),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details.error || 'Impossible de restaurer cette révision');
      }

      setMessage('Révision restaurée.');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
          <div className="d-flex flex-column flex-md-row gap-3">
            <div className="flex-grow-1">
              <label className="form-label fw-semibold">Titre</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onBlur={handleAutoSlug}
              />
            </div>
            <div>
              <label className="form-label fw-semibold">Position</label>
              <input
                type="number"
                className="form-control"
                value={position}
                onChange={(event) => setPosition(event.target.value)}
              />
            </div>
            <div className="flex-grow-1">
              <label className="form-label fw-semibold">Slug</label>
              <input
                type="text"
                className="form-control"
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
              />
            </div>
            <div>
              <label className="form-label fw-semibold">Statut</label>
              <select
                className="form-select"
                value={status}
                onChange={(event) => handlePublish(event.target.value)}
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </select>
            </div>
          </div>

          <div className="row g-4">
            {fields.map((field) => {
              const value = values[field.name] ?? '';

              if (field.type === 'textarea') {
                return (
                  <div className="col-12" key={field.name}>
                    <label className="form-label fw-semibold">{field.label}</label>
                    <textarea
                      className="form-control"
                      rows={field.rows ?? 4}
                      value={value}
                      onChange={(event) => handleFieldChange(field.name, event.target.value)}
                      placeholder={field.placeholder}
                    />
                    {field.helpText ? (
                      <small className="text-secondary d-block mt-1">{field.helpText}</small>
                    ) : null}
                  </div>
                );
              }

              if (field.type === 'image') {
                return (
                  <div className="col-md-6" key={field.name}>
                    <label className="form-label fw-semibold">{field.label}</label>
                    <div className="d-flex gap-2">
                      <input
                        type="text"
                        className="form-control"
                        value={value}
                        onChange={(event) => handleFieldChange(field.name, event.target.value)}
                        placeholder={field.placeholder}
                      />
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          try {
                            setIsSaving(true);
                            await handleUpload(field.name, file);
                            setMessage('Image envoyée.');
                          } catch (uploadError) {
                            setError(uploadError.message);
                          } finally {
                            setIsSaving(false);
                            event.target.value = '';
                          }
                        }}
                      />
                    </div>
                    {field.helpText ? (
                      <small className="text-secondary d-block mt-1">{field.helpText}</small>
                    ) : null}
                  </div>
                );
              }

              return (
                <div className="col-md-6" key={field.name}>
                  <label className="form-label fw-semibold">{field.label}</label>
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    className="form-control"
                    value={value}
                    onChange={(event) => handleFieldChange(field.name, event.target.value)}
                    placeholder={field.placeholder}
                  />
                  {field.helpText ? (
                    <small className="text-secondary d-block mt-1">{field.helpText}</small>
                  ) : null}
                </div>
              );
            })}
          </div>

          {error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="alert alert-success" role="alert">
              {message}
            </div>
          ) : null}

          <div className="d-flex align-items-center gap-3">
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            {entry ? (
              <span className="text-secondary small">
                Dernière mise à jour : {new Date(entry.updatedAt).toLocaleString('fr-FR')}
              </span>
            ) : null}
          </div>
        </form>

        {entry && revisions.length ? (
          <div className="mt-5">
            <h2 className="h5 fw-bold text-primary">Historique</h2>
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Statut</th>
                    <th scope="col">Auteur</th>
                    <th scope="col" className="text-end"></th>
                  </tr>
                </thead>
                <tbody>
                  {revisions.map((revision) => (
                    <tr key={revision.id}>
                      <td>{new Date(revision.createdAt).toLocaleString('fr-FR')}</td>
                      <td>
                        <span
                          className={`badge ${
                            revision.status === 'published' ? 'text-bg-success' : 'text-bg-secondary'
                          }`}
                        >
                          {revision.status === 'published' ? 'Publié' : 'Brouillon'}
                        </span>
                      </td>
                      <td>{revision.author?.name ?? revision.author?.email ?? '—'}</td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleRestore(revision.id)}
                          disabled={isSaving}
                        >
                          Restaurer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
