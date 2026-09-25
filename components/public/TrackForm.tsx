"use client";

import { getTrackingDetails } from "@/app/actions/tracking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Package, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

export function TrackForm({ initialTrackingNumber = "" }: { initialTrackingNumber?: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(initialTrackingNumber);
  const autoSearched = useRef(false);

  const handleSearch = async (trackingNumber: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("trackingNumber", trackingNumber);
    const data = await getTrackingDetails(formData);

    if (data.error) {
      setError(data.error);
    } else {
      setResult(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch(inputValue);
  };

  // Auto-search if navigated from homepage with a tracking number
  useEffect(() => {
    if (initialTrackingNumber && !autoSearched.current) {
      autoSearched.current = true;
      handleSearch(initialTrackingNumber);
    }
  }, [initialTrackingNumber]);

  const getStatusIcon = (status: string) => {
    if (status.includes("delivered")) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (status.includes("transit") || status.includes("delivery")) return <Package className="h-5 w-5 text-accent" />;
    if (status.includes("pending")) return <Clock className="h-5 w-5 text-yellow-500" />;
    return <MapPin className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl bg-background/10 backdrop-blur-xl border border-white/20 shadow-2xl">
        <Input 
          name="trackingNumber"
          placeholder="e.g. FWS-1234-5678" 
          className="h-14 border-0 bg-transparent text-white placeholder:text-white/60 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
          required
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <Button type="submit" size="lg" className="h-14 px-8 bg-accent text-accent-foreground hover:bg-accent/90 text-base" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
          Track Now
        </Button>
      </form>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center font-medium"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Timeline */}
      <AnimatePresence>
        {result && (
          <motion.div 
            className="bg-background rounded-2xl shadow-2xl border border-border overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="bg-muted/50 p-6 border-b flex flex-col md:flex-row justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tracking Number</p>
                <h3 className="font-heading text-xl font-bold text-primary font-mono">{result.shipment.tracking_number}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-bold uppercase">
                  {result.shipment.status.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Route Info */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Origin</p>
                <p className="font-medium text-primary">{result.shipment.origin_address}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Destination</p>
                <p className="font-medium text-primary">{result.shipment.destination_address}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-6">
              <h4 className="font-heading text-lg font-bold text-primary mb-6">Shipment Progress</h4>
              <div className="relative border-l-2 border-muted ml-4 space-y-8">
                {result.updates && result.updates.length > 0 ? (
                  result.updates.map((update: any, index: number) => (
                    <motion.div 
                      key={update.id} 
                      className="relative pl-8"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="absolute -left-[11px] top-0 flex items-center justify-center w-5 h-5 rounded-full bg-background border-2 border-muted">
                        {getStatusIcon(update.status)}
                      </div>
                      <p className="font-semibold text-primary capitalize">{update.status.replace("_", " ")}</p>
                      <p className="text-sm text-muted-foreground">{update.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(update.timestamp).toLocaleString()}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <div className="pl-8">
                    <p className="text-muted-foreground">Shipment created, awaiting pickup updates.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}