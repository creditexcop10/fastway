"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";

export function SetPriceButton({ shipmentId, currentPrice }: { shipmentId: string; currentPrice: number }) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(currentPrice ? currentPrice.toString() : "");
  const [loading, setLoading] = useState(false);

  if (currentPrice && currentPrice > 0) {
    return (
      <span className="font-bold text-primary text-sm">${currentPrice.toFixed(2)}</span>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append("shipment_id", shipmentId);
    formData.append("price", price);
    
    try {
      const res = await fetch("/api/admin/set-price", {
        method: "POST",
        body: formData,
      });
      
      if (res.ok) {
        toast.success("Price set! Customer has been notified.");
        setOpen(false);
        setPrice("");
      } else {
        toast.error("Failed to set price.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Removed asChild — styles applied directly */}
      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium h-8 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground">
        <DollarSign className="h-3 w-3 mr-1" /> Set Price
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Set Shipment Price</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g. 250.00"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-8"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              The customer will receive an email and notification with this price and payment instructions.
            </p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Setting...</> : "Set Price & Notify"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}