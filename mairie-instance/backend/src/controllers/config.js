// src/controllers/config.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET - Configuration publique
exports.getConfigPublic = async (req, res) => {
  try {
    const mairieId = req.headers['x-mairie-id'];

    const mairie = await prisma.mairie.findUnique({
      where: { id: mairieId },
      include: {
        socialMedia: {
          where: { isActive: true }
        }
      }
    });

    if (!mairie) {
      return res.status(404).json({ error: 'Mairie non trouvée' });
    }

    res.json({
      name: mairie.name,
      domain: mairie.domain,
      logo: mairie.logoUrl,
      primaryColor: mairie.primaryColor,
      secondaryColor: mairie.secondaryColor,
      description: mairie.description,
      address: mairie.address,
      phone: mairie.phone,
      email: mairie.email,
      openingHours: mairie.openingHours ? JSON.parse(mairie.openingHours) : null,
      mayorName: mairie.mayorName,
      socialMedia: mairie.socialMedia,
    });
  } catch (error) {
    console.error('Erreur getConfigPublic:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// PUT - Modifier infos générales (admin)
exports.updateConfigGeneral = async (req, res) => {
  try {
    const mairieId = req.user.mairieId;
    const { 
      name, description, address, phone, email, 
      openingHours, mayorName 
    } = req.body;

    const updated = await prisma.mairie.update({
      where: { id: mairieId },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(address && { address }),
        ...(phone && { phone }),
        ...(email && { email }),
        ...(openingHours && { openingHours: JSON.stringify(openingHours) }),
        ...(mayorName && { mayorName }),
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Erreur updateConfigGeneral:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// PUT - Modifier branding (admin)
exports.updateBranding = async (req, res) => {
  try {
    const mairieId = req.user.mairieId;
    const { logoUrl, primaryColor, secondaryColor } = req.body;

    const updated = await prisma.mairie.update({
      where: { id: mairieId },
      data: {
        ...(logoUrl && { logoUrl }),
        ...(primaryColor && { primaryColor }),
        ...(secondaryColor && { secondaryColor }),
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Erreur updateBranding:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// POST - Ajouter réseau social (admin)
exports.addSocialMedia = async (req, res) => {
  try {
    const mairieId = req.user.mairieId;
    const { plateforme, url } = req.body;

    if (!plateforme || !url) {
      return res.status(400).json({ error: 'Plateforme et URL requises' });
    }

    const socialMedia = await prisma.socialMedia.upsert({
      where: {
        plateforme_mairieId: {
          plateforme,
          mairieId,
        }
      },
      update: { url, isActive: true },
      create: { plateforme, url, mairieId },
    });

    res.status(201).json(socialMedia);
  } catch (error) {
    console.error('Erreur addSocialMedia:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// PUT - Modifier réseau social
exports.updateSocialMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const mairieId = req.user.mairieId;
    const { url, isActive } = req.body;

    const socialMedia = await prisma.socialMedia.findFirst({
      where: { id, mairieId }
    });

    if (!socialMedia) {
      return res.status(404).json({ error: 'Réseau social non trouvé' });
    }

    const updated = await prisma.socialMedia.update({
      where: { id },
      data: {
        ...(url && { url }),
        ...(isActive !== undefined && { isActive }),
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Erreur updateSocialMedia:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// DELETE - Supprimer réseau social
exports.deleteSocialMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const mairieId = req.user.mairieId;

    const socialMedia = await prisma.socialMedia.findFirst({
      where: { id, mairieId }
    });

    if (!socialMedia) {
      return res.status(404).json({ error: 'Réseau social non trouvé' });
    }

    await prisma.socialMedia.delete({ where: { id } });

    res.json({ message: 'Réseau social supprimé' });
  } catch (error) {
    console.error('Erreur deleteSocialMedia:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
