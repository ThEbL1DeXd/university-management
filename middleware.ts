import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { canAccessRoute, UserRole } from '@/lib/permissions';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const role = (token?.role as UserRole) || 'student';
    const pathname = req.nextUrl.pathname;

    // Vérifier si l'utilisateur a accès à cette route selon son rôle
    if (!canAccessRoute(role, pathname)) {
      console.log(`❌ Accès refusé: ${role} → ${pathname}`);
      // Rediriger vers la page d'accueil si accès non autorisé
      return NextResponse.redirect(new URL('/', req.url));
    }

    console.log(`✅ Accès autorisé: ${role} → ${pathname}`);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Vérifie que l'utilisateur est connecté
    },
  }
);

export const config = {
  matcher: [
    '/',
    '/students/:path*',
    '/teachers/:path*',
    '/courses/:path*',
    '/departments/:path*',
    '/grades/:path*',
    '/groups/:path*',
  ],
};
