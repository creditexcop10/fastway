"use server"

import { sendBrevoEmail } from "@/lib/brevo"
import { revalidatePath } from "next/cache"

export async function replyToContact(formData: FormData) {
  const email = formData.get("email") as string
  const subject = formData.get("subject") as string
  const message = formData.get("message") as string

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #1b3e69;">Fastway Send Support</h2>
      <p>${message}</p>
      <br>
      <p style="font-size: 12px; color: #888;">Fastway Send Ltd | 24/7 Courier & Logistics</p>
    </div>
  `

  await sendBrevoEmail({
    to: email,
    subject: subject,
    htmlContent: html
  })

  revalidatePath("/admins/contacts")
}