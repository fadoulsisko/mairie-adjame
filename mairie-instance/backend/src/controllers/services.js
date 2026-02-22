// src/controllers/services.js
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

const createSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

// GET - Services publics
exports.getServicesPublic = async (req, res) => {
  try {
    const mairieId = req.headers['x-mairie-id'];

    const services = await prisma.service.findMany({
      where: {
        mairieId,
        isActive: true,
      },
      orderBy: { ordre: 'asc' },
    });

    res.json(services);
  } catch (error) {
    console.error('Erreur getServicesPublic:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET - Service par slug
exports.getServiceBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const mairieId = req.headers['x-mairie-id'];

    const service = await prisma.service.findFirst({
      where: {
        slug,
        mairieId,
        isActive: true,
      }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }

    res.json(service);
  } catch (error) {
    console.error('Erreur getServiceBySlug:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET - Services pour admin
exports.getServices = async (req, res) => {
  try {
    const mairieId = req.user.mairieId;
    const { page = 1 } = req.query;
    const skip = (page - 1) * 10;

    const services = await prisma.service.findMany({
      where: { mairieId },
      orderBy: { ordre: 'asc' },
      skip,
      take: 10,
    });

    const total = await prisma.service.count({ where: { mairieId } });

    res.json({
      services,
      pagination: {
        page: parseInt(page),
        perPage: 10,
        total,
        pages: Math.ceil(total / 10),
      }
    });
  } catch (error) {
    console.error('Erreur getServices:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// POST - Créer service
exports.createService = async (req, res) => {
  try {
    const { 
      nom, description, categorie, contact, email, phone, 
      documents, conditions, delais, imageUrl, ordre 
    } = req.body;
    const mairieId = req.user.mairieId;

    if (!nom || !description) {
      return res.status(400).json({ error: 'Nom et description requis' });
    }

    const slug = createSlug(nom) + '-' + uuidv4().slice(0, 8);

    const service = await prisma.service.create({
      data: {
        nom,
        slug,
        description,
        categorie,
        contact,
        email,
        phone,
        documents: documents ? JSON.stringify(documents) : null,
        conditions,
        delais,
        imageUrl,
        ordre: ordre || 0,
        mairieId,
      }
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('Erreur createService:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// PUT - Modifier service
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const mairieId = req.user.mairieId;

    const service = await prisma.service.findFirst({
      where: { id, mairieId }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }

    const updated = await prisma.service.update({
      where: { id },
      data: {
        ...req.body,
        documents: req.body.documents ? JSON.stringify(req.body.documents) : undefined,
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Erreur updateService:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// DELETE - Supprimer service
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const mairieId = req.user.mairieId;

    const service = await prisma.service.findFirst({
      where: { id, mairieId }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }

    await prisma.service.delete({ where: { id } });

    res.json({ message: 'Service supprimé' });
  } catch (error) {
    console.error('Erreur deleteService:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
