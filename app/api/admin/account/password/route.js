export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { validateNewPassword } from '@/lib/password';

const schema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string(),
});

export async function POST(request) {
  const user = await getCurrentUser({ allowPendingPasswordChange: true });
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

  const { currentPassword, newPassword } = parsed.data;
  const policyError = validateNewPassword(newPassword, { email: user.email, name: user.name });
  if (policyError) {
    return NextResponse.json({ error: policyError }, { status: 400 });
  }

  const full = await prisma.user.findUnique({ where: { id: user.id } });
  const isValid = await bcrypt.compare(currentPassword, full.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: 'Mot de passe actuel incorrect.' }, { status: 400 });
  }
  if (await bcrypt.compare(newPassword, full.passwordHash)) {
    return NextResponse.json(
      { error: 'Le nouveau mot de passe doit être différent de l’actuel.' },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordChangedAt: new Date(),
      mustChangePassword: false,
      temporaryPasswordExpiresAt: null,
    },
  });

  return NextResponse.json({ ok: true });
}
