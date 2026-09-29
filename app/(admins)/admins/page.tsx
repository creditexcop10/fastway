import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { Package, Users, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function AdminOverviewPage() {
  const supabaseAdmin = createSupabaseAdminClient();

  // Fetch Stats (Filter out admins from total users count)
  const { count: totalShipments } = await supabaseAdmin.from("shipments").select("*", { count: "exact", head: true });
  const { count: totalUsers } = await supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).neq("role", "admin");
  const { count: pendingShipments } = await supabaseAdmin.from("shipments").select("*", { count: "exact", head: true }).eq("status", "pending");
  const { count: deliveredShipments } = await supabaseAdmin.from("shipments").select("*", { count: "exact", head: true }).eq("status", "delivered");

  // Fetch Recent Data (Filter out admins from recent users)
  const { data: recentShipments } = await supabaseAdmin
    .from("shipments")
    .select("tracking_number, status, created_at, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentUsers } = await supabaseAdmin
    .from("profiles")
    .select("full_name, role, created_at")
    .neq("role", "admin")
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    { label: "Total Shipments", value: totalShipments || 0, icon: Package, color: "text-blue-500" },
    { label: "Total Users", value: totalUsers || 0, icon: Users, color: "text-purple-500" },
    { label: "Pending", value: pendingShipments || 0, icon: Clock, color: "text-orange-500" },
    { label: "Delivered", value: deliveredShipments || 0, icon: CheckCircle2, color: "text-green-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primary">Admin Overview</h1>
        <p className="text-muted-foreground">System-wide statistics and recent activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="font-heading text-3xl font-bold text-primary">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Shipments */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="font-heading text-xl font-bold text-primary">Recent Shipments</h2>
            <Link href="/admins/shipments" className="text-sm text-accent hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y">
            {recentShipments && recentShipments.length > 0 ? (
              recentShipments.map((ship: any) => {
                // Handle Supabase join returning an array or object
                const customerName = Array.isArray(ship.profiles) 
                  ? ship.profiles[0]?.full_name 
                  : ship.profiles?.full_name;

                return (
                  <div key={ship.tracking_number} className="p-4 flex items-center justify-between hover:bg-muted/30">
                    <div>
                      <p className="font-mono text-sm font-medium text-primary">{ship.tracking_number}</p>
                      <p className="text-xs text-muted-foreground">{customerName || "Unknown User"}</p>
                    </div>
                    <Badge variant="secondary" className="capitalize">{ship.status.replace("_", " ")}</Badge>
                  </div>
                );
              })
            ) : (
              <p className="p-8 text-center text-sm text-muted-foreground">No shipments yet.</p>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="font-heading text-xl font-bold text-primary">Recent Users</h2>
            <Link href="/admins/users" className="text-sm text-accent hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y">
            {recentUsers && recentUsers.length > 0 ? (
              recentUsers.map((user: any) => (
                <div key={user.id || user.full_name + user.created_at} className="p-4 flex items-center justify-between hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-primary">
                      {user.full_name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">{user.full_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"} className="capitalize">{user.role}</Badge>
                </div>
              ))
            ) : (
              <p className="p-8 text-center text-sm text-muted-foreground">No users yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}