// 🎉 Promotional
export function getPromotionalMessage(name: string): string {
  return `Hi ${name}, 🎁 don't miss out on our special offers this week. Visit our website to learn more!`;
}

// 🔐 Login / 2FA OTP
export function getLoginOTPMessage(code: string): string {
  return `Your login verification code is: ${code}. It expires in 5 minutes.`;
}

// 📱 App Notification
export function getAppNotificationMessage(name: string): string {
  return `Hi ${name}, there's a new update on Operation Save my CGPA. Log in to view the details.`;
}
