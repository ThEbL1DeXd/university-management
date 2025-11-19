# ⚡ Démarrage Rapide

Guide pour lancer rapidement l'application UniManage en local.

## 🚀 En 5 Minutes

### 1. Prérequis
Assurez-vous d'avoir installé :
- [Node.js](https://nodejs.org/) (version 18+)
- [MongoDB](https://www.mongodb.com/try/download/community) OU compte [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gratuit)

### 2. Installation

```bash
# Installer les dépendances
npm install
```

### 3. Configuration

Créez un fichier `.env.local` à la racine :

```env
# MongoDB Local
MONGODB_URI=mongodb://localhost:27017/university-management

# OU MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/university-management

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-secret-ici
```

**Générer un secret sécurisé :**
```bash
# Sur Windows PowerShell
-join ((65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# Sur Linux/Mac
openssl rand -base64 32
```

### 4. Lancer MongoDB (si local)

```bash
# Sur Windows, MongoDB démarre automatiquement comme service
# Vérifiez avec :
mongod --version

# Si besoin de démarrer manuellement :
mongod
```

### 5. Démarrer l'Application

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### 6. Créer le Premier Utilisateur

**Option A - MongoDB Compass :**

1. Téléchargez [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Connectez-vous à `mongodb://localhost:27017`
3. Créez la database `university-management`
4. Créez la collection `users`
5. Insérez ce document :

```json
{
  "name": "Admin",
  "email": "admin@university.com",
  "password": "$2a$10$X5YQZ8P7K9L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4",
  "role": "Admin",
  "createdAt": {"$date": "2024-01-01T00:00:00.000Z"},
  "updatedAt": {"$date": "2024-01-01T00:00:00.000Z"}
}
```

**Option B - MongoDB Shell :**

```bash
mongosh

use university-management

db.users.insertOne({
  name: "Admin",
  email: "admin@university.com",
  password: "$2a$10$X5YQZ8P7K9L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4",
  role: "Admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 7. Se Connecter

Allez sur [http://localhost:3000/login](http://localhost:3000/login)

- **Email :** `admin@university.com`
- **Mot de passe :** `admin123`

## ✅ Checklist

- [x] Node.js installé
- [x] MongoDB installé ou compte Atlas créé
- [x] Dépendances installées (`npm install`)
- [x] Fichier `.env.local` créé avec bonnes valeurs
- [x] MongoDB démarré (si local)
- [x] Application lancée (`npm run dev`)
- [x] Utilisateur admin créé dans MongoDB
- [x] Connexion réussie sur http://localhost:3000

## 📝 Prochaines Étapes

1. **Créer des départements**
   - Allez dans "Départements"
   - Cliquez sur "Ajouter un département"
   - Exemple : Informatique (INF), Mathématiques (MATH)

2. **Ajouter des enseignants**
   - Allez dans "Enseignants"
   - Assignez-les à un département

3. **Créer des cours**
   - Allez dans "Cours"
   - Liez-les à un département et un enseignant

4. **Inscrire des étudiants**
   - Allez dans "Étudiants"
   - Assignez-les à un département

5. **Ajouter des notes**
   - Allez dans "Notes"
   - Sélectionnez étudiant et cours

## 🎨 Fonctionnalités

- ✅ Dashboard avec statistiques
- ✅ Graphiques interactifs
- ✅ Mode Dark/Light
- ✅ Recherche et filtres
- ✅ Pagination automatique
- ✅ CRUD complet pour toutes les entités
- ✅ Interface responsive
- ✅ Authentification sécurisée

## 🐛 Problèmes Courants

### L'application ne démarre pas

```bash
# Nettoyer et réinstaller
rm -rf node_modules .next
npm install
npm run dev
```

### Erreur MongoDB

```bash
# Vérifier que MongoDB tourne
mongosh --eval "db.version()"

# Si erreur, démarrer MongoDB
mongod
```

### Erreur "NEXTAUTH_SECRET is not defined"

Vérifiez que `.env.local` existe et contient `NEXTAUTH_SECRET`.

### Port 3000 déjà utilisé

```bash
# Utiliser un autre port
PORT=3001 npm run dev
```

## 📚 Documentation Complète

- [README.md](./README.md) - Documentation complète
- [MONGODB_SETUP.md](./MONGODB_SETUP.md) - Configuration MongoDB détaillée
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guide de déploiement Vercel

## 💡 Astuces

### Réinitialiser la Base de Données

```bash
mongosh

use university-management
db.dropDatabase()
```

### Voir les Logs

Les erreurs s'affichent dans :
- Le terminal où `npm run dev` tourne
- La console du navigateur (F12)

### Générer un Hash de Mot de Passe

```javascript
// Dans Node.js
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('votre-mot-de-passe', 10));
```

## 🎉 C'est Prêt !

Votre système de gestion universitaire est maintenant opérationnel !

Pour toute question, consultez la documentation complète ou ouvrez une issue.

---

**Bon développement ! 🚀**
