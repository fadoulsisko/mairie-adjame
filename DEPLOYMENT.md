# 📖 Guide d'Installation et Déploiement

## 🚀 Démarrage Rapide (Développement)

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (optionnel)
- npm ou yarn

### Installation locale

```bash
# 1. Cloner le projet
git clone <repository> mairie-platform
cd mairie-platform

# 2. Installer les dépendances
npm install

# 3. Configuration environnement
cp mairie-instance/.env.example mairie-instance/.env

# 4. Lancer en développement
npm run dev
```

**Accès:**
- Frontend vitrine: http://localhost:3001
- Backoffice: http://localhost:3002
- API: http://localhost:3000/api
- MailHog (emails): http://localhost:8025

---

## 🐳 Déploiement avec Docker

### Installation rapide (1 mairie)

```bash
cd mairie-instance
docker-compose up -d
```

Services lancés:
- PostgreSQL: port 5432
- Backend: port 3000
- Frontend: port 3001
- Backoffice: port 3002
- MailHog: port 8025

### Déployer une nouvelle mairie

```bash
./deploy-scripts/create-mairie.sh \
  --name "Mairie Adjamé" \
  --domain "adjame-mairie.ci" \
  --email "admin@adjame-mairie.ci"
```

Le script:
- Crée une BD PostgreSQL indépendante
- Clone le template
- Configure les variables d'environnement
- Lance les conteneurs Docker

---

## 🔐 Sécurité en Production

### Variables d'environnement à configurer

```env
# JWT
JWT_SECRET=votre_secret_tres_securise_min_32_caracteres

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# SMTP (email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_app

# URLs
FRONTEND_URL=https://mairie.ci
BACKOFFICE_URL=https://admin.mairie.ci
```

### SSL/HTTPS avec Let's Encrypt

```bash
# Installer Certbot
sudo apt-get install certbot python3-certbot-nginx

# Générer certificat
sudo certbot certonly --standalone -d mairie.ci -d admin.mairie.ci

# Renouvellement automatique
sudo certbot renew --quiet
```

### Nginx Configuration (exemple)

```nginx
upstream api {
  server localhost:3000;
}

upstream frontend {
  server localhost:3001;
}

upstream backoffice {
  server localhost:3002;
}

# Frontend
server {
  listen 443 ssl;
  server_name mairie.ci;
  
  ssl_certificate /etc/letsencrypt/live/mairie.ci/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/mairie.ci/privkey.pem;
  
  location / {
    proxy_pass http://frontend;
  }
}

# Backoffice
server {
  listen 443 ssl;
  server_name admin.mairie.ci;
  
  ssl_certificate /etc/letsencrypt/live/mairie.ci/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/mairie.ci/privkey.pem;
  
  location / {
    proxy_pass http://backoffice;
  }
}

# API
server {
  listen 443 ssl;
  server_name api.mairie.ci;
  
  ssl_certificate /etc/letsencrypt/live/mairie.ci/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/mairie.ci/privkey.pem;
  
  location / {
    proxy_pass http://api;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}

# Redirect HTTP to HTTPS
server {
  listen 80;
  server_name _;
  return 301 https://$host$request_uri;
}
```

---

## 📊 Structure des Bases de Données

### Une BD par mairie

```
mairie_adjame_db
├── mairies
├── users
├── articles
├── services
├── evenements
├── albums
├── photos
├── audiences
├── creneaux_audiences
├── social_media
├── page_views
├── audience_stats
└── audit_logs
```

---

## 🔧 Maintenance

### Sauvegardes

```bash
# Backup d'une base de données
docker-compose exec postgres pg_dump -U mairie_user mairie_db > backup.sql

# Restore
docker-compose exec -T postgres psql -U mairie_user mairie_db < backup.sql
```

### Logs

```bash
# Logs en temps réel
docker-compose logs -f

# Logs spécifiques
docker-compose logs backend
docker-compose logs postgres
```

### Mise à jour

```bash
# Mettre à jour une mairie
cd instances/subdomain
docker-compose pull
docker-compose up -d
docker-compose exec backend npm run migrate
```

---

## 📝 Première Configuration d'une Mairie

1. **Login au backoffice**
   - URL: https://admin.mairie.ci
   - Email: admin@mairie.ci
   - Mot de passe: (fourni lors de la création)

2. **Configuration générale**
   - Aller à Configuration
   - Ajouter logo, couleurs
   - Infos mairie (adresse, téléphone, email)
   - Horaires d'ouverture

3. **Réseaux sociaux**
   - Configuration > Réseaux sociaux
   - Ajouter les liens des pages officielles

4. **Créneaux audiences**
   - Configuration > Créneaux
   - Définir les horaires disponibles
   - Durée par audience

5. **Contenu initial**
   - Ajouter un article de bienvenue
   - Ajouter les services principaux
   - Ajouter un événement de test

---

## 🆘 Troubleshooting

### Port déjà utilisé

```bash
# Trouver le process utilisant le port
lsof -i :3000

# Libérer le port
kill -9 <PID>
```

### Erreur de connexion BD

```bash
# Vérifier la BD
docker-compose exec postgres psql -U mairie_user -l

# Réinitialiser la BD
docker-compose down -v
docker-compose up -d
docker-compose exec backend npm run migrate:reset
```

### Email non reçu

```bash
# Vérifier MailHog
# http://localhost:8025

# Ou configurer SMTP réel dans .env
```

---

## 📞 Support

Pour les questions:
1. Consulter la documentation: `/docs`
2. Vérifier les logs: `docker-compose logs`
3. Contacter: support@mairie-platform.ci

---

**Version**: 1.0.0  
**Dernière mise à jour**: Février 2026
