import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Use Admin client to bypass RLS
  const supabaseAdmin = createSupabaseAdminClient();
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login?reason=session_expired");
  }

  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen w-full flex bg-muted/40">
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-50 w-64 flex-col">
        <AdminSidebar />
      </aside>
      
      <div className="flex-1 flex flex-col w-full md:pl-64">
        <AdminHeader />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}