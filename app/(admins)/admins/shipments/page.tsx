import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { UpdateStatusForm } from "@/components/admin/UpdateStatusForm";
import { confirmPayment } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteShipmentButton } from "@/components/admin/DeleteShipmentButton";

export default async function AdminShipmentsPage() {
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
        <p className="text-muted-foreground">Verify crypto payments and update tracking statuses.</p>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Tracking #</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Cost</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Pay Method</th>
                <th className="text-left p-4 font-medium text-muted-foreground">TXN Hash</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Pay Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Ship Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Update</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shipments && shipments.length > 0 ? (
                shipments.map((shipment: any) => {
                  const customerName = Array.isArray(shipment.profiles) 
                    ? shipment.profiles[0]?.full_name 
                    : shipment.profiles?.full_name;

                  return (
                    <tr key={shipment.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-4 font-medium">{customerName || "Unknown"}</td>
                      <td className="p-4 font-mono text-primary">{shipment.tracking_number}</td>
                      <td className="p-4 font-bold">${shipment.total_cost || "0.00"}</td>
                      <td className="p-4 uppercase text-xs">{shipment.payment_method || "N/A"}</td>
                      <td className="p-4 font-mono text-xs text-muted-foreground max-w-[150px] truncate">
                        {shipment.payment_hash || "N/A"}
                      </td>
                      <td className="p-4">
                        {shipment.payment_status === "pending" ? (
                          <form action={confirmPayment}>
                            <input type="hidden" name="shipment_id" value={shipment.id} />
                            <Button type="submit" size="sm" variant="destructive" className="h-8 text-xs">
                              Confirm Payment
                            </Button>
                          </form>
                        ) : (
                          <Badge variant="default" className="bg-green-500 hover:bg-green-500">Paid</Badge>
                        )}
                      </td>
                      <td className="p-4 capitalize">
                        <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs">
                          {shipment.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4">
                      <DeleteShipmentButton shipmentId={shipment.id} />
                    </td>
                      <td className="p-4">
                        <UpdateStatusForm shipmentId={shipment.id} currentStatus={shipment.status} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
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