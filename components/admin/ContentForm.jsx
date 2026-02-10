'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import ImageCropper from '@/components/admin/ImageCropper';
import RichTextEditor from '@/components/admin/RichTextEditor';

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

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function looksLikeHtml(value) {
  return /<[^>]+>/.test(value);
}

function toParagraphs(value) {
  if (!value) return '';
  const paragraphs = value
    .split(/\n{2,}/)
    .map((line) => line.trim())
    .filter(Boolean);
  return paragraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br />')}</p>`)
    .join('');
}

function getPreviewHtmlValue(value, autoParagraphs = false) {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (autoParagraphs && !looksLikeHtml(trimmed)) {
    return toParagraphs(trimmed);
  }
  return trimmed;
}

function normaliseGalleryInput(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  const byLine = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (byLine.length > 1) return byLine;
  return value
    .split(',')
    .map((line) => line.trim())
    .filter(Boolean);
}

function fileTypeFromPath(path) {
  const lower = (path || '').toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function fileNameFromPath(path) {
  if (!path) return '';
  const parts = path.split('/');
  return parts[parts.length - 1] || '';
}

function normaliseInitialData(fields, data) {
  const initial = {};
  for (const field of fields) {
    let value = data?.[field.name];
    if (field.type === 'gallery') {
      if (Array.isArray(value)) {
        initial[field.name] = value;
      } else if (typeof value === 'string') {
        initial[field.name] = value.split(/\r?\n/).filter(Boolean);
      } else {
        initial[field.name] = [];
      }
      continue;
    }

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
    if (field.type === 'gallery') {
      prepared[field.name] = Array.isArray(value) ? value : [];
      continue;
    }

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
    } else if (field.autoParagraphs && typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed && !looksLikeHtml(trimmed)) {
        prepared[field.name] = toParagraphs(trimmed);
      } else {
        prepared[field.name] = value;
      }
    } else {
      prepared[field.name] = value;
    }
  }
  return prepared;
}

