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

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .card { background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); text-align: left; }
        .logo { font-size: 24px; font-weight: bold; color: #18181b; margin-bottom: 32px; display: block; }
        .h1 { font-size: 20px; font-weight: 600; color: #18181b; margin-bottom: 16px; }
        .text { font-size: 15px; line-height: 1.6; color: #52525b; margin-bottom: 24px; }
        .code-container { margin: 32px 0; }
        .code { 
          font-family: 'Courier New', Courier, monospace; 
          font-size: 32px; 
          font-weight: 700; 
          letter-spacing: 4px; 
          color: #000000; 
          background-color: #f4f4f5; 
          padding: 16px 24px; 
          border-radius: 8px; 
          display: inline-block; 
          border: 1px solid #e4e4e7; 
          cursor: pointer; 
          user-select: all; 
          -webkit-user-select: all; 
          -moz-user-select: all; 
          -ms-user-select: all;
        }
        .hint { font-size: 12px; color: #a1a1aa; margin-top: 8px; }
        .footer { font-size: 13px; color: #a1a1aa; margin-top: 32px; line-height: 1.5; border-top: 1px solid #f4f4f5; padding-top: 24px; }
        .strong { color: #18181b; font-weight: 500; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">Primer</div>
          <h1 class="h1">Verifique seu e-mail</h1>
          <p class="text">
            Precisamos verificar seu endereço de email <span class="strong">${email}</span> antes que você possa acessar sua conta. Digite o código abaixo na janela do navegador que está aberta.
          </p>
          
          <div class="code-container">
            <div class="code">${code}</div>
          </div>
          
          <p class="text" style="font-size: 14px; color: #71717a;">
            Este código expira em 10 minutos.
          </p>

          <div class="footer">
            Se você não se cadastrou no Primer, pode ignorar este e-mail com segurança. Alguém pode ter digitado seu endereço de e-mail por engano.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Primer" <noreply@primer.com>',
    to: email,
    subject: 'Verifique seu e-mail',
    text: `Verifique seu e-mail\n\nPrecisamos verificar seu endereço de email ${email} antes que você possa acessar sua conta. O seu código é: ${code}\n\nEste código expira em 10 minutos.`,
    html: htmlContent,
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
