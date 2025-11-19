'use client';

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';
import { hasPermission, UserRole, Permission } from '@/lib/permissions';

interface ProtectedActionProps {
  children: ReactNode;
  permission: keyof Permission;
  fallback?: ReactNode;
}

/**
 * Composant pour protéger les actions basées sur les permissions
 * Usage: <ProtectedAction permission="canCreateStudent">...</ProtectedAction>
 */
export default function ProtectedAction({ children, permission, fallback = null }: ProtectedActionProps) {
  const { data: session } = useSession();
  
  if (!session?.user?.role) {
    return <>{fallback}</>;
  }

  const userRole = session.user.role as UserRole;
  
  if (!hasPermission(userRole, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
