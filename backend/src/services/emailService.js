const nodemailer = require("nodemailer");
const config = require("../config/env");

/**
 * Email service — wraps nodemailer. In development without mail
 * credentials it logs the email instead of sending, so the reset
 * flow still works end-to-end locally.
 */
let transporter;

try {
  transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.port === 465,
    auth: {
      user: config.mail.user,
      pass: config.mail.password,
    },
  });
} catch (err) {
  transporter = null;
}

const sendMail = async ({ to, subject, html, text }) => {
  if (!transporter || !config.mail.user) {
    console.log(`[mail:dev] To: ${to} | Subject: ${subject}\n${text || "see html"}`);
    return { dev: true };
  }
  const info = await transporter.sendMail({
    from: config.mail.from,
    to,
    subject,
    html: html || text,
  });
  return info;
};

module.exports = { sendMail };
