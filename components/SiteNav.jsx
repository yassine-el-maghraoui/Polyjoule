'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/presentation', label: 'Présentation' },
  { href: '/historique', label: 'Historique' },
  { href: '/palmares', label: 'Palmarès' },
  { href: '/infos-vehicule', label: 'Véhicules' },
  { href: '/calendrier', label: 'Calendrier' },
  { href: '/gallery', label: 'Galerie' }
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold" href="/">
            Polyjoule
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Basculer la navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-lg-5 mb-2 mb-lg-0 gap-lg-2">
              {LINKS.map((link) => {
                const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                return (
                  <li className="nav-item" key={link.href}>
                    <Link
                      className={clsx('nav-link', { active: isActive })}
                      aria-current={isActive ? 'page' : undefined}
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
