import { NextResponse } from 'next/server';
import { draftMode } from 'next/headers';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const mode = searchParams.get('mode');

  if (!process.env.PREVIEW_SECRET) {
    return NextResponse.json({ error: 'PREVIEW_SECRET non configuré' }, { status: 500 });
  }

  if (secret !== process.env.PREVIEW_SECRET) {
    return NextResponse.json({ error: 'Jeton invalide' }, { status: 401 });
  }

  if (mode === 'disable') {
    draftMode().disable();
    const redirectUrl = searchParams.get('redirect') ?? '/';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  draftMode().enable();
  const redirectTo = searchParams.get('redirect') ?? '/';
  return NextResponse.redirect(new URL(redirectTo, request.url));
}
