import { notFound } from 'next/navigation';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import UserManager from '@/components/admin/UserManager';

export const metadata = {
  title: 'Comptes & accès — Back-office Polyjoule',
};

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  // Le middleware bloque déjà les non-admins sur cette route ; on revérifie
  // ici en base au cas où le rôle du token serait périmé.
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== 'admin') {
    notFound();
  }

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h1 className="h4 fw-bold text-primary mb-1">Comptes & accès</h1>
        <p className="text-secondary mb-0">
          Créez les comptes de l’équipe communication et choisissez leur rôle. Un éditeur peut gérer tous les
          contenus du site ; un administrateur peut en plus créer et gérer les comptes.
        </p>
      </div>
      <UserManager initialUsers={users} currentUserId={currentUser.id} />
    </div>
  );
}
