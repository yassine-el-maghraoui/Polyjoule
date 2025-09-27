import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import fs from 'fs/promises';
import path from 'path';

import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

function sanitizeFilename(filename) {
  const timestamp = Date.now();
  const normalized = filename
    .toLowerCase()
    .replace(/[^a-z0-9\.\-]+/g, '-');
  return `${timestamp}-${normalized}`;
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const altText = formData.get('altText') ?? null;

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
  }

  const uploadDir = process.env.UPLOAD_DIR ?? 'public/uploads';
  const absoluteDir = path.isAbsolute(uploadDir)
    ? uploadDir
    : path.join(process.cwd(), uploadDir);

  await fs.mkdir(absoluteDir, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = sanitizeFilename(file.name ?? 'upload');
  const filePath = path.join(absoluteDir, filename);

  await fs.writeFile(filePath, buffer);

  const publicPath = `/${path.relative(path.join(process.cwd(), 'public'), filePath).replace(/\\/g, '/')}`;

  const media = await prisma.mediaAsset.create({
    data: {
      filename,
      originalName: file.name ?? filename,
      mimeType: file.type ?? 'application/octet-stream',
      size: buffer.length,
      altText: altText || null,
    },
  });

  return NextResponse.json({ path: publicPath, asset: media });
}
