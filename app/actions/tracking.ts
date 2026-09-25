"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function getTrackingDetails(formData: FormData) {
  const trackingNumber = formData.get("trackingNumber") as string
  const supabase = await createSupabaseServerClient()

  // 1. Fetch the main shipment record
  const { data: shipment, error: shipmentError } = await supabase
    .from("shipments")
    .select("*")
    .eq("tracking_number", trackingNumber.toUpperCase())
    .single()

  if (shipmentError || !shipment) {
    return { error: "No shipment found with that tracking number." }
  }

  // 2. Fetch the tracking timeline updates
  const { data: updates } = await supabase
    .from("shipment_updates")
    .select("*")
    .eq("shipment_id", shipment.id)
    .order("timestamp", { ascending: false })

  return { shipment, updates }
}