# 🎓 UniManage - Système de Gestion Universitaire

Application web moderne et complète de gestion universitaire construite avec **Next.js 15**, **MongoDB**, **NextAuth** et **Tailwind CSS**.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Fonctionnalités

### 🔐 Authentification
- Système d'authentification sécurisé avec **NextAuth** et JWT
- 3 rôles utilisateur : **Admin**, **Enseignant**, **Étudiant**
- Protection des routes avec middleware

### 👥 Gestion des Utilisateurs
- **Étudiants** : Ajout, modification, suppression, matricule, email, département, cours inscrits
- **Enseignants** : Gestion complète avec département, spécialisation, cours enseignés
- **Départements** : Organisation par départements avec codes et descriptions
- **Cours** : Création de cours avec crédits, semestre, enseignant assigné

### 📊 Gestion des Notes
- Ajout et modification de notes par type d'examen (Midterm, Final, Quiz, Assignment)
- Affichage des notes par étudiant et par cours
- Calcul de la moyenne générale

### 📈 Dashboard & Statistiques
- Tableau de bord avec statistiques en temps réel
- Graphiques interactifs (barres et camemberts) avec **Recharts**
- Distribution des étudiants par département
- Actions rapides vers toutes les sections

### 🎨 Interface Utilisateur
- Design moderne et responsive
- Mode **Dark/Light** avec toggle
- Sidebar avec navigation intuitive
- Tableaux avec pagination et recherche
- Modals pour les formulaires
- Animations fluides

## 🚀 Installation

### Prérequis

- **Node.js** 18+ et npm
- **MongoDB** (local ou MongoDB Atlas)
- Un éditeur de code (VS Code recommandé)

### Étapes d'installation

1. **Cloner le projet**
```bash
git clone <url-du-repo>
cd university-management
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**

Créer un fichier `.env.local` à la racine du projet :

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/university-management
# Pour MongoDB Atlas :
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/university-management

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

Pour générer un `NEXTAUTH_SECRET` sécurisé :
```bash
openssl rand -base64 32
```

4. **Initialiser la base de données (optionnel)**

Vous pouvez créer un utilisateur admin initial manuellement ou via MongoDB :

```javascript
// Dans MongoDB Shell ou Compass
use university-management

db.users.insertOne({
  name: "Admin",
  email: "admin@university.com",
  password: "$2a$10$XYZ...", // Hash bcrypt de "admin123"
  role: "Admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

6. **Accéder à l'application**

Ouvrez votre navigateur et allez à : [http://localhost:3000](http://localhost:3000)

## 📁 Structure du Projet

```
university-management/
├── app/
│   ├── api/              # Routes API (CRUD)
│   │   ├── auth/         # NextAuth
│   │   ├── students/
│   │   ├── teachers/
│   │   ├── courses/
│   │   ├── departments/
│   │   ├── grades/
│   │   └── stats/
│   ├── students/         # Page étudiants
│   ├── teachers/         # Page enseignants
│   ├── courses/          # Page cours
│   ├── departments/      # Page départements
│   ├── grades/           # Page notes
│   ├── login/            # Page connexion
│   ├── layout.tsx        # Layout principal
│   ├── page.tsx          # Dashboard
│   └── globals.css       # Styles globaux
├── components/
│   ├── DataTable.tsx     # Table avec pagination
│   ├── DashboardLayout.tsx
│   ├── Modal.tsx
│   ├── Navbar.tsx
│   ├── SearchBar.tsx
│   ├── SessionProvider.tsx
│   ├── Sidebar.tsx
│   └── StatCard.tsx
├── contexts/
│   └── ThemeContext.tsx  # Contexte Dark/Light mode
├── lib/
│   ├── auth.ts           # Configuration NextAuth
│   └── dbConnect.ts      # Connexion MongoDB
├── models/              # Modèles Mongoose
│   ├── Course.ts
│   ├── Department.ts
│   ├── Grade.ts
│   ├── Student.ts
│   ├── Teacher.ts
│   └── User.ts
├── types/
│   └── next-auth.d.ts    # Types NextAuth
├── .env.local            # Variables d'environnement
├── middleware.ts         # Protection des routes
└── package.json
```

## 🗄️ Modèles de Données

### User (Utilisateur)
- name, email, password (hash bcrypt)
- role: Admin | Teacher | Student
- relatedId: Référence vers Student ou Teacher

### Department (Département)
- name, code, description, head

### Teacher (Enseignant)
- name, email, phone, department, specialization
- courses: tableau de cours enseignés

### Student (Étudiant)
- name, matricule, email, phone, department
- enrolledCourses: tableau de cours inscrits
- dateOfBirth, address

### Course (Cours)
- name, code, description, credits
- department, teacher, semester, year
- enrolledStudents: tableau d'étudiants

### Grade (Note)
- student, course, grade (0-100)
- examType: Midterm | Final | Quiz | Assignment
- comments, submittedBy (teacher)

## 🔑 Identifiants de Démonstration

Après avoir créé les utilisateurs, vous pouvez utiliser :

- **Admin** : admin@university.com / admin123
- **Enseignant** : teacher@university.com / teacher123
- **Étudiant** : student@university.com / student123

## 🌐 Déploiement sur Vercel

### 1. Préparer MongoDB Atlas

1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créer un cluster gratuit
3. Créer un utilisateur de base de données
4. Obtenir l'URI de connexion
5. Whitelist l'IP `0.0.0.0/0` (ou IP spécifique)

### 2. Déployer sur Vercel

1. Pousser le code sur GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <votre-repo-url>
git push -u origin main
```

2. Aller sur [Vercel](https://vercel.com)
3. Importer votre repository
4. Configurer les variables d'environnement :
   - `MONGODB_URI`: Votre URI MongoDB Atlas
   - `NEXTAUTH_URL`: https://votre-domaine.vercel.app
   - `NEXTAUTH_SECRET`: Généré avec `openssl rand -base64 32`

5. Déployer !

## 🛠️ Technologies Utilisées

- **Frontend** : Next.js 15 (App Router), React, TypeScript
- **Styling** : Tailwind CSS
- **Backend** : Next.js API Routes
- **Base de données** : MongoDB avec Mongoose
- **Authentification** : NextAuth.js avec JWT
- **Graphiques** : Recharts
- **Icônes** : Lucide React

## 📝 Scripts Disponibles

```bash
npm run dev      # Lancer le serveur de développement
npm run build    # Créer le build de production
npm start        # Lancer le serveur de production
npm run lint     # Vérifier le code avec ESLint
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 📧 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue !

---

Fait avec ❤️ avec Next.js et MongoDB
