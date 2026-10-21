'use client';

import { useState } from 'react';

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const details = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(details.error || 'Modification impossible');
      }
      setMessage('Mot de passe mis à jour.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
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
      <div>
        <label className="form-label fw-semibold">Mot de passe actuel</label>
        <input
          type="password"
          className="form-control"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
        />
      </div>
      <div>
        <label className="form-label fw-semibold">Nouveau mot de passe</label>
        <input
          type="password"
          className="form-control"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          minLength={8}
          required
        />
      </div>
      <div>
        <label className="form-label fw-semibold">Confirmer le nouveau mot de passe</label>
        <input
          type="password"
          className="form-control"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          minLength={8}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? 'Enregistrement…' : 'Mettre à jour le mot de passe'}
      </button>
    </form>
  );
}
