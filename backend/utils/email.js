const nodemailer = require('nodemailer');

const isConfigured = !!(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    })
  : null;

/**
 * Sends an email if EMAIL_HOST/EMAIL_USER/EMAIL_PASS are configured. If not,
 * logs the content to the console instead — so flows like password reset are
 * still fully testable in development without an email provider. Never
 * throws: email delivery failing should not break the calling request.
 */
async function sendMail({ to, subject, html }) {
  if (!isConfigured) {
    console.warn(
      `\n✉️  Email is not configured (set EMAIL_HOST/EMAIL_USER/EMAIL_PASS in .env). ` +
      `Would have sent to ${to}:\nSubject: ${subject}\n${html}\n`
    );
    return { delivered: false };
  }
  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM || process.env.EMAIL_USER, to, subject, html });
    return { delivered: true };
  } catch (err) {
    console.error('Failed to send email:', err.message);
    return { delivered: false };
  }
}

module.exports = { sendMail, isConfigured };
