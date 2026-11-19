import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth';
import ChangePasswordForm from '@/components/admin/ChangePasswordForm';

export const metadata = {
  title: 'Première connexion — Back-office Polyjoule',
};

export const dynamic = 'force-dynamic';

export default async function FirstLoginPage() {
  const user = await getCurrentUser({ allowPendingPasswordChange: true });
  if (!user) {
    redirect('/admin/login?expired=1');
  }
  if (!user.mustChangePassword) {
    redirect('/admin');
  }

  return (
    <main className="d-flex align-items-center justify-content-center flex-grow-1 py-5">
      <div className="section-card" style={{ maxWidth: '480px', width: '100%' }}>
        <h1 className="h3 fw-bold text-primary mb-3">Choisissez votre mot de passe</h1>
        <p className="text-secondary mb-4">
          Bienvenue {user.name || user.email}. Le mot de passe que vous avez reçu est temporaire : remplacez-le
          par un mot de passe personnel que vous seul connaissez. Vous devrez ensuite vous reconnecter.
        </p>
        <ChangePasswordForm currentPasswordLabel="Mot de passe temporaire reçu" />
      </div>
    </main>
  );
}
