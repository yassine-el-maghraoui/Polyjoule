export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

const createSchema = z.object({
  email: z.string().trim().toLowerCase().email('Adresse e-mail invalide'),
  name: z.string().trim().min(1, 'Nom requis').max(120),
  role: z.enum(['admin', 'editor']).default('editor'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
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

  const { email, name, role, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: { email, name, role, passwordHash },
      select: USER_SELECT,
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Cette adresse e-mail est déjà utilisée.' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Impossible de créer ce compte.' }, { status: 500 });
  }
}
