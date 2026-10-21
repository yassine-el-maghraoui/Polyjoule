import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth';
import ChangePasswordForm from '@/components/admin/ChangePasswordForm';

export const metadata = {
  title: 'Mon compte — Back-office Polyjoule',
};

export const dynamic = 'force-dynamic';

export default async function MyAccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h1 className="h4 fw-bold text-primary mb-1">Mon compte</h1>
        <p className="text-secondary mb-0">
          Connecté en tant que <strong>{user.name || user.email}</strong> ({user.email}).
        </p>
      </div>
      <div className="card shadow-sm border-0" style={{ maxWidth: '480px' }}>
        <div className="card-body">
          <h2 className="h5 fw-bold text-primary mb-3">Changer mon mot de passe</h2>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
