# 🏗️ Architecture Détaillée

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                    LANDING PAGE & ONBOARDING                │
│                   (Inscription des mairies)                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                  INSTANCE MAIRIE INDÉPENDANTE                    │
├────────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │
│  │  FRONTEND NEXT  │  │ BACKOFFICE REACT│  │  EXPRESS API  │  │
│  │   (Vitrine)     │  │   (Dashboard)    │  │              │  │
│  │  :3000 (public) │  │  :3001 (admin)   │  │  :3002 (API) │  │
│  └─────────────────┘  └─────────────────┘  └──────────────┘  │
│          ↓                    ↓                    ↑           │
│  ┌───────────────────────────────────────────────┐           │
│  │          POSTGRESQL (BD Indépendante)         │           │
│  │         mairie_adjame, mairie_yamoussoukro    │           │
│  └───────────────────────────────────────────────┘           │
│                                                               │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📦 Composants

### 1. Landing Page (Publique)
- **Framework**: Next.js
- **Port**: 3000
- **Rôle**: 
  - Présenter la plateforme
  - Inscription des mairies
  - Redirection vers instance mairie

### 2. Frontend Vitrine (Publique)
- **Framework**: Next.js 14
- **Port**: 3001
- **Pages**:
  - Accueil (héro section + services + articles + événements)
  - Articles/Actualités
  - Services
  - Événements/Agenda
  - Galerie photos
  - Contact
  - Demande d'audience (formulaire)
- **Données**: 
  - Appelent l'API Express via `x-mairie-id` header
  - Pas d'authentification requise

### 3. Backoffice Admin (Protégé)
- **Framework**: React 18 + React Router
- **Port**: 3002
- **Authentification**: JWT
- **Pages**:
  - Dashboard (stats + audiences urgentes + contenu récent)
  - Audiences (lister + gérer + priorités)
  - Articles (CRUD)
  - Services (CRUD)
  - Événements (CRUD)
  - Galerie photos (albums + upload)
  - Configuration (infos mairie + branding + réseaux sociaux)
  - Utilisateurs (admin/assistante) - Admin seulement
  - Analytics (graphiques + statistiques)
- **Permissions**: Role-based (ADMIN, ASSISTANTE, MAIRE)

### 4. Backend API (Express.js)
- **Framework**: Express + Prisma ORM
- **Port**: 3000
- **BD**: PostgreSQL (une par mairie)
- **Authentification**: JWT Bearer token
- **Fonctionnalités**:
  - CRUD complet pour tout le contenu
  - Gestion audiences (citoyen + admin/assistante)
  - Configuration mairie
  - Analytics tracking
  - Email notifications
  - Sécurité (validation + sanitization)

### 5. Base de Données (PostgreSQL)
- **Structure**: Une BD par mairie
- **Isolation**: Complète
- **Replication**: Possible
- **Backup**: Quotidien recommandé

---

## 🔀 Flux de Données

### 1. Demande d'Audience (Public → API)

```
Citoyen remplit formulaire (Frontend)
         ↓
POST /api/audiences/submit + header x-mairie-id
         ↓
Backend valide + crée enregistrement
         ↓
Email confirmation au citoyen
         ↓
Email notification à l'assistante
```

### 2. Gestion Audience (Assistante)

```
Login backoffice (JWT)
         ↓
GET /api/audiences (liste filtrée)
         ↓
PUT /api/audiences/:id (change status)
         ↓
Email notification au citoyen
         ↓
Tracking analytics
```

### 3. Modification Contenu (Admin)

```
Login backoffice (JWT)
         ↓
POST/PUT /api/articles (nouveau article)
         ↓
Frontend récupère via GET /api/articles
         ↓
Affichage en temps réel
```

---

## 🔐 Authentification & Autorisations

### JWT Token Structure

```json
{
  "id": "uuid",
  "email": "admin@mairie.ci",
  "role": "ADMIN|ASSISTANTE|MAIRE",
  "mairieId": "uuid",
  "mairieeName": "Mairie Adjamé",
  "iat": 1234567890,
  "exp": 1234654290
}
```

### Rôles & Permissions

| Rôle | Audiences | Contenu | Config | Users | Analytics |
|------|-----------|---------|--------|-------|-----------|
| ADMIN | Voir+Gérer | Voir+Edit | Edit | Gérer | Voir |
| ASSISTANTE | Voir+Gérer | - | - | - | - |
| MAIRE | Voir | Voir | - | - | Voir |

---

## 📊 Schéma Base de Données

