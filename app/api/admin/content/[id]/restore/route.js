export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const schema = z.object({
  revisionId: z.number(),
});

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 });
  }

  const body = await request.json();
  const parsed = schema.safeParse({
    revisionId: Number(body.revisionId),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  const revision = await prisma.contentRevision.findUnique({
    where: { id: parsed.data.revisionId },
  });

  if (!revision || revision.contentId !== id) {
    return NextResponse.json({ error: 'Révision introuvable' }, { status: 404 });
  }

  const updated = await prisma.contentEntry.update({
    where: { id },
    data: {
      data: revision.data,
      status: revision.status,
      publishedAt: revision.status === 'published' ? new Date() : null,
    },
  });

  await prisma.contentRevision.create({
    data: {
      contentId: id,
      authorId: session.user?.id ?? null,
      status: revision.status,
      data: revision.data,
    },
  });

  return NextResponse.json({ entry: updated });
}
