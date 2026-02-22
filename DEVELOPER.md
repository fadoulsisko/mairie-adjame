# 👨‍💻 Guide pour Développeurs

## 🔧 Setup Développement

### Installation initiale

```bash
# 1. Cloner et installation
git clone <repo> mairie-platform
cd mairie-platform

# 2. Installer les dépendances
npm install

# 3. Configuration environnement
cp mairie-instance/.env.example mairie-instance/.env

# 4. Démarrer tous les services
npm run dev

# Ou avec Docker
cd mairie-instance
docker-compose up -d
```

### Ports en développement
- Frontend vitrine: http://localhost:3001
- Backoffice: http://localhost:3002
- Backend API: http://localhost:3000
- MailHog: http://localhost:8025 (voir emails de test)

---

## 📁 Structure du code

### Backend (Express)

```
backend/
├── src/
│   ├── index.js                 # Fichier principal
│   ├── controllers/             # Logique métier
│   │   ├── auth.js
│   │   ├── articles.js
│   │   ├── services.js
│   │   ├── evenements.js
│   │   ├── galerie.js
│   │   ├── audiences.js
│   │   ├── analytics.js
│   │   └── config.js
│   ├── services/                # Services réutilisables
│   │   └── email.js
│   ├── middleware/              # Middlewares Express
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── routes/                  # Routes API
│   │   ├── auth.js
│   │   ├── articles.js
│   │   ├── services.js
│   │   ├── audiences.js
│   │   └── analytics.js
│   └── utils/                   # Utilitaires
├── prisma/
│   ├── schema.prisma            # Schéma BD
│   ├── migrations/              # Migrations
│   └── seed.js                  # Données initiales
├── package.json
├── .env.example
└── Dockerfile
```

### Frontend (Next.js)

```
frontend/
├── app/
│   ├── layout.jsx               # Layout principal
│   ├── page.jsx                 # Accueil
│   ├── globals.css
│   ├── articles/
│   │   ├── page.jsx             # Liste articles
│   │   └── [slug]/page.jsx      # Article détail
│   ├── services/
│   ├── evenements/
│   ├── galerie/
│   ├── contact/
│   ├── audiences/
│   │   └── demander/page.jsx    # Formulaire demande
│   └── api/                     # Route API côté client
├── components/                  # Composants réutilisables
├── public/
├── package.json
├── next.config.js
├── .env.example
└── Dockerfile
```

### Backoffice (React)

```
backoffice/
├── src/
│   ├── index.js
│   ├── App.jsx                  # Routing principal
│   ├── index.css
│   ├── App.css
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Audiences.jsx        # Gestion audiences
│   │   ├── Articles.jsx
│   │   ├── Services.jsx
│   │   ├── Evenements.jsx
│   │   ├── Galerie.jsx
│   │   ├── Config.jsx
│   │   ├── Users.jsx
│   │   └── Analytics.jsx
│   ├── components/              # Composants réutilisables
│   └── hooks/
├── public/
├── package.json
└── Dockerfile
```

---

## 🚀 Développer une nouvelle feature

### Exemple: Ajouter un champ "description" aux services

#### 1. Migration BD (Backend)

```bash
cd backend
npx prisma migrate dev --name add_service_description
```

Modifie `prisma/schema.prisma`:
```prisma
model Service {
  // ...
  description  String   // Rich text
  shortDesc    String?  // Nouveau champ
  // ...
}
```

#### 2. Contrôleur (Backend)

Dans `src/controllers/services.js`:
```javascript
exports.createService = async (req, res) => {
  const { nom, description, shortDesc } = req.body;
  // ...
  const service = await prisma.service.create({
    data: {
      nom,
      description,
      shortDesc,  // Nouveau
      mairieId,
    }
  });
  // ...
};
```

#### 3. Routes (Backend)

Déjà existantes dans `src/routes/` et `src/index.js`.

#### 4. Frontend (Next.js)

Dans `app/services/page.jsx`:
```javascript
{services.map(service => (
  <div key={service.id}>
    <h3>{service.nom}</h3>
    {service.shortDesc && <p>{service.shortDesc}</p>}
  </div>
))}
```

#### 5. Backoffice (React)

