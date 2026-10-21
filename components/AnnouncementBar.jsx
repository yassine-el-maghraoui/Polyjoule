import Link from 'next/link';

export default function AnnouncementBar({ announcements }) {
  if (!announcements || announcements.length === 0) return null;

  const items = announcements.map((entry) => entry.data ?? {}).filter((d) => d.message);
  if (items.length === 0) return null;

  // Dupliqué pour boucler le défilement sans coupure visuelle.
  const track = [...items, ...items];

  return (
    <div className="announcement-bar" role="region" aria-label="Annonces">
      <div className="announcement-bar-track">
        {track.map((item, index) => (
          <span className="announcement-bar-item" key={index}>
            {item.message}
            {item.ctaHref && item.ctaLabel ? (
              <Link href={item.ctaHref} className="announcement-bar-link">
                {item.ctaLabel}
              </Link>
            ) : null}
          </span>
        ))}
      </div>
    </div>
  );
}
