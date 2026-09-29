"use client";

import { useState, useEffect } from "react";
import { submitContactForm } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Mail, MapPin, Phone, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 1. Capture the form element before any async calls
    const form = e.currentTarget; 
    
    setIsSubmitting(true);

    const formData = new FormData(form);
    const result = await submitContactForm(formData);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      toast.success("Message sent successfully! We will get back to you shortly.");
      // 2. Use the captured reference to reset the form
      form.reset(); 
    }

    setIsSubmitting(false);
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
            Get in <span className="text-accent">Touch</span>
          </motion.h1>
          <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto">
            We value your feedback, comments, and queries. Reach out to us anytime.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Info Column */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-accent/10 text-accent"><MapPin className="h-6 w-6" /></div>
              <div>
                <h3 className="font-bold text-primary mb-1">Our Address</h3>
                <p className="text-muted-foreground">12 East 63rd St, Manhattan, NY</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-accent/10 text-accent"><Phone className="h-6 w-6" /></div>
              <div>
                <h3 className="font-bold text-primary mb-1">Phone</h3>
                <p className="text-muted-foreground">+1 (917) 410-5271</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-accent/10 text-accent"><Mail className="h-6 w-6" /></div>
              <div>
                <h3 className="font-bold text-primary mb-1">Email</h3>
                <p className="text-muted-foreground">support@fastwaysending.com</p>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="bg-card border rounded-3xl p-8 shadow-xl">
            {showSuccess && (
              <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-green-500/10 text-green-600 font-medium">
                <CheckCircle2 className="h-5 w-5" />
                Message sent successfully! We will get back to you shortly.
              </div>
            )}
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="john@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" placeholder="Inquiry about freight" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" rows={4} placeholder="How can we help you?" required />
              </div>
              <Button type="submit" size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}