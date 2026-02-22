# 🏛️ Mairie Platform - Système de Gestion Complet

Plateforme complète pour gérer un site de mairie avec module de demande d'audience, backoffice d'administration, galerie photos, événements, services et analytics.

## 📋 Table des matières
- [Architecture](#architecture)
- [Installation](#installation)
- [Déploiement](#déploiement)
- [Structure du Projet](#structure-du-projet)
- [Documentation API](#documentation-api)

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│    Landing Page + Inscription    │
└─────────────────────────────────┘
            ↓
┌─────────────────────────────────┐
│   Instance Mairie Indépendante   │
├──────────────┬──────────────┬────┤
│  Frontend    │  Backoffice  │API │
│  Vitrine     │  Admin       │    │
└──────────────┴──────────────┴────┘
            ↓
┌─────────────────────────────────┐
│  Base de Données (PostgreSQL)    │
└─────────────────────────────────┘
```

## 🚀 Installation

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose
- npm ou yarn

### Installation Locale

```bash
# 1. Cloner le projet
git clone <repo> mairie-platform
cd mairie-platform

# 2. Installation globale (landing + onboarding)
cd landing
npm install
cd ../onboarding-api
npm install
cd ..

# 3. Installation mairie template
cd mairie-instance
npm install --prefix backend
npm install --prefix frontend
npm install --prefix backoffice
cd ..

# 4. Configuration environnement
cp landing/.env.example landing/.env.local
cp onboarding-api/.env.example onboarding-api/.env
cp mairie-instance/backend/.env.example mairie-instance/backend/.env
cp mairie-instance/frontend/.env.example mairie-instance/frontend/.env.local
cp mairie-instance/backoffice/.env.example mairie-instance/backoffice/.env.local

# 5. Initialiser les bases de données
cd onboarding-api
npm run migrate:init
cd ../mairie-instance/backend
npm run migrate:template
cd ../../..

# 6. Lancer en développement
npm run dev
```

## 🐳 Déploiement avec Docker

### Déployer une nouvelle mairie

```bash
# Script automatisé
./deploy-scripts/create-mairie.sh \
  --name "Mairie Adjamé" \
  --domain "adjame-mairie.ci" \
  --admin-email "admin@adjame-mairie.ci"

# Ou manuellement
cd deploy-scripts
bash create-mairie.sh
```

### Accès après déploiement

```
Site vitrine    : https://adjame-mairie.ci
Backoffice Admin : https://adjame-mairie.ci/admin
API             : https://api.adjame-mairie.ci/api
```

## 📁 Structure du Projet

```
mairie-platform/
├── landing/                      # Landing page + inscription
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── pages/
│   ├── public/
│   └── package.json
│
├── onboarding-api/              # Service création mairies
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   └── middleware/
│   └── package.json
│
├── mairie-instance/             # Template pour chaque mairie
│   ├── backend/                 # Express API
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   └── middleware/
│   │   ├── prisma/
│   │   └── package.json
│   │
│   ├── frontend/                # Next.js vitrine publique
│   │   ├── app/
│   │   ├── components/
│   │   ├── public/
│   │   └── package.json
│   │
│   ├── backoffice/              # React admin dashboard
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── hooks/
│   │   └── package.json
│   │
│   ├── docker-compose.yml
│   └── .env.example
│
├── deploy-scripts/              # Scripts déploiement
│   ├── create-mairie.sh
│   ├── backup-mairie.sh
│   └── update-mairie.sh
│
├── docker-compose.yml           # Orchestration globale
└── package.json                 # Scripts npm globaux
```

## 🔌 Documentation API

Voir `/onboarding-api/API.md` et `/mairie-instance/backend/API.md`

## 📚 Documentation Détaillée

- [Architecture Détaillée](./ARCHITECTURE.md)
- [Guide Configuration](./CONFIG.md)
- [Guide Déploiement](./DEPLOYMENT.md)
- [Guide Développeur](./DEVELOPER.md)

## 🔐 Sécurité

- ✅ JWT Authentication
- ✅ Bcrypt Password Hashing
- ✅ Input Validation & Sanitization
- ✅ CORS Configuration
- ✅ Rate Limiting
- ✅ HTTPS Obligatoire en Production
- ✅ SQL Injection Prevention (Prisma ORM)

## 📈 Features V1

### ✅ Fonctionnalités Incluses
- [x] Inscription mairies automatisée
- [x] Domaine personnalisé par mairie
- [x] BD indépendante par mairie
- [x] Site vitrine complet et modifiable
- [x] Module demande d'audience
- [x] Gestion audiences (admin/assistante)
- [x] Galerie photos par albums
- [x] Événements/agenda
- [x] Services de la mairie
- [x] Articles/actualités
- [x] Backoffice complet
- [x] Analytics/statistiques
- [x] Configuration personnalisée (logo, couleurs)
- [x] Gestion utilisateurs
- [x] Notifications email
- [x] Réseaux sociaux liens

## 🤝 Support

Pour les questions, consultez :
- Documentation complète : `/docs`
- Issues : GitHub Issues
- Email : support@mairie-platform.ci

## 📝 Licence

MIT License - Voir LICENSE.md

---

**Version 1.0** - Février 2026
