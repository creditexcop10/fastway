"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateShipmentStatus(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Double check admin role on the server
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    throw new Error("Unauthorized: You are not an admin.")
  }

  const shipmentId = formData.get("shipment_id") as string
  const newStatus = formData.get("status") as string

  // 1. Update the shipment status
  const { error: updateError } = await supabase
    .from("shipments")
    .update({ status: newStatus })
    .eq("id", shipmentId)

  if (updateError) {
    console.error("Failed to update status:", updateError)
    return
  }

  // 2. Add a record to the tracking timeline (shipment_updates)
  // This is what makes the public tracking page work!
  await supabase
    .from("shipment_updates")
    .insert({
      shipment_id: shipmentId,
      status: newStatus,
      location: "Sorting Facility", // Static for now, could be a form input
      description: `Shipment status updated to ${newStatus.replace("_", " ")}`,
    })

  // Later, we will trigger Brevo to send an email to the customer right here.

  revalidatePath("/admins/shipments")
  redirect("/admins/shipments")
}