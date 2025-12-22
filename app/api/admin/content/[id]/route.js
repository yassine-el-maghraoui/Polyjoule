export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const updateSchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  position: z.coerce.number().optional(),
  status: z.enum(['draft', 'published']).optional(),
  data: z.record(z.any()).optional(),
});

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { id: rawId } = await params;
  const id = Number(rawId);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 });
  }

  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.format() }, { status: 400 });
  }

  const existing = await prisma.contentEntry.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Contenu introuvable' }, { status: 404 });
  }

  const data = parsed.data.data ?? JSON.parse(existing.data ?? '{}');
  const status = parsed.data.status ?? existing.status;

  const updated = await prisma.contentEntry.update({
    where: { id },
    data: {
      title: parsed.data.title ?? existing.title,
      slug: parsed.data.slug ?? existing.slug,
      position: parsed.data.position ?? existing.position,
      status,
      data: JSON.stringify(data),
      publishedAt: status === 'published' ? existing.publishedAt ?? new Date() : null,
    },
  });

  await prisma.contentRevision.create({
    data: {
      contentId: id,
      authorId: session.user?.id ?? null,
      status,
      data: JSON.stringify(data),
    },
  });

  return NextResponse.json({ entry: updated });
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { id: rawId } = await params;
  const id = Number(rawId);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 });
  }

  await prisma.contentEntry.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
