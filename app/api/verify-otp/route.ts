import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Missing email or code" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // FORCE LOWERCASE AND TRIM to match the send-otp logic exactly
    const normalizedEmail = String(email).trim().toLowerCase();

    // 1. Fetch the code from the database
    const { data, error } = await supabase
      .from("otp_codes")
      .select("code, expires_at")
      .eq("email", normalizedEmail)
      .single();

    // 2. Better Error Message: Don't tell them to register again, just say it's invalid
    if (error || !data) {
      return NextResponse.json({ error: "Invalid email or code. Please request a new code." }, { status: 400 });
    }

    // 3. Check if code matches
    if (data.code !== code) {
      return NextResponse.json({ error: "Invalid code. Please check and try again." }, { status: 400 });
    }

    // 4. Check if code is expired
    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 400 });
    }

    // 5. Success! Delete the code so it can't be reused
    await supabase.from("otp_codes").delete().eq("email", normalizedEmail);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}