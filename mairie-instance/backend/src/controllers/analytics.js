// src/controllers/analytics.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET - Statistiques audiences
exports.getAudienceStats = async (req, res) => {
  try {
    const mairieId = req.user.mairieId;
    const { mois, annee } = req.query;

    const currentDate = new Date();
    const queryMois = parseInt(mois) || currentDate.getMonth() + 1;
    const queryAnnee = parseInt(annee) || currentDate.getFullYear();

    let stats = await prisma.audienceStats.findUnique({
      where: {
        mois_annee_mairieId: {
          mois: queryMois,
          annee: queryAnnee,
          mairieId,
        }
      }
    });

    // Si pas de stats pré-calculées, calculer en temps réel
    if (!stats) {
      const startDate = new Date(queryAnnee, queryMois - 1, 1);
      const endDate = new Date(queryAnnee, queryMois, 0, 23, 59, 59);

      const audiences = await prisma.audience.findMany({
        where: {
          mairieId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          }
        }
      });

      stats = {
        totalDemandes: audiences.length,
        confirmees: audiences.filter(a => a.status === 'CONFIRMEE').length,
        refusees: audiences.filter(a => a.status === 'REFUSEE').length,
        reportees: audiences.filter(a => a.status === 'REPORTEE').length,
        vipCount: audiences.filter(a => a.priorite === 'VIP').length,
        urgentCount: audiences.filter(a => a.priorite === 'URGENT').length,
      };
    }

    res.json(stats);
  } catch (error) {
    console.error('Erreur getAudienceStats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET - Tendance audiences (derniers 12 mois)
exports.getAudienceTrends = async (req, res) => {
  try {
    const mairieId = req.user.mairieId;

    const trends = [];
    const currentDate = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const mois = date.getMonth() + 1;
      const annee = date.getFullYear();

      const startDate = new Date(annee, mois - 1, 1);
      const endDate = new Date(annee, mois, 0, 23, 59, 59);

      const count = await prisma.audience.count({
        where: {
          mairieId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          }
        }
      });

      trends.push({
        mois: `${mois}/${annee}`,
        demandes: count,
      });
    }

    res.json(trends);
  } catch (error) {
    console.error('Erreur getAudienceTrends:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET - Statistiques site vitrine
exports.getSiteStats = async (req, res) => {
  try {
    const mairieId = req.user.mairieId;
    const { period = 'month' } = req.query;

    let startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const pageViews = await prisma.pageView.count({
      where: {
        mairieId,
        createdAt: { gte: startDate }
      }
    });

    const topPages = await prisma.pageView.groupBy({
      by: ['page'],
      where: {
        mairieId,
        createdAt: { gte: startDate }
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5,
    });

    const articles = await prisma.article.findMany({
      where: { mairieId },
      orderBy: { viewsCount: 'desc' },
      take: 5,
      select: {
        id: true,
        titre: true,
        viewsCount: true,
      }
    });

    const services = await prisma.service.findMany({
      where: { mairieId },
      take: 5,
      select: {
        id: true,
        nom: true,
      }
    });

    res.json({
      period,
      pageViews,
      topPages: topPages.map(tp => ({
        page: tp.page,
        views: tp._count.id,
      })),
      topArticles: articles,
      servicesCount: await prisma.service.count({ where: { mairieId } }),
      articlesCount: await prisma.article.count({ where: { mairieId } }),
      evenementsCount: await prisma.evenement.count({ where: { mairieId } }),
    });
  } catch (error) {
    console.error('Erreur getSiteStats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET - Dashboard complet
exports.getDashboard = async (req, res) => {
  try {
    const mairieId = req.user.mairieId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Audiences
    const audiencesToday = await prisma.audience.count({
      where: {
        mairieId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        }
      }
    });

    const audienceConfirmedToday = await prisma.audience.count({
      where: {
        mairieId,
        status: 'CONFIRMEE',
        createdAt: {
          gte: today,
          lt: tomorrow,
        }
      }
    });

    const audiencePending = await prisma.audience.count({
      where: {
        mairieId,
        status: 'EN_ATTENTE',
      }
    });

    const audienceVip = await prisma.audience.findMany({
      where: {
        mairieId,
        priorite: 'VIP',
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    // Contenu
    const recentArticles = await prisma.article.findMany({
      where: { mairieId },
      take: 5,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        titre: true,
        publishedAt: true,
      }
    });

    const upcomingEvents = await prisma.evenement.findMany({
      where: {
        mairieId,
        dateStart: {
          gte: today,
        }
      },
      take: 5,
      orderBy: { dateStart: 'asc' },
    });

    res.json({
      audiences: {
        today: audiencesToday,
        confirmedToday: audienceConfirmedToday,
        pending: audiencePending,
        vip: audienceVip,
      },
      content: {
        recentArticles,
        upcomingEvents,
      }
    });
  } catch (error) {
    console.error('Erreur getDashboard:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// POST - Enregistrer page view
exports.trackPageView = async (req, res) => {
  try {
    const mairieId = req.headers['x-mairie-id'];
    const { page, referrer, userAgent, deviceType } = req.body;

    // Enregistrer la vue de page
    await prisma.pageView.create({
      data: {
        page,
        referrer: referrer || '',
        userAgent: userAgent || '',
        deviceType: deviceType || 'unknown',
        ipAddress: req.ip || '',
        mairieId,
      }
    });

    res.json({ ok: true });
  } catch (error) {
    console.error('Erreur trackPageView:', error);
    // Ne pas bloquer l'affichage si l'analytics échoue
    res.json({ ok: true });
  }
};
