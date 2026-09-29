"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plane, Ship, Truck, Package, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { submitQuoteRequest } from "@/app/actions/quote";

const freightTypes = [
  { name: "Air", icon: Plane }, 
  { name: "Sea", icon: Ship }, 
  { name: "Road", icon: Truck }, 
  { name: "Courier", icon: Package }
];

export default function QuotePage() {
  const [selectedType, setSelectedType] = useState("Air");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 1. Capture the form element before any async calls
    const form = e.currentTarget;
    
    setIsSubmitting(true);
    const formData = new FormData(form);
    formData.append("freight_type", selectedType); // Append the selected button state
    await submitQuoteRequest(formData);
    setIsSubmitting(false);
    
    // 2. Use the captured reference to reset the form
    form.reset(); 
  };

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-24 bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent via-transparent to-transparent" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.h1 
            className="font-heading text-4xl md:text-6xl font-extrabold text-primary-foreground mb-4"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
          >
            Get an Instant <span className="text-accent">Quote</span>
          </motion.h1>
          <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto">
            Know your costs before you ship. No hidden fees, no surprises at delivery.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <motion.div 
            className="bg-card border rounded-3xl p-8 md:p-12 shadow-xl"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
          >
            {success && (
              <div className="mb-8 flex items-center gap-3 p-4 rounded-xl bg-green-500/10 text-green-600 font-medium">
                <CheckCircle2 className="h-5 w-5" />
                Quote request submitted! Our team will contact you shortly with pricing.
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-8">
              {/* Freight Type Selector */}
              <div className="space-y-4">
                <Label className="text-lg font-bold text-primary">Freight Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {freightTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.name}
                        type="button"
                        onClick={() => setSelectedType(type.name)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                          selectedType === type.name 
                            ? "border-accent bg-accent/10 text-accent" 
                            : "border-border text-muted-foreground hover:border-accent/50"
                        }`}
                      >
                        <Icon className="h-8 w-8 mb-2" />
                        <span className="font-semibold">{type.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Routes & Weight */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin Address</Label>
                  <Input id="origin" name="origin" placeholder="123 Main St, New York, NY" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination Address</Label>
                  <Input id="destination" name="destination" placeholder="456 Market St, London, UK" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" name="weight" type="number" step="0.1" min="0.1" placeholder="e.g. 25.5" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-14 bg-accent text-accent-foreground hover:bg-accent/90 text-base group" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Calculate Quote 
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}