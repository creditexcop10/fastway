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
    
    const normalizedEmail = email.toLowerCase();

    const { data, error } = await supabase
      .from("otp_codes")
      .select("code, expires_at")
      .eq("email", normalizedEmail)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "No code found. Please register again." }, { status: 400 });
    }

    if (data.code !== code) {
      return NextResponse.json({ error: "Invalid code. Please check and try again." }, { status: 400 });
    }

    if (new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 400 });
    }

    // Delete the code so it can't be reused
    await supabase.from("otp_codes").delete().eq("email", normalizedEmail);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}