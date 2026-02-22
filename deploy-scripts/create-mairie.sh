#!/bin/bash

# Script de création d'une nouvelle mairie
# Usage: ./deploy-scripts/create-mairie.sh --name "Nom Mairie" --domain "nom.ci" --email "admin@nom.ci"

set -e

# Couleurs pour le output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Paramètres par défaut
MAIRIE_NAME="Mairie Exemple"
DOMAIN="mairie-exemple.ci"
SUBDOMAIN="mairie-exemple"
ADMIN_EMAIL="admin@mairie-exemple.ci"
ADMIN_PASSWORD=$(openssl rand -base64 12)
DB_PASSWORD=$(openssl rand -base64 16)
JWT_SECRET=$(openssl rand -base64 32)

# Parser les arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --name)
      MAIRIE_NAME="$2"
      shift 2
      ;;
    --domain)
      DOMAIN="$2"
      SUBDOMAIN="${DOMAIN%.ci}"
      shift 2
      ;;
    --email)
      ADMIN_EMAIL="$2"
      shift 2
      ;;
    *)
      echo "Option inconnue: $1"
      exit 1
      ;;
  esac
done

echo -e "${YELLOW}🚀 Création d'une nouvelle instance mairie${NC}"
echo "=================================================="
echo -e "Mairie: ${GREEN}${MAIRIE_NAME}${NC}"
echo -e "Domain: ${GREEN}${DOMAIN}${NC}"
echo -e "Email admin: ${GREEN}${ADMIN_EMAIL}${NC}"
echo "=================================================="

# Créer le répertoire de la mairie
MAIRIE_DIR="./instances/${SUBDOMAIN}"
if [ -d "$MAIRIE_DIR" ]; then
  echo -e "${RED}❌ Instance pour ${DOMAIN} existe déjà!${NC}"
  exit 1
fi

echo -e "${YELLOW}📁 Création du répertoire...${NC}"
mkdir -p "$MAIRIE_DIR"

# Copier le template
echo -e "${YELLOW}📋 Copie du template...${NC}"
cp -r mairie-instance/* "$MAIRIE_DIR/"
cd "$MAIRIE_DIR"

# Créer le fichier .env
echo -e "${YELLOW}⚙️ Configuration des variables...${NC}"
cat > .env << EOL
# Mairie Configuration
MAIRIE_NAME="${MAIRIE_NAME}"
DOMAIN="${DOMAIN}"
SUBDOMAIN="${SUBDOMAIN}"
MAIRIE_ID="${SUBDOMAIN}"

# Database
DB_USER=mairie_${SUBDOMAIN}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=mairie_${SUBDOMAIN}

# Environment
NODE_ENV=production
PORT=3000

# JWT
JWT_SECRET=${JWT_SECRET}

# URLs
FRONTEND_URL=https://${DOMAIN}
BACKOFFICE_URL=https://admin.${DOMAIN}
FRONTEND_API_URL=https://api.${DOMAIN}/api
BACKOFFICE_API_URL=https://api.${DOMAIN}/api

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe
EMAIL_FROM=noreply@${DOMAIN}

# Autre
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
EOL

# Créer le fichier docker-compose
echo -e "${YELLOW}🐳 Configuration Docker...${NC}"
sed -i "s|mairie_postgres|mairie_${SUBDOMAIN}_postgres|g" docker-compose.yml
sed -i "s|mairie_backend|mairie_${SUBDOMAIN}_backend|g" docker-compose.yml
sed -i "s|mairie_frontend|mairie_${SUBDOMAIN}_frontend|g" docker-compose.yml
sed -i "s|mairie_backoffice|mairie_${SUBDOMAIN}_backoffice|g" docker-compose.yml
sed -i "s|mairie_mailhog|mairie_${SUBDOMAIN}_mailhog|g" docker-compose.yml

# Initialiser npm
echo -e "${YELLOW}📦 Installation des dépendances...${NC}"
npm install --prefix backend > /dev/null 2>&1 || echo "Backend npm install en arrière-plan"
npm install --prefix frontend > /dev/null 2>&1 || echo "Frontend npm install en arrière-plan"
npm install --prefix backoffice > /dev/null 2>&1 || echo "Backoffice npm install en arrière-plan"

# Lancer les conteneurs
echo -e "${YELLOW}🚀 Démarrage des conteneurs Docker...${NC}"
docker-compose up -d

echo -e "${GREEN}✅ Instance créée avec succès!${NC}"
echo ""
echo -e "${YELLOW}📝 Informations d'accès:${NC}"
echo "=================================================="
echo -e "Site vitrine    : ${GREEN}https://${DOMAIN}${NC}"
echo -e "Backoffice Admin : ${GREEN}https://admin.${DOMAIN}${NC}"
echo -e "Email admin      : ${GREEN}${ADMIN_EMAIL}${NC}"
echo -e "Mot de passe     : ${GREEN}${ADMIN_PASSWORD}${NC}"
echo "=================================================="
echo ""
echo -e "${YELLOW}⚠️ À faire:${NC}"
echo "1. Configurer les DNS pour ${DOMAIN}"
echo "2. Configurer Let's Encrypt SSL"
echo "3. Configurer l'SMTP (email)"
echo "4. Modifier le mot de passe admin à la première connexion"
echo ""
echo -e "${YELLOW}📊 Logs:${NC}"
echo "docker-compose logs -f"
