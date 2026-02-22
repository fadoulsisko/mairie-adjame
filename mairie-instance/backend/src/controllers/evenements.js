// src/controllers/evenements.js
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

// GET - Événements publics
exports.getEvenementPublic = async (req, res) => {
  try {
    const mairieId = req.headers['x-mairie-id'];

    const evenements = await prisma.evenement.findMany({
      where: {
        mairieId,
        dateStart: {
          gte: new Date(),
        }
      },
      orderBy: { dateStart: 'asc' },
    });

    res.json(evenements);
  } catch (error) {
    console.error('Erreur getEvenementPublic:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET - Événement par slug
exports.getEvenementBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const mairieId = req.headers['x-mairie-id'];

    const evenement = await prisma.evenement.findFirst({
      where: {
        slug,
        mairieId,
      }
    });

    if (!evenement) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }

    // Incrémenter les vues
    await prisma.evenement.update({
      where: { id: evenement.id },
      data: { viewsCount: { increment: 1 } }
    });

    res.json(evenement);
  } catch (error) {
    console.error('Erreur getEvenementBySlug:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET - Événements pour admin
exports.getEvenements = async (req, res) => {
  try {
    const mairieId = req.user.mairieId;
    const { page = 1 } = req.query;
    const skip = (page - 1) * 10;

    const evenements = await prisma.evenement.findMany({
      where: { mairieId },
      orderBy: { dateStart: 'desc' },
      skip,
      take: 10,
    });

    const total = await prisma.evenement.count({ where: { mairieId } });

    res.json({
      evenements,
      pagination: {
        page: parseInt(page),
        perPage: 10,
        total,
        pages: Math.ceil(total / 10),
      }
    });
  } catch (error) {
    console.error('Erreur getEvenements:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// POST - Créer événement
exports.createEvenement = async (req, res) => {
  try {
    const { 
      titre, description, imageUrl, categorie, 
      dateStart, timeStart, dateEnd, timeEnd, 
      lieu, rsvpEnabled, maxParticipants 
    } = req.body;
    const mairieId = req.user.mairieId;

    if (!titre || !description || !dateStart) {
      return res.status(400).json({ 
        error: 'Titre, description et date requis' 
      });
    }

    const slug = createSlug(titre) + '-' + uuidv4().slice(0, 8);

    const evenement = await prisma.evenement.create({
      data: {
        titre,
        slug,
        description,
        imageUrl,
        categorie,
        dateStart: new Date(dateStart),
        timeStart: timeStart || '',
        dateEnd: dateEnd ? new Date(dateEnd) : null,
        timeEnd: timeEnd || '',
        lieu,
        rsvpEnabled: rsvpEnabled || false,
        maxParticipants: maxParticipants || null,
        mairieId,
      }
    });

    res.status(201).json(evenement);
  } catch (error) {
    console.error('Erreur createEvenement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// PUT - Modifier événement
exports.updateEvenement = async (req, res) => {
  try {
    const { id } = req.params;
    const mairieId = req.user.mairieId;

    const evenement = await prisma.evenement.findFirst({
      where: { id, mairieId }
    });

    if (!evenement) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }

    const data = {
      ...req.body,
      dateStart: req.body.dateStart ? new Date(req.body.dateStart) : undefined,
      dateEnd: req.body.dateEnd ? new Date(req.body.dateEnd) : undefined,
    };

    // Supprimer les propriétés undefined
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    const updated = await prisma.evenement.update({
      where: { id },
      data,
    });

    res.json(updated);
  } catch (error) {
    console.error('Erreur updateEvenement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// DELETE - Supprimer événement
exports.deleteEvenement = async (req, res) => {
  try {
    const { id } = req.params;
    const mairieId = req.user.mairieId;

    const evenement = await prisma.evenement.findFirst({
      where: { id, mairieId }
    });

    if (!evenement) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }

    await prisma.evenement.delete({ where: { id } });

    res.json({ message: 'Événement supprimé' });
  } catch (error) {
    console.error('Erreur deleteEvenement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
