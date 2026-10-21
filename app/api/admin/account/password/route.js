export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const schema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
});

// Permet à n'importe quel compte connecté (admin ou éditeur) de changer
// son propre mot de passe, en confirmant l'ancien.
export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const json = await request.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Données invalides' },
      { status: 400 }
    );
  }

  const full = await prisma.user.findUnique({ where: { id: user.id } });
  const isValid = await bcrypt.compare(parsed.data.currentPassword, full.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: 'Mot de passe actuel incorrect.' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return NextResponse.json({ ok: true });
}
