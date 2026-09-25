import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { UpdateStatusForm } from "@/components/admin/UpdateStatusForm";

export default async function AdminShipmentsPage() {
  // Use the admin client to bypass RLS and see all shipments
  const supabaseAdmin = createSupabaseAdminClient();
  
  const { data: shipments } = await supabaseAdmin
    .from("shipments")
    .select(`
      *,
      profiles ( full_name )
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primary">Manage Shipments</h1>
        <p className="text-muted-foreground">Update tracking statuses for all customers.</p>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Tracking #</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Freight Type</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Current Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Update Status</th>
              </tr>
            </thead>
            <tbody>
              {shipments && shipments.length > 0 ? (
                shipments.map((shipment) => (
                  <tr key={shipment.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-4 font-medium">{shipment.profiles?.full_name || "Unknown"}</td>
                    <td className="p-4 font-mono text-primary">{shipment.tracking_number}</td>
                    <td className="p-4 capitalize">{shipment.freight_type}</td>
                    <td className="p-4 capitalize">
                      <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs">
                        {shipment.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4">
                      <UpdateStatusForm shipmentId={shipment.id} currentStatus={shipment.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No shipments in the system yet.
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