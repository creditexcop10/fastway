"use client"

import { createShipment } from "@/app/actions/shipment"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Loader2, ArrowRight } from "lucide-react"

export function BookShipmentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    await createShipment(formData)
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="origin_address">Origin Address</Label>
          <Input id="origin_address" name="origin_address" placeholder="123 Main St, New York, NY" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="destination_address">Destination Address</Label>
          <Input id="destination_address" name="destination_address" placeholder="456 Market St, London, UK" required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="freight_type">Freight Type</Label>
          <select 
            id="freight_type" 
            name="freight_type" 
            required
            className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="air">Air Freight</option>
            <option value="sea">Sea Freight</option>
            <option value="road">Road Transport</option>
            <option value="courier">Courier Services</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input id="weight" name="weight" type="number" step="0.1" min="0.1" placeholder="e.g. 25.5" required />
        </div>
      </div>

      <Button 
        type="submit" 
        size="lg" 
        className="w-full md:w-auto min-w-[200px] bg-accent text-accent-foreground hover:bg-accent/90 group" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Booking...
          </>
        ) : (
          <>
            Book Shipment
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </Button>
    </form>
  )
}