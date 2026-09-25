import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { Package, Users, Clock, CheckCircle2 } from "lucide-react";

export default async function AdminOverviewPage() {
  const supabaseAdmin = createSupabaseAdminClient();

  const { count: totalShipments } = await supabaseAdmin.from("shipments").select("*", { count: "exact", head: true });
  const { count: totalUsers } = await supabaseAdmin.from("profiles").select("*", { count: "exact", head: true });
  const { count: pendingShipments } = await supabaseAdmin.from("shipments").select("*", { count: "exact", head: true }).eq("status", "pending");
  const { count: deliveredShipments } = await supabaseAdmin.from("shipments").select("*", { count: "exact", head: true }).eq("status", "delivered");

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
        <p className="text-muted-foreground">System-wide statistics and metrics.</p>
      </div>

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
    </div>
  );
}