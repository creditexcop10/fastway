"use client";

import { motion, useAnimation } from "motion/react";
import dynamic from "next/dynamic";
import { MapPin, Package, Clock, CheckCircle2, User, Mail, Phone, Globe, Plane, Ship, Truck, Box } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

// Dynamically import the map (Leaflet doesn't work with SSR)
const ShipmentMap = dynamic(() => import("./ShipmentMap").then(mod => mod.ShipmentMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[250px] sm:h-[300px] md:h-[400px] rounded-2xl bg-muted animate-pulse flex items-center justify-center">
      <span className="text-muted-foreground text-sm">🌐 Acquiring satellite data...</span>
    </div>
  ),
});

const statusProgress: Record<string, number> = {
  pending: 0,
  picked_up: 15,
  in_transit: 50,
  out_for_delivery: 85,
  delivered: 100,
  cancelled: 0,
};

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "picked_up", label: "Picked Up", icon: Package },
  { key: "in_transit", label: "In Transit", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: MapPin },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

function FreightIconDisplay({ type }: { type: string }) {
  const className = "h-4 w-4";
  switch (type) {
    case "air": return <Plane className={className} />;
    case "sea": return <Ship className={className} />;
    case "road": return <Truck className={className} />;
    case "courier": return <Box className={className} />;
    default: return <Package className={className} />;
  }
}

