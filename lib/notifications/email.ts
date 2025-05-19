import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendSignupEmail(to: string, name: string) {
  const html = `
    <h2>🎉 Welcome, ${name}!</h2>
    <p>Your account has been successfully created on <strong>Glorious Future Academy</strong>.</p>
    <p>We’re excited to have you onboard!</p>
  `;

  return await resend.emails.send({
    from: process.env.RESEND_SENDER_EMAIL!,
    to,
    subject: '✅ Registration Successful',
    html,
  });
}

export async function sendLoginEmail(to: string, name: string) {
  const html = `
    <h2>👋 Welcome back, ${name}!</h2>
    <p>You just logged into your Glorious Future Academy account.</p>
  `;

  return await resend.emails.send({
    from: process.env.RESEND_SENDER_EMAIL!,
    to,
    subject: '🔐 Login Notification',
    html,
  });
}
 