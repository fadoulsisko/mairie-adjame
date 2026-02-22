# 🚀 GUIDE DÉPLOIEMENT RENDER

Guide complet pour déployer **Mairie Platform** sur **Render** (2-5 minutes)

---

## 📋 Prérequis

1. **Compte GitHub** (ou GitLab/Bitbucket)
   - Créer repo: https://github.com/new
   - Cloner ce projet dedans

2. **Compte Render** (gratuit)
   - S'inscrire: https://render.com
   - Connecter GitHub

3. **Email SMTP** (optionnel pour dev, requis pour prod)
   - Gmail, SendGrid, ou autre service

---

## 🔧 ÉTAPE 1: Préparer le Repository Git

```bash
# Initialiser git
cd /home/claude/mairie-platform
git init
git add .
git commit -m "Initial commit: Mairie Platform V1.0"

# Ajouter remote (remplacer par votre repo)
git remote add origin https://github.com/votre-username/mairie-platform.git
git branch -M main
git push -u origin main
```

**Vérifier que tout est pusher:**
```
https://github.com/votre-username/mairie-platform
```

---

## 🌐 ÉTAPE 2: Créer les Services sur Render

### Option A: Déploiement Automatique (Recommandé)

**1. Render Blueprint (render.yaml)**
- Render lit `render.yaml` automatiquement
- Déploie tous les services en 1 clic
- Crée la BD PostgreSQL auto

```bash
# 1. Sur GitHub, pusher le code (déjà fait)
# 2. Aller sur https://dashboard.render.com
# 3. Cliquer "New +" → "Blueprint"
# 4. Sélectionner le repo
# 5. Cliquer "Deploy" ✓
```

Render va automatiquement:
- ✅ Créer BD PostgreSQL
- ✅ Déployer Backend
- ✅ Déployer Frontend
- ✅ Déployer Backoffice
- ✅ Configurer variables d'environnement

### Option B: Déploiement Manuel (Plus de contrôle)

Si render.yaml ne fonctionne pas, créer manuellement:

---

## 🗄️ ÉTAPE 3: Créer la Base de Données

**Sur Render Dashboard:**

1. Cliquer `New +` → `PostgreSQL`
2. Configuration:
   ```
   Name: mairie-db
   Database: mairie
   User: mairie_user
   Region: Frankfurt (EU)
   Plan: Free (pour test) ou Starter (production)
   ```
3. Cliquer `Create Database`

**Copier la connection string:**
```
postgresql://user:password@host:5432/mairie
```

Cette URL sera utilisée comme `DATABASE_URL`

---

## 🔌 ÉTAPE 4: Déployer le Backend

**Sur Render Dashboard:**

1. Cliquer `New +` → `Web Service`
2. Connecter le repo GitHub
3. Configuration:
   ```
   Name: mairie-backend
   Branch: main
   Runtime: Node
   Build Command: npm install && cd mairie-instance/backend && npm install && npx prisma migrate deploy
   Start Command: cd mairie-instance/backend && npm start
   Plan: Free (test) ou Starter (prod)
   Region: Frankfurt
   ```

4. **Environment Variables:**
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://...  (copier de PostgreSQL)
   JWT_SECRET=<généré auto>
   FRONTEND_URL=https://mairie-frontend.onrender.com
   BACKOFFICE_URL=https://mairie-backoffice.onrender.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=votre-email@gmail.com
   SMTP_PASS=votre-mot-de-passe-app
   EMAIL_FROM=noreply@mairie-platform.ci
   PORT=10000
   ```

5. Cliquer `Create Web Service`

**Attendre que la build soit complète** (~2-3 min)

**URL Backend:** `https://mairie-backend.onrender.com`

---

## 🎨 ÉTAPE 5: Déployer le Frontend (Next.js)

1. Cliquer `New +` → `Web Service`
2. Configuration:
   ```
   Name: mairie-frontend
   Branch: main
   Runtime: Node
   Build Command: cd mairie-instance/frontend && npm install && npm run build
   Start Command: cd mairie-instance/frontend && npm start
   Plan: Free/Starter
   Region: Frankfurt
   ```

3. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://mairie-backend.onrender.com/api
   NEXT_PUBLIC_MAIRIE_ID=default
   NODE_ENV=production
   ```

4. Cliquer `Create Web Service`

**URL Frontend:** `https://mairie-frontend.onrender.com`

---

## 💼 ÉTAPE 6: Déployer le Backoffice (React)

1. Cliquer `New +` → `Web Service`
2. Configuration:
   ```
   Name: mairie-backoffice
   Branch: main
   Runtime: Node
   Build Command: cd mairie-instance/backoffice && npm install && npm run build
   Start Command: cd mairie-instance/backoffice && npm start
   Plan: Free/Starter
   Region: Frankfurt
   ```

3. **Environment Variables:**
   ```
   REACT_APP_API_URL=https://mairie-backend.onrender.com/api
   NODE_ENV=production
   PORT=10000
   ```

4. Cliquer `Create Web Service`

