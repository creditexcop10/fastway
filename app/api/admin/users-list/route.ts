import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all non-admin users with their emails
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .neq("role", "admin")
    .order("full_name", { ascending: true });

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  // Get emails from auth
  const usersWithEmails = [];
  for (const profile of profiles || []) {
    const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
    usersWithEmails.push({
      id: profile.id,
      full_name: profile.full_name,
      email: userData?.user?.email || "",
    });
  }

  return NextResponse.json({ users: usersWithEmails });
}