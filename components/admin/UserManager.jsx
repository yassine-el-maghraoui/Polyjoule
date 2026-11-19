'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLE_LABELS = {
  admin: 'Administrateur',
  editor: 'Éditeur',
};

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' });
}

function formatDateTime(value) {
  return new Date(value).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Europe/Paris',
  });
}

function AccountStatus({ user }) {
  const now = Date.now();
  if (user.lockedUntil && new Date(user.lockedUntil).getTime() > now) {
    return (
      <span className="badge text-bg-danger" title="Trop de mots de passe erronés">
        Bloqué jusqu’à {formatDateTime(user.lockedUntil)}
      </span>
    );
  }
  if (user.mustChangePassword) {
    if (user.temporaryPasswordExpiresAt && new Date(user.temporaryPasswordExpiresAt).getTime() < now) {
      return <span className="badge text-bg-danger">Accès temporaire expiré</span>;
    }
    return (
      <span className="badge text-bg-warning">
        En attente de première connexion
        {user.temporaryPasswordExpiresAt ? ` (avant le ${formatDate(user.temporaryPasswordExpiresAt)})` : ''}
      </span>
    );
  }
  return (
    <span className="text-secondary small">
      {user.lastLoginAt ? `Dernière connexion : ${formatDateTime(user.lastLoginAt)}` : 'Actif'}
    </span>
  );
}

function TemporaryCredentials({ credentials, onDismiss }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(credentials.password);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="alert alert-info mt-3 mb-0">
      <div className="mb-2">
        {credentials.title} pour <strong>{credentials.email}</strong>. Mot de passe temporaire :{' '}
        <code className="fs-6">{credentials.password}</code>{' '}
        <button type="button" className="btn btn-sm btn-outline-primary ms-1" onClick={copy}>
          {copied ? 'Copié' : 'Copier'}
        </button>
      </div>
      <ul className="small mb-2 ps-3">
        <li>Il ne sera plus affiché après avoir fermé ce message.</li>
        <li>
          Envoyez l’adresse de connexion et le mot de passe par <strong>deux canaux différents</strong> (par ex.
          l’adresse par e-mail, le mot de passe par SMS ou en main propre).
        </li>
        <li>La personne devra choisir son propre mot de passe à la première connexion.</li>
        <li>Ce mot de passe temporaire expire dans 7 jours.</li>
      </ul>
      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onDismiss}>
        J’ai transmis le mot de passe, masquer
      </button>
    </div>
  );
}

export default function UserManager({ initialUsers, currentUserId }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [creating, setCreating] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const [busyId, setBusyId] = useState(null);
  const [resetResult, setResetResult] = useState(null);

  const refresh = async () => {
    const res = await fetch('/api/admin/users', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setCreatedCredentials(null);
    setCreating(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, role }),
      });
      const details = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(details.error || 'Création impossible');
      }

      setCreatedCredentials({
        title: 'Compte créé',
        email: details.user.email,
        password: details.temporaryPassword,
      });
      setName('');
      setEmail('');
      setRole('editor');
      await refresh();
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setError('');
    setMessage('');
    setBusyId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      });
      const details = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(details.error || 'Modification impossible');
      }
      setMessage('Rôle mis à jour.');
      await refresh();
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleResetPassword = async (userId, userLabel) => {
    const confirmed = window.confirm(
      `Réinitialiser le mot de passe de ${userLabel} ?\n\n` +
        'Cette personne sera déconnectée immédiatement et devra choisir un nouveau mot de passe ' +
        'avec le mot de passe temporaire que vous allez lui transmettre. Le compte sera aussi débloqué.'
    );
    if (!confirmed) {
      return;
    }
    setError('');
    setMessage('');
    setBusyId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ resetPassword: true }),
      });
      const details = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(details.error || 'Réinitialisation impossible');
      }
      setResetResult({
        title: 'Mot de passe réinitialisé',
        email: details.user.email,
        password: details.temporaryPassword,
      });
      await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Supprimer le compte de ${user.name || user.email} ?\n\n` +
        'Cette personne perdra immédiatement l’accès au back-office. ' +
        'Les contenus déjà modifiés par ce compte restent dans l’historique, mais sans nom d’auteur associé.'
    );
    if (!confirmed) return;

    setError('');
    setMessage('');
    setBusyId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const details = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(details.error || 'Suppression impossible');
      }
      setMessage('Compte supprimé.');
      await refresh();
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {error ? (
        <div className="alert alert-danger py-2" role="alert">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="alert alert-success py-2" role="status">
          {message}
        </div>
      ) : null}

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h2 className="h5 fw-bold text-primary mb-3">Créer un compte</h2>
          <form onSubmit={handleCreate} className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Nom</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Adresse e-mail</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Rôle</label>
              <select className="form-select" value={role} onChange={(event) => setRole(event.target.value)}>
                <option value="editor">Éditeur (gère le contenu du site)</option>
                <option value="admin">Administrateur (gère aussi les comptes)</option>
              </select>
            </div>
            <div className="col-md-8">
              <p className="text-secondary small mb-0">
                Un mot de passe temporaire aléatoire est généré à la création. Il est valable 7 jours et la
                personne doit le remplacer par le sien dès sa première connexion. Préférez le rôle Éditeur sauf
                besoin réel de gérer les comptes.
              </p>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button type="submit" className="btn btn-primary w-100" disabled={creating}>
                {creating ? 'Création…' : 'Créer le compte'}
              </button>
            </div>
          </form>

          {createdCredentials ? (
            <TemporaryCredentials credentials={createdCredentials} onDismiss={() => setCreatedCredentials(null)} />
          ) : null}
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h2 className="h5 fw-bold text-primary mb-3">Comptes existants</h2>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th scope="col">Nom</th>
                  <th scope="col">E-mail</th>
                  <th scope="col">Rôle</th>
                  <th scope="col">Statut</th>
                  <th scope="col">Créé le</th>
                  <th scope="col" className="text-end">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user.id === currentUserId;
                  const isBusy = busyId === user.id;
                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="fw-semibold">
                          {user.name || '—'} {isSelf ? <span className="text-secondary small">(vous)</span> : null}
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td style={{ minWidth: '220px' }}>
                        <select
                          className="form-select form-select-sm"
                          value={user.role}
                          disabled={isSelf || isBusy}
                          onChange={(event) => handleRoleChange(user.id, event.target.value)}
                        >
                          <option value="editor">{ROLE_LABELS.editor}</option>
                          <option value="admin">{ROLE_LABELS.admin}</option>
                        </select>
                      </td>
                      <td>
                        <AccountStatus user={user} />
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td className="text-end">
                        <div className="d-flex flex-column flex-md-row gap-2 justify-content-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            disabled={isSelf || isBusy}
                            onClick={() => handleResetPassword(user.id, user.name || user.email)}
                          >
                            Réinitialiser le mot de passe
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            disabled={isSelf || isBusy}
                            onClick={() => handleDelete(user)}
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {resetResult ? (
            <TemporaryCredentials credentials={resetResult} onDismiss={() => setResetResult(null)} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
