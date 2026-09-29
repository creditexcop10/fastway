"use client";

import { deleteShipment } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteShipmentButton({ shipmentId }: { shipmentId: string }) {
  return (
    <form 
      action={deleteShipment}
      onSubmit={(e) => {
        if (!confirm("Are you sure you want to delete this shipment? This action cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="shipment_id" value={shipmentId} />
      <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
        <Trash2 className="h-4 w-4" />
      </Button>
    </form>
  );
}