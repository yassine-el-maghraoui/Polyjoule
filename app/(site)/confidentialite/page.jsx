import { siteConfig } from '@/lib/site.config';

export const metadata = {
    title: `Politique de Confidentialité — ${siteConfig.name}`,
    description: `Politique de confidentialité et gestion des données personnelles de l’association ${siteConfig.name}.`,
};

export default function ConfidentialitePage() {
    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="text-center mb-5">
                        <h1 className="display-5 fw-bold text-primary mb-3">Politique de Confidentialité</h1>
                        <p className="lead text-secondary">
                            Transparence sur la collecte et l'utilisation de vos données.
                        </p>
                    </div>

                    <div className="section-card mb-4">
                        <h2 className="h4 text-primary mb-4">1. Collecte des données</h2>
                        <p>
                            L’association {siteConfig.name} s’engage à ce que la collecte et le traitement de vos données, effectués à partir du site <strong>{siteConfig.url.replace(/^https?:\/\//, '')}</strong>, soient conformes au règlement général sur la protection des données (RGPD) et à la loi Informatique et Libertés.
                        </p>
                        <p>
                            Nous collectons des données personnelles uniquement via :
                        </p>
                        <ul>
                            <li>Le formulaire de contact (Nom, Email, Message).</li>
                            <li>Les outils de statistiques anonymes (si applicables).</li>
                        </ul>
                    </div>

                    <div className="section-card mb-4">
                        <h2 className="h4 text-primary mb-4">2. Utilisation des données</h2>
                        <p>
                            Les données personnelles recueillies sont utilisées uniquement pour :
                        </p>
                        <ul>
                            <li>Répondre à vos demandes de contact.</li>
                            <li>Améliorer l'expérience utilisateur sur notre site.</li>
                        </ul>
                        <p>
                            Ces données ne sont jamais vendues, échangées ou transférées à des tiers sans votre consentement, sauf obligation légale.
                        </p>
                    </div>

                    <div className="section-card mb-4">
                        <h2 className="h4 text-primary mb-4">3. Cookies</h2>
                        <p>
                            Ce site peut utiliser des cookies "techniques" nécessaires au bon fonctionnement du site (session).
                        </p>
                        <p>
                            Pour les cookies de mesure d'audience ou tiers, un bandeau de consentement vous sera proposé lors de votre première visite si nécessaire. Vous pouvez à tout moment configurer votre navigateur pour bloquer les cookies.
                        </p>
                    </div>

                    <div className="section-card">
                        <h2 className="h4 text-primary mb-4">4. Vos droits</h2>
                        <p>
                            Conformément à la réglementation, vous disposez d’un droit d’accès, de rectification, d’effacement et de portabilité de vos données.
                        </p>
                        <p>
                            Pour exercer ces droits, vous pouvez nous contacter à l'adresse suivante :
                        </p>
                        <p className="mb-0">
                            <a href={`mailto:${siteConfig.email}`} className="btn btn-outline-primary">
                                {siteConfig.email}
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
