import { siteConfig } from '@/lib/site.config';

export const metadata = {
    title: `Mentions Légales — ${siteConfig.name}`,
    description: `Mentions légales de l’association ${siteConfig.name}.`,
};

export default function MentionsLegalesPage() {
    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-lg-10">
                    <div className="text-center mb-5">
                        <h1 className="display-5 fw-bold text-primary mb-3">Mentions Légales</h1>
                        <p className="lead text-secondary">
                            Informations légales sur l’éditeur et l’hébergeur du site.
                        </p>
                    </div>

                    <div className="section-card mb-4">
                        <h2 className="h4 text-primary mb-4">1. Éditeur du site</h2>
                        <p>
                            Le site <strong>{siteConfig.url.replace(/^https?:\/\//, '')}</strong> est édité par l’association <strong>{siteConfig.name}</strong>, association régie par la loi du 1er juillet 1901.
                        </p>
                        <ul className="list-unstyled text-secondary">
                            <li className="mb-2"><strong>Adresse du siège social :</strong></li>
                            <li className="mb-3">
                                {siteConfig.address.entity}<br />
                                {siteConfig.address.street}<br />
                                {siteConfig.address.zipCode} {siteConfig.address.city}, {siteConfig.address.country}
                            </li>
                            <li className="mb-2"><strong>Contact :</strong> <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></li>
                            <li><strong>Directeur de la publication :</strong> Le Président de l'association {siteConfig.name}.</li>
                        </ul>
                    </div>

                    <div className="section-card mb-4">
                        <h2 className="h4 text-primary mb-4">2. Hébergement</h2>
                        <p>
                            Le site est hébergé par <strong>{siteConfig.credits.host.name}</strong>
                        </p>
                        <address className="text-secondary">
                            {siteConfig.credits.host.address.split(', ').map((line, i) => (
                                <span key={i}>{line}<br /></span>
                            ))}
                            <a href={siteConfig.credits.host.url} target="_blank" rel="noopener noreferrer">{siteConfig.credits.host.url}</a>
                        </address>
                    </div>

                    <div className="section-card mb-4">
                        <h2 className="h4 text-primary mb-4">3. Propriété intellectuelle</h2>
                        <p>
                            L’ensemble de ce site relève de la législation française et internationale sur le droit d’auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
                        </p>
                        <p>
                            La reproduction de tout ou partie de ce site sur un support électronique quel qu’il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
                        </p>
                    </div>

                    <div className="section-card">
                        <h2 className="h4 text-primary mb-4">4. Crédits</h2>
                        <p>
                            Conception et réalisation : <strong>Polyjoule Web Team</strong>.
                        </p>
                        <p>
                            Photos : &copy; Polyjoule et ses membres.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
