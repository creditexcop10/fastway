import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendBrevoEmail } from "@/lib/brevo";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const shipmentId = formData.get("shipment_id") as string;
    const price = parseFloat(formData.get("price") as string);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update shipment price
    const { data: shipment, error: updateError } = await supabase
      .from("shipments")
      .update({ total_cost: price })
      .eq("id", shipmentId)
      .select("user_id, tracking_number, payment_method")
      .single();

    if (updateError || !shipment) {
      return NextResponse.json({ error: "Failed to update price" }, { status: 500 });
    }

    // Insert notification
    await supabase.from("notifications").insert({
      user_id: shipment.user_id,
      title: "Price Set — Payment Required",
      message: `Your shipment ${shipment.tracking_number} costs $${price.toFixed(2)}. Please complete payment using ${shipment.payment_method?.toUpperCase() || "your selected method"}.`
    });

    // Send email with payment instructions
    const { data: userData } = await supabase.auth.admin.getUserById(shipment.user_id);
    if (userData?.user?.email) {
      const btcAddress = process.env.NEXT_PUBLIC_BTC_ADDRESS || "N/A";
      const erc20Address = process.env.NEXT_PUBLIC_ERC20_ADDRESS || "N/A";
      
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #1b3e69;">Payment Required for Shipment ${shipment.tracking_number}</h2>
          <p>Your shipment has been reviewed. The total cost is:</p>
          <h1 style="color: #ff5e02; font-size: 36px;">$${price.toFixed(2)}</h1>
          <p>Please complete your payment using your selected method (${shipment.payment_method?.toUpperCase() || "Crypto"}):</p>
          ${shipment.payment_method === "btc" ? `<p><strong>BTC Address:</strong><br><span style="font-family: monospace; word-break: break-all;">${btcAddress}</span></p>` : ""}
          ${shipment.payment_method === "erc20" ? `<p><strong>ERC-20 Address:</strong><br><span style="font-family: monospace; word-break: break-all;">${erc20Address}</span></p>` : ""}
          <p>Once payment is received and verified, your shipment will be processed immediately.</p>
          <br>
          <p style="font-size: 12px; color: #888;">Fastway Send Ltd | 24/7 Courier & Logistics</p>
        </div>
      `;
      
      await sendBrevoEmail({
        to: userData.user.email,
        subject: `Payment Required: $${price.toFixed(2)} for ${shipment.tracking_number}`,
        htmlContent: html
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Set price error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}