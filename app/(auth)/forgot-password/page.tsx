"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed to send email");
      
      // Always show this message for security (prevents email enumeration)
      toast.success("If the email exists, a reset link has been sent.");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <motion.div 
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Forgot Password</h2>
          <p className="text-sm text-muted-foreground">Enter your email to receive a reset link</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="email" className="block text-xs font-semibold mb-1">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="email" 
                type="email" 
                placeholder="john@example.com" 
                className="pl-10" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            {loading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : "Send Reset Link"}
          </Button>
        </form>

        <div className="px-6 pb-6 text-center text-xs text-muted-foreground">
          <Link href="/login" className="inline-flex items-center gap-1 text-accent font-semibold hover:underline">
            <ArrowLeft className="h-3 w-3" /> Back to Login
          </Link>
        </div>
      </div>
    </motion.div>
  );
}