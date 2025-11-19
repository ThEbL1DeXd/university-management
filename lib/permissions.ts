/**
 * Système de gestion des permissions basé sur les rôles
 * Admin: Accès complet
 * Teacher: Peut gérer les notes et voir les cours
 * Student: Peut seulement voir ses propres données
 */

export type UserRole = 'admin' | 'teacher' | 'student';

export interface Permission {
  // Students
  canCreateStudent: boolean;
  canEditStudent: boolean;
  canDeleteStudent: boolean;
  canViewAllStudents: boolean;
  
  // Teachers
  canCreateTeacher: boolean;
  canEditTeacher: boolean;
  canDeleteTeacher: boolean;
  canViewAllTeachers: boolean;
  
  // Courses
  canCreateCourse: boolean;
  canEditCourse: boolean;
  canDeleteCourse: boolean;
  canViewAllCourses: boolean;
  
  // Groups
  canCreateGroup: boolean;
  canEditGroup: boolean;
  canDeleteGroup: boolean;
  canViewAllGroups: boolean;
  
  // Departments
  canCreateDepartment: boolean;
  canEditDepartment: boolean;
  canDeleteDepartment: boolean;
  canViewAllDepartments: boolean;
  
  // Grades
  canCreateGrade: boolean;
  canEditGrade: boolean;
  canDeleteGrade: boolean;
  canViewAllGrades: boolean;
  
  // Dashboard
  canViewDashboard: boolean;
  canViewStatistics: boolean;
}

/**
 * Définition des permissions par rôle
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  admin: {
    // Students
    canCreateStudent: true,
    canEditStudent: true,
    canDeleteStudent: true,
    canViewAllStudents: true,
    
    // Teachers
    canCreateTeacher: true,
    canEditTeacher: true,
    canDeleteTeacher: true,
    canViewAllTeachers: true,
    
    // Courses
    canCreateCourse: true,
    canEditCourse: true,
    canDeleteCourse: true,
    canViewAllCourses: true,
    
    // Groups
    canCreateGroup: true,
    canEditGroup: true,
    canDeleteGroup: true,
    canViewAllGroups: true,
    
    // Departments
    canCreateDepartment: true,
    canEditDepartment: true,
    canDeleteDepartment: true,
    canViewAllDepartments: true,
    
    // Grades
    canCreateGrade: true,
    canEditGrade: true,
    canDeleteGrade: true,
    canViewAllGrades: true,
    
    // Dashboard
    canViewDashboard: true,
    canViewStatistics: true,
  },
  
  teacher: {
    // Students
    canCreateStudent: false,
    canEditStudent: false,
    canDeleteStudent: false,
    canViewAllStudents: true, // Peut voir les étudiants
    
    // Teachers
    canCreateTeacher: false,
    canEditTeacher: false,
    canDeleteTeacher: false,
    canViewAllTeachers: true, // Peut voir les collègues
    
    // Courses
    canCreateCourse: false,
    canEditCourse: false, // Ne peut pas modifier les cours (seulement admin)
    canDeleteCourse: false,
    canViewAllCourses: true,
    
    // Groups
    canCreateGroup: false,
    canEditGroup: false,
    canDeleteGroup: false,
    canViewAllGroups: true, // Peut voir les groupes (lecture seule)
    
    // Departments
    canCreateDepartment: false,
    canEditDepartment: false,
    canDeleteDepartment: false,
    canViewAllDepartments: true,
    
    // Grades
    canCreateGrade: true, // Peut créer des notes pour ses étudiants
    canEditGrade: true, // Peut modifier les notes qu'il a créées
    canDeleteGrade: true, // Peut supprimer ses notes
    canViewAllGrades: false, // Ne peut voir que les notes de ses cours
    
    // Dashboard
    canViewDashboard: true,
    canViewStatistics: true, // Peut voir ses propres statistiques
  },
  
  student: {
    // Students
    canCreateStudent: false,
    canEditStudent: false,
    canDeleteStudent: false,
    canViewAllStudents: false, // Ne peut voir que ses camarades de classe
    
    // Teachers
    canCreateTeacher: false,
    canEditTeacher: false,
    canDeleteTeacher: false,
    canViewAllTeachers: false, // ❌ Ne peut PAS voir la liste de tous les enseignants
    
    // Courses
    canCreateCourse: false,
    canEditCourse: false,
    canDeleteCourse: false,
    canViewAllCourses: true, // Peut voir tous les cours disponibles
    
    // Groups
    canCreateGroup: false,
    canEditGroup: false,
    canDeleteGroup: false,
    canViewAllGroups: false, // Ne peut voir que son propre groupe
    
    // Departments
    canCreateDepartment: false,
    canEditDepartment: false,
    canDeleteDepartment: false,
    canViewAllDepartments: false, // ❌ Ne peut PAS voir la liste de tous les départements
    
    // Grades
    canCreateGrade: false,
    canEditGrade: false,
    canDeleteGrade: false,
    canViewAllGrades: false, // Ne peut voir que ses propres notes
    
    // Dashboard
    canViewDashboard: true,
    canViewStatistics: false, // Pas de statistiques globales
  },
};

/**
 * Obtenir les permissions pour un rôle donné
 */
export function getPermissions(role: UserRole): Permission {
  return ROLE_PERMISSIONS[role];
}

/**
 * Vérifier si un rôle a une permission spécifique
 */
export function hasPermission(role: UserRole, permission: keyof Permission): boolean {
  return ROLE_PERMISSIONS[role][permission];
}

/**
 * Vérifier si l'utilisateur est admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === 'admin';
}

/**
 * Vérifier si l'utilisateur est enseignant
 */
export function isTeacher(role: UserRole): boolean {
  return role === 'teacher';
}

/**
 * Vérifier si l'utilisateur est étudiant
 */
export function isStudent(role: UserRole): boolean {
  return role === 'student';
}

/**
 * Routes accessibles par rôle
 */
export const ROLE_ROUTES: Record<UserRole, string[]> = {
  admin: ['/', '/students', '/teachers', '/courses', '/groups', '/departments', '/grades'],
  teacher: ['/', '/students', '/teachers', '/courses', '/groups', '/departments', '/grades'],
  student: ['/', '/courses', '/grades'], // Accès limité
};

/**
 * Vérifier si un rôle peut accéder à une route
 */
export function canAccessRoute(role: UserRole, route: string): boolean {
  return ROLE_ROUTES[role].includes(route);
}
