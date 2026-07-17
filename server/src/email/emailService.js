import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    });
  }

  return transporter;
}

async function send({ to, subject, text, html, fallbackLabel }) {
  const smtp = getTransporter();

  if (!smtp) {
    // Pas de SMTP configuré (dev local) : on affiche le lien dans les logs
    // plutôt que d'exiger des identifiants de messagerie pour tester.
    console.log(`[email] ${fallbackLabel} pour ${to} : ${text}`);
    return;
  }

  await smtp.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text, html });
}

export async function sendPasswordResetEmail(to, resetUrl) {
  await send({
    to,
    subject: "Réinitialise ton mot de passe Lexora",
    text: `Pour réinitialiser ton mot de passe, ouvre ce lien (valable 1 heure) : ${resetUrl}\n\nSi tu n'es pas à l'origine de cette demande, ignore cet email.`,
    html: `<p>Pour réinitialiser ton mot de passe, clique sur ce lien (valable 1 heure) :</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Si tu n'es pas à l'origine de cette demande, ignore cet email.</p>`,
    fallbackLabel: "Lien de réinitialisation",
  });
}

export async function sendVerificationEmail(to, verifyUrl) {
  await send({
    to,
    subject: "Confirme ton adresse email Lexora",
    text: `Bienvenue sur Lexora ! Pour confirmer ton adresse email, ouvre ce lien (valable 48 heures) : ${verifyUrl}`,
    html: `<p>Bienvenue sur Lexora !</p><p>Pour confirmer ton adresse email, clique sur ce lien (valable 48 heures) :</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
    fallbackLabel: "Lien de vérification email",
  });
}
