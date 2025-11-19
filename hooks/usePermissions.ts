'use client';

import { useSession } from 'next-auth/react';
import { getPermissions, UserRole, Permission, hasPermission, canAccessRoute } from '@/lib/permissions';

/**
 * Hook pour obtenir les permissions de l'utilisateur connecté
 */
export function usePermissions() {
  const { data: session, status } = useSession();
  
  const role = (session?.user as any)?.role as UserRole || 'student';
  const permissions = getPermissions(role);
  
  /**
   * Vérifier si l'utilisateur a une permission spécifique
   */
  const can = (permission: keyof Permission): boolean => {
    return hasPermission(role, permission);
  };

  /**
   * Vérifier si l'utilisateur peut accéder à une route
   */
  const canAccess = (route: string): boolean => {
    return canAccessRoute(role, route);
  };
  
  return {
    permissions,
    role,
    can,
    canAccess,
    isAdmin: role === 'admin',
    isTeacher: role === 'teacher',
    isStudent: role === 'student',
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
}
