import nodemailer from 'nodemailer';

const smtpPort = parseInt(process.env.SMTP_PORT || '587');
// Auto-detect SSL: port 465 uses implicit SSL, other ports use STARTTLS
const smtpSecure = process.env.SMTP_SECURE !== undefined
  ? process.env.SMTP_SECURE === 'true'
  : smtpPort === 465;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, code: string) {
  if (!process.env.SMTP_HOST) {
    console.warn('SMTP_HOST not set. Printing code to console:', code);
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Primer" <noreply@primer.com>',
    to: email,
    subject: 'Your Verification Code',
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code is: <strong>${code}</strong></p>`,
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  if (!process.env.SMTP_HOST) {
    console.warn('SMTP_HOST not set. Skipping welcome email.');
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Primer" <noreply@primer.com>',
    to: email,
    subject: 'Welcome to Primer!',
    text: `Hello ${name},

Welcome to Primer! We are excited to have you on board.`,
    html: `<p>Hello ${name},</p><p>Welcome to <strong>Primer</strong>! We are excited to have you on board.</p>`,
  });
}
