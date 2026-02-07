'use client';

import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/lib/site.config';
import Navbar from '@/components/navbar/Navbar';
import Footer from '@/components/footer/Footer';

export default function NotFound() {
    return (
        <>
            <Navbar />
            <div className="container py-5 min-vh-50 d-flex align-items-center justify-content-center text-center">
                <div className="row w-100 justify-content-center">
                    <div className="col-md-8 col-lg-6">
                        <div className="mb-4">
                            <Image
                                src={siteConfig.assets.logo}
                                alt={`${siteConfig.name} Logo`}
                                width={200}
                                height={70}
                                style={{ height: 'auto', width: 'auto', objectFit: 'contain' }}
                                className="opacity-50"
                            />
                        </div>
                        <h1 className="display-1 fw-bold text-primary mb-2">404</h1>
                        <h2 className="h4 text-dark mb-4">Oups ! Page introuvable.</h2>
                        <p className="text-secondary mb-5">
                            La page que vous recherchez semble avoir été déplacée, supprimée ou n'a jamais existé.
                        </p>
                        <div className="d-flex gap-3 justify-content-center">
                            <Link href="/" className="btn btn-primary px-4 py-2 rounded-pill">
                                <i className="ri-home-4-line me-2"></i>Retour à l'accueil
                            </Link>
                            <button
                                onClick={() => window.history.back()}
                                className="btn btn-outline-secondary px-4 py-2 rounded-pill"
                            >
                                Page précédente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
