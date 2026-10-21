'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const COLLECTION_ICONS = {
  announcements: 'ri-megaphone-line',
  'page-cagnotte': 'ri-hand-coin-line',
  'home-hero': 'ri-image-line',
  'quick-links': 'ri-links-line',
  partners: 'ri-handshake-line',
  palmares: 'ri-trophy-line',
  timeline: 'ri-history-line',
  vehicles: 'ri-car-line',
  'page-presentation': 'ri-team-line',
  'events-upcoming': 'ri-calendar-check-line',
  'events-past': 'ri-calendar-close-line',
  'event-detail': 'ri-file-text-line',
  'gallery-slides': 'ri-image-2-line',
};

function NavLink({ href, label, icon }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <li>
      <Link
        href={href}
        className={clsx('btn w-100 d-flex align-items-center gap-2 text-start', {
          'btn-primary': isActive,
          'btn-outline-primary': !isActive,
        })}
        aria-current={isActive ? 'page' : undefined}
      >
        {icon ? <i className={icon} aria-hidden="true"></i> : null}
        <span>{label}</span>
      </Link>
    </li>
  );
}

export default function AdminSidebar({ navigationGroups, collectionDefinitions, user }) {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <div className="mb-4">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-2"
          >
            <i className="ri-external-link-line" aria-hidden="true"></i>
            <span>Voir le site</span>
          </a>
        </div>

        {navigationGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="text-uppercase text-secondary small fw-semibold mb-2">{group.label}</p>
            <ul className="list-unstyled d-grid gap-2">
              {group.items.map((item) => {
                const definition = collectionDefinitions[item.collection];
                if (!definition) return null;
                return (
                  <NavLink
                    key={item.collection}
                    href={`/admin/collections/${item.collection}`}
                    label={definition.label}
                    icon={COLLECTION_ICONS[item.collection]}
                  />
                );
              })}
            </ul>
          </div>
        ))}

        <div className="mb-2">
          <p className="text-uppercase text-secondary small fw-semibold mb-2">Mon compte</p>
          <ul className="list-unstyled d-grid gap-2">
            <NavLink href="/admin/mon-compte" label="Changer mon mot de passe" icon="ri-lock-password-line" />
            {user.role === 'admin' ? (
              <NavLink href="/admin/utilisateurs" label="Comptes & accès" icon="ri-user-settings-line" />
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
}
