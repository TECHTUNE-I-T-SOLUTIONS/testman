export const smsTemplates = {
  welcome: (name: string) =>
    `🎉 Hi ${name}, your registration with Operation Save My CGPA was successful! Welcome aboard.`,

  login: (name: string) =>
    `👋 Hello ${name}, you just logged into your Operation Save my CGPA account.`,

  otp: (otp: string) =>
    `🔐 Your OTP is ${otp}. Do not share this with anyone.`,

  promo: (offer: string) =>
    `🚀 Don't miss out! ${offer} — Operation Save My CGPA.`,

  appNotification: (title: string, body: string) =>
    `📱 ${title}: ${body}`,
};
