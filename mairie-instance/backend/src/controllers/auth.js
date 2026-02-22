// src/controllers/auth.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Chercher utilisateur
    const user = await prisma.user.findFirst({
      where: { email },
      include: { mairie: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Vérifier mot de passe
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Compte désactivé' });
    }

    // Générer JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        mairieId: user.mairieId,
        maisonName: user.mairie.name,
      },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );

    // Mettre à jour lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.logout = async (req, res) => {
  // Pas vraiment nécessaire avec JWT côté serveur,
  // mais pour la cohérence API
  res.json({ message: 'Déconnecté avec succès' });
};

exports.refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token requis' });
    }

    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'secret_key'
    );

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { mairie: true }
    });

    if (!user || !user.isActive) {
      return res.status(403).json({ error: 'Utilisateur invalide' });
    }

    // Nouveau token
    const newToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        mairieId: user.mairieId,
        maisonName: user.mairie.name,
      },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );

    res.json({ token: newToken });
  } catch (error) {
    console.error('Erreur refresh token:', error);
    res.status(403).json({ error: 'Token invalide' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        isActive: true,
        lastLogin: true,
        mairie: {
          select: {
            id: true,
            name: true,
            domain: true,
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erreur getCurrentUser:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Ancien et nouveau mot de passe requis' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Vérifier ancien mot de passe
    const validPassword = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Ancien mot de passe incorrect' });
    }

    // Hash nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword }
    });

    res.json({ message: 'Mot de passe changé avec succès' });
  } catch (error) {
    console.error('Erreur changePassword:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
