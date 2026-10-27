"use server"

import { createSupabaseAdminClient } from "@/lib/supabase/admin"

export async function getTrackingDetails(formData: FormData) {
  const trackingNumber = formData.get("trackingNumber") as string
  
  if (!trackingNumber) {
    return { error: "Please enter a tracking number." }
  }

  // Use Admin Client to bypass RLS — tracking is a public feature
  const supabaseAdmin = createSupabaseAdminClient()

  // 1. Fetch the main shipment record (case-insensitive lookup)
  const { data: shipment, error: shipmentError } = await supabaseAdmin
    .from("shipments")
    .select("*")
    .ilike("tracking_number", trackingNumber.trim())
    .single()

  if (shipmentError || !shipment) {
    return { error: "No shipment found with that tracking number. Please check and try again." }
  }

  // 2. Fetch the tracking timeline updates
  const { data: updates } = await supabaseAdmin
    .from("shipment_updates")
    .select("*")
    .eq("shipment_id", shipment.id)
    .order("timestamp", { ascending: false })

  return { shipment, updates }
}