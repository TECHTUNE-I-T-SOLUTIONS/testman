import axios from "axios";

const TERMII_API_KEY = process.env.TERMII_API_KEY!;
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID!;
const TERMII_API_URL = process.env.TERMII_API_URL!;

type TermiiSMSPayload = {
  to: string | string[];
  from: string;
  sms: string;
  type: "plain";
  api_key: string;
  channel: "generic";
};

// Generic SMS Sender
export async function sendSMS(to: string | string[], message: string) {
  const isBulk = Array.isArray(to);
  const url = `${TERMII_API_URL}/api/sms/send${isBulk ? "/bulk" : ""}`;

  const payload: TermiiSMSPayload = {
    to,
    from: TERMII_SENDER_ID,
    sms: message,
    type: "plain",
    api_key: TERMII_API_KEY,
    channel: "generic",
  };

  return axios.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
