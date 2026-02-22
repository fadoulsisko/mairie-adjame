// src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('❌ Erreur:', err);

  // Erreurs Prisma
  if (err.code === 'P2002') {
    return res.status(400).json({ 
      error: 'Cet élément existe déjà' 
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ 
      error: 'Élément non trouvé' 
    });
  }

  // Erreurs de validation
  if (err.status === 400) {
    return res.status(400).json({ 
      error: err.message || 'Données invalides' 
    });
  }

  // Erreurs d'authentification
  if (err.status === 401) {
    return res.status(401).json({ 
      error: 'Non authentifié' 
    });
  }

  // Erreurs d'autorisation
  if (err.status === 403) {
    return res.status(403).json({ 
      error: 'Accès refusé' 
    });
  }

  // Erreur serveur par défaut
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Erreur serveur interne' 
      : err.message 
  });
};

module.exports = { errorHandler };
