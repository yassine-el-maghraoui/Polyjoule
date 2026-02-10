import { siteConfig } from '@/lib/site.config';
import { getCollectionEntries } from '@/lib/content';

export default async function sitemap() {
    const baseUrl = siteConfig.url;

    // Static pages with specific priorities
    const routes = [
        { path: '', priority: 1.0, changeFrequency: 'weekly' },
        { path: '/calendrier', priority: 0.9, changeFrequency: 'daily' },
        { path: '/presentation', priority: 0.8, changeFrequency: 'monthly' },
        { path: '/historique', priority: 0.8, changeFrequency: 'monthly' },
        { path: '/infos-vehicule', priority: 0.8, changeFrequency: 'monthly' },
        { path: '/palmares', priority: 0.8, changeFrequency: 'monthly' },
        { path: '/gallery', priority: 0.7, changeFrequency: 'monthly' },
        { path: '/mentions-legales', priority: 0.1, changeFrequency: 'yearly' },
        { path: '/confidentialite', priority: 0.1, changeFrequency: 'yearly' },
    ].map(({ path, priority, changeFrequency }) => ({
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
    }));

    // Dynamic pages: Calendar Events
    const events = await getCollectionEntries('calendar');
    const eventRoutes = events.map((event) => ({
        url: `${baseUrl}/calendrier/${event.slug}`,
        lastModified: new Date(event.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.6,
    }));

    return [...routes, ...eventRoutes];
}
