// src/controllers/galerie.js
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

// GET - Albums publics
exports.getAlbumsPublic = async (req, res) => {
  try {
    const mairieId = req.headers['x-mairie-id'];

    const albums = await prisma.album.findMany({
      where: { mairieId },
      include: {
        photos: {
          take: 1, // Une seule photo pour la couverture
          orderBy: { ordre: 'asc' }
        }
      },
      orderBy: { ordre: 'asc' },
    });

    res.json(albums);
  } catch (error) {
    console.error('Erreur getAlbumsPublic:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET - Photos d'un album (public)
exports.getPhotosPublic = async (req, res) => {
  try {
    const { id } = req.params;
    const mairieId = req.headers['x-mairie-id'];

    const album = await prisma.album.findFirst({
      where: { id, mairieId },
      include: {
        photos: {
          orderBy: { ordre: 'asc' }
        }
      }
    });

    if (!album) {
      return res.status(404).json({ error: 'Album non trouvé' });
    }

    res.json(album);
  } catch (error) {
    console.error('Erreur getPhotosPublic:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// POST - Créer album (admin)
exports.createAlbum = async (req, res) => {
  try {
    const { titre, description, ordre } = req.body;
    const mairieId = req.user.mairieId;

    if (!titre) {
      return res.status(400).json({ error: 'Titre requis' });
    }

    const album = await prisma.album.create({
      data: {
        titre,
        description: description || '',
        ordre: ordre || 0,
        mairieId,
      }
    });

    res.status(201).json(album);
  } catch (error) {
    console.error('Erreur createAlbum:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// PUT - Modifier album
exports.updateAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const mairieId = req.user.mairieId;

    const album = await prisma.album.findFirst({
      where: { id, mairieId }
    });

    if (!album) {
      return res.status(404).json({ error: 'Album non trouvé' });
    }

    const updated = await prisma.album.update({
      where: { id },
      data: req.body,
      include: {
        photos: {
          orderBy: { ordre: 'asc' }
        }
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Erreur updateAlbum:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// DELETE - Supprimer album
exports.deleteAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const mairieId = req.user.mairieId;

    const album = await prisma.album.findFirst({
      where: { id, mairieId }
    });

    if (!album) {
      return res.status(404).json({ error: 'Album non trouvé' });
    }

    // Supprimer photos d'abord
    await prisma.photo.deleteMany({
      where: { albumId: id }
    });

    await prisma.album.delete({ where: { id } });

    res.json({ message: 'Album supprimé' });
  } catch (error) {
    console.error('Erreur deleteAlbum:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// POST - Upload photos (admin)
exports.uploadPhotos = async (req, res) => {
  try {
    const { id } = req.params;
    const mairieId = req.user.mairieId;
    const photos = req.body.photos || []; // [{url, titre}, ...]

    if (!photos.length) {
      return res.status(400).json({ error: 'Aucune photo fournie' });
    }

    const album = await prisma.album.findFirst({
      where: { id, mairieId }
    });

    if (!album) {
      return res.status(404).json({ error: 'Album non trouvé' });
    }

    // Créer les photos
    const createdPhotos = await Promise.all(
      photos.map((photo, index) => 
        prisma.photo.create({
          data: {
            url: photo.url,
            titre: photo.titre || '',
            ordre: index,
            albumId: id,
          }
        })
      )
    );

    res.status(201).json(createdPhotos);
  } catch (error) {
    console.error('Erreur uploadPhotos:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// PUT - Modifier photo (titre, ordre)
exports.updatePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, ordre } = req.body;

    const updated = await prisma.photo.update({
      where: { id },
      data: {
        ...(titre !== undefined && { titre }),
        ...(ordre !== undefined && { ordre }),
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Erreur updatePhoto:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// DELETE - Supprimer photo
exports.deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const mairieId = req.user.mairieId;

    const photo = await prisma.photo.findUnique({
      where: { id },
      include: {
        album: {
          select: { mairieId: true }
        }
      }
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo non trouvée' });
    }

    if (photo.album.mairieId !== mairieId) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    await prisma.photo.delete({ where: { id } });

    res.json({ message: 'Photo supprimée' });
  } catch (error) {
    console.error('Erreur deletePhoto:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
