"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createShipment(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Generate a random tracking number (e.g., FWS-XXXX-XXXX)
  const generateTrackingNumber = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let id = "FWS-"
    for (let i = 0; i < 4; i++) id += chars.charAt(Math.floor(Math.random() * chars.length))
    id += "-"
    for (let i = 0; i < 4; i++) id += chars.charAt(Math.floor(Math.random() * chars.length))
    return id
  }

  const newShipment = {
    user_id: user.id,
    tracking_number: generateTrackingNumber(),
    origin_address: formData.get("origin_address") as string,
    destination_address: formData.get("destination_address") as string,
    freight_type: formData.get("freight_type") as string,
    weight: parseFloat(formData.get("weight") as string),
    status: "pending", // All new shipments start as pending
  }

  const { error } = await supabase.from("shipments").insert([newShipment])

  if (error) {
    console.error("Error creating shipment:", error)
    // In a real app, you'd return a structured error message to the UI
    redirect("/dashboard/book?error=Could not create shipment")
  }

  // Refresh the cache for the shipments page so the new data shows up
  revalidatePath("/dashboard/shipments")
  redirect("/dashboard/shipments")
}