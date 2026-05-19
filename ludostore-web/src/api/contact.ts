export interface ContactMessageRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const emailJsConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  toEmail:
    import.meta.env.VITE_CONTACT_TO_EMAIL || "support@amfoartgallery.com",
};

const placeholderValues = new Set([
  "your_emailjs_service_id",
  "your_emailjs_template_id",
  "your_emailjs_public_key",
]);

const hasRealValue = (value: string | undefined) =>
  Boolean(value && !placeholderValues.has(value));

export const isContactEmailConfigured = () =>
  hasRealValue(emailJsConfig.serviceId) &&
  hasRealValue(emailJsConfig.templateId) &&
  hasRealValue(emailJsConfig.publicKey);

export const sendContactMessage = async (data: ContactMessageRequest) => {
  if (!isContactEmailConfigured()) {
    throw new Error("EmailJS is not configured yet.");
  }

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      service_id: emailJsConfig.serviceId,
      template_id: emailJsConfig.templateId,
      user_id: emailJsConfig.publicKey,
      template_params: {
        from_name: data.name,
        from_email: data.email,
        reply_to: data.email,
        subject: data.subject,
        message: data.message,
        to_email: emailJsConfig.toEmail,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to send contact message.");
  }
};
