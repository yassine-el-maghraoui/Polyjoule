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

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  role: z.enum(['admin', 'editor']).optional(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').optional(),
});

async function requireAdmin() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { error: NextResponse.json({ error: 'Non autorisé' }, { status: 401 }) };
  }
  if (currentUser.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Réservé aux administrateurs' }, { status: 403 }) };
  }
  return { currentUser };
}

export async function PATCH(request, { params }) {
  const { currentUser, error } = await requireAdmin();
  if (error) return error;

  const { id: rawId } = await params;
  const id = Number(rawId);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 });
  }

  const json = await request.json();
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Données invalides' },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Compte introuvable' }, { status: 404 });
  }

  const { name, role, password } = parsed.data;

  if (role && role !== existing.role) {
    if (existing.id === currentUser.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas modifier votre propre rôle.' },
        { status: 400 }
      );
    }
    if (existing.role === 'admin' && role !== 'admin') {
      const adminCount = await prisma.user.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Impossible : il doit rester au moins un administrateur.' },
          { status: 400 }
        );
      }
    }
  }

  const data = {};
  if (name !== undefined) data.name = name;
  if (role !== undefined) data.role = role;
  if (password) data.passwordHash = await bcrypt.hash(password, 12);

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: USER_SELECT,
  });

  return NextResponse.json({ user: updated });
}

export async function DELETE(request, { params }) {
  const { currentUser, error } = await requireAdmin();
  if (error) return error;

  const { id: rawId } = await params;
  const id = Number(rawId);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 });
  }

  if (id === currentUser.id) {
    return NextResponse.json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Compte introuvable' }, { status: 404 });
  }

  if (existing.role === 'admin') {
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: 'Impossible : il doit rester au moins un administrateur.' },
        { status: 400 }
      );
    }
  }

  // Les révisions déjà enregistrées par ce compte restent dans l'historique,
  // mais perdent leur attribution (contrainte ON DELETE SET NULL).
  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
