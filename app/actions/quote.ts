"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendBrevoEmail } from "@/lib/brevo";
import { redirect } from "next/navigation";

export async function submitQuoteRequest(formData: FormData): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const freight_type = formData.get("freight_type") as string;
  const origin = formData.get("origin") as string;
  const destination = formData.get("destination") as string;
  const weight = parseFloat(formData.get("weight") as string);
  const email = formData.get("email") as string;

  // 1. Save to database
  const { error } = await supabase
    .from("quotes")
    .insert({
      user_id: user?.id || null, 
      origin_address: origin,
      destination_address: destination,
      freight_type: freight_type,
      weight: weight,
      status: "pending"
    });

  if (error) {
    console.error("Error saving quote:", error);
    redirect("/quote?error=Failed to submit quote");
  }

  // 2. Send email to admin via Brevo
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #1b3e69;">New Quote Request</h2>
      <p><strong>Customer Email:</strong> ${email}</p>
      <p><strong>Freight Type:</strong> ${freight_type}</p>
      <p><strong>Route:</strong> ${origin} -> ${destination}</p>
      <p><strong>Weight:</strong> ${weight} kg</p>
    </div>
  `;

  await sendBrevoEmail({
    to: "support@fastwaysending.com", 
    subject: `New Quote Request: ${freight_type} freight`,
    htmlContent: html,
  });

  redirect("/quote?success=true");
}