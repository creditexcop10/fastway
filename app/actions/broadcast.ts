"use server"

import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { sendBrevoEmail } from "@/lib/brevo"
import { revalidatePath } from "next/cache"

export async function sendBroadcast(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const supabaseAdmin = createSupabaseAdminClient()
  const subject = formData.get("subject") as string
  const message = formData.get("message") as string
  const recipientId = formData.get("recipient_id") as string | null

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #1b3e69;">${subject}</h2>
      <p>${message}</p>
      <br>
      <p style="font-size: 12px; color: #888;">Fastway Send Ltd | 24/7 Courier & Logistics</p>
    </div>
  `

  // Individual mode
  if (recipientId) {
    await supabaseAdmin.from("notifications").insert({
      user_id: recipientId,
      title: subject,
      message: message
    })

    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(recipientId)
    if (userData?.user?.email) {
      await sendBrevoEmail({
        to: userData.user.email,
        subject: subject,
        htmlContent: html
      })
    }

    revalidatePath("/admins/broadcasts")
    return { success: true }
  }

  // Broadcast mode (all customers)
  const { data: users } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("role", "customer")

  if (!users || users.length === 0) return { error: "No customers found." }

  for (const user of users) {
    await supabaseAdmin.from("notifications").insert({
      user_id: user.id,
      title: subject,
      message: message
    })

    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(user.id)
    if (userData?.user?.email) {
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