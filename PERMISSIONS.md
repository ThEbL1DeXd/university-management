# 🔐 Système de Permissions et Contrôle d'Accès (RBAC)

## Vue d'ensemble

L'application utilise un système de **Role-Based Access Control (RBAC)** pour gérer les permissions des utilisateurs selon leurs rôles.

## 🎭 Rôles Disponibles

### 1. **Admin** (Administrateur)
- **Accès complet** à toutes les fonctionnalités
- Peut créer, modifier et supprimer tous les types d'entités
- Voit toutes les statistiques globales
- Accède à toutes les pages

### 2. **Teacher** (Enseignant)
- **Lecture**: Peut voir les étudiants, enseignants, cours, départements
- **Écriture limitée**: Peut créer/modifier/supprimer des notes
- **Modification de cours**: Peut modifier les cours qu'il enseigne
- Ne peut **PAS** créer/modifier/supprimer les étudiants ou enseignants
- Accède aux pages: Dashboard, Étudiants, Enseignants, Cours, Départements, Notes

### 3. **Student** (Étudiant)
- **Lecture limitée**: Peut seulement voir ses propres données
- **Filtrage automatique des données**: 
  - Ne voit que les cours auxquels il est inscrit (filtré par `enrolledStudents`)
  - Ne voit que ses propres notes (filtré par `student` ID)
- Ne peut **rien créer, modifier ou supprimer**
- Accède uniquement aux pages: Dashboard, Cours, Notes
- **Interface simplifiée**: Les boutons d'ajout, modification et suppression sont automatiquement masqués

## 📋 Matrice des Permissions

| Fonctionnalité | Admin | Teacher | Student |
|----------------|-------|---------|---------|
| **Étudiants** |
| Voir tous les étudiants | ✅ | ✅ | ❌ |
| Créer un étudiant | ✅ | ❌ | ❌ |
| Modifier un étudiant | ✅ | ❌ | ❌ |
| Supprimer un étudiant | ✅ | ❌ | ❌ |
| **Enseignants** |
| Voir tous les enseignants | ✅ | ✅ | ✅ |
| Créer un enseignant | ✅ | ❌ | ❌ |
| Modifier un enseignant | ✅ | ❌ | ❌ |
| Supprimer un enseignant | ✅ | ❌ | ❌ |
| **Cours** |
| Voir tous les cours | ✅ | ✅ | ❌ (Seulement ses cours inscrits) |
| Créer un cours | ✅ | ❌ | ❌ |
| Modifier un cours | ✅ | ✅* | ❌ |
| Supprimer un cours | ✅ | ❌ | ❌ |
| **Départements** |
| Voir tous les départements | ✅ | ✅ | ✅ |
| Créer un département | ✅ | ❌ | ❌ |
| Modifier un département | ✅ | ❌ | ❌ |
| Supprimer un département | ✅ | ❌ | ❌ |
| **Notes** |
| Voir toutes les notes | ✅ | ✅** | ❌ (Seulement ses propres notes) |
| Créer une note | ✅ | ✅ | ❌ |
| Modifier une note | ✅ | ✅ | ❌ |
| Supprimer une note | ✅ | ✅ | ❌ |
| **Dashboard** |
| Voir le dashboard | ✅ | ✅ | ✅ |
| Voir les statistiques | ✅ | ❌ | ❌ |

