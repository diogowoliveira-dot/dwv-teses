import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SPARKPOST_SMTP_HOST || 'smtp.sparkpostmail.com',
  port: Number(process.env.SPARKPOST_SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SPARKPOST_SMTP_USER || 'SMTP_Injection',
    pass: process.env.SPARKPOST_API_KEY,
  },
})

interface SendEmailProps {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailProps) {
  return transporter.sendMail({
    from: `"${process.env.SPARKPOST_FROM_NAME}" <${process.env.SPARKPOST_FROM_EMAIL}>`,
    to,
    subject,
    html,
  })
}

export function magicLinkEmail(link: string, name?: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'DM Sans', Arial, sans-serif; background: #0a0a0a; color: #e8e0d5; margin: 0; padding: 0; }
    .wrap { max-width: 480px; margin: 40px auto; padding: 40px; background: #111; border: 1px solid #1f1f1f; border-radius: 12px; }
    .logo { font-size: 22px; font-weight: 700; color: #E8392A; margin-bottom: 32px; letter-spacing: -0.5px; }
    h1 { font-size: 20px; margin: 0 0 12px; color: #e8e0d5; }
    p { font-size: 14px; color: #888; line-height: 1.6; margin: 0 0 24px; }
    .btn { display: inline-block; padding: 12px 28px; background: #E8392A; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; }
    .footer { margin-top: 32px; font-size: 12px; color: #444; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="logo">DWV</div>
    <h1>Seu link de acesso</h1>
    <p>${name ? `Olá, ${name}.<br><br>` : ''}Clique no botão abaixo para acessar a plataforma de Teses de Investimento DWV. O link expira em 1 hora.</p>
    <a href="${link}" class="btn">Acessar plataforma →</a>
    <div class="footer">
      Se você não solicitou este acesso, ignore este email.<br>
      DWV · Teses de Investimento Imobiliário
    </div>
  </div>
</body>
</html>
  `.trim()
}

export function welcomeEmail(name: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #0a0a0a; color: #e8e0d5; margin: 0; padding: 0; }
    .wrap { max-width: 480px; margin: 40px auto; padding: 40px; background: #111; border: 1px solid #1f1f1f; border-radius: 12px; }
    .logo { font-size: 22px; font-weight: 700; color: #E8392A; margin-bottom: 32px; }
    h1 { font-size: 20px; margin: 0 0 12px; color: #e8e0d5; }
    p { font-size: 14px; color: #888; line-height: 1.6; }
    .footer { margin-top: 32px; font-size: 12px; color: #444; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="logo">DWV</div>
    <h1>Bem-vindo, ${name}!</h1>
    <p>Sua conta foi criada com sucesso. Você já pode acessar a plataforma e criar suas teses de investimento imobiliário.</p>
    <div class="footer">DWV · Teses de Investimento Imobiliário</div>
  </div>
</body>
</html>
  `.trim()
}
