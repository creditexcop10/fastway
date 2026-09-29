"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { Translator } from "@/components/shared/Translator";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  // { name: "Track", href: "/track" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8">
      <header className="mx-auto max-w-7xl flex h-16 items-center justify-between rounded-full border border-white/10 bg-primary/60 px-6 backdrop-blur-2xl shadow-2xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-0 font-heading text-base font-bold uppercase tracking-tight">
          {/* Hidden on small screens to save space */}
          <span className="hidden sm:inline text-primary-foreground">FASTWAY</span>
          <Image 
            src="/favicon.png" 
            alt="Fastway Send Logo" 
            width={36} 
            height={36} 
            className="h-9 w-9 sm:mx-1.5 drop-shadow-[0_2px_10px_rgba(255,94,2,0.5)]"
            priority
          />
          {/* Gradient Text (Web3 Style) */}
          <span className="hidden sm:inline bg-gradient-to-r from-primary-foreground to-accent bg-clip-text text-transparent">SEND</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-primary-foreground/70 transition-colors hover:text-accent"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" className="text-primary-foreground hover:bg-white/10 hover:text-accent">Sign In</Button>
          </Link>
          <div className="hidden md:flex items-center gap-2">
            <Translator />
          </div>
          <Link href="/quote">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full">
              Get a Quote
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-primary-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden mt-2 rounded-3xl border border-white/10 bg-primary/80 backdrop-blur-2xl shadow-2xl">
          <nav className="flex flex-col px-6 py-4 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-base font-medium text-primary-foreground/80 hover:text-accent"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-4 pb-4">
              <Link href="/login">
                <Button variant="outline" className="w-full rounded-full border-white/20 bg-transparent text-primary-foreground hover:bg-white/10">Sign In</Button>
              </Link>
              <Link href="/quote">
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full">
                  Get a Quote
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}