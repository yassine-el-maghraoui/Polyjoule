import { NextResponse } from 'next/server';
import { withAuth } from 'next-auth/middleware';

const FIRST_LOGIN_PAGE = '/admin/premiere-connexion';
const PENDING_PASSWORD_ALLOWED = [FIRST_LOGIN_PAGE, '/admin/login', '/api/admin/account/password'];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    if (!req.nextauth.token?.mustChangePassword) {
      return;
    }
    if (PENDING_PASSWORD_ALLOWED.some((path) => pathname.startsWith(path))) {
      return;
    }
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Changez votre mot de passe temporaire avant de continuer.' },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL(FIRST_LOGIN_PAGE, req.url));
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;
        if (pathname.startsWith('/admin/login')) {
          return true;
        }
        return !!token;
      },
    },
    pages: {
      signIn: '/admin/login',
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
