"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Stats } from "@/components/public/Stats";
import { CheckCircle2, Target, Eye, HeartHandshake } from "lucide-react";

const values = [
  { title: "Our Mission", description: "To provide reliable and efficient shipping services that meet the expectations of our clients and exceed industry standards.", icon: Target },
  { title: "Our Vision", description: "To be the world's most customer-centric logistics company, where people can find and ship anything they need globally.", icon: Eye },
  { title: "Our Values", description: "Safety, speed, and transparency. We take every possible measure to ensure your packages arrive safely and intact.", icon: HeartHandshake }
];

export default function AboutPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-24 bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent via-transparent to-transparent" />
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.h1 className="font-heading text-4xl md:text-6xl font-extrabold text-primary-foreground mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            About <span className="text-accent">Fastway Send</span>
          </motion.h1>
          <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto">A global supplier of transport and logistics solutions, delivering on time, every time.</p>
        </div>
      </section>

      {/* Split Content */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div className="relative h-96 rounded-3xl overflow-hidden" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <Image src="/welcome.jpg" alt="Night Port" fill className="object-cover" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading text-3xl font-bold text-primary mb-6">Built for every kind of shipper</h2>
            <p className="text-muted-foreground mb-8 text-lg">From your first pallet to your two-thousandth, we handle each shipment like it&apos;s the only one that matters—with the packaging, insurance, and tracking to prove it.</p>
            <ul className="space-y-4">
              {["100% Safe Delivery", "Weather Insurance", "Fast & On Time Delivery", "24/7 Live Support"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-foreground"><CheckCircle2 className="h-6 w-6 text-accent" /> {item}</li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <Stats />

      {/* Core Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-primary">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((val, i) => {
              const Icon = val.icon;
              return (
                <motion.div key={val.title} className="bg-background border rounded-3xl p-8 text-center shadow-sm" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent"><Icon className="h-7 w-7" /></div>
                  <h3 className="font-heading text-xl font-bold text-primary mb-2">{val.title}</h3>
                  <p className="text-muted-foreground text-sm">{val.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}