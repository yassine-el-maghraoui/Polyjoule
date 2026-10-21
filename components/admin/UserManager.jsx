'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLE_LABELS = {
  admin: 'Administrateur',
  editor: 'Éditeur',
};

function generatePassword() {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  let value = '';
  for (let i = 0; i < bytes.length; i += 1) {
    value += alphabet[bytes[i] % alphabet.length];
  }
  return value;
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('fr-FR');
}

export default function UserManager({ initialUsers, currentUserId }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Nouveau compte
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  // Édition (par ligne)
  const [busyId, setBusyId] = useState(null);
  const [resetPasswords, setResetPasswords] = useState({});
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
        body: JSON.stringify({ name, email, role, password }),
      });
      const details = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(details.error || 'Création impossible');
      }

      setCreatedCredentials({ email: details.user.email, password });
      setName('');
      setEmail('');
      setRole('editor');
      setPassword('');
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
    const newPassword = resetPasswords[userId]?.trim() || generatePassword();
    if (!window.confirm(`Réinitialiser le mot de passe de ${userLabel} ?`)) {
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
        body: JSON.stringify({ password: newPassword }),
      });
      const details = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(details.error || 'Réinitialisation impossible');
      }
      setResetResult({ userId, email: details.user.email, password: newPassword });
      setResetPasswords((prev) => ({ ...prev, [userId]: '' }));
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
              <label className="form-label fw-semibold">Mot de passe initial</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="8 caractères minimum"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setPassword(generatePassword())}
                >
                  Générer
                </button>
              </div>
              <p className="text-secondary small mb-0 mt-1">
                Communiquez ce mot de passe à la personne concernée (par un moyen autre que le site, par ex. en
                main propre ou par un message privé). Il ne sera plus affiché ensuite.
              </p>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button type="submit" className="btn btn-primary w-100" disabled={creating}>
                {creating ? 'Création…' : 'Créer le compte'}
              </button>
            </div>
          </form>

          {createdCredentials ? (
            <div className="alert alert-info mt-3 mb-0">
              Compte créé pour <strong>{createdCredentials.email}</strong>. Mot de passe initial :{' '}
              <code>{createdCredentials.password}</code>
            </div>
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
                      <td>{formatDate(user.createdAt)}</td>
                      <td className="text-end">
                        <div className="d-flex flex-column flex-md-row gap-2 justify-content-end">
                          <div className="input-group input-group-sm" style={{ maxWidth: '260px' }}>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Nouveau mot de passe"
                              value={resetPasswords[user.id] ?? ''}
                              onChange={(event) =>
                                setResetPasswords((prev) => ({ ...prev, [user.id]: event.target.value }))
                              }
                            />
                            <button
                              type="button"
                              className="btn btn-outline-primary"
                              disabled={isBusy}
                              onClick={() => handleResetPassword(user.id, user.name || user.email)}
                            >
                              Réinitialiser
                            </button>
                          </div>
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
            <div className="alert alert-info mb-0">
              Nouveau mot de passe pour <strong>{resetResult.email}</strong> : <code>{resetResult.password}</code>
              <br />
              Communiquez-le à la personne concernée ; il ne sera plus affiché ensuite.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
