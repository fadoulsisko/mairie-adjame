// src/services/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: process.env.SMTP_PORT || 1025,
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});

const emailTemplates = {
  'audience-submitted': (data) => ({
    subject: `Demande d'audience reçue - ${data.mairieeName}`,
    html: `
      <h2>Bonjour ${data.nomCitoyen},</h2>
      <p>Votre demande d'audience a bien été reçue.</p>
      <p><strong>Numéro de suivi:</strong> ${data.audienceId}</p>
      <p>Vous recevrez une notification dès que votre demande aura été traitée.</p>
      <p>Cordialement,<br>${data.mairieeName}</p>
    `
  }),

  'audience-confirmed': (data) => ({
    subject: `Audience confirmée - ${data.dateDemandee}`,
    html: `
      <h2>Bonjour ${data.nomCitoyen},</h2>
      <p>Votre demande d'audience a été <strong>confirmée</strong>.</p>
      <p><strong>Date:</strong> ${new Date(data.dateDemandee).toLocaleDateString('fr-FR')}</p>
      <p><strong>Heure:</strong> ${data.heureDemandee || 'À définir'}</p>
      <p><strong>Message:</strong> ${data.messageReponse}</p>
      <p>Pour toute question, veuillez contacter: ${data.mairiePhone}</p>
      <p>Cordialement</p>
    `
  }),

  'audience-refused': (data) => ({
    subject: `Mise à jour de votre demande d'audience`,
    html: `
      <h2>Bonjour ${data.nomCitoyen},</h2>
      <p>Nous regrettons d'informer que votre demande d'audience a été <strong>refusée</strong>.</p>
      <p><strong>Raison:</strong> ${data.messageReponse || 'Non spécifiée'}</p>
      <p>Pour toute contestation, veuillez contacter: ${data.mairiePhone}</p>
      <p>Cordialement</p>
    `
  }),

  'new-audience-notification': (data) => ({
    subject: `Nouvelle demande d'audience - ${data.nomCitoyen}`,
    html: `
      <h2>Nouvelle demande d'audience</h2>
      <p><strong>Citoyen:</strong> ${data.nomCitoyen}</p>
      <p><strong>Objet:</strong> ${data.objet}</p>
      <p><strong>Téléphone:</strong> ${data.telephone}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p>Veuillez accéder au backoffice pour traiter cette demande.</p>
    `
  }),

  'user-invitation': (data) => ({
    subject: `Invitation à rejoindre ${data.mairieeName}`,
    html: `
      <h2>Bienvenue!</h2>
      <p>Vous avez été invité à rejoindre la plateforme de ${data.mairieeName}.</p>
      <p><strong>Rôle:</strong> ${data.role}</p>
      <p>Identifiants temporaires:</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Mot de passe temporaire:</strong> ${data.tempPassword}</p>
      <p><a href="${data.backofficeUrl}">Accéder au backoffice</a></p>
      <p>Veuillez changer votre mot de passe dès la première connexion.</p>
    `
  }),
};

exports.sendEmail = async (options) => {
  const {
    to,
    subject,
    template,
    data = {},
    html,
  } = options;

  try {
    let emailContent;

    if (template && emailTemplates[template]) {
      emailContent = emailTemplates[template](data);
    } else if (html) {
      emailContent = { html };
    } else {
      throw new Error('Template ou HTML requis');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@mairie-platform.ci',
      to,
      subject: subject || emailContent.subject,
      html: emailContent.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email envoyé à ${to}`);
    return result;
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    // Ne pas lever l'erreur pour ne pas bloquer le flux
    return { error: error.message };
  }
};

// Test de connexion SMTP
exports.testSMTP = async () => {
  try {
    await transporter.verify();
    console.log('✅ Serveur SMTP prêt');
    return true;
  } catch (error) {
    console.error('❌ Erreur SMTP:', error);
    return false;
  }
};
