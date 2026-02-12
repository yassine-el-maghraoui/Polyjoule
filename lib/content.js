import { cache } from 'react';
import prisma from './prisma.js';

function parseData(entry) {
  if (!entry) return null;
  let data;
  try {
    data = JSON.parse(entry.data || '{}');
  } catch (error) {
    data = {};
  }
  return {
    ...entry,
    data,
  };
}

function preferDraftEntries(entries) {
  const bySlug = new Map();

  for (const entry of entries) {
    const key = entry.slug;
    const current = bySlug.get(key);
    if (!current) {
      bySlug.set(key, entry);
      continue;
    }

    if (current.status === 'draft' && entry.status !== 'draft') {
      continue;
    }

    if (entry.status === 'draft' && current.status !== 'draft') {
      bySlug.set(key, entry);
      continue;
    }

    if (new Date(entry.updatedAt).getTime() > new Date(current.updatedAt).getTime()) {
      bySlug.set(key, entry);
    }
  }

  return Array.from(bySlug.values()).sort((a, b) => a.position - b.position);
}

export const getCollectionEntries = cache(async (collection, { includeDrafts = false } = {}) => {
  try {
    const entries = await prisma.contentEntry.findMany({
      where: includeDrafts
        ? { collection }
        : { collection, status: 'published' },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });

    const effectiveEntries = includeDrafts ? preferDraftEntries(entries) : entries;

    return effectiveEntries.map(parseData);
  } catch (error) {
    console.error(`[getCollectionEntries] Error fetching ${collection}:`, error.message);
    return [];
  }
});

export const getEntry = cache(async (collection, slug, { includeDrafts = false } = {}) => {
  try {
    if (includeDrafts) {
      const entry = await prisma.contentEntry.findFirst({
        where: {
          collection,
          slug,
        },
        orderBy: [
          { status: 'desc' },
          { updatedAt: 'desc' },
        ],
      });
      return parseData(entry);
    }

    const entry = await prisma.contentEntry.findUnique({
      where: {
        collection_slug: {
          collection,
          slug,
        },
      },
    });
    if (!entry || entry.status !== 'published') return null;
    return parseData(entry);
  } catch (error) {
    console.error(`[getEntry] Error fetching ${collection}/${slug}:`, error.message);
    return null;
  }
});

export const getEntryById = cache(async (id) => {
  try {
    const entry = await prisma.contentEntry.findUnique({ where: { id } });
    return parseData(entry);
  } catch (error) {
    console.error(`[getEntryById] Error fetching ${id}:`, error.message);
    return null;
  }
});

export const listCollections = cache(async () => {
  try {
    const collections = await prisma.contentEntry.findMany({
      distinct: ['collection'],
      select: { collection: true },
    });
    return collections.map((item) => item.collection).sort();
  } catch (error) {
    console.error('[listCollections] Error:', error.message);
    return [];
  }
});

export const getRevisions = cache(async (contentId) => {
  try {
    const revisions = await prisma.contentRevision.findMany({
      where: { contentId },
      orderBy: { createdAt: 'desc' },
      include: { author: true },
    });

    return revisions.map((revision) => ({
      ...revision,
      data: (() => {
        try {
          return JSON.parse(revision.data || '{}');
        } catch (error) {
          return {};
        }
      })(),
    }));
  } catch (error) {
    console.error(`[getRevisions] Error fetching ${contentId}:`, error.message);
    return [];
  }
});
