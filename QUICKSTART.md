# ⚡ Quick Start - Démarrage Rapide

## 🟢 Démarrage en 2 minutes

### Option 1: Avec Docker (Recommandé)

```bash
# Aller au répertoire de l'instance
cd mairie-instance

# Lancer tous les services
docker-compose up -d

# Attendre 30-60 secondes pour l'initialisation

# Vérifier que tout fonctionne
docker-compose ps
docker-compose logs -f
```

**Accès immédiat:**
- Frontend: http://localhost:3001
- Backoffice: http://localhost:3002
- API: http://localhost:3000/api
- Emails: http://localhost:8025

### Option 2: Sans Docker (Développement local)

```bash
# 1. Prérequis
# - PostgreSQL doit tourner sur localhost:5432
# - Node.js 18+ doit être installé

# 2. Installation
npm install

# 3. Configuration
cp mairie-instance/.env.example mairie-instance/.env
# Éditer .env avec vos paramètres PostgreSQL

# 4. Démarrage
npm run dev

# Services lancés sur:
# - Backend: http://localhost:3000
# - Frontend: http://localhost:3001
# - Backoffice: http://localhost:3002
```

---

## 🔑 Premiers Pas

### 1. Login au Backoffice

- URL: http://localhost:3002
- Email: `admin@mairie-exemple.local`
- Password: `admin123`

### 2. Configuration Mairie

1. Aller à **Configuration**
2. Ajouter le logo et les couleurs
3. Remplir les infos générales (adresse, tél, email)
4. Ajouter les réseaux sociaux

### 3. Ajouter des Créneaux

1. Aller à **Configuration > Créneaux**
2. Ajouter les heures disponibles (ex: lun-ven 9h-17h)
3. Définir la durée par audience (ex: 30 min)

### 4. Ajouter du Contenu

**Articles:**
1. Cliquer sur **Articles**
2. **Nouveau article**
3. Remplir titre, contenu, publier

**Services:**
1. Cliquer sur **Services**
2. **Nouveau service**
3. Ajouter nom, description, catégorie

**Événements:**
1. Cliquer sur **Événements**
2. **Nouvel événement**
3. Ajouter date, lieu, description

### 5. Tester Demande Audience

1. Aller au frontend: http://localhost:3001
2. Cliquer "Demander une audience"
3. Remplir le formulaire
4. Vérifier la notification au backoffice

---

## 📊 Structure Données

### Base de Données de Test

Les données de test sont créées automatiquement:

```
Mairie: "Mairie Exemple"
Domain: mairie-exemple.local

Utilisateurs:
- Admin: admin@mairie-exemple.local / admin123
- Assistante: assistante@mairie-exemple.local / assistant123
```

### Accéder à la BD

```bash
# Avec Docker
docker-compose exec postgres psql -U mairie_user -d mairie_db

# Commandes utiles:
\dt                    # Lister les tables
SELECT * FROM mairie;  # Voir les mairies
\q                     # Quitter
```

---

## 🧪 Tester les APIs

### Avec cURL

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mairie-exemple.local","password":"admin123"}' \
  | jq '.token'

# 2. Utiliser le token (remplacer TOKEN par la valeur)
TOKEN="eyJhbGciOiJIUzI1NiI..."

curl -X GET http://localhost:3000/api/articles-admin \
  -H "Authorization: Bearer $TOKEN"

# 3. Créer un article
curl -X POST http://localhost:3000/api/articles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Bienvenue",
    "contenu": "Bienvenue sur notre mairie",
    "published": true
  }'
```

### Avec Postman

1. Importer la collection: `/docs/api.postman_collection.json`
2. Définir la variable `{{token}}` après login
3. Tester les endpoints

---

## 🆘 Dépannage Rapide

### Les services ne démarrent pas

```bash
# Vérifier les erreurs
docker-compose logs backend
docker-compose logs postgres

# Redémarrer
docker-compose restart

# Si ça persiste, réinitialiser
docker-compose down -v
docker-compose up -d
```

### Erreur "Port already in use"

```bash
# Tuer les processus
kill -9 $(lsof -t -i :3000)
kill -9 $(lsof -t -i :3001)
kill -9 $(lsof -t -i :3002)

# Ou utiliser un autre port dans .env
PORT=3003
```

### Erreur de connexion BD

```bash
# Vérifier que PostgreSQL tourne
docker-compose exec postgres pg_isready

# Vérifier les variables .env
cat .env | grep DATABASE_URL

# Réinitialiser la BD
docker-compose exec backend npm run migrate:reset
```

### Email pas reçu

```bash
# Vérifier MailHog
# Ouvrir http://localhost:8025

# Si besoin de configurer SMTP réel
# Éditer .env avec vos paramètres Gmail/Sendgrid
```

---

## 📱 Checkliste Première Utilisation

- [ ] Services démarrés sans erreur
- [ ] Login backoffice OK
- [ ] Logo et couleurs configurés
- [ ] Infos mairie complétées
- [ ] Réseaux sociaux ajoutés
- [ ] Créneaux audiences créés
- [ ] Article de test créé
- [ ] Service de test créé
- [ ] Événement de test créé
- [ ] Demande audience soumise et gérée

---

## 🎯 Prochaines Étapes

1. **Personnaliser davantage:**
   - Ajouter plus de contenu
   - Configurer les emails SMTP
   - Ajouter les utilisateurs réels

2. **Tester en profondeur:**
   - Demandes audiences
   - Notifications
   - Formulaires

3. **Préparer la production:**
   - Configurer les domaines réels
   - SSL/HTTPS
   - Backups
   - Monitoring

---

## 📞 Besoin d'aide?

- Consulter: `/docs/`
- Developer guide: `DEVELOPER.md`
- Deployment guide: `DEPLOYMENT.md`
- Architecture: `ARCHITECTURE.md`

---

**Prêt?** Lancez avec `docker-compose up -d` et bonne chance! 🚀
