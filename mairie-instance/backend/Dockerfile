FROM node:18-alpine

WORKDIR /app

# Copier files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Build
RUN npm run build 2>/dev/null || true

# Copy source
COPY src ./src

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
