import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Use Admin client to bypass RLS and guarantee we get the role
  const supabaseAdmin = createSupabaseAdminClient();
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // TRAFFIC COP: If they are an admin, send them to the admin panel
  if (profile?.role === "admin") {
    redirect("/admins");
  }

  // If there's no profile at all, something is wrong, send to login
  if (!profile) {
    redirect("/login?reason=profile_missing");
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
    </div>
  );
}