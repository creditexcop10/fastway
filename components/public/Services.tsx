"use client";

import { motion } from "motion/react";
import { Plane, Ship, Truck, Package, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

const services = [
  {
    title: "Air Freight",
    description: "Time-critical cargo, priced and moving within 24 hours globally.",
    image: "/service-1.jpg",
    icon: Plane,
    span: "md:col-span-2 md:row-span-2",
  },
  {
    title: "Sea Freight",
    description: "Full and part-container loads, tracked port to port.",
    image: "/service-2.jpg",
    icon: Ship,
    span: "md:col-span-2",
  },
  {
    title: "Road Transport",
    description: "Door-to-door trucking.",
    image: "/service-3.jpg",
    icon: Truck,
    span: "md:col-span-1",
  },
  {
    title: "Courier Services",
    description: "Fast & reliable packages.",
    image: "/service-4.jpg",
    icon: Package,
    span: "md:col-span-1",
  },
  {
    title: "Fast Freight",
    description: "Expedited delivery for time-sensitive shipments.",
    image: "/service-5.jpg",
    icon: Clock,
    span: "md:col-span-2",
  },
];

export function Services() {
  return (
    <section id="services" className="relative w-full py-20 md:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-sm font-bold uppercase tracking-widest text-accent mb-2">What we offer</span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-primary">
            Our Awesome <span className="text-accent">Services</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {services.map((service, i) => (
            <SpotlightCard key={service.title} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SpotlightCard({ service, index }: { service: any, index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const Icon = service.icon;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden rounded-2xl border border-border/50 group ${service.span}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Image
        src={service.image}
        alt={service.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/60 to-transparent" />
      
      {/* Spotlight Overlay */}
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: "radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(255, 94, 2, 0.15), transparent 40%)"
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-end p-6 text-primary-foreground">
        <div className="mb-3 inline-flex w-12 h-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/20">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="font-heading text-xl font-bold">{service.title}</h3>
        <p className="text-sm text-primary-foreground/80 mt-1 max-w-xs">
          {service.description}
        </p>
      </div>
    </motion.div>
  );
}