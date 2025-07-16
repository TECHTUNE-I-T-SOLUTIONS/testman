import emailjs from "@emailjs/nodejs";

export async function sendSignupEmail(toEmail: string, studentName: string) {
  const serviceID = process.env.EMAILJS_SERVICE_ID!;
  const templateID = process.env.EMAILJS_WELCOME_TEMPLATE_ID!;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY!;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY!;

  const templateParams = {
    to_name: studentName,
    to_email: toEmail,
  };

  try {
    const result = await emailjs.send(serviceID, templateID, templateParams, {
      publicKey,
      privateKey, // ✅ Ensure it's passed here just like in OTP
    });

    console.log("Signup Email Sent:", result);
    return result;
  } catch (error) {
    console.error("Error sending signup email:", error);
    throw new Error("Failed to send signup email");
  }
}