*_Teacher peut modifier uniquement ses propres cours_  
**_Teacher peut voir uniquement les notes de ses cours_  
***_Student peut voir uniquement ses propres notes (filtrage automatique au niveau de l'API)_

## 🔍 Filtrage des Données par Rôle

Le système implémente un **double niveau de protection** pour les étudiants :

### 1. Filtrage Backend (API)

Les routes API filtrent automatiquement les données selon le rôle :

**Pour les Cours** (`/api/courses`):
```typescript
if (userRole === 'student') {
  // Filtre uniquement les cours où l'étudiant est inscrit
  query.enrolledStudents = relatedId; // relatedId = Student._id
}
```

**Pour les Notes** (`/api/grades`):
```typescript
if (userRole === 'student') {
  // Filtre uniquement les notes de l'étudiant
  query.student = relatedId; // relatedId = Student._id
}
```

### 2. Protection Frontend (UI)

L'interface masque automatiquement les boutons d'action non autorisés :

```typescript
// Exemple dans app/grades/page.tsx
{permissions.canCreateGrade && (
  <button>Ajouter une note</button> // Masqué pour les étudiants
)}

{permissions.canEditGrade && (
  <button>Modifier</button> // Masqué pour les étudiants
)}
```

**Résultat pour un étudiant** :
- ✅ Voit ses cours inscrits uniquement
- ✅ Voit ses propres notes uniquement
- ❌ Aucun bouton "Ajouter", "Modifier" ou "Supprimer"
- ❌ Impossible d'accéder aux données des autres étudiants via l'API

## 🛡️ Protection des Routes

### Routes API Protégées

Toutes les routes API vérifient l'authentification et les permissions :

```typescript
// Exemple: POST /api/students (Créer un étudiant)
// ✅ Admin: Autorisé
// ❌ Teacher: 403 Forbidden
// ❌ Student: 403 Forbidden
// ❌ Non authentifié: 401 Unauthorized
```

### Routes Frontend Protégées

Le middleware Next.js redirige vers `/login` si non authentifié.

Le Sidebar masque automatiquement les pages non accessibles selon le rôle.

### Isolation des Données (Students)

Pour garantir que les étudiants ne voient que **leurs propres données**, le système utilise :

1. **Identification de l'étudiant lié** : 
   - Chaque User avec le rôle `student` a un champ `relatedId` qui pointe vers son document Student
   - Ce `relatedId` est stocké dans la session JWT

2. **Filtrage automatique dans les API routes** :
   ```typescript
   // Dans app/api/courses/route.ts
   const { userRole, relatedId } = auth.session.user;
   if (userRole === 'student') {
     query.enrolledStudents = relatedId; // MongoDB ObjectId du Student
   }
   ```

3. **Résultat** :
   - Un étudiant ne peut **jamais** récupérer les données d'un autre étudiant
   - Même en appelant directement l'API, les résultats sont filtrés côté serveur
   - Protection totale contre la manipulation des requêtes côté client

## 📁 Fichiers Importants

### Backend
- `lib/permissions.ts` - Définition des permissions par rôle
- `lib/auth-helpers.ts` - Helpers pour vérifier l'authentification et les rôles
- `app/api/*/route.ts` - Routes API protégées

### Frontend
- `hooks/usePermissions.ts` - Hook React pour obtenir les permissions
- `components/Sidebar.tsx` - Navigation filtrée par rôle
- `app/students/page.tsx` - Exemple de page protégée
- `app/teachers/page.tsx` - Exemple de page protégée

## 🔧 Comment Utiliser les Permissions

### Dans les Routes API

```typescript
import { requireAdmin, requireAdminOrTeacher } from '@/lib/auth-helpers';

// Seul l'admin
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.error },
      { status: auth.status }
    );
  }
  // ... logique
}

// Admin ou Teacher
export async function POST(request: NextRequest) {
  const auth = await requireAdminOrTeacher(request);
  // ... vérification et logique
}
```

### Dans les Composants React

```typescript
import { usePermissions } from '@/hooks/usePermissions';

export default function MyComponent() {
  const { permissions, isAdmin, isTeacher, isStudent } = usePermissions();

  return (
    <div>
      {permissions.canCreateStudent && (
        <button>Ajouter un étudiant</button>
      )}
      
      {isAdmin && (
        <div>Section Admin uniquement</div>
      )}
    </div>
  );
}
```

## 🧪 Tester les Permissions

### Comptes de Test

Utilisez ces comptes pour tester les différents rôles :

**Admin:**
```
Email: admin@university.com
Mot de passe: admin123
```

**Teacher:**
```
Email: jean.dupont@university.com
Mot de passe: teacher123
```

**Student:**
```
Email: alice.johnson@student.com
Mot de passe: student123
```

### Scénarios de Test

1. **En tant qu'Admin:**
   - ✅ Créer un nouvel étudiant
   - ✅ Modifier un enseignant
   - ✅ Supprimer un cours
   - ✅ Voir toutes les statistiques

2. **En tant que Teacher:**
   - ✅ Voir la liste des étudiants
   - ❌ Impossible de créer un étudiant (bouton masqué)
   - ✅ Créer une note pour un étudiant
   - ❌ Impossible d'accéder à /api/students (403)

3. **En tant que Student:**
   - ✅ Voir ses cours inscrits uniquement (autres cours non visibles)
   - ✅ Voir ses notes uniquement (notes des autres étudiants non visibles)
   - ❌ Aucun bouton "Ajouter", "Modifier" ou "Supprimer" visible
   - ❌ Pas d'accès à /students (Sidebar ne montre pas l'option)
   - ❌ Impossible de créer ou modifier quoi que ce soit
   - ✅ **Test d'isolation**: Appel direct à `/api/courses` retourne uniquement les cours inscrits
   - ✅ **Test d'isolation**: Appel direct à `/api/grades` retourne uniquement ses propres notes

## 🔒 Sécurité

### Bonnes Pratiques Implémentées

1. **Double Protection**: API + UI
   - Les routes API vérifient les permissions (sécurité backend)
   - L'UI masque les boutons inaccessibles (UX)

2. **Principe du Moindre Privilège**
   - Chaque rôle a uniquement les permissions nécessaires
   - Les étudiants ne voient que leurs propres données

3. **Messages d'Erreur Appropriés**
   - 401 Unauthorized pour non authentifié
   - 403 Forbidden pour permissions insuffisantes

4. **Sessions Sécurisées**
   - JWT avec NextAuth
   - Secret token dans .env.local

## 📝 Extension du Système

Pour ajouter de nouvelles permissions :

1. **Mettre à jour `lib/permissions.ts`**
```typescript
export interface Permission {
  // ... permissions existantes
  canDoNewAction: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  admin: { canDoNewAction: true },
  teacher: { canDoNewAction: false },
  student: { canDoNewAction: false },
};
```

2. **Protéger la route API**
```typescript
const auth = await requireAdmin(request);
if (!auth.authorized) {
  return NextResponse.json({ error: auth.error }, { status: auth.status });
}
```

3. **Utiliser dans l'UI**
```typescript
const { permissions } = usePermissions();
{permissions.canDoNewAction && <button>Nouvelle Action</button>}
```

## 🎯 Résumé

- ✅ **3 rôles**: Admin, Teacher, Student
- ✅ **Protection complète**: API + UI
- ✅ **Granularité**: Permissions détaillées par fonctionnalité
- ✅ **Facilement extensible**: Ajout simple de nouvelles permissions
- ✅ **Type-safe**: TypeScript pour éviter les erreurs
- ✅ **Testé**: Comptes de test disponibles

Le système est maintenant sécurisé et respecte le principe du moindre privilège ! 🔐
