import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { geocodeAddress } from "@/lib/geocode";

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all shipments with missing coordinates
  const { data: shipments, error } = await supabase
    .from("shipments")
    .select("id, tracking_number, origin_address, destination_address, sender_country, nearest_airport, origin_lat, destination_lat")
    .or("origin_lat.is.null,destination_lat.is.null");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!shipments || shipments.length === 0) {
    return NextResponse.json({ success: true, message: "No shipments need geocoding.", results: [] });
  }

  const results = [];

  for (const shipment of shipments) {
    console.log(`\n--- Processing: ${shipment.tracking_number} ---`);
    
    let originCoords = null;
    let destCoords = null;

    // Geocode origin if missing
    if (!shipment.origin_lat) {
      console.log(`[Backfill] Geocoding origin: ${shipment.origin_address}`);
      originCoords = await geocodeAddress(
        shipment.origin_address,
        shipment.sender_country,
        shipment.nearest_airport
      );
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Geocode destination if missing
    if (!shipment.destination_lat) {
      console.log(`[Backfill] Geocoding destination: ${shipment.destination_address}`);
      destCoords = await geocodeAddress(shipment.destination_address);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Build update object
    const update: any = {};
    if (originCoords) {
      update.origin_lat = originCoords.lat;
      update.origin_lng = originCoords.lng;
    }
    if (destCoords) {
      update.destination_lat = destCoords.lat;
      update.destination_lng = destCoords.lng;
    }

    // Update the database
    if (Object.keys(update).length > 0) {
      const { error: updateError } = await supabase
        .from("shipments")
        .update(update)
        .eq("id", shipment.id);

      if (updateError) {
        console.error(`[Backfill] DB update error for ${shipment.tracking_number}:`, updateError.message);
      }

      results.push({
        tracking: shipment.tracking_number,
        origin: originCoords ? `${originCoords.lat.toFixed(4)}, ${originCoords.lng.toFixed(4)}` : "FAILED",
        destination: destCoords ? `${destCoords.lat.toFixed(4)}, ${destCoords.lng.toFixed(4)}` : "FAILED"
      });
    } else {
      results.push({
        tracking: shipment.tracking_number,
        origin: "FAILED",
        destination: "FAILED"
      });
    }
  }

  console.log("\n=== Backfill Complete ===");
  console.table(results);

  return NextResponse.json({ 
    success: true, 
    totalProcessed: results.length,
    results 
  });
}