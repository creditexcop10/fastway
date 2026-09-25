import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge"; // Make sure to add this via npx shadcn@latest add badge

export default async function MyShipmentsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: shipments } = await supabase
    .from("shipments")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primary">My Shipments</h1>
        <p className="text-muted-foreground">View and track all your active and past shipments.</p>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground">Tracking #</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Origin</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Destination</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {shipments && shipments.length > 0 ? (
                shipments.map((shipment) => (
                  <tr key={shipment.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono font-medium text-primary">{shipment.tracking_number}</td>
                    <td className="p-4 max-w-[200px] truncate">{shipment.origin_address}</td>
                    <td className="p-4 max-w-[200px] truncate">{shipment.destination_address}</td>
                    <td className="p-4">
                      <Badge variant={shipment.status === "delivered" ? "default" : "secondary"} className="capitalize">
                        {shipment.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(shipment.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No shipments found. <a href="/dashboard/book" className="text-accent hover:underline">Book one now.</a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}