'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { siteConfig } from '@/lib/site.config';
import styles from './Navbar.module.css';

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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* SPACER */}
      <div
        className={clsx(styles.spacer, { [styles.scrolled]: isScrolled })}
        aria-hidden="true"
      />

      {/* HEADER */}
      <header
        className={clsx(styles.header, {
          [styles.scrolled]: isScrolled
        })}
      >
        <div className={styles.container}>
          {/* LOGO */}
          <Link href="/" className={styles.logo} onClick={closeMenu}>
            <Image
              src={siteConfig.assets.logo}
              alt={`${siteConfig.name} Logo`}
              width={160}
              height={55}
              priority
              style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
            />
          </Link>

          {/* DESKTOP NAV */}
          <nav className={styles.desktopNav}>
            {LINKS.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(styles.linkItem, { [styles.activeLink]: isActive })}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* BURGER */}
          <button
            className={clsx(styles.burger, { [styles.burgerOpen]: isOpen })}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* MOBILE MENU (Enfant du header pour synchroniser couleurs et position) */}
        <nav
          className={clsx(styles.mobileMenu, {
            [styles.mobileMenuOpen]: isOpen
          })}
        >
          {LINKS.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={clsx(styles.mobileLink, { [styles.activeLinkMobile]: isActive })}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}