export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { generateTemporaryPassword, TEMPORARY_PASSWORD_TTL_MS } from '@/lib/password';

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  mustChangePassword: true,
  temporaryPasswordExpiresAt: true,
  lockedUntil: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
};

const createSchema = z.object({
  email: z.string().trim().toLowerCase().email('Adresse e-mail invalide'),
  name: z.string().trim().min(1, 'Nom requis').max(120),
  role: z.enum(['admin', 'editor']).default('editor'),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: USER_SELECT,
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ users });
}

export async function POST(request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  if (currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 });
  }

  const json = await request.json();
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Données invalides' },
      { status: 400 }
    );
  }

  const { email, name, role } = parsed.data;
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        passwordHash,
        mustChangePassword: true,
        temporaryPasswordExpiresAt: new Date(Date.now() + TEMPORARY_PASSWORD_TTL_MS),
      },
      select: USER_SELECT,
    });
    return NextResponse.json({ user, temporaryPassword }, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Cette adresse e-mail est déjà utilisée.' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Impossible de créer ce compte.' }, { status: 500 });
  }
}
