// src/controllers/audiences.js
const { PrismaClient } = require('@prisma/client');
const { sendEmail } = require('../services/email');

const prisma = new PrismaClient();

// GET - Créneaux disponibles (public)
exports.getCreneaux = async (req, res) => {
  try {
    const mairieId = req.headers['x-mairie-id'];
    const { date } = req.query;

    const creneaux = await prisma.creneauAudience.findMany({
      where: {
        mairieId,
        isActive: true,
      },
    });

    res.json(creneaux);
  } catch (error) {
    console.error('Erreur getCreneaux:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// POST - Soumettre demande audience (public)
exports.submitAudience = async (req, res) => {
  try {
    const mairieId = req.headers['x-mairie-id'];
    const { 
      nomCitoyen, prenomCitoyen, email, telephone, 
      objet, message, dateDemandee, heureDemandee 
    } = req.body;

    // Validation
    if (!nomCitoyen || !email || !telephone || !objet || !dateDemandee) {
      return res.status(400).json({ 
        error: 'Champs obligatoires manquants' 
      });
    }

    // Vérifier si mairie existe
    const mairie = await prisma.mairie.findUnique({
      where: { id: mairieId }
    });

    if (!mairie) {
      return res.status(404).json({ error: 'Mairie non trouvée' });
    }

    // Créer la demande
    const audience = await prisma.audience.create({
      data: {
        nomCitoyen,
        prenomCitoyen: prenomCitoyen || '',
        email,
        telephone,
        objet,
        message: message || '',
        dateDemandee: new Date(dateDemandee),
        heureDemandee: heureDemandee || '',
        status: 'EN_ATTENTE',
        priorite: 'NORMAL',
        mairieId,
      }
    });

    // Envoyer email de confirmation au citoyen
    await sendEmail({
      to: email,
      subject: `Demande d'audience reçue - ${mairie.name}`,
      template: 'audience-submitted',
      data: {
        nomCitoyen,
        mairieeName: mairie.name,
        audienceId: audience.id,
      }
    });

    // Notifier l'assistante
    const assistantes = await prisma.user.findMany({
      where: {
        mairieId,
        role: 'ASSISTANTE',
      }
    });

    for (const assistante of assistantes) {
      await sendEmail({
        to: assistante.email,
        subject: `Nouvelle demande d'audience - ${nomCitoyen}`,
        template: 'new-audience-notification',
        data: {
          nomCitoyen,
          objet,
          telephone,
          email,
        }
      });
    }

    res.status(201).json({
      message: 'Demande reçue',
      audience
    });
  } catch (error) {
    console.error('Erreur submitAudience:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET - Audiences (admin/assistante)
exports.getAudiences = async (req, res) => {
  try {
    const mairieId = req.user.mairieId;
    const { page = 1, status, priorite } = req.query;
    const skip = (page - 1) * 20;

    const where = { mairieId };
    if (status) where.status = status;
    if (priorite) where.priorite = priorite;

    const audiences = await prisma.audience.findMany({
      where,
      orderBy: { dateDemandee: 'desc' },
      skip,
      take: 20,
    });

    const total = await prisma.audience.count({ where });

    res.json({
      audiences,
      pagination: {
        page: parseInt(page),
        perPage: 20,
        total,
        pages: Math.ceil(total / 20),
      }
    });
  } catch (error) {
    console.error('Erreur getAudiences:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET - Audience par ID
exports.getAudienceById = async (req, res) => {
  try {
    const { id } = req.params;
    const mairieId = req.user.mairieId;

    const audience = await prisma.audience.findFirst({
      where: { id, mairieId }
    });

    if (!audience) {
      return res.status(404).json({ error: 'Audience non trouvée' });
    }

    res.json(audience);
  } catch (error) {
    console.error('Erreur getAudienceById:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// PUT - Modifier audience (admin/assistante)
exports.updateAudience = async (req, res) => {
  try {
    const { id } = req.params;
    const mairieId = req.user.mairieId;
    const { status, priorite, messageReponse, notesInterne, dateDemandee, heureDemandee } = req.body;

    const audience = await prisma.audience.findFirst({
      where: { id, mairieId },
      include: { mairie: true }
    });

    if (!audience) {
      return res.status(404).json({ error: 'Audience non trouvée' });
    }

    const updated = await prisma.audience.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priorite && { priorite }),
        ...(messageReponse && { messageReponse }),
        ...(notesInterne && { notesInterne }),
        ...(dateDemandee && { dateDemandee: new Date(dateDemandee) }),
        ...(heureDemandee && { heureDemandee }),
      },
      include: { mairie: true }
    });

    // Envoyer email si status change
    if (status && status !== audience.status) {
      const emailTemplate = status === 'CONFIRMEE' ? 'audience-confirmed' : 'audience-refused';
      
      await sendEmail({
        to: updated.email,
        subject: `Mise à jour de votre demande d'audience - ${updated.mairie.name}`,
        template: emailTemplate,
        data: {
          nomCitoyen: updated.nomCitoyen,
          dateDemandee: updated.dateDemandee,
          heureDemandee: updated.heureDemandee,
          messageReponse: messageReponse || '',
          mairiePhone: updated.mairie.phone,
        }
      });
    }

    res.json(updated);
  } catch (error) {
    console.error('Erreur updateAudience:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// DELETE - Supprimer audience
exports.deleteAudience = async (req, res) => {
  try {
    const { id } = req.params;
    const mairieId = req.user.mairieId;

    const audience = await prisma.audience.findFirst({
      where: { id, mairieId }
    });

    if (!audience) {
      return res.status(404).json({ error: 'Audience non trouvée' });
    }

    await prisma.audience.delete({ where: { id } });

    res.json({ message: 'Audience supprimée' });
  } catch (error) {
    console.error('Erreur deleteAudience:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// ============================================
// CRÉNEAUX
// ============================================

// POST - Créer créneau (admin)
exports.createCreneau = async (req, res) => {
  try {
    const { jour, heureDebut, heureFin, capacite, dureeAudience } = req.body;
    const mairieId = req.user.mairieId;

    if (!jour || !heureDebut || !heureFin) {
      return res.status(400).json({ error: 'Jour et heures requis' });
    }

    const creneau = await prisma.creneauAudience.create({
      data: {
        jour,
        heureDebut,
        heureFin,
        capacite: capacite || 1,
        dureeAudience: dureeAudience || 30,
        mairieId,
      }
    });

    res.status(201).json(creneau);
  } catch (error) {
    console.error('Erreur createCreneau:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// PUT - Modifier créneau
exports.updateCreneau = async (req, res) => {
  try {
    const { id } = req.params;
    const mairieId = req.user.mairieId;

    const creneau = await prisma.creneauAudience.findFirst({
      where: { id, mairieId }
    });

    if (!creneau) {
      return res.status(404).json({ error: 'Créneau non trouvé' });
    }

    const updated = await prisma.creneauAudience.update({
      where: { id },
      data: req.body
    });

    res.json(updated);
  } catch (error) {
    console.error('Erreur updateCreneau:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// DELETE - Supprimer créneau
exports.deleteCreneau = async (req, res) => {
  try {
    const { id } = req.params;
    const mairieId = req.user.mairieId;

    const creneau = await prisma.creneauAudience.findFirst({
      where: { id, mairieId }
    });

    if (!creneau) {
      return res.status(404).json({ error: 'Créneau non trouvé' });
    }

    await prisma.creneauAudience.delete({ where: { id } });

    res.json({ message: 'Créneau supprimé' });
  } catch (error) {
    console.error('Erreur deleteCreneau:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
