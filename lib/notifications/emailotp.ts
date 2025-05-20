// lib/notifications/emailotp.ts
import emailjs from "@emailjs/nodejs";

export const sendOtpEmail = async (email: string, otp: string) => {
  const serviceID = process.env.EMAILJS_SERVICE_ID!;
  const templateID = process.env.EMAILJS_PASSWORD_TEMPLATE_ID!;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY!;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY!;

  const templateParams = {
    to_email: email,
    otp_code: otp,
  };

  try {
    const result = await emailjs.send(serviceID, templateID, templateParams, {
      publicKey,
      privateKey, // ✅ REQUIRED IN STRICT MODE
    });

    console.log("OTP Email Sent:", result);
    return result;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};
