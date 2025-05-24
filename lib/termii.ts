// ✅ EMAIL OTP
export async function sendEmailOTP(email: string, code: string) {
  const res = await fetch(`${process.env.TERMII_API_URL}/api/email/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TERMII_API_KEY,
      email_address: email,
      code,
      email_configuration_id: process.env.TERMII_EMAIL_CONFIG_ID,
    }),
  });

  const data = await res.json();
  return data;
}

// ✅ SMS or WhatsApp OTP using GENERIC channel
export async function sendSMSorWhatsAppOTP(phone: string, channel: "sms" | "whatsapp") {
  const data = {
    api_key: process.env.TERMII_API_KEY!,
    message_type: "NUMERIC",
    to: phone,
    from: process.env.TERMII_SENDER_ID, // Plain generic sender as per Termii instructions
    channel: channel === "sms" ? "generic" : "whatsapp",
    pin_attempts: 10,
    pin_time_to_live: 5,
    pin_length: 6,
    pin_placeholder: "< 123456 >",
    message_text: "Your verification code is < 123456 >",
    pin_type: "NUMERIC",
  };

  const response = await fetch(`${process.env.TERMII_API_URL}/api/sms/otp/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Termii Error:", result);
  }

  return result;
}


// ✅ VOICE OTP (fixed)
export async function sendVoiceOTP(to: string, code: string) {
  const res = await fetch(`${process.env.TERMII_API_URL}/api/sms/otp/send/voice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: process.env.TERMII_API_KEY,
      phone_number: to,
      pin_attempts: 3,
      pin_time_to_live: 5,
      pin_length: 6,
      pin_type: "NUMERIC",
      pin_placeholder: `< ${code} >`,
      message_text: `Your pin is < ${code} >`,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Voice OTP Error:", data);
  }

  return data;
}


// ✅ Send custom SMS or WhatsApp message via Termii
export async function sendCustomSMSOrWhatsApp(phone: string, message: string, channel: "sms" | "whatsapp") {
  const data = {
    api_key: process.env.TERMII_API_KEY!,
    to: phone,
    from: process.env.TERMII_SENDER_ID!,
    sms: message,
    type: "plain",
    channel: channel,
  };

  const response = await fetch(`${process.env.TERMII_API_URL}/api/sms/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Custom SMS/WhatsApp Error:", result);
  }

  return result;
}