```
MAIRIE (racine)
├── Infos générales (nom, logo, couleurs, etc)
├── Utilisateurs (admin, assistante, maire)
├── Articles
├── Services
├── Événements
├── Albums Photos
├── Audiences (demandes)
├── Créneaux (horaires disponibles)
├── Réseaux sociaux
├── Page views (analytics)
└── Statistiques pré-calculées
```

---

## 🔄 Multi-Tenant Architecture

### Isolation des données

```
Header: x-mairie-id=uuid-mairie-1
         ↓
Backend cherche mairieId dans contexte
         ↓
Filtre toutes les requêtes par mairieId
         ↓
Réponse contient UNIQUEMENT les données de cette mairie
```

### Sécurité

- ✅ Une BD par mairie (meilleure isolation)
- ✅ JWT token inclut mairieId
- ✅ Backend valide mairieId sur chaque requête
- ✅ Pas de fuite de données cross-tenant
- ✅ CORS configuré par domaine

---

## 📧 Système d'Email

### Templates disponibles

1. **audience-submitted** (Citoyen)
   - Confirmation réception demande
   - Numéro de suivi

2. **audience-confirmed** (Citoyen)
   - Date/heure confirmée
   - Informations mairie

3. **audience-refused** (Citoyen)
   - Motif refus
   - Contact pour recours

4. **new-audience-notification** (Assistante)
   - Nouvelle demande en attente
   - Infos citoyen
   - Lien backoffice

5. **user-invitation** (Nouvel utilisateur)
   - Identifiants temporaires
   - Lien accès backoffice

### Service SMTP

```javascript
Configuration:
- SMTP_HOST: gmail, sendgrid, ou custom
- SMTP_PORT: 587 (TLS) ou 465 (SSL)
- EMAIL_FROM: noreply@mairie.ci

Development:
- MailHog sur localhost:1025
- Web UI: localhost:8025
```

---

## 📈 Analytics

### Tracking

- Page views (quelle page, quand, depuis où)
- Article views (comptage automatique)
- Service clicks (optionnel)
- Device type (mobile/desktop)

### Rapports

- Tendance audiences (derniers 12 mois)
- Stats audiences (par mois/année)
- Pages populaires
- Articles les plus lus
- Statistiques d'engagement

---

## 🚀 Performance

### Frontend
- Next.js SSG/SSR pour performance
- Images optimisées (Next Image)
- CSS Tailwind (minified)
- Lazy loading
- Caching headers

### Backend
- Connection pooling PostgreSQL
- Query optimization (indexes)
- Rate limiting
- Caching responses
- Compression gzip

---

## 🔧 DevOps

### Docker Compose Services

```yaml
- postgres (BD)
- backend (API Express)
- frontend (Next.js vitrine)
- backoffice (React dashboard)
- mailhog (SMTP dev)
```

### Déploiement Automatisé

```bash
./deploy-scripts/create-mairie.sh \
  --name "Mairie Adjamé" \
  --domain "adjame.ci" \
  --email "admin@adjame.ci"
```

Effectue:
- Création BD PostgreSQL
- Clone template
- Configuration .env
- Lancement conteneurs Docker
- SSL auto (optionnel)

---

## 📝 Logging & Monitoring

### Logs Structure
```
timestamp | level | component | message | context
2024-02-21 10:30:45 | INFO | audiences | submitAudience | mairieId=uuid
2024-02-21 10:31:02 | ERROR | auth | loginFailed | email=test@test.ci
```

### Outils recommandés
- **ELK Stack** (Elasticsearch + Logstash + Kibana)
- **Datadog** (Cloud monitoring)
- **Sentry** (Error tracking)

---

## 🔐 Sécurité en Couches

```
┌─────────────────────────────────────┐
│ 1. HTTPS/SSL (Nginx reverse proxy)  │
├─────────────────────────────────────┤
│ 2. CORS (configuration par domaine) │
├─────────────────────────────────────┤
│ 3. Rate Limiting (brute force)      │
├─────────────────────────────────────┤
│ 4. JWT Authentication (sessions)    │
├─────────────────────────────────────┤
│ 5. Input Validation (express-valid) │
├─────────────────────────────────────┤
│ 6. SQL Injection Prevention (Prisma)│
├─────────────────────────────────────┤
│ 7. XSS Prevention (sanitization)    │
├─────────────────────────────────────┤
│ 8. CSRF Protection (tokens)         │
├─────────────────────────────────────┤
│ 9. Password Hashing (bcrypt)        │
├─────────────────────────────────────┤
│ 10. Database Encryption (TLS)       │
└─────────────────────────────────────┘
```

---

**Version**: 1.0.0  
**Dernière mise à jour**: Février 2026