**URL Backoffice:** `https://mairie-backoffice.onrender.com/admin`

---

## ✅ ÉTAPE 7: Vérifier la Déploiement

Après 5-10 minutes, tous les services doivent être `Live`:

- ✅ **Backend** (mairie-backend) - http://mairie-backend.onrender.com/health
- ✅ **Frontend** (mairie-frontend) - http://mairie-frontend.onrender.com
- ✅ **Backoffice** (mairie-backoffice) - http://mairie-backoffice.onrender.com
- ✅ **Database** (mairie-db) - Connectée

---

## 🔐 Identifiants Premiers Pas

**Admin Backoffice:**
- Email: `admin@mairie-exemple.local`
- Password: `admin123`

⚠️ **IMPORTANT:** Changer le mot de passe dès la première connexion!

---

## 🛠️ Configuration SMTP Finale

Pour que les emails fonctionnent en production:

### Avec Gmail:
```
1. Activer 2FA sur votre compte Google
2. Générer App Password: https://myaccount.google.com/apppasswords
3. Dans Render → Environment Variables:
   SMTP_USER=votre-email@gmail.com
   SMTP_PASS=mot-de-passe-app-généré
```

### Avec SendGrid:
```
1. Créer compte: https://sendgrid.com
2. Générer API Key
3. Dans Render:
   SMTP_HOST=smtp.sendgrid.net
   SMTP_USER=apikey
   SMTP_PASS=SG.xxxxx
```

---

## 📊 Monitoring & Logs

**Sur Render Dashboard:**

```
Services → [Service] → Logs
```

Voir les logs en temps réel:
```bash
# Logs Backend
Services → mairie-backend → Logs

# Logs Frontend
Services → mairie-frontend → Logs

# Logs Backoffice
Services → mairie-backoffice → Logs

# Erreurs DB
Databases → mairie-db → Logs
```

---

## 🔄 Mise à Jour du Code

**Après chaque modification:**

```bash
git add .
git commit -m "feat: description du changement"
git push origin main
```

Render va **automatiquement redéployer** (2-3 min)

---

## 💾 Sauvegarder la Base de Données

**Sur Render Dashboard:**

```
Databases → mairie-db → Backups
```

Sauvegardes automatiques quotidiennes (plan Starter+)

**Télécharger une sauvegarde:**
```bash
# Exporter depuis pgAdmin ou:
pg_dump postgresql://user:password@host:5432/mairie > backup.sql
```

---

## 💰 Coûts Render

| Service | Free | Starter |
|---------|------|---------|
| Web Service | Gratuit (pause après 15 min d'inactivité) | $7/mois |
| PostgreSQL | Gratuit (limité) | $15/mois |
| **Total V1** | **$0** | **$22/mois** |

**Recommandation:** Commencer en Free, passer à Starter pour production

---

## 🆘 Troubleshooting Render

### Build échoue
```
Logs → Chercher "error"
Vérifier package.json, Dockerfile, migration Prisma
```

### Service ne démarre pas
```
Vérifier DATABASE_URL est correcte
Vérifier environment variables
Vérifier npm start/npm run build
```

### Erreur 502 Bad Gateway
```
Vérifier logs
Redéployer: Services → Redeploy
```

### Base de données vide
```
Vérifier que migration s'est exécutée
Lancer manuellement: prisma migrate deploy
```

---

## 📝 Checklist Déploiement Production

- [ ] Code pusher sur GitHub
- [ ] Account Render créé
- [ ] render.yaml validé
- [ ] PostgreSQL créé
- [ ] Backend déployé et running
- [ ] Frontend déployé et running
- [ ] Backoffice déployé et running
- [ ] Login backoffice OK
- [ ] SMTP configuré pour emails
- [ ] Domaine personnalisé (optionnel)
- [ ] SSL/HTTPS auto (Render le fait)
- [ ] Backups configurées
- [ ] Monitoring activé

---

## 🌍 Ajouter un Domaine Personnalisé (Optionnel)

**Pour utiliser votre domaine au lieu de *.onrender.com:**

1. Acheter domaine: Namecheap, GoDaddy, Google Domains
2. Aller sur Render → Service → Settings → Custom Domain
3. Ajouter votre domaine
4. Mettre à jour les DNS records:
   ```
   CNAME: mairie → mairie-backend.onrender.com
   CNAME: admin → mairie-backoffice.onrender.com
   ```
5. Attendre propagation DNS (5-30 min)

---

## 📞 Support & Ressources

- **Render Documentation:** https://render.com/docs
- **Render Community:** https://render.com/community
- **Problèmes:** Contacter support@render.com

---

## 🎯 Prochaines Étapes

1. ✅ Tester en production sur Render
2. ⬜ Compléter les pages stubs du backoffice
3. ⬜ Ajouter tests unitaires
4. ⬜ Configurer monitoring/alerting
5. ⬜ Onboarder les vraies mairies

---

**Vous êtes prêt à deployer en production!** 🚀

Version: 1.0.0
Date: Février 2026
