import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { PackageSearch } from "lucide-react";

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-primary">My Shipments</h1>
          <p className="text-muted-foreground">View and track all your active and past shipments.</p>
        </div>
        <Link href="/dashboard/book" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-accent text-accent-foreground hover:bg-accent/90">
          Book New Shipment
        </Link>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground">Tracking #</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Origin</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Destination</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Cost</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Pay Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Ship Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {shipments && shipments.length > 0 ? (
                shipments.map((shipment) => (
                  <tr key={shipment.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono font-medium text-primary">{shipment.tracking_number}</td>
                    <td className="p-4 max-w-[200px] truncate text-muted-foreground">{shipment.origin_address}</td>
                    <td className="p-4 max-w-[200px] truncate text-muted-foreground">{shipment.destination_address}</td>
                    <td className="p-4 font-bold text-primary">${shipment.total_cost || "0.00"}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-xs capitalize font-medium ${
                        shipment.payment_status === 'paid' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {shipment.payment_status || "N/A"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs capitalize">
                        {shipment.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(shipment.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8">
                    <div className="flex flex-col items-center justify-center text-center py-10">
                      <PackageSearch className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-bold text-primary mb-1">No shipments yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">You haven't booked any shipments. Let's get started!</p>
                      <Link href="/dashboard/book" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-accent text-accent-foreground hover:bg-accent/90">
                        Book Your First Shipment
                      </Link>
                    </div>
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