export default function ContentForm({ collection, definition, entry, revisions = [] }) {
  const router = useRouter();
  const entryTitleField = definition.entryTitleField ?? null;
  const fields = definition.fields ?? [];
  const fieldByName = Object.fromEntries(fields.map((field) => [field.name, field]));
  const [title, setTitle] = useState(entry?.title ?? entry?.data?.title ?? '');
  const [slug, setSlug] = useState(entry?.slug ?? definition.defaultSlug ?? '');
  const [position, setPosition] = useState(
    entry?.position !== undefined && entry?.position !== null ? entry.position : ''
  );
  const [status, setStatus] = useState(entry?.status ?? 'published');
  const [values, setValues] = useState(() => normaliseInitialData(fields, entry?.data));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [imageEditors, setImageEditors] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFieldChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutoSlug = (value) => {
    if (!entry && !slug) {
      setSlug(slugify(value || ''));
    }
  };

  const handleUpload = async (name, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('altText', '');

    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erreur lors du téléversement');
    }

    const result = await response.json();
    handleFieldChange(name, result.path);
  };

  const openImageEditor = ({ name, sourceUrl, fileName, fileType, rawFile, revokeUrl, aspect }) => {
    setImageEditors((prev) => {
      const current = prev[name];
      if (current?.revokeUrl && current.sourceUrl) {
        URL.revokeObjectURL(current.sourceUrl);
      }
      return {
        ...prev,
        [name]: {
          sourceUrl,
          fileName,
          fileType,
          rawFile,
          revokeUrl,
          aspect,
        },
      };
    });
  };

  const closeImageEditor = (name) => {
    setImageEditors((prev) => {
      const next = { ...prev };
      const current = next[name];
      if (current?.revokeUrl && current.sourceUrl) {
        URL.revokeObjectURL(current.sourceUrl);
      }
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      const primaryText = entryTitleField ? values[entryTitleField] : title;
      const slugSource =
        primaryText || title || values.title || values.name || values.imagePath || collection;
      const autoSlug = slugify(slugSource || '') || `${collection}-${Date.now()}`;
      const resolvedTitle = entryTitleField ? primaryText : title;
      const preparedValues = prepareValues(fields, values);
      const payload = {
        collection,
        slug: slug || autoSlug,
        status,
        data: preparedValues,
      };

      if (resolvedTitle && resolvedTitle.toString().trim()) {
        payload.title = resolvedTitle.toString().trim();
      }

      const numericPosition = position === '' ? null : Number(position);
      if (numericPosition !== null && !Number.isNaN(numericPosition)) {
        payload.position = numericPosition;
      }

      const response = await fetch(entry ? `/api/admin/content/${entry.id}` : '/api/admin/content', {
        method: entry ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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

  const handleDelete = async () => {
    if (!entry) return;
    if (!window.confirm('Supprimer définitivement ce contenu ?')) {
      return;
    }

    setIsDeleting(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`/api/admin/content/${entry.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details.error || 'Suppression impossible');
      }

      router.replace(`/admin/collections/${collection}`);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async (revisionId) => {
    setIsSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`/api/admin/content/${entry.id}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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

  const previewTitle =
    (entryTitleField ? values[entryTitleField] : title) ||
    values.title ||
    values.name ||
    definition.label;
  const previewImage =
    values.imagePath || values.illustrationPath || values.logoPath || '';
  const previewAltText = values.imageAlt || values.altText || previewTitle || 'Aperçu';
  const previewSummary = values.summary || values.intro || values.description || values.lead || '';
  const previewDate = values.date || values.year || values.category || '';
  const previewCtaLabel = values.ctaLabel || 'En savoir plus';
  const previewBodyHtml = getPreviewHtmlValue(
    values.bodyHtml || '',
    fieldByName.bodyHtml?.autoParagraphs
  );
  const previewGallery = normaliseGalleryInput(values.galleryPaths || '');

  const renderPreview = () => {
    if (collection === 'events-upcoming' || collection === 'events-past') {
      return (
        <div className="col-md-8 col-lg-6">
          <div className="card event-card h-100">
            {values.imagePath ? (
              <img
                src={values.imagePath}
                alt={previewAltText}
                className="card-img-top"
                loading="lazy"
              />
            ) : (
              <div className="bg-light text-secondary text-center py-5">Aucune image</div>
            )}
            <div className="card-body d-flex flex-column">
              {previewDate ? (
                <span className="text-uppercase text-secondary fw-semibold small mb-2">
                  {previewDate}
                </span>
              ) : null}
              <h3 className="h5 fw-bold">{previewTitle}</h3>
              {previewSummary ? <p className="text-secondary">{previewSummary}</p> : null}
              <button type="button" className="btn btn-primary mt-auto" disabled>
                {previewCtaLabel}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (collection === 'event-detail') {
      return (
        <div className="section-card mx-auto" style={{ maxWidth: '960px' }}>
          <div className="row g-4 align-items-center">
            <div className="col-lg-6 order-lg-2 text-center">
              {values.imagePath ? (
                <img
                  src={values.imagePath}
                  alt={previewAltText}
                  className="img-fluid rounded-4 shadow"
                  loading="lazy"
                />
              ) : (
                <div className="bg-light text-secondary text-center py-5 rounded-4">
                  Aucune image
                </div>
              )}
            </div>
            <div className="col-lg-6 order-lg-1">
              <span className="badge badge-soft-primary">Calendrier</span>
              <h2 className="h3 fw-bold text-primary mt-3">{previewTitle}</h2>
              {values.intro ? <p className="text-secondary fs-5">{values.intro}</p> : null}
              {previewBodyHtml ? (
                <div
                  className="text-secondary fs-5"
                  dangerouslySetInnerHTML={{ __html: previewBodyHtml }}
                />
              ) : null}
            </div>
          </div>
        </div>
      );
    }

    if (collection === 'timeline' || collection === 'palmares') {
      return (
        <article className="timeline-card">
          {previewDate ? <span className="timeline-year">{previewDate}</span> : null}
          <h3 className="h5 fw-bold">{previewTitle}</h3>
          {previewSummary ? <p className="text-secondary mb-0">{previewSummary}</p> : null}
          {values.imagePath ? (
            <img
              src={values.imagePath}
              alt={previewAltText}
              className="img-fluid rounded-4 shadow mt-3"
              loading="lazy"
            />
          ) : null}
        </article>
      );
    }

    if (collection === 'gallery-slides') {
      return values.imagePath ? (
        <img src={values.imagePath} alt={previewAltText} className="img-fluid rounded-4 shadow" loading="lazy" />
      ) : (
        <div className="bg-light text-secondary text-center py-5 rounded-4">Aucune image</div>
      );
    }

    if (collection === 'vehicles') {
      return (
        <div>
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              {values.category ? <span className="timeline-year">{values.category}</span> : null}
              <h2 className="h3 fw-bold text-primary mt-3">{previewTitle}</h2>
              {values.intro ? <p className="text-secondary fs-5">{values.intro}</p> : null}
              {previewBodyHtml ? (
                <div
                  className="text-secondary fs-5"
                  dangerouslySetInnerHTML={{ __html: previewBodyHtml }}
                />
              ) : null}
            </div>
            <div className="col-lg-6 text-center">
              {values.imagePath ? (
                <img
                  src={values.imagePath}
                  alt={previewAltText}
                  className="img-fluid rounded-4 shadow"
                  loading="lazy"
                />
              ) : (
                <div className="bg-light text-secondary text-center py-5 rounded-4">
                  Aucune image
                </div>
              )}
            </div>
          </div>
          {previewGallery.length ? (
            <div className="row g-4 mt-4">
              {previewGallery.slice(0, 3).map((path) => (
                <div className="col-sm-6 col-lg-4" key={path}>
                  <img src={path} alt={`${previewTitle} - galerie`} className="img-fluid rounded-4 shadow" loading="lazy" />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      );
    }

    if (collection === 'home-hero') {
      return (
        <div className="row align-items-center g-4">
          <div className="col-lg-6 text-center text-lg-start">
            {values.badge ? <span className="badge badge-soft-primary small-caps mb-3">{values.badge}</span> : null}
            <h2 className="h3 fw-bold text-primary mb-3">{previewTitle}</h2>
            {values.lead ? <p className="lead text-secondary mb-4">{values.lead}</p> : null}
            <div className="d-flex flex-wrap justify-content-center justify-content-lg-start gap-3">
              {values.primaryCtaLabel ? (
                <button type="button" className="btn btn-primary btn-lg px-4" disabled>
                  {values.primaryCtaLabel}
                </button>
              ) : null}
              {values.secondaryCtaLabel ? (
                <button type="button" className="btn btn-outline-primary btn-lg px-4" disabled>
                  {values.secondaryCtaLabel}
                </button>
              ) : null}
            </div>
          </div>
          <div className="col-lg-6 text-center">
            {values.illustrationPath ? (
              <img
                src={values.illustrationPath}
                alt={previewAltText}
                className="img-fluid hero-illustration"
                loading="lazy"
              />
            ) : (
              <div className="bg-light text-secondary text-center py-5 rounded-4">Aucune image</div>
            )}
          </div>
        </div>
      );
    }

    if (collection === 'quick-links') {
      return (
        <div className="col-sm-8 col-lg-6">
          <div className="card quick-link-card h-100 text-center text-decoration-none">
            <div className="card-body py-4">
              {values.icon ? <i className={`${values.icon} display-5 text-primary mb-3`}></i> : null}
              <h5 className="card-title">{previewTitle}</h5>
              {values.description ? <p className="card-text text-secondary">{values.description}</p> : null}
            </div>
          </div>
        </div>
      );
    }

    if (collection === 'partners') {
      return (
        <div className="text-center">
          {values.logoPath ? (
            <img src={values.logoPath} alt={previewTitle} className="partner-logo" loading="lazy" />
          ) : (
            <div className="bg-light text-secondary text-center py-5 rounded-4">Aucun logo</div>
          )}
          <p className="mt-3 mb-0 text-secondary">{previewTitle}</p>
        </div>
      );
    }

    if (collection === 'page-presentation') {
      return (
        <div className="section-card mx-auto" style={{ maxWidth: '900px' }}>
          <div className="text-center mb-4">
            <span className="badge badge-soft-primary">Polyjoule depuis 2005</span>
            <h2 className="mt-3 fw-bold text-primary">{previewTitle}</h2>
          </div>
          <div className="fs-5 text-secondary">
            {previewBodyHtml ? (
              <div dangerouslySetInnerHTML={{ __html: previewBodyHtml }} />
            ) : (
              <p>Aucun contenu saisi.</p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="border rounded-3 p-3 bg-white">
        <h3 className="h5 fw-bold text-primary">{previewTitle}</h3>
        {previewSummary ? <p className="text-secondary">{previewSummary}</p> : null}
        {previewBodyHtml ? (
          <div className="text-secondary" dangerouslySetInnerHTML={{ __html: previewBodyHtml }} />
        ) : null}
        {previewImage ? (
          <img src={previewImage} alt={previewAltText} className="img-fluid rounded-4 shadow mt-3" loading="lazy" />
        ) : null}
      </div>
    );
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
          <div className="d-flex flex-column gap-2">
            <p className="text-secondary mb-0">
              Remplissez les champs essentiels, les options techniques sont automatiques.
            </p>
            <div className="row g-3 align-items-end">
              {!entryTitleField ? (
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Titre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    onBlur={(event) => handleAutoSlug(event.target.value)}
                  />
                </div>
              ) : null}
              <div className="col-md-6">
                <label className="form-label fw-semibold">Visibilité</label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="content-status"
                    checked={status === 'published'}
                    onChange={(event) => handlePublish(event.target.checked ? 'published' : 'draft')}
                  />
                  <label className="form-check-label" htmlFor="content-status">
                    En ligne
                  </label>
                </div>
                <small className="text-secondary d-block">
                  Désactivez pour garder ce contenu en brouillon.
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-link text-start px-0"
              onClick={() => setShowAdvanced((prev) => !prev)}
            >
              {showAdvanced ? 'Masquer les options avancées' : 'Afficher les options avancées'}
            </button>
            {showAdvanced ? (
              <div className="border rounded-3 p-3 bg-light">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Adresse courte (slug)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={slug}
                      onChange={(event) => setSlug(event.target.value)}
                      placeholder="auto"
                    />
                    <small className="text-secondary d-block mt-1">
                      Laissez vide pour générer automatiquement depuis le titre.
                    </small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Ordre d&apos;affichage</label>
                    <input
                      type="number"
                      className="form-control"
                      value={position}
                      onChange={(event) => setPosition(event.target.value)}
                      placeholder="Auto"
                    />
                    <small className="text-secondary d-block mt-1">
                      Laissez vide pour placer automatiquement la nouvelle entrée en tête.
                    </small>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="row g-4">
            {fields.map((field) => {
              const value = values[field.name] ?? '';

              if (field.type === 'textarea' && field.richText) {
                return (
                  <div className="col-12" key={field.name}>
                    <label className="form-label fw-semibold">{field.label}</label>
                    <RichTextEditor
                      value={value}
                      onChange={(nextValue) => handleFieldChange(field.name, nextValue)}
                      placeholder={field.placeholder}
                    />
                    {field.helpText ? (
                      <small className="text-secondary d-block mt-1">{field.helpText}</small>
                    ) : null}
                  </div>
                );
              }

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
                      onBlur={
                        field.name === entryTitleField
                          ? (event) => handleAutoSlug(event.target.value)
                          : undefined
                      }
                    />
                    {field.helpText ? (
                      <small className="text-secondary d-block mt-1">{field.helpText}</small>
                    ) : null}
                  </div>
                );
              }

              if (field.type === 'image') {
                const editor = imageEditors[field.name];
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
                      <div className="d-flex flex-column gap-2">
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            const objectUrl = URL.createObjectURL(file);
                            openImageEditor({
                              name: field.name,
                              sourceUrl: objectUrl,
                              fileName: file.name,
                              fileType: file.type,
                              rawFile: file,
                              revokeUrl: true,
                              aspect: field.cropAspect,
                            });
                            event.target.value = '';
                          }}
                        />
                        {value ? (
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() =>
                              openImageEditor({
                                name: field.name,
                                sourceUrl: value,
                                fileName: fileNameFromPath(value),
                                fileType: fileTypeFromPath(value),
                                rawFile: null,
                                revokeUrl: false,
                                aspect: field.cropAspect,
                              })
                            }
                          >
                            Ajuster l&apos;image
                          </button>
                        ) : null}
                      </div>
                    </div>
                    {value ? (
                      <div className="mt-2">
                        <img
                          src={value}
                          alt="Aperçu"
                          className="img-fluid rounded border"
                          style={{ maxHeight: '180px', objectFit: 'cover' }}
                        />
                      </div>
                    ) : null}
                    {editor ? (
                      <div className="mt-3">
                        <ImageCropper
                          sourceUrl={editor.sourceUrl}
                          initialAspect={editor.aspect}
                          fileName={editor.fileName}
                          fileType={editor.fileType}
                          rawFile={editor.rawFile}
                          onCancel={() => closeImageEditor(field.name)}
                          onSave={async ({ blob, fileName, fileType, useOriginal }) => {
                            try {
                              setIsSaving(true);
                              if (useOriginal && editor.rawFile) {
                                await handleUpload(field.name, editor.rawFile);
                              } else if (blob) {
                                const file = new File([blob], fileName, { type: fileType });
                                await handleUpload(field.name, file);
                              }
                              setMessage('Image envoyée.');
                              closeImageEditor(field.name);
                            } catch (uploadError) {
                              setError(uploadError.message);
                            } finally {
                              setIsSaving(false);
                            }
                          }}
                        />
                      </div>
                    ) : null}
                    {field.helpText ? (
                      <small className="text-secondary d-block mt-1">{field.helpText}</small>
                    ) : null}
                  </div>
                );
              }

              if (field.type === 'gallery') {
                const images = Array.isArray(value) ? value : [];
                return (
                  <div className="col-12" key={field.name}>
                    <label className="form-label fw-semibold">{field.label}</label>

                    {/* List of existing images */}
                    {images.length > 0 && (
                      <div className="row g-3 mb-3">
                        {images.map((img, idx) => (
                          <div className="col-6 col-md-3 col-lg-2 position-relative" key={idx}>
                            <div className="ratio ratio-1x1 rounded border overflow-hidden">
                              <img src={img} alt={`Galerie ${idx}`} className="object-fit-cover w-100 h-100" />
                            </div>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 p-0 d-flex align-items-center justify-content-center"
                              style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                              onClick={() => {
                                const newImages = images.filter((_, i) => i !== idx);
                                handleFieldChange(field.name, newImages);
                              }}
                            >
                              <span style={{ fontSize: '14px', lineHeight: 1 }}>×</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Input */}
                    <div className="d-flex flex-column gap-2">
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        multiple
                        onChange={async (event) => {
                          const files = Array.from(event.target.files || []);
                          if (files.length === 0) return;

                          setIsSaving(true);
                          const newPaths = [];

                          try {
                            for (const file of files) {
                              const formData = new FormData();
                              formData.append('file', file);
                              const res = await fetch('/api/admin/upload', {
                                method: 'POST',
                                body: formData,
                              });
                              if (res.ok) {
                                const data = await res.json();
                                newPaths.push(data.path);
                              }
                            }
                            handleFieldChange(field.name, [...images, ...newPaths]);
                            setMessage(`${newPaths.length} image(s) ajoutée(s).`);
                          } catch (e) {
                            setError("Erreur lors de l'upload");
                          } finally {
                            setIsSaving(false);
                            event.target.value = ''; // Reset input
                          }
                        }}
                      />
                      <small className="text-secondary">
                        Sélectionnez plusieurs images pour les ajouter à la galerie.
                      </small>
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
                    onBlur={
                      field.name === entryTitleField
                        ? (event) => handleAutoSlug(event.target.value)
                        : undefined
                    }
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
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={handleDelete}
                disabled={isDeleting || isSaving}
              >
                {isDeleting ? 'Suppression…' : 'Supprimer'}
              </button>
            ) : null}
            {entry ? (
              <span className="text-secondary small">
                Dernière mise à jour : {new Date(entry.updatedAt).toLocaleString('fr-FR')}
              </span>
            ) : null}
          </div>

          <div className="border-top pt-4">
            <div className="d-flex align-items-center justify-content-between">
              <h2 className="h6 fw-bold text-primary mb-0">Aperçu en direct</h2>
              <button
                type="button"
                className="btn btn-link"
                onClick={() => setShowPreview((prev) => !prev)}
              >
                {showPreview ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            {showPreview ? (
              <div className="mt-3">{renderPreview()}</div>
            ) : (
              <p className="text-secondary mt-3 mb-0">Aperçu masqué.</p>
            )}
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
                          className={`badge ${revision.status === 'published' ? 'text-bg-success' : 'text-bg-secondary'
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