export function TrackingResult({ shipment, updates }: { shipment: any; updates: any[] }) {
  const progress = statusProgress[shipment.status] ?? 0;
  const hasCoords = shipment.origin_lat && shipment.origin_lng && shipment.destination_lat && shipment.destination_lng;
  
  const controls = useAnimation();
  const trackingRef = useRef<HTMLHeadingElement>(null);

  // GSAP Text Reveal Animation
  useEffect(() => {
    if (trackingRef.current) {
      gsap.fromTo(
        trackingRef.current.querySelectorAll(".char"),
        { opacity: 0, y: 20, rotateX: -90 },
        { opacity: 1, y: 0, rotateX: 0, stagger: 0.05, duration: 0.8, ease: "back.out(1.7)" }
      );
    }
    
    controls.start("show");
  }, [controls]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any } }
  };

  const trackingChars = shipment.tracking_number.split("");

  // Extract checkpoints from updates that have coordinates
  const checkpoints = updates
    .filter((u: any) => u.lat && u.lng)
    .map((u: any) => ({
      lat: parseFloat(u.lat),
      lng: parseFloat(u.lng),
      location: u.location,
      status: u.status
    }));

  return (
    <motion.div
      className="bg-background rounded-3xl shadow-2xl border border-border overflow-hidden text-left w-full"
      variants={containerVariants}
      initial="hidden"
      animate={controls}
    >
      {/* Cinematic Header */}
      <motion.div 
        className="bg-gradient-to-br from-primary to-primary/80 p-6 md:p-8 border-b relative overflow-hidden"
        variants={itemVariants}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-primary-foreground/60 uppercase tracking-widest mb-2">Tracking Number</p>
            <h3 
              ref={trackingRef} 
              className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-primary-foreground font-mono break-all"
              style={{ perspective: 1000 }}
            >
              {trackingChars.map((char: string, i: number) => (
                <span key={i} className="char inline-block">{char}</span>
              ))}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <motion.span 
              className="px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-bold uppercase whitespace-nowrap shadow-lg shadow-accent/30"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {shipment.status.replace("_", " ")}
            </motion.span>
          </div>
        </div>
      </motion.div>

      {/* Animated Progress Bar */}
      <motion.div className="p-6 md:p-8 border-b bg-card" variants={itemVariants}>
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-bold text-primary">Shipment Progress</p>
          <span className="text-lg font-bold text-accent">{progress}%</span>
        </div>
        <div className="relative h-3 sm:h-4 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-accent via-orange-400 to-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          >
            <motion.div
              className="absolute right-0 top-0 h-full w-8 bg-white/40 blur-sm"
              animate={{ x: [-20, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 2 }}
            />
          </motion.div>
        </div>
        
        {/* Step indicators */}
        <div className="flex justify-between mt-6">
          {statusSteps.map((step) => {
            const Icon = step.icon;
            const stepProgress = statusProgress[step.key] ?? 0;
            const isComplete = progress >= stepProgress;
            const isCurrent = shipment.status === step.key;
            
            return (
              <div key={step.key} className="flex flex-col items-center gap-2 flex-1 min-w-0">
                <motion.div 
                  className={`relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 transition-all ${
                    isComplete ? "bg-accent border-accent text-accent-foreground" : 
                    isCurrent ? "bg-accent/20 border-accent text-accent" :
                    "bg-muted border-border text-muted-foreground"
                  }`}
                  animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                  transition={isCurrent ? { duration: 1.5, repeat: Infinity } : {}}
                >
                  <Icon className="h-5 w-5" />
                  {isComplete && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-accent"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.8, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                <span className={`text-[10px] sm:text-xs text-center ${isComplete || isCurrent ? "text-primary font-bold" : "text-muted-foreground"}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Interactive Map */}
      <motion.div className="p-6 md:p-8 border-b bg-card" variants={itemVariants}>
        {hasCoords ? (
          <ShipmentMap
            originLat={parseFloat(shipment.origin_lat)}
            originLng={parseFloat(shipment.origin_lng)}
            destLat={parseFloat(shipment.destination_lat)}
            destLng={parseFloat(shipment.destination_lng)}
            status={shipment.status}
            freightType={shipment.freight_type}
            checkpoints={checkpoints}
          />
        ) : (
          <div className="p-8 bg-muted/30 rounded-2xl flex flex-col items-center justify-center text-center">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-4"
            >
              <Globe className="h-12 w-12 text-accent" />
            </motion.div>
            <p className="text-sm font-bold text-primary">Map data processing</p>
            <p className="text-xs text-muted-foreground mt-1">Location coordinates are still being calculated. Check back shortly.</p>
          </div>
        )}
      </motion.div>

      {/* Shipment Details */}
      <motion.div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-b bg-card" variants={itemVariants}>
        {/* Sender Info */}
        <div className="space-y-4">
          <p className="text-xs text-accent uppercase tracking-widest font-bold flex items-center gap-2">
            <User className="h-4 w-4" /> Sender Details
          </p>
          <div className="space-y-2 bg-muted/30 rounded-xl p-4">
            <p className="text-base font-bold text-primary">{shipment.sender_name || "N/A"}</p>
            <div className="h-px bg-border my-3"></div>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4 text-accent/70 flex-shrink-0" /> <span className="break-all">{shipment.sender_email}</span></p>
              <p className="text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4 text-accent/70 flex-shrink-0" /> {shipment.sender_phone}</p>
              <p className="text-muted-foreground flex items-center gap-2"><Globe className="h-4 w-4 text-accent/70 flex-shrink-0" /> {shipment.sender_country}</p>
              <p className="text-muted-foreground flex items-center gap-2"><MapPin className="h-4 w-4 text-accent/70 flex-shrink-0" /> <span className="break-words">{shipment.origin_address}</span></p>
              <p className="text-muted-foreground flex items-center gap-2"><Plane className="h-4 w-4 text-accent/70 flex-shrink-0" /> Airport: {shipment.nearest_airport}</p>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="space-y-4">
          <p className="text-xs text-accent uppercase tracking-widest font-bold flex items-center gap-2">
            <FreightIconDisplay type={shipment.freight_type} /> Delivery Details
          </p>
          <div className="space-y-2 bg-muted/30 rounded-xl p-4">
            <p className="text-base font-bold text-primary break-words">{shipment.destination_address}</p>
            <div className="h-px bg-border my-3"></div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-background border border-border text-xs capitalize font-medium">{shipment.freight_type} Freight</span>
              <span className="px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-medium">{shipment.weight} kg</span>
              <span className={`px-3 py-1.5 rounded-lg text-xs capitalize font-medium ${shipment.payment_status === 'paid' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'}`}>
                Payment: {shipment.payment_status || "pending"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Animated Timeline */}
      <motion.div className="p-6 md:p-8 bg-card" variants={itemVariants}>
        <p className="text-xs text-accent uppercase tracking-widest font-bold mb-8">Shipment Journey</p>
        <div className="relative border-l-2 border-dashed border-muted ml-2 space-y-8">
          {updates && updates.length > 0 ? (
            updates.map((update: any, index: number) => (
              <motion.div
                key={update.id}
                className="relative pl-8"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.2, duration: 0.5 }}
              >
                <div className="absolute -left-[11px] top-0 flex items-center justify-center w-5 h-5 rounded-full bg-accent border-2 border-background shadow-md">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="bg-muted/20 hover:bg-muted/40 transition-colors rounded-xl p-4 border border-border/50">
                  <p className="font-bold text-primary text-sm capitalize flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {update.status.replace("_", " ")}
                  </p>
                  {update.location && <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><MapPin className="h-3 w-3" /> {update.location}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{update.description}</p>
                  <p className="text-xs text-muted-foreground/70 mt-2" suppressHydrationWarning>{new Date(update.timestamp).toLocaleString()}</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="pl-8">
              <div className="bg-muted/20 rounded-xl p-4 border border-border/50">
                <p className="font-bold text-primary text-sm">Order Placed</p>
                <p className="text-xs text-muted-foreground mt-1">Shipment created. Awaiting pickup.</p>
                <p className="text-xs text-muted-foreground/70 mt-2" suppressHydrationWarning>{new Date(shipment.created_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}