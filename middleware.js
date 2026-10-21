import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware() {},
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;
        if (pathname.startsWith('/admin/login')) {
          return true;
        }
        // Le rôle contenu dans le jeton peut être périmé jusqu'à 4h (compte
        // promu/rétrogradé après la connexion) : la vérification du rôle
        // admin se fait en base dans la page et les routes /api/admin/users,
        // pas ici.
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
