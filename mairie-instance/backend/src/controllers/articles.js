// src/controllers/articles.js
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

// Utility function to create slug
const createSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

// GET - Articles publics
exports.getArticlesPublic = async (req, res) => {
  try {
    const mairieId = req.headers['x-mairie-id'];
    
    const articles = await prisma.article.findMany({
      where: {
        mairieId,
        published: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    });

    // Incrémenter les vues de chaque article (simple tracking)
    res.json(articles);
  } catch (error) {
    console.error('Erreur getArticlesPublic:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET - Article par slug
exports.getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const mairieId = req.headers['x-mairie-id'];

    const article = await prisma.article.findFirst({
      where: {
        slug,
        mairieId,
        published: true,
      }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }

    // Incrémenter les vues
    await prisma.article.update({
      where: { id: article.id },
      data: { viewsCount: { increment: 1 } }
    });

    res.json(article);
  } catch (error) {
    console.error('Erreur getArticleBySlug:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET - Articles pour admin
exports.getArticles = async (req, res) => {
  try {
    const mairieId = req.user.mairieId;
    const { page = 1, published } = req.query;
    const skip = (page - 1) * 10;

    const where = { mairieId };
    if (published !== undefined) {
      where.published = published === 'true';
    }

    const articles = await prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: 10,
    });

    const total = await prisma.article.count({ where });

    res.json({
      articles,
      pagination: {
        page: parseInt(page),
        perPage: 10,
        total,
        pages: Math.ceil(total / 10),
      }
    });
  } catch (error) {
    console.error('Erreur getArticles:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// POST - Créer article
exports.createArticle = async (req, res) => {
  try {
    const { titre, contenu, excerpt, imageUrl, categorie, published } = req.body;
    const mairieId = req.user.mairieId;

    if (!titre || !contenu) {
      return res.status(400).json({ error: 'Titre et contenu requis' });
    }

    const slug = createSlug(titre) + '-' + uuidv4().slice(0, 8);

    const article = await prisma.article.create({
      data: {
        titre,
        slug,
        contenu,
        excerpt: excerpt || contenu.substring(0, 200),
        imageUrl,
        categorie,
        published: published || false,
        publishedAt: published ? new Date() : null,
        mairieId,
      }
    });

    res.status(201).json(article);
  } catch (error) {
    console.error('Erreur createArticle:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// PUT - Modifier article
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, contenu, excerpt, imageUrl, categorie, published } = req.body;
    const mairieId = req.user.mairieId;

    // Vérifier que l'article appartient à la mairie
    const article = await prisma.article.findFirst({
      where: { id, mairieId }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        ...(titre && { titre }),
        ...(contenu && { contenu }),
        ...(excerpt && { excerpt }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(categorie !== undefined && { categorie }),
        ...(published !== undefined && { 
          published,
          publishedAt: published ? new Date() : null 
        }),
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Erreur updateArticle:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// DELETE - Supprimer article
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const mairieId = req.user.mairieId;

    const article = await prisma.article.findFirst({
      where: { id, mairieId }
    });

    if (!article) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }

    await prisma.article.delete({ where: { id } });

    res.json({ message: 'Article supprimé' });
  } catch (error) {
    console.error('Erreur deleteArticle:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
