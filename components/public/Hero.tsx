"use client";

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, type Variants } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Package, MapPin, Clock, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { getTrackingDetails } from "@/app/actions/tracking";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Mouse Parallax Setup
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const bgX = useTransform(springX, [-0.5, 0.5], [-30, 30]);
  const bgY = useTransform(springY, [-0.5, 0.5], [-30, 30]);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } }
  };

  const word: Variants = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: "easeOut" } }
  };

  const headlineWords = ["We", "deliver", "on", "time,", "every", "time."];

  const handleTrack = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    
    const formData = new FormData(e.currentTarget);
    const data = await getTrackingDetails(formData);
    
    if (data.error) {
      setError(data.error);
    } else {
      setResult(data);
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    if (status.includes("delivered")) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (status.includes("transit") || status.includes("delivery")) return <Package className="h-4 w-4 text-accent" />;
    if (status.includes("pending")) return <Clock className="h-4 w-4 text-yellow-500" />;
    return <MapPin className="h-4 w-4 text-muted-foreground" />;
  };

  useEffect(() => {
    const path = lineRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    
    import("animejs").then(({ createTimeline }) => {
      const timeline = createTimeline({ autoplay: true });
      timeline.add(path, {
        strokeDashoffset: [length, 0],
        easing: "easeInOutSine",
        duration: 1500,
      }, 1000);
    });

    const handleMouse = (e: MouseEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [mouseX, mouseY]);

  return (
    <section ref={sectionRef} className="relative min-h-[100vh] w-full overflow-hidden pt-20">
      <motion.div className="absolute inset-0 z-0" style={{ x: bgX, y: bgY, scale: 1.1 }}>
        <Image src="/slidermain.jpg" alt="Fast train" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-primary/80" />
      </motion.div>

      <div className="container relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-4 md:px-6 py-24 text-center">
        
        <motion.h1 
          className="font-heading text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-primary-foreground mb-2 flex flex-wrap justify-center gap-x-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {headlineWords.map((w, i) => (
            <span key={i} className="inline-block relative">
              <motion.span variants={word} className={w === "time," || w === "time." ? "text-accent" : ""}>
                {w}
              </motion.span>
              {w === "time." && (
                <svg className="absolute left-0 -bottom-2 w-full h-3 pointer-events-none" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                  <motion.path ref={lineRef} d="M2 9 Q 50 2 198 8" stroke="oklch(0.68 0.21 42)" strokeWidth="3" strokeLinecap="round" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} />
                </svg>
              )}
            </span>
          ))}
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          Straightforward rates on freight, cars, furniture, and cargo. Any size, with tracking you can trust.
        </motion.p>

        {/* Hero Glass Card with Live Tracking */}
        <motion.div 
          className="w-full max-w-lg rounded-3xl border border-white/20 bg-white/10 p-6 md:p-8 shadow-2xl backdrop-blur-xl text-left"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
        >
          <h3 className="font-heading text-lg font-bold text-white mb-4 text-center">Track Your Shipment</h3>
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
            <Input 
              name="trackingNumber"
              type="text" 
              placeholder="Enter tracking number (e.g. FWS-2894-1130)" 
              className="h-14 border-white/20 bg-white/10 text-white placeholder:text-white/60 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-accent"
              required
            />
            <Button type="submit" size="lg" className="h-14 px-8 bg-accent text-accent-foreground hover:bg-accent/90 text-base" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
              Track
            </Button>
          </form>
          
          <p className="mt-4 text-sm text-white/60 text-center">
            Get real-time updates on your cargo&apos;s location and estimated delivery.
          </p>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result Display */}
          <AnimatePresence>
            {result && (
              <motion.div 
                className="mt-6 bg-background rounded-2xl border border-border overflow-hidden"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <div className="bg-muted/50 p-4 border-b flex justify-between items-center">
                  <h4 className="font-mono font-bold text-primary text-sm">{result.shipment.tracking_number}</h4>
                  <span className="px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase">{result.shipment.status.replace("_", " ")}</span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4 border-b text-xs">
                  <div>
                    <p className="text-muted-foreground uppercase mb-1">Origin</p>
                    <p className="font-medium text-primary truncate">{result.shipment.origin_address}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground uppercase mb-1">Destination</p>
                    <p className="font-medium text-primary truncate">{result.shipment.destination_address}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="relative border-l-2 border-muted ml-2 space-y-6">
                    {result.updates?.map((update: any, index: number) => (
                      <motion.div key={update.id} className="relative pl-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.1 }}>
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-muted flex items-center justify-center">
                          {getStatusIcon(update.status)}
                        </div>
                        <p className="font-semibold text-primary text-sm capitalize">{update.status.replace("_", " ")}</p>
                        <p className="text-xs text-muted-foreground">{new Date(update.timestamp).toLocaleString()}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}