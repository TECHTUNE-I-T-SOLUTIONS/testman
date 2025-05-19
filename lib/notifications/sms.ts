import axios from 'axios';

const TERMII_API_KEY = process.env.TERMII_API_KEY!;
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID!;

export async function sendSignupSMS(phone: string, name: string) {
  const message = `🎉 Hi ${name}, your registration with Glorious Future Academy was successful! Welcome aboard.`;

  return await axios.post('https://api.ng.termii.com/api/sms/send', {
    to: phone,
    from: TERMII_SENDER_ID,
    sms: message,
    type: 'plain',
    api_key: TERMII_API_KEY,
    channel: 'generic',
  });
}

export async function sendLoginSMS(phone: string, name: string) {
  const message = `👋 Hello ${name}, you just logged into your Glorious Future Academy account.`;

  return await axios.post('https://api.ng.termii.com/api/sms/send', {
    to: phone,
    from: TERMII_SENDER_ID,
    sms: message,
    type: 'plain',
    api_key: TERMII_API_KEY,
    channel: 'generic',
  });
}
