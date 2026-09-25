"use client";

import { updateShipmentStatus } from "@/app/actions/admin";
import { useState } from "react";

const statuses = ["pending", "picked_up", "in_transit", "out_for_delivery", "delivered", "cancelled"];

export function UpdateStatusForm({ shipmentId, currentStatus }: { shipmentId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    
    const formData = new FormData();
    formData.append("shipment_id", shipmentId);
    formData.append("status", newStatus);
    
    await updateShipmentStatus(formData);
  };

  return (
    <select 
      value={status} 
      onChange={handleChange}
      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring capitalize"
    >
      {statuses.map((s) => (
        <option key={s} value={s} className="capitalize">
          {s.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}