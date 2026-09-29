import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendBrevoEmail } from "@/lib/brevo";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseAdminClient();

    // 1. Generate the secure recovery link using the Admin API (Corrected Syntax)
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      email,
      type: 'recovery',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
      }
    });

    // If user doesn't exist, Supabase returns an error. 
    // For security, we don't tell the user the email doesn't exist.
    if (error || !data?.properties?.action_link) {
      console.log("Password reset requested for non-existent or blocked user:", email);
      return NextResponse.json({ success: true, message: "If the email exists, a reset link has been sent." });
    }

    const resetLink = data.properties.action_link;

    // 2. Send the email via Brevo
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #1b3e69;">Reset Your Password</h2>
        <p>We received a request to reset your password for your Fastway Send account.</p>
        <p>Click the button below to choose a new password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #ff5e02; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Reset Password</a>
        <p>If you did not request this, you can safely ignore this email.</p>
        <br>
        <p style="font-size: 12px; color: #888;">Fastway Send Ltd | 24/7 Courier & Logistics</p>
      </div>
    `;

    const emailSent = await sendBrevoEmail({
      to: email,
      subject: "Reset Your Fastway Send Password",
      htmlContent: html,
    });

    if (!emailSent) {
      console.error("Brevo failed to send the reset email. Check your BREVO_API_KEY.");
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "If the email exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}