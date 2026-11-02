"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { sendBrevoEmail } from "@/lib/brevo"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateShipmentStatus(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const supabaseAdmin = createSupabaseAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: adminProfile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (adminProfile?.role !== "admin") {
    throw new Error("Unauthorized: You are not an admin.")
  }

  const shipmentId = formData.get("shipment_id") as string
  const newStatus = formData.get("status") as string

  // 1. Update the shipment status
  const { error: updateError } = await supabaseAdmin
    .from("shipments")
    .update({ status: newStatus })
    .eq("id", shipmentId)

  if (updateError) {
    console.error("Failed to update status:", updateError)
    return
  }

  // 2. Add a record to the tracking timeline
  await supabaseAdmin
    .from("shipment_updates")
    .insert({
      shipment_id: shipmentId,
      status: newStatus,
      location: "Sorting Facility", 
      description: `Shipment status updated to ${newStatus.replace("_", " ")}`,
    })

  // 3. Fetch shipment details for email and notification
  const { data: shipment } = await supabaseAdmin
    .from("shipments")
    .select("tracking_number, user_id")
    .eq("id", shipmentId)
    .single()

  if (shipment) {
    // 3a. Insert In-App Notification for the customer
    await supabaseAdmin.from("notifications").insert({
      user_id: shipment.user_id,
      title: "Shipment Status Updated",
      message: `Your shipment ${shipment.tracking_number} is now ${newStatus.replace("_", " ")}.`
    })

    // 3b. Send Brevo Email to the customer
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(shipment.user_id)
    if (userData?.user?.email) {
      const formattedStatus = newStatus.replace("_", " ")
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #1b3e69;">Shipment Update: ${shipment.tracking_number}</h2>
          <p>Your shipment status has been updated to: <strong style="color: #ff5e02; text-transform: capitalize;">${formattedStatus}</strong>.</p>
          <p>You can track your shipment live here: <a href="https://fastwaysending.com">fastwaysending.com</a></p>
        </div>
      `
      await sendBrevoEmail({
        to: userData.user.email,
        subject: `Update on shipment ${shipment.tracking_number}`,
        htmlContent: html
      })
    }
  }

  revalidatePath("/admins/shipments")
}

export async function confirmPayment(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const supabaseAdmin = createSupabaseAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: adminProfile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (adminProfile?.role !== "admin") {
    throw new Error("Unauthorized")
  }

  const shipmentId = formData.get("shipment_id") as string

  // 1. Update payment status
  const { data: shipment } = await supabaseAdmin
    .from("shipments")
    .update({ payment_status: "paid" })
    .eq("id", shipmentId)
    .select("user_id, tracking_number")
    .single()

  if (shipment) {
    // 2. Insert In-App Notification for the customer
    await supabaseAdmin.from("notifications").insert({
      user_id: shipment.user_id,
      title: "Payment Confirmed",
      message: `Payment for shipment ${shipment.tracking_number} has been confirmed. It is now being processed.`
    })

    // 3. Send Brevo Email to the customer
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(shipment.user_id)
    if (userData?.user?.email) {
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #1b3e69;">Payment Confirmed!</h2>
          <p>We have received your payment for shipment <strong>${shipment.tracking_number}</strong>.</p>
          <p>Your shipment is now being processed and will be dispatched shortly.</p>
        </div>
      `
      await sendBrevoEmail({
        to: userData.user.email,
        subject: `Payment Confirmed for ${shipment.tracking_number}`,
        htmlContent: html
      })
    }
  }

  revalidatePath("/admins/shipments")
}

export async function deleteShipment(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const supabaseAdmin = createSupabaseAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: adminProfile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (adminProfile?.role !== "admin") {
    throw new Error("Unauthorized")
  }

  const shipmentId = formData.get("shipment_id") as string

  await supabaseAdmin
    .from("shipments")
    .delete()
    .eq("id", shipmentId)

  revalidatePath("/admins/shipments")
}

export async function setShipmentPrice(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const supabaseAdmin = createSupabaseAdminClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: adminProfile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (adminProfile?.role !== "admin") {
    throw new Error("Unauthorized")
  }

  const shipmentId = formData.get("shipment_id") as string
  const price = parseFloat(formData.get("price") as string)

  // Update the shipment with the price
  const { data: shipment } = await supabaseAdmin
    .from("shipments")
    .update({ total_cost: price })
    .eq("id", shipmentId)
    .select("user_id, tracking_number, payment_method")
    .single()

  if (shipment) {
    // Send in-app notification
    await supabaseAdmin.from("notifications").insert({
      user_id: shipment.user_id,
      title: "Price Set — Payment Required",
      message: `Your shipment ${shipment.tracking_number} costs $${price.toFixed(2)}. Please complete payment using ${shipment.payment_method?.toUpperCase() || "your selected method"}.`
    })

    // Send email with payment instructions
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(shipment.user_id)
    if (userData?.user?.email) {
      const btcAddress = "bc1q7w56j35gqvqa8pe7js4fp3z3xcat8ewexrmujs"
      const erc20Address = "0xbd8D9284c436Aa3f175A92b5Ff6C57E1cfd1D080"
      
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #1b3e69;">Payment Required for Shipment ${shipment.tracking_number}</h2>
          <p>Your shipment has been reviewed. The total cost is:</p>
          <h1 style="color: #ff5e02; font-size: 36px;">$${price.toFixed(2)}</h1>
          <p>Please complete your payment using your selected method (${shipment.payment_method?.toUpperCase() || "Crypto"}):</p>
          ${shipment.payment_method === "btc" ? `<p><strong>BTC Address:</strong><br><span style="font-family: monospace; word-break: break-all;">bc1q7w56j35gqvqa8pe7js4fp3z3xcat8ewexrmujs</span></p>` : "bc1q7w56j35gqvqa8pe7js4fp3z3xcat8ewexrmujs"}
          ${shipment.payment_method === "erc20" ? `<p><strong>ERC-20 Address:</strong><br><span style="font-family: monospace; word-break: break-all;">0xbd8D9284c436Aa3f175A92b5Ff6C57E1cfd1D080</span></p>`: "0xbd8D9284c436Aa3f175A92b5Ff6C57E1cfd1D080" }
          <p>Once payment is received and verified, your shipment will be processed immediately.</p>
          <br>
          <p style="font-size: 12px; color: #888;">Fastway Send Ltd | 24/7 Courier & Logistics</p>
        </div>
      `
      
      await sendBrevoEmail({
        to: userData.user.email,
        subject: `Payment Required: $${price.toFixed(2)} for ${shipment.tracking_number}`,
        htmlContent: html
      })
    }
  }

  revalidatePath("/admins/shipments")
}