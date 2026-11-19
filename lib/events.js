import { getCollectionEntries, getEntry } from './content.js';

const TIME_ZONE = 'Europe/Paris';
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function todayInParis() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date());
}

function toDate(iso) {
  return new Date(`${iso}T12:00:00Z`);
}

export function formatEventDate(startDate, endDate) {
  if (!ISO_DATE.test(startDate || '')) return '';
  const long = { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' };
  const start = toDate(startDate);
  if (!ISO_DATE.test(endDate || '') || endDate === startDate) {
    return start.toLocaleDateString('fr-FR', long);
  }

  const end = toDate(endDate);
  const sameMonth =
    start.getUTCFullYear() === end.getUTCFullYear() && start.getUTCMonth() === end.getUTCMonth();
  const startLabel = sameMonth
    ? start.toLocaleDateString('fr-FR', { day: 'numeric', timeZone: 'UTC' })
    : start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' });
  return `${startLabel} – ${end.toLocaleDateString('fr-FR', long)}`;
}

function eventCard(entry) {
  const data = entry.data ?? {};
  const photos = Array.isArray(data.galleryPaths) ? data.galleryPaths.filter(Boolean) : [];
  return {
    id: `event-${entry.id}`,
    slug: entry.slug,
    title: data.title ?? entry.title,
    date: formatEventDate(data.startDate, data.endDate),
    location: data.location ?? '',
    summary: data.summary ?? '',
    imagePath: data.imagePath || photos[0] || '',
    photos,
    href: `/calendrier/${entry.slug}`,
    ctaLabel: "Voir l'événement",
    startDate: data.startDate,
    lastDay: ISO_DATE.test(data.endDate || '') ? data.endDate : data.startDate,
  };
}

function legacyCard(entry) {
  const data = entry.data ?? {};
  return {
    id: `legacy-${entry.id}`,
    slug: entry.slug,
    title: data.title ?? entry.title,
    date: data.date ?? '',
    location: '',
    summary: data.summary ?? '',
    imagePath: data.imagePath ?? '',
    photos: [],
    href: data.ctaHref ?? '',
    ctaLabel: data.ctaLabel ?? 'Explorer',
  };
}

async function getDatedEvents({ includeDrafts }) {
  const entries = await getCollectionEntries('events', { includeDrafts });
  return entries.filter((entry) => ISO_DATE.test(entry.data?.startDate || '')).map(eventCard);
}

export async function getCalendar({ includeDrafts = false } = {}) {
  const [events, legacyUpcoming, legacyPast] = await Promise.all([
    getDatedEvents({ includeDrafts }),
    getCollectionEntries('events-upcoming', { includeDrafts }),
    getCollectionEntries('events-past', { includeDrafts }),
  ]);

  const today = todayInParis();
  const upcoming = events
    .filter((event) => event.lastDay >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const past = events
    .filter((event) => event.lastDay < today)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  return {
    upcoming: [...upcoming, ...legacyUpcoming.map(legacyCard)],
    past: [...past, ...legacyPast.map(legacyCard)],
  };
}

export async function getEventAlbums({ includeDrafts = false } = {}) {
  const events = await getDatedEvents({ includeDrafts });
  return events
    .filter((event) => event.photos.length > 0)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export async function getEventPage(slug, { includeDrafts = false } = {}) {
  const entry = await getEntry('events', slug, { includeDrafts });
  if (entry) {
    const data = entry.data ?? {};
    return {
      ...eventCard(entry),
      intro: data.summary ?? '',
      bodyHtml: data.bodyHtml ?? '',
      endDate: data.endDate || data.startDate,
    };
  }

  const legacy = await getEntry('event-detail', slug, { includeDrafts });
  if (!legacy) return null;
  const data = legacy.data ?? {};
  return {
    slug: legacy.slug,
    title: data.title ?? legacy.title,
    date: '',
    location: data.location ?? '',
    intro: data.intro ?? '',
    bodyHtml: data.bodyHtml ?? '',
    imagePath: data.imagePath ?? '',
    photos: [],
    startDate: data.date,
    endDate: data.dateEnd ?? data.date,
  };
}

export async function getEventSlugs() {
  const [events, legacy] = await Promise.all([
    getCollectionEntries('events'),
    getCollectionEntries('event-detail'),
  ]);
  const bySlug = new Map();
  for (const entry of [...legacy, ...events]) {
    bySlug.set(entry.slug, entry.updatedAt);
  }
  return Array.from(bySlug, ([slug, updatedAt]) => ({ slug, updatedAt }));
}
