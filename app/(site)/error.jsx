'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="container py-5 min-vh-50 d-flex align-items-center justify-content-center text-center">
            <div className="row w-100 justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="mb-4">
                        <i className="ri-error-warning-line display-1 text-danger"></i>
                    </div>
                    <h2 className="h4 text-dark mb-4">Une erreur est survenue !</h2>
                    <p className="text-secondary mb-5">
                        Nous sommes désolés, mais quelque chose s'est mal passé. Nos équipes ont été notifiées.
                    </p>
                    <div className="d-flex gap-3 justify-content-center">
                        <button
                            onClick={() => reset()}
                            className="btn btn-primary px-4 py-2 rounded-pill"
                        >
                            Réessayer
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="btn btn-outline-secondary px-4 py-2 rounded-pill"
                        >
                            Retour à l'accueil
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