Dans `src/pages/Services.jsx`:
```javascript
<input
  type="text"
  name="shortDesc"
  placeholder="Description courte"
/>
```

---

## 🧪 Testing

### Tester l'API

```bash
# Avec curl
curl -X POST http://localhost:3000/api/articles \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titre":"Test","contenu":"Test"}'

# Avec Postman/Insomnia
Import the API collection from /docs/api.postman_collection.json
```

### Tester avec Jest (optionnel)

```bash
cd backend
npm install --save-dev jest supertest

# Créer tests dans __tests__/
npm test
```

---

## 🐛 Debugging

### Backend

```javascript
// Ajouter des logs
console.log('🔍 Debug:', variable);

// Utiliser le debugger Node
node --inspect src/index.js

// Ou debug dans VSCode
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/index.js"
    }
  ]
}
```

### Frontend

```bash
# Chrome DevTools
# Open http://localhost:3001
# F12 pour DevTools

# React DevTools extension
# React Profiler dans DevTools
```

### Base de données

```bash
# Studio Prisma
npm run prisma:studio

# Ouvre http://localhost:5555 avec interface graphique

# Ou psql directement
docker-compose exec postgres psql -U mairie_user -d mairie_db
```

---

## 📝 Conventions de Code

### Naming

```javascript
// Variables
const userEmail = 'test@test.com';
const isActive = true;
const MAX_ITEMS = 100;

// Fonctions
function getUserById(id) { }
const fetchArticles = async () => { }

// React components
function UserCard({ user }) { }
export default function Dashboard() { }
```

### Structure API

```javascript
// Succès
res.json({ data: {...} });
res.status(201).json(newItem);

// Erreurs
res.status(400).json({ error: 'Message d\'erreur' });
res.status(401).json({ error: 'Non authentifié' });
res.status(404).json({ error: 'Ressource non trouvée' });
```

### Commentaires

```javascript
// ============================================
// SECTION PRINCIPALE
// ============================================

// Commentaire sur une action spécifique
const userId = req.user.id;

// ❌ Mauvais
// const userId = req.user.id; // Gets the user ID
```

---

## 🔄 Workflow Git

```bash
# 1. Créer une branche
git checkout -b feature/audiences-management

# 2. Committer régulièrement
git add .
git commit -m "feat: improve audience status updates"

# 3. Push et créer une MR
git push origin feature/audiences-management

# 4. Après review, merger
git checkout main
git merge feature/audiences-management
```

### Convention des commits

```
feat:   nouvelle fonctionnalité
fix:    correction d'un bug
docs:   changements documentation
style:  changements de style (pas de logique)
refactor: refactorisation de code
test:   ajout de tests
chore:  maintenance, dépendances
```

---

## 🚨 Erreurs Courantes

### "Cannot find module"

```bash
cd backend (ou frontend/backoffice)
npm install
npm update
```

### Port déjà utilisé

```bash
# Trouver le PID
lsof -i :3000

# Tuer le processus
kill -9 <PID>
```

### Erreur BD "connection refused"

```bash
# Vérifier que Docker est lancé
docker ps

# Vérifier la connexion BD
docker-compose logs postgres

# Réinitialiser
docker-compose down -v
docker-compose up -d
```

### Token JWT invalide

```javascript
// S'assurer que le token est envoyé correctement
Authorization: Bearer eyJhbGciOiJIUzI1NiI...

// Le token expire après 24h, refresh si nécessaire
POST /api/auth/refresh-token
```

---

## 📚 Ressources Utiles

- [Express.js Docs](https://expressjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [PostgreSQL](https://www.postgresql.org/docs)

---

## ❓ Questions Fréquentes

**Q: Comment ajouter un nouvel endpoint API?**
A: 
1. Créer le contrôleur dans `src/controllers/`
2. Ajouter la route dans `src/routes/`
3. Importer la route dans `src/index.js`

**Q: Comment modifier le branding (logo, couleurs)?**
A: Aller dans la page Configuration du backoffice

**Q: Comment tester l'envoi d'email?**
A: Accéder à MailHog sur http://localhost:8025

**Q: Comment sauvegarder une mairie?**
A: `docker-compose exec postgres pg_dump -U user db > backup.sql`

---

**Version**: 1.0.0  
**Dernière mise à jour**: Février 2026
