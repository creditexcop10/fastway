import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Package, Truck, CheckCircle2, Clock } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: shipments } = await supabase
    .from("shipments")
    .select("*")
    .eq("user_id", user?.id);

  const totalShipments = shipments?.length || 0;
  const inTransit = shipments?.filter(s => s.status === 'in_transit').length || 0;
  const delivered = shipments?.filter(s => s.status === 'delivered').length || 0;
  const pending = shipments?.filter(s => s.status === 'pending').length || 0;

  const stats = [
    { label: "Total Shipments", value: totalShipments, icon: Package, color: "text-blue-500" },
    { label: "In Transit", value: inTransit, icon: Truck, color: "text-orange-500" },
    { label: "Delivered", value: delivered, icon: CheckCircle2, color: "text-green-500" },
    { label: "Pending", value: pending, icon: Clock, color: "text-yellow-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primary">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="font-heading text-3xl font-bold text-primary">{stat.value}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="p-6 border-b">
          <h2 className="font-heading text-xl font-bold text-primary">Recent Shipments</h2>
        </div>
        <div className="p-6">
          {shipments && shipments.length > 0 ? (
            <div className="space-y-4">
              {/* We will map shipments here later */}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">You have no shipments yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}