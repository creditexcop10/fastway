"use client"

import { createShipment } from "@/app/actions/shipment"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Loader2, ArrowRight, Bitcoin, Coins, Copy, CheckCircle2, Package } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function BookShipmentForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("btc")
  
  const [formData, setFormData] = useState({
    sender_name: "",
    sender_email: "",
    sender_phone: "",
    origin_address: "",
    sender_country: "",
    nearest_airport: "",
    destination_address: "",
    freight_type: "air",
    weight: "",
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setIsSubmitting(true)
    
    const submitData = new FormData(form)
    submitData.set("payment_method", paymentMethod)
    
    const result = await createShipment(submitData) as { error?: string; tracking_number?: string }
    
    if (result?.error) {
      toast.error(result.error)
      setIsSubmitting(false)
    } else if (result?.tracking_number) {
      setTrackingNumber(result.tracking_number)
      toast.success("Shipment booked successfully!")
      form.reset()
      setIsSubmitting(false)
    }
  }

  const copyTracking = () => {
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber)
      setCopied(true)
      toast.success("Tracking number copied!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // SUCCESS SCREEN
  if (trackingNumber) {
    return (
      <div className="max-w-2xl">
        <div className="bg-card border rounded-3xl p-8 md:p-12 shadow-xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary mb-2">
            Shipment Booked Successfully!
          </h2>
          <p className="text-muted-foreground mb-8">
            Your tracking number has been generated. You can track your shipment immediately.
          </p>

          <div className="bg-muted/50 rounded-2xl p-6 mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Your Tracking Number
            </p>
            <div className="flex items-center justify-center gap-3">
              <p className="font-heading text-2xl md:text-3xl font-bold text-accent font-mono tracking-wider">
                {trackingNumber}
              </p>
              <button onClick={copyTracking} className="p-2 rounded-lg hover:bg-accent/10 transition-colors">
                {copied ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-muted-foreground" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto">
                <Package className="mr-2 h-4 w-4" /> Track My Shipment
              </Button>
            </Link>
            <Link href="/dashboard/shipments">
              <Button className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                View My Shipments <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <button 
            onClick={() => {
              setTrackingNumber(null)
              setFormData({
                sender_name: "", sender_email: "", sender_phone: "",
                origin_address: "", sender_country: "", nearest_airport: "",
                destination_address: "", freight_type: "air", weight: "",
              })
            }}
            className="mt-6 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            Book Another Shipment
          </button>
        </div>
      </div>
    )
  }

  // BOOKING FORM
  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      
      {/* Sender / Pickup Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-primary border-b pb-2">Sender / Pickup Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="sender_name">Full Name</Label>
            <Input id="sender_name" name="sender_name" placeholder="John Doe" required value={formData.sender_name} onChange={(e) => setFormData({...formData, sender_name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sender_email">Email Address</Label>
            <Input id="sender_email" name="sender_email" type="email" placeholder="john@example.com" required value={formData.sender_email} onChange={(e) => setFormData({...formData, sender_email: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sender_phone">Phone Number</Label>
            <Input id="sender_phone" name="sender_phone" type="tel" placeholder="+1 (555) 555-5555" required value={formData.sender_phone} onChange={(e) => setFormData({...formData, sender_phone: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sender_country">Country</Label>
            <Input id="sender_country" name="sender_country" placeholder="United States" required value={formData.sender_country} onChange={(e) => setFormData({...formData, sender_country: e.target.value})} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="origin_address">Home / Pickup Address</Label>
            <Input id="origin_address" name="origin_address" placeholder="123 Main St, New York, NY 10001" required value={formData.origin_address} onChange={(e) => setFormData({...formData, origin_address: e.target.value})} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="nearest_airport">Nearest Airport</Label>
            <Input id="nearest_airport" name="nearest_airport" placeholder="e.g., JFK, LAX, Heathrow" required value={formData.nearest_airport} onChange={(e) => setFormData({...formData, nearest_airport: e.target.value})} />
          </div>
        </div>
      </div>

      {/* Delivery Details */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-bold text-primary border-b pb-2">Delivery Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="destination_address">Destination Address</Label>
            <Input id="destination_address" name="destination_address" placeholder="456 Market St, London, UK" required value={formData.destination_address} onChange={(e) => setFormData({...formData, destination_address: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="freight_type">Freight Type</Label>
            <select id="freight_type" name="freight_type" required value={formData.freight_type} onChange={(e) => setFormData({...formData, freight_type: e.target.value})} className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="air">Air Freight</option>
              <option value="sea">Sea Freight</option>
              <option value="road">Road Transport</option>
              <option value="courier">Courier Services</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input id="weight" name="weight" type="number" step="0.1" min="0.1" placeholder="e.g. 25.5" required value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} />
          </div>
        </div>
      </div>

      {/* Payment Method (wallets only, no TXN hash) */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-bold text-primary border-b pb-2">Payment Method</h3>
        <p className="text-sm text-muted-foreground">Select your preferred payment method to view the wallet address.</p>
        
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setPaymentMethod("btc")} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${paymentMethod === "btc" ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground"}`}>
            <Bitcoin className="h-6 w-6" /><span className="text-xs font-medium">Bitcoin</span>
          </button>
          <button type="button" onClick={() => setPaymentMethod("erc20")} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${paymentMethod === "erc20" ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground"}`}>
            <Coins className="h-6 w-6" /><span className="text-xs font-medium">ERC-20</span>
          </button>
        </div>

        {paymentMethod === "btc" && (
          <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
            <p className="text-xs text-muted-foreground">Send BTC to:</p>
            <div className="flex justify-between items-center gap-2">
              <p className="font-mono font-medium text-xs break-all">bc1q7w56j35gqvqa8pe7js4fp3z3xcat8ewexrmujs</p>
              <Button type="button" size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText("bc1q7w56j35gqvqa8pe7js4fp3z3xcat8ewexrmujs"); toast.success("Address copied!") }}><Copy className="h-3 w-3" /></Button>
            </div>
          </div>
        )}

        {paymentMethod === "erc20" && (
          <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
            <p className="text-xs text-muted-foreground">Send USDT, USDC, or ETH to:</p>
            <div className="flex justify-between items-center gap-2">
              <p className="font-mono font-medium text-xs break-all">0xbd8D9284c436Aa3f175A92b5Ff6C57E1cfd1D080</p>
              <Button type="button" size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText("0xbd8D9284c436Aa3f175A92b5Ff6C57E1cfd1D080"); toast.success("Address copied!") }}><Copy className="h-3 w-3" /></Button>
            </div>
          </div>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full md:w-auto min-w-[200px] bg-accent text-accent-foreground hover:bg-accent/90 group" disabled={isSubmitting}>
        {isSubmitting ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Booking Shipment...</>
        ) : (
          <>Book Shipment <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" /></>
        )}
      </Button>
    </form>
  )
}