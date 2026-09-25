import { BookShipmentForm } from "@/components/dashboard/BookShipmentForm";

export default function BookShipmentPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primary">Book a Shipment</h1>
        <p className="text-muted-foreground">Fill out the details below to create a new shipment request.</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
        <BookShipmentForm />
      </div>
    </div>
  );
}