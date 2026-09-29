"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendBrevoEmail } from "@/lib/brevo";

// Explicitly type the return value to fix the TypeScript squiggly line
export async function submitContactForm(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  // 1. Save to database
  const { error } = await supabase
    .from("contact_messages")
    .insert({ name, email, subject, message });

  if (error) {
    console.error("Error saving contact message:", error);
    return { error: "Failed to send message. Please try again." };
  }

  // 2. Send email to support team via Brevo
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #ff5e02;">New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    </div>
  `;

  await sendBrevoEmail({
    to: "support@fastwaysending.com", // Send to your support inbox
    subject: `New Contact Form: ${subject}`,
    htmlContent: html,
  });

  return { success: true };
}