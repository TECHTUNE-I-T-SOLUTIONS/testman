import { sendSMS } from "./sms";
import { smsTemplates } from "./templates";

export async function sendSignupSMS(phone: string, name: string) {
  const message = smsTemplates.welcome(name);
  return sendSMS(phone, message);
}

export async function sendLoginSMS(phone: string, name: string) {
  const message = smsTemplates.login(name);
  return sendSMS(phone, message);
}

export async function sendOtpSMS(phone: string, otp: string) {
  const message = smsTemplates.otp(otp);
  return sendSMS(phone, message);
}

export async function sendPromotionalSMS(phoneNumbers: string[], offer: string) {
  const message = smsTemplates.promo(offer);
  return sendSMS(phoneNumbers, message);
}

export async function sendAppNotificationSMS(phoneNumbers: string[], title: string, body: string) {
  const message = smsTemplates.appNotification(title, body);
  return sendSMS(phoneNumbers, message);
}
