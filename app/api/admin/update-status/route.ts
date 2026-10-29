import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { geocodeAddress } from "@/lib/geocode";
import { sendBrevoEmail } from "@/lib/brevo";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const shipmentId = formData.get("shipment_id") as string;
    const newStatus = formData.get("status") as string;
    const location = formData.get("location") as string || "Sorting Facility";
    const description = formData.get("description") as string || `Shipment status updated to ${newStatus.replace("_", " ")}`;
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Update shipment status
    const { error: updateError } = await supabase
      .from("shipments")
      .update({ status: newStatus })
      .eq("id", shipmentId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 2. Geocode the location for the map
    let lat = null;
    let lng = null;
    
    if (location && location !== "Sorting Facility") {
      const coords = await geocodeAddress(location);
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
      }
      await new Promise(resolve => setTimeout(resolve, 1500)); // Rate limit
    }

    // 3. Add to timeline with coordinates
    const { error: timelineError } = await supabase
      .from("shipment_updates")
      .insert({
        shipment_id: shipmentId,
        status: newStatus,
        location: location,
        description: description,
        lat: lat,
        lng: lng,
      });

    if (timelineError) {
      console.error("Timeline insert error:", timelineError);
    }

    // 4. Fetch shipment details for notifications
    const { data: shipment } = await supabase
      .from("shipments")
      .select("tracking_number, user_id")
      .eq("id", shipmentId)
      .single();

    if (shipment) {
      // 5. Insert notification
      await supabase.from("notifications").insert({
        user_id: shipment.user_id,
        title: "Shipment Status Updated",
        message: `Your shipment ${shipment.tracking_number} is now ${newStatus.replace("_", " ")}. ${location ? `Current location: ${location}` : ""}`
      });

      // 6. Send email
      const { data: userData } = await supabase.auth.admin.getUserById(shipment.user_id);
      if (userData?.user?.email) {
        const html = `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
            <h2 style="color: #1b3e69;">Shipment Update: ${shipment.tracking_number}</h2>
            <p>Your shipment status has been updated to: <strong style="color: #ff5e02; text-transform: capitalize;">${newStatus.replace("_", " ")}</strong>.</p>
            ${location ? `<p><strong>Current Location:</strong> ${location}</p>` : ""}
            ${description ? `<p><strong>Details:</strong> ${description}</p>` : ""}
            <p>Track your shipment live here: <a href="https://fastwaysending.com">fastwaysending.com</a></p>
          </div>
        `;
        
        await sendBrevoEmail({
          to: userData.user.email,
          subject: `Update on shipment ${shipment.tracking_number}`,
          htmlContent: html
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}