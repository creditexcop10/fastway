"use client"

import { createShipment } from "@/app/actions/shipment"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Loader2, ArrowRight, Bitcoin, Coins, Copy, Wallet } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function BookShipmentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter();
  const [formData, setFormData] = useState({
    origin_address: "",
    destination_address: "",
    freight_type: "air",
    weight: "",
  })
  
  // Pricing state
  const [calculatedCost, setCalculatedCost] = useState(0)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [paymentStep, setPaymentStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("btc")
  const [txnHash, setTxnHash] = useState("")

  const handleCalculate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Mock pricing logic: Base $50 + weight * $5 + freight modifier
    const weight = parseFloat(formData.weight) || 0
    const freightModifier = formData.freight_type === "air" ? 3 : formData.freight_type === "sea" ? 1 : 2
    const cost = 50 + (weight * 5 * freightModifier)
    
    setCalculatedCost(cost)
    setIsModalOpen(true)
    setPaymentStep(1)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Address copied to clipboard!")
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const submitData = new FormData();
    submitData.append("origin_address", formData.origin_address);
    submitData.append("destination_address", formData.destination_address);
    submitData.append("freight_type", formData.freight_type);
    submitData.append("weight", formData.weight);
    submitData.append("total_cost", calculatedCost.toString());
    submitData.append("payment_method", paymentMethod);
    submitData.append("payment_hash", txnHash);
    
    const result = await createShipment(submitData) as { error?: string; success?: boolean };
    
    if (result?.error) {
      toast.error(result.error);
      setIsSubmitting(false);
    } else {
      toast.success("Shipment booked successfully!");
      router.push("/dashboard/shipments");
      router.refresh();
    }
  };

  return (
    <>
      <form onSubmit={handleCalculate} className="space-y-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="origin_address">Origin Address</Label>
            <Input 
              id="origin_address" 
              placeholder="123 Main St, New York, NY" 
              required 
              value={formData.origin_address}
              onChange={(e) => setFormData({...formData, origin_address: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination_address">Destination Address</Label>
            <Input 
              id="destination_address" 
              placeholder="456 Market St, London, UK" 
              required 
              value={formData.destination_address}
              onChange={(e) => setFormData({...formData, destination_address: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="freight_type">Freight Type</Label>
            <select 
              id="freight_type" 
              required
              value={formData.freight_type}
              onChange={(e) => setFormData({...formData, freight_type: e.target.value})}
              className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="air">Air Freight</option>
              <option value="sea">Sea Freight</option>
              <option value="road">Road Transport</option>
              <option value="courier">Courier Services</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input 
              id="weight" 
              type="number" 
              step="0.1" 
              min="0.1" 
              placeholder="e.g. 25.5" 
              required 
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
            />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full md:w-auto min-w-[200px] bg-accent text-accent-foreground hover:bg-accent/90 group">
          Calculate & Pay
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </form>

      {/* Payment Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if(!open) setPaymentStep(1); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center">
              {paymentStep === 1 ? "Complete Your Payment" : "Submit Transaction Hash"}
            </DialogTitle>
          </DialogHeader>

          {paymentStep === 1 && (
            <div className="space-y-4 py-4">
              <div className="text-center bg-muted/50 p-4 rounded-xl">
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-3xl font-bold text-primary">${calculatedCost.toFixed(2)}</p>
              </div>
              
              <p className="text-sm text-muted-foreground text-center">Select payment method to view address.</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setPaymentMethod("btc")}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${paymentMethod === "btc" ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground"}`}
                >
                  <Bitcoin className="h-6 w-6" />
                  <span className="text-xs font-medium">Bitcoin</span>
                </button>

                <button 
                  type="button"
                  onClick={() => setPaymentMethod("erc20")}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-colors ${paymentMethod === "erc20" ? "border-accent bg-accent/5" : "border-border hover:border-muted-foreground"}`}
                >
                  <Coins className="h-6 w-6" />
                  <span className="text-xs font-medium">ERC-20</span>
                </button>
              </div>

              {paymentMethod === "btc" && (
                <div className="bg-muted/50 rounded-xl p-4 space-y-3 text-sm">
                  <p className="text-xs text-muted-foreground">Send exact BTC equivalent to:</p>
                  <div className="flex justify-between items-center gap-2">
                    <p className="font-mono font-medium text-xs break-all">{process.env.NEXT_BTC_ADDRESS}</p>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(process.env.NEXT_BTC_ADDRESS || "")}><Copy className="h-3 w-3" /></Button>
                  </div>
                </div>
              )}

              {paymentMethod === "erc20" && (
                <div className="bg-muted/50 rounded-xl p-4 space-y-3 text-sm">
                  <p className="text-xs text-muted-foreground">Send USDT, USDC, or ETH to:</p>
                  <div className="flex justify-between items-center gap-2">
                    <p className="font-mono font-medium text-xs break-all">{process.env.NEXT_ERC20_ADDRESS}</p>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(process.env.NEXT_ERC20_ADDRESS || "")}><Copy className="h-3 w-3" /></Button>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button className="w-full bg-accent hover:bg-accent/90" onClick={() => setPaymentStep(2)}>
                  I have made the transfer
                </Button>
              </DialogFooter>
            </div>
          )}

          {paymentStep === 2 && (
            <form onSubmit={handleFinalSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="txnHash">Transaction Hash / TXN ID</Label>
                <Input 
                  id="txnHash" 
                  required 
                  value={txnHash} 
                  onChange={(e) => setTxnHash(e.target.value)} 
                  placeholder="e.g. 0x1234... or a1b2c3..." 
                />
                <p className="text-xs text-muted-foreground">Found on your crypto wallet receipt. Helps us verify your payment faster.</p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPaymentStep(1)}>Back</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent/90">
                  {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : "Confirm & Book Shipment"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}