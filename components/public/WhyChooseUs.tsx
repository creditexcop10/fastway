"use client";

import { motion } from "motion/react";
import { ShieldCheck, Clock, Headset, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const features = [
  {
    title: "100% Safe Delivery",
    description: "High-quality packaging and careful handling ensure your items arrive intact, every time.",
    icon: ShieldCheck,
  },
  {
    title: "Fast & On-Time",
    description: "Latest technologies and skilled pros delivering to any location reliably.",
    icon: Clock,
  },
  {
    title: "24/7 Live Support",
    description: "Round-the-clock tracking and dedicated support for your peace of mind.",
    icon: Headset,
  },
  {
    title: "Global Coverage",
    description: "Reaching 207+ countries with a network of trusted partners and carriers.",
    icon: Globe2,
  },
];

export function WhyChooseUs() {
  return (
    <section className="relative w-full py-20 md:py-32 bg-background overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[50%] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          
          {/* Left Column: Sticky Headline */}
          <div className="lg:col-span-1 lg:sticky lg:top-32 lg:h-fit">
            <motion.span 
              className="text-sm font-bold uppercase tracking-widest text-accent mb-2 block"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Why Fastway Send?
            </motion.span>
            
            <motion.h2 
              className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-primary mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Built for every kind of shipper.
            </motion.h2>
            
            <motion.p 
              className="text-muted-foreground mb-8 max-w-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              From your first pallet to your two-thousandth, we handle each shipment like it&apos;s the only one that matters—with the packaging, insurance, and tracking to prove it.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/about">
                <Button variant="outline" className="rounded-full border-primary/20 text-primary hover:bg-primary/5">
                  More About Us
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right Column: 2x2 Glass Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card p-8 transition-all hover:border-accent/50 hover:shadow-xl hover:shadow-accent/5"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  {/* Hover glow */}
                  <div className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(300px circle at center, rgba(255, 94, 2, 0.05), transparent 70%)" }} />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-6 inline-flex w-14 h-14 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-primary mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}