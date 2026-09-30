"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { sendBrevoEmail } from "@/lib/brevo"

export async function createShipment(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to book a shipment." }
  }

  const generateTrackingNumber = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let id = "FWS-"
    for (let i = 0; i < 4; i++) id += chars.charAt(Math.floor(Math.random() * chars.length))
    id += "-"
    for (let i = 0; i < 4; i++) id += chars.charAt(Math.floor(Math.random() * chars.length))
    return id
  }

  const trackingNumber = generateTrackingNumber();

  const newShipment = {
    user_id: user.id,
    tracking_number: trackingNumber,
    
    // Sender Info
    sender_name: formData.get("sender_name") as string,
    sender_email: formData.get("sender_email") as string,
    sender_phone: formData.get("sender_phone") as string,
    sender_country: formData.get("sender_country") as string,
    nearest_airport: formData.get("nearest_airport") as string,
    origin_address: formData.get("origin_address") as string,
    
    // Delivery Info
    destination_address: formData.get("destination_address") as string,
    freight_type: formData.get("freight_type") as string,
    weight: parseFloat(formData.get("weight") as string),
    
    // Payment & Status
    status: "pending", 
    total_cost: parseFloat(formData.get("total_cost") as string) || 0,
    payment_method: formData.get("payment_method") as string,
    payment_hash: formData.get("payment_hash") as string,
    payment_status: "pending"
  }

  const { error } = await supabase.from("shipments").insert([newShipment])

  if (error) {
    console.error("Error creating shipment:", error)
    return { error: "Database error: Could not create shipment." }
  }

  // Send Alert Email to Admin via Brevo
  const adminHtml = `
    <h2>New Shipment Booking Pending Verification</h2>
    <p>A user just booked a shipment and submitted a crypto payment hash.</p>
    <ul>
      <li><strong>Tracking #:</strong> ${trackingNumber}</li>
      <li><strong>Payment Method:</strong> ${newShipment.payment_method}</li>
      <li><strong>TXN Hash:</strong> ${newShipment.payment_hash}</li>
      <li><strong>Total Cost:</strong> $${newShipment.total_cost}</li>
    </ul>
    <p>Please verify the transaction on the blockchain and update the shipment status.</p>
  `;

  await sendBrevoEmail({
    to: "support@fastwaysending.com",
    subject: `Action Required: Verify Payment for ${trackingNumber}`,
    htmlContent: adminHtml
  });

  return { success: true }
}