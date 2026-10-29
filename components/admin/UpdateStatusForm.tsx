"use client";

import { updateShipmentStatus } from "@/app/actions/admin";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const statuses = ["pending", "picked_up", "in_transit", "out_for_delivery", "delivered", "cancelled"];

export function UpdateStatusForm({ shipmentId, currentStatus }: { shipmentId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [showFields, setShowFields] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setShowFields(newStatus !== "pending" && newStatus !== "cancelled");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append("shipment_id", shipmentId);
    formData.append("status", status);
    if (location) formData.append("location", location);
    if (description) formData.append("description", description);
    
    try {
      // Use a simple fetch to the server action
      const res = await fetch("/api/admin/update-status", {
        method: "POST",
        body: formData,
      });
      
      if (res.ok) {
        toast.success("Status updated successfully!");
        setLocation("");
        setDescription("");
        setShowFields(false);
      } else {
        toast.error("Failed to update status.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
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
      
      {showFields && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <input
            type="text"
            placeholder="Location (e.g., JFK Airport)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
          />
          <input
            type="text"
            placeholder="Description (e.g., Package scanned at customs)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex h-9 w-full items-center justify-center rounded-md bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
          </button>
        </div>
      )}
    </form>
  );
}