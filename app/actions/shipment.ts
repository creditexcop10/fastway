"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { sendBrevoEmail } from "@/lib/brevo"

export async function createShipment(formData: FormData): Promise<{ error?: string; tracking_number?: string }> {
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

  const trackingNumber = generateTrackingNumber()

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
    
    // Payment (no cost calculation, but keep payment methods)
    total_cost: 0,
    payment_method: formData.get("payment_method") as string,
    payment_hash: null,
    payment_status: "pending",
    
    // Status
    status: "pending",
  }

  const { error } = await supabase.from("shipments").insert([newShipment])

  if (error) {
    console.error("Error creating shipment:", error)
    return { error: "Database error: Could not create shipment." }
  }

  // Send Alert Email to Admin via Brevo
  const adminHtml = `
    <h2>New Shipment Booked</h2>
    <p>A user just booked a shipment.</p>
    <ul>
      <li><strong>Tracking #:</strong> ${trackingNumber}</li>
      <li><strong>Sender:</strong> ${newShipment.sender_name}</li>
      <li><strong>Phone:</strong> ${newShipment.sender_phone}</li>
      <li><strong>Nearest Airport:</strong> ${newShipment.nearest_airport}</li>
      <li><strong>Destination:</strong> ${newShipment.destination_address}</li>
      <li><strong>Freight Type:</strong> ${newShipment.freight_type}</li>
      <li><strong>Weight:</strong> ${newShipment.weight} kg</li>
      <li><strong>Payment Method:</strong> ${newShipment.payment_method || "N/A"}</li>
      <li><strong>TXN Hash:</strong> ${newShipment.payment_hash || "N/A"}</li>
    </ul>
  `;

  await sendBrevoEmail({
    to: "support@fastwaysending.com",
    subject: `New Shipment Booked: ${trackingNumber}`,
    htmlContent: adminHtml
  });

  return { tracking_number: trackingNumber }
}