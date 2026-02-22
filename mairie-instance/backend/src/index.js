// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

// Import routes
const authRoutes = require('./routes/auth');
const articlesRoutes = require('./routes/articles');
const servicesRoutes = require('./routes/services');
const evenementsRoutes = require('./routes/evenements');
const gallerieRoutes = require('./routes/galerie');
const audiencesRoutes = require('./routes/audiences');
const configRoutes = require('./routes/config');
const analyticsRoutes = require('./routes/analytics');
const usersRoutes = require('./routes/users');

// Import middleware
const { authenticateToken } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const prisma = new PrismaClient();

// ============================================
// MIDDLEWARE
// ============================================

// CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.BACKOFFICE_URL || 'http://localhost:3001',
  ],
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limiter à 100 requêtes par fenêtre
  message: 'Trop de requêtes, veuillez réessayer plus tard'
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});

app.use('/api/', limiter);
app.use('/api/auth/login', strictLimiter);
app.use('/api/auth/register', strictLimiter);

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    version: '1.0.0',
    timestamp: new Date().toISOString() 
  });
});

// ============================================
// ROUTES PUBLIQUES (sans authentification)
// ============================================

app.use('/api/auth', authRoutes);

// Routes publiques vitrine
app.get('/api/articles', require('./controllers/articles').getArticlesPublic);
app.get('/api/articles/:slug', require('./controllers/articles').getArticleBySlug);

app.get('/api/services', require('./controllers/services').getServicesPublic);
app.get('/api/services/:slug', require('./controllers/services').getServiceBySlug);

app.get('/api/evenements', require('./controllers/evenements').getEvenementPublic);
app.get('/api/evenements/:slug', require('./controllers/evenements').getEvenementBySlug);

app.get('/api/albums', require('./controllers/galerie').getAlbumsPublic);
app.get('/api/albums/:id/photos', require('./controllers/galerie').getPhotosPublic);

app.get('/api/config/public', require('./controllers/config').getConfigPublic);
app.get('/api/creneaux', require('./controllers/audiences').getCreneaux);

app.post('/api/audiences/submit', require('./controllers/audiences').submitAudience);
app.post('/api/contact', require('./controllers/contact').submitContactForm);

// ============================================
// ROUTES PROTÉGÉES (authentification requise)
// ============================================

app.use(authenticateToken);

// Articles (admin)
app.post('/api/articles', require('./controllers/articles').createArticle);
app.put('/api/articles/:id', require('./controllers/articles').updateArticle);
app.delete('/api/articles/:id', require('./controllers/articles').deleteArticle);
app.get('/api/articles-admin', require('./controllers/articles').getArticles);

// Services (admin)
app.post('/api/services', require('./controllers/services').createService);
app.put('/api/services/:id', require('./controllers/services').updateService);
app.delete('/api/services/:id', require('./controllers/services').deleteService);
app.get('/api/services-admin', require('./controllers/services').getServices);

// Événements (admin)
app.post('/api/evenements', require('./controllers/evenements').createEvenement);
app.put('/api/evenements/:id', require('./controllers/evenements').updateEvenement);
app.delete('/api/evenements/:id', require('./controllers/evenements').deleteEvenement);
app.get('/api/evenements-admin', require('./controllers/evenements').getEvenements);

// Galerie (admin)
app.post('/api/albums', require('./controllers/galerie').createAlbum);
app.put('/api/albums/:id', require('./controllers/galerie').updateAlbum);
app.delete('/api/albums/:id', require('./controllers/galerie').deleteAlbum);
app.post('/api/albums/:id/photos', require('./controllers/galerie').uploadPhotos);
app.delete('/api/photos/:id', require('./controllers/galerie').deletePhoto);

// Audiences (admin & assistante)
app.get('/api/audiences', require('./controllers/audiences').getAudiences);
app.get('/api/audiences/:id', require('./controllers/audiences').getAudienceById);
app.put('/api/audiences/:id', require('./controllers/audiences').updateAudience);
app.delete('/api/audiences/:id', require('./controllers/audiences').deleteAudience);
app.post('/api/creneaux', require('./controllers/audiences').createCreneau);
app.put('/api/creneaux/:id', require('./controllers/audiences').updateCreneau);
app.delete('/api/creneaux/:id', require('./controllers/audiences').deleteCreneau);

// Configuration (admin)
app.put('/api/config/general', require('./controllers/config').updateConfigGeneral);
app.put('/api/config/branding', require('./controllers/config').updateBranding);
app.post('/api/config/social-media', require('./controllers/config').addSocialMedia);
app.put('/api/config/social-media/:id', require('./controllers/config').updateSocialMedia);
app.delete('/api/config/social-media/:id', require('./controllers/config').deleteSocialMedia);

// Utilisateurs (admin)
app.use('/api/users', usersRoutes);

// Analytics (admin)
app.use('/api/analytics', analyticsRoutes);

// ============================================
// ERROR HANDLING
// ============================================

app.use(errorHandler);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⛔ Arrêt du serveur...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('✅ Serveur arrêté');
    process.exit(0);
  });
});

module.exports = app;
