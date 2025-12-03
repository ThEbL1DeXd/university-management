import { NextRequest } from 'next/server';
import { getServerSession as nextAuthGetServerSession } from 'next-auth';
import { authOptions } from './auth';
import { hasPermission, UserRole, Permission } from './permissions';

/**
 * Export getServerSession for direct use
 */
export async function getServerSession() {
  return nextAuthGetServerSession(authOptions);
}

/**
 * Vérifier l'authentification et obtenir la session
 */
export async function checkAuth(request: NextRequest) {
  const session = await nextAuthGetServerSession(authOptions);
  
  if (!session || !session.user) {
    return {
      authorized: false,
      error: 'Non authentifié',
      status: 401,
      session: null,
    };
  }

  return {
    authorized: true,
    error: null,
    status: 200,
    session,
  };
}

/**
 * Vérifier si l'utilisateur a le rôle requis
 */
export async function checkRole(request: NextRequest, allowedRoles: string[]) {
  const { authorized, error, status, session } = await checkAuth(request);
  
  if (!authorized || !session) {
    return { authorized: false, error, status, session: null, role: null };
  }

  const userRole = (session.user as any).role;

  if (!allowedRoles.includes(userRole)) {
    return {
      authorized: false,
      error: 'Permission refusée',
      status: 403,
      session,
      role: userRole,
    };
  }

  return {
    authorized: true,
    error: null,
    status: 200,
    session,
    role: userRole,
  };
}

/**
 * Vérifier si l'utilisateur a une permission spécifique
 */
export async function requirePermission(request: NextRequest, permission: keyof Permission) {
  const { authorized, error, status, session } = await checkAuth(request);
  
  if (!authorized || !session) {
    return { authorized: false, error, status, session: null, role: null };
  }

  const userRole = (session.user as any).role as UserRole || 'student';

  if (!hasPermission(userRole, permission)) {
    return {
      authorized: false,
      error: `Permission refusée: ${permission}`,
      status: 403,
      session,
      role: userRole,
    };
  }

  return {
    authorized: true,
    error: null,
    status: 200,
    session,
    role: userRole,
  };
}

/**
 * Vérifier si l'utilisateur est admin
 */
export async function requireAdmin(request: NextRequest) {
  return checkRole(request, ['admin']);
}

/**
 * Vérifier si l'utilisateur est admin ou teacher
 */
export async function requireAdminOrTeacher(request: NextRequest) {
  return checkRole(request, ['admin', 'teacher']);
}

/**
 * Vérifier si l'utilisateur est authentifié (tous les rôles)
 */
export async function requireAuth(request: NextRequest) {
  return checkRole(request, ['admin', 'teacher', 'student']);
}
