export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
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

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const collection = searchParams.get('collection');
  const slug = searchParams.get('slug');

  if (!collection) {
    return NextResponse.json({ error: 'Collection requise' }, { status: 400 });
  }

  try {
    if (slug) {
      const entry = await prisma.contentEntry.findUnique({
        where: { collection_slug: { collection, slug } },
      });
      return NextResponse.json(entry || null);
    }

    const entries = await prisma.contentEntry.findMany({
      where: { collection },
      orderBy: { position: 'asc' },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

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

  const { collection, slug, title, position, status, data = {} } = parsed.data;

  try {
    let finalPosition = position;

    if (finalPosition === undefined || finalPosition === null || Number.isNaN(finalPosition)) {
      const minPosition = await prisma.contentEntry.aggregate({
        _min: { position: true },
        where: { collection },
      });

      const fallback = minPosition._min.position ?? 1;
      finalPosition = fallback - 1;
    }

    const entry = await prisma.contentEntry.create({
      data: {
        collection,
        slug,
        title: title ?? null,
        position: finalPosition,
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
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un élément avec ce slug existe déjà pour cette collection.' },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: 'Impossible de créer le contenu.' }, { status: 500 });
  }
}
