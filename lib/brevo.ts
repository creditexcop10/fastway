export interface BrevoEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
}

export async function sendBrevoEmail({ to, subject, htmlContent }: BrevoEmailParams): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.error("BREVO_API_KEY is missing in environment variables.");
    return false;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { email: "support@fastwaysending.com", name: "Fastway Send" },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    if (!response.ok) {
      console.error("Failed to send email via Brevo:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Brevo fetch error:", error);
    return false;
  }
}