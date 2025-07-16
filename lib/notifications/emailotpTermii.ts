import axios from "axios";

export async function sendOtpEmailTermii(email: string, subject: string, message: string): Promise<void> {
  try {
    const apiKey = process.env.TERMII_API_KEY;
    const configId = process.env.TERMII_EMAIL_CONFIG_ID;

    if (!apiKey || !configId) {
      throw new Error("Missing TERMII_API_KEY or TERMII_EMAIL_CONFIG_ID in environment");
    }

    await axios.post("https://api.ng.termii.com/api/email/send", {
      api_key: apiKey,
      email_address: email,
      email_configuration_id: configId,
      subject,
      message_type: "text", // You can use "text" or "html" depending on your config
      message,
    });
  } catch (error) {
    console.error("Error sending Termii email:", error);
    throw error;
  }
}
