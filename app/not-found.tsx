"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary px-4 text-center text-primary-foreground">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-heading text-8xl font-extrabold text-accent md:text-9xl">
          404
        </h1>
      </motion.div>
      
      <motion.h2
        className="mt-4 font-heading text-2xl font-bold md:text-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Shipment Lost in Transit
      </motion.h2>
      
      <p className="mt-4 max-w-md text-primary-foreground/70">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      
      <Link href="/" className="mt-8">
        <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
          Return to Homepage
        </Button>
      </Link>
    </div>
  );
}