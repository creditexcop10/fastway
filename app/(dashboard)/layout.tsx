import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ChatWidget } from "@/components/dashboard/ChatWidget";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const supabaseAdmin = createSupabaseAdminClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Use Admin Client to bypass RLS and timing issues
  let { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // SELF-HEALING: If profile is missing, create it!
  if (!profile) {
    const { data: newProfile } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || "New User",
        role: "customer"
      })
      .select("*")
      .single();
      
    profile = newProfile;
  }

  // TRAFFIC COP: If they are an admin, send them to the admin panel
  if (profile?.role === "admin") {
    redirect("/admins");
  }

  return (
    <div className="min-h-screen w-full flex bg-muted/40">
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-50 w-64 flex-col">
        <DashboardSidebar profile={profile} />
      </aside>
      
      <div className="flex-1 flex flex-col w-full md:pl-64">
        <DashboardHeader profile={profile} />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
      <ChatWidget userId={user.id}/>
    </div>
  );
}