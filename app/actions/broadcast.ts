"use server"

import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { sendBrevoEmail } from "@/lib/brevo"
import { revalidatePath } from "next/cache"

export async function sendBroadcast(formData: FormData) {
  const supabaseAdmin = createSupabaseAdminClient()
  const subject = formData.get("subject") as string
  const message = formData.get("message") as string

  // 1. Fetch all customer profiles
  const { data: users } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("role", "customer")

  if (!users) return { error: "No users found." }

  // 2. Loop through users and send email + create notification
  // Note: In a production app with 10,000+ users, you'd use a background job (Queues) for this.
  // For our scope, this synchronous loop is perfectly fine.
  for (const user of users) {
    // Insert In-App Notification
    await supabaseAdmin.from("notifications").insert({
      user_id: user.id,
      title: subject,
      message: message
    })

    // Fetch Email and Send via Brevo
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(user.id)
    if (userData?.user?.email) {
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #1b3e69;">${subject}</h2>
          <p>${message}</p>
          <br>
          <p style="font-size: 12px; color: #888;">Fastway Send Ltd | 24/7 Courier & Logistics</p>
        </div>
      `
      await sendBrevoEmail({
        to: userData.user.email,
        subject: subject,
        htmlContent: html
      })
    }
  }

  revalidatePath("/admins/broadcasts")
  return { success: true }
}