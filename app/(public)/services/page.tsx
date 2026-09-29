"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Plane, Ship, Truck, Package, FileText, Box, CreditCard, MapPin } from "lucide-react";
import { motion } from "motion/react";

const services = [
  { title: "Air Freight", description: "Time-critical cargo, priced and moving within 24 hours globally. We handle all customs and documentation.", image: "/service-1.jpg", icon: Plane },
  { title: "Sea Freight", description: "Full and part-container loads, tracked port to port. Cost-effective for large international shipments.", image: "/service-2.jpg", icon: Ship },
  { title: "Road Transport", description: "Door-to-door trucking with live GPS check-ins. Reliable domestic and cross-border logistics.", image: "/service-3.jpg", icon: Truck },
  { title: "Courier Services", description: "Fast and reliable transportation of packages, documents, and time-sensitive parcels.", image: "/service-4.jpg", icon: Package },
];

const processSteps = [
  { title: "Submit Request", description: "Tell us what you're shipping, where it's going, and how fast you need it there.", icon: FileText },
  { title: "Get Instant Quote", description: "Receive transparent pricing upfront. No hidden fees, no surprises at delivery.", icon: CreditCard },
  { title: "We Pack & Ship", description: "Our team secures your cargo and dispatches it via the fastest, safest route.", icon: Box },
  { title: "Track & Deliver", description: "Monitor your shipment in real-time until it safely reaches its destination.", icon: MapPin },
];

export default function ServicesPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-24 bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent via-transparent to-transparent" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.h1 className="font-heading text-4xl md:text-6xl font-extrabold text-primary-foreground mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            Our Awesome <span className="text-accent">Services</span>
          </motion.h1>
          <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto">
            From your first pallet to your two-thousandth, we handle each shipment like it&apos;s the only one that matters.
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6 space-y-20">
          {services.map((service, i) => {
            const Icon = service.icon;
            const isReversed = i % 2 === 1;
            return (
              <motion.div key={service.title} className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center`} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className={`relative h-64 md:h-96 rounded-3xl overflow-hidden ${isReversed ? 'md:order-2' : ''}`}>
                  <Image src={service.image} alt={service.title} fill className="object-cover" />
                </div>
                <div className={isReversed ? 'md:order-1' : ''}>
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-6">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h2 className="font-heading text-3xl font-bold text-primary mb-4">{service.title}</h2>
                  <p className="text-muted-foreground mb-6 text-lg">{service.description}</p>
                  <Link href="/quote"><Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full group">Get a Quote <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Button></Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-primary">How It Works</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">Shipping with Fastway Send is simple, transparent, and fast.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {processSteps.map((step, i) => (
              <motion.div key={step.title} className="relative text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  {i + 1}
                </div>
                <h3 className="font-heading text-xl font-bold text-primary mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}