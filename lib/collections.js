export const COLLECTION_DEFINITIONS = {
  'home-hero': {
    label: 'Accueil — Section héro',
    type: 'singleton',
    defaultSlug: 'principal',
    fields: [
      { name: 'badge', label: 'Badge', type: 'text', required: true },
      { name: 'title', label: 'Titre', type: 'text', required: true },
      { name: 'lead', label: 'Texte introductif', type: 'textarea', required: true },
      { name: 'primaryCtaLabel', label: 'Libellé CTA principal', type: 'text', required: true },
      { name: 'primaryCtaHref', label: 'Lien CTA principal', type: 'text', required: true },
      { name: 'secondaryCtaLabel', label: 'Libellé CTA secondaire', type: 'text' },
      { name: 'secondaryCtaHref', label: 'Lien CTA secondaire', type: 'text' },
      {
        name: 'illustrationPath',
        label: 'Image héro (chemin relatif depuis /public)',
        type: 'image',
        placeholder: '/assets/header.png',
      },
    ],
  },
  'quick-links': {
    label: 'Accueil — Liens rapides',
    type: 'collection',
    fields: [
      { name: 'icon', label: 'Icône Remix (classe)', type: 'text', placeholder: 'ri-trophy-line' },
      { name: 'title', label: 'Titre', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'href', label: 'Lien', type: 'text', required: true },
    ],
  },
  partners: {
    label: 'Accueil — Partenaires',
    type: 'collection',
    fields: [
      { name: 'name', label: 'Nom', type: 'text', required: true },
      { name: 'url', label: 'Lien externe', type: 'text' },
      {
        name: 'logoPath',
        label: 'Logo (chemin relatif)',
        type: 'image',
        placeholder: '/assets/logo.png',
        required: true,
      },
    ],
  },
  palmares: {
    label: 'Palmarès',
    type: 'collection',
    fields: [
      { name: 'year', label: 'Année', type: 'text', required: true },
      { name: 'title', label: 'Titre', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
    ],
  },
  timeline: {
    label: 'Historique — Événements',
    type: 'collection',
    fields: [
      { name: 'year', label: 'Année', type: 'text', required: true },
      { name: 'title', label: 'Titre', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      {
        name: 'imagePath',
        label: 'Image (chemin relatif)',
        type: 'image',
        placeholder: '/assets/historique-photos/2013.jfif',
      },
      { name: 'imageAlt', label: "Texte alternatif de l'image", type: 'text' },
    ],
  },
  'events-upcoming': {
    label: 'Calendrier — À venir',
    type: 'collection',
    fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true },
      { name: 'summary', label: 'Résumé', type: 'textarea', required: true },
      { name: 'date', label: 'Date (texte libre)', type: 'text' },
      { name: 'ctaLabel', label: 'Libellé bouton', type: 'text', required: true },
      { name: 'ctaHref', label: 'Lien bouton', type: 'text', required: true },
      {
        name: 'imagePath',
        label: 'Image',
        type: 'image',
        placeholder: '/assets/...',
      },
    ],
  },
  'events-past': {
    label: 'Calendrier — Passés',
    type: 'collection',
    fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true },
      { name: 'summary', label: 'Résumé', type: 'textarea', required: true },
      { name: 'date', label: 'Date (texte libre)', type: 'text' },
      { name: 'ctaLabel', label: 'Libellé bouton', type: 'text', required: true },
      { name: 'ctaHref', label: 'Lien bouton', type: 'text', required: true },
      {
        name: 'imagePath',
        label: 'Image',
        type: 'image',
        placeholder: '/assets/...',
      },
    ],
  },
  'event-detail': {
    label: 'Calendrier — Fiches détail',
    type: 'collection',
    fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true },
      { name: 'intro', label: 'Accroche', type: 'textarea' },
      { name: 'bodyHtml', label: 'Contenu (HTML autorisé)', type: 'textarea', required: true },
      {
        name: 'imagePath',
        label: 'Image',
        type: 'image',
        placeholder: '/assets/...',
      },
    ],
  },
  'gallery-slides': {
    label: 'Galerie — Slides',
    type: 'collection',
    fields: [
      {
        name: 'imagePath',
        label: 'Image',
        type: 'image',
        placeholder: '/assets/vehicule1.jpg',
        required: true,
      },
      { name: 'altText', label: 'Texte alternatif', type: 'text' },
    ],
  },
  vehicles: {
    label: 'Véhicules',
    type: 'collection',
    fields: [
      { name: 'category', label: 'Catégorie', type: 'text', placeholder: 'Urban Concept / Prototype' },
      { name: 'title', label: 'Titre', type: 'text', required: true },
      { name: 'intro', label: 'Introduction', type: 'textarea', required: true },
      { name: 'bodyHtml', label: 'Texte détaillé (HTML autorisé)', type: 'textarea' },
      {
        name: 'imagePath',
        label: 'Image principale',
        type: 'image',
        placeholder: '/assets/vehicule1.jpg',
      },
      {
        name: 'galleryPaths',
        label: 'Galerie (un chemin par ligne)',
        type: 'textarea',
        placeholder: '/assets/vehicule2.JPG\n/assets/vehicule3.JPG',
      },
    ],
  },
  'page-presentation': {
    label: 'Page — Présentation',
    type: 'singleton',
    defaultSlug: 'association',
    fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true },
      { name: 'bodyHtml', label: 'Contenu (HTML autorisé)', type: 'textarea', required: true },
    ],
  },
};

export function getCollectionDefinition(collection) {
  return COLLECTION_DEFINITIONS[collection] || null;
}

export const MANAGED_COLLECTIONS = Object.keys(COLLECTION_DEFINITIONS);
