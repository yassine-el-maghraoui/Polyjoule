'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/admin');
    }
  }, [status, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl: '/admin',
    });

    if (!result || result.error) {
      setError('Identifiants incorrects.');
      setLoading(false);
      return;
    }

    router.push(result.url ?? '/admin');
  };

  const callbackUrl = searchParams.get('callbackUrl');

  if (status === 'authenticated') {
    return null;
  }

  return (
    <main className="d-flex align-items-center justify-content-center flex-grow-1 py-5">
      <div className="section-card" style={{ maxWidth: '420px', width: '100%' }}>
        <h1 className="h3 fw-bold text-primary mb-3">Espace équipe Polyjoule</h1>
        <p className="text-secondary mb-4">
          Connectez-vous pour gérer le contenu du site. Identifiez-vous avec votre adresse e-mail et votre mot de passe.
        </p>
        {callbackUrl ? (
          <div className="alert alert-info py-2">
            Merci de vous identifier pour accéder à la ressource demandée.
          </div>
        ) : null}
        {error ? (
          <div className="alert alert-danger py-2" role="alert">
            {error}
          </div>
        ) : null}
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          <div>
            <label className="form-label fw-semibold">Adresse e-mail</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="form-label fw-semibold">Mot de passe</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </main>
  );
}
