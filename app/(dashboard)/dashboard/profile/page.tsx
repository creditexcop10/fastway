import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primary">My Profile</h1>
        <p className="text-muted-foreground">Update your personal details and contact information.</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}