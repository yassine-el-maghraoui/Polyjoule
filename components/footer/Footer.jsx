'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      
      <div className={styles.mainSection}>
        <div className={styles.container}>
          
          {/* COLONNE 1 : MARQUE */}
          <div className={styles.brandColumn}>
            <Link href="/" className={styles.logo}>
              <Image 
                src="/images/logo.png" 
                alt="Polyjoule Logo" 
                width={150} 
                height={50} 
                style={{ height: 'auto', width: 'auto', objectFit: 'contain' }}
              />
            </Link>
            <p className={styles.tagline}>
              L'excellence étudiante au service de l'énergie alternative. Innovation, performance et passion depuis 2006.
            </p>
          </div>

          {/* COLONNE 2 : NAVIGATION */}
          <div>
            <h3 className={styles.columnTitle}>Explorer</h3>
            <ul className={styles.linkList}>
              <li><Link href="/presentation" className={styles.footerLink}>L'Association</Link></li>
              <li><Link href="/historique" className={styles.footerLink}>Notre Histoire</Link></li>
              <li><Link href="/palmares" className={styles.footerLink}>Palmarès</Link></li>
              <li><Link href="/infos-vehicule" className={styles.footerLink}>Les Prototypes</Link></li>
              <li><Link href="/gallery" className={styles.footerLink}>Médiathèque</Link></li>
            </ul>
          </div>

          

          {/* COLONNE 4 : LÉGAL */}
          <div>
            <h3 className={styles.columnTitle}>Légal</h3>
            <ul className={styles.linkList}>
              <li><Link href="/mentions-legales" className={styles.footerLink}>Mentions Légales</Link></li>
              <li><Link href="/confidentialite" className={styles.footerLink}>Politique de Confidentialité</Link></li>
              <li><Link href="/credits" className={styles.footerLink}>Crédits</Link></li>
              <li><a href="#" className={styles.footerLink}>Connexion Membre</a></li>
            </ul>
          </div>
          {/* COLONNE 3 : CONTACT & RÉSEAUX */}
          <div>
            <h3 className={styles.columnTitle}>Contact</h3>
            <div className={styles.linkList}>
              <div className={styles.contactItem}>
                <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span>Polytech Nantes<br/>Rue Christian Pauc<br/>44300 Nantes, France</span>
              </div>
              <div className={styles.contactItem}>
                <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                <Link href="mailto:contact@polyjoule.org" className={styles.footerLink}>contact@polyjoule.org</Link>
              </div>
            </div>

            {/* RÉSEAUX SOCIAUX */}
            <div className={styles.socialWrapper}>
              
              {/* Facebook (Icon filled) */}
              <Link href="https://www.facebook.com/polyjoule" target="_blank" rel="noreferrer" className={styles.socialLink} aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </Link>

              {/* Instagram (Icon stroke/outline pour être propre) */}
              <a href="https://www.instagram.com/polyjoule" target="_blank" rel="noreferrer" className={styles.socialLink} aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>

              {/* LinkedIn (Icon filled) */}
              <a href="https://www.linkedin.com/company/polyjoule" target="_blank" rel="noreferrer" className={styles.socialLink} aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.bottomContainer}>
          <p>&copy; {currentYear} Polyjoule. Tous droits réservés.</p>
          <p>Design & Développement par l'équipe Web Polyjoule.</p>
        </div>
      </div>

    </footer>
  );
}