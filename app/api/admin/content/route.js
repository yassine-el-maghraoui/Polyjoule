import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';

import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

const payloadSchema = z.object({
  collection: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().optional(),
  position: z.coerce.number().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  data: z.record(z.any()).optional(),
});

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const json = await request.json();
  const parsed = payloadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.format() }, { status: 400 });
  }

  const { collection, slug, title, position = 0, status, data = {} } = parsed.data;

  try {
    const entry = await prisma.contentEntry.create({
      data: {
        collection,
        slug,
        title: title ?? null,
        position,
        status,
        data: JSON.stringify(data),
        publishedAt: status === 'published' ? new Date() : null,
      },
    });

    await prisma.contentRevision.create({
      data: {
        contentId: entry.id,
        authorId: session.user?.id ?? null,
        status,
        data: JSON.stringify(data),
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Impossible de créer le contenu.' }, { status: 500 });
  }
}
