"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [timer, setTimer] = useState(60); // 60-second countdown

  // Handle OTP countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("verification_email");
    const storedPassword = sessionStorage.getItem("verification_password");
    
    if (!storedEmail || !storedPassword) {
      router.push("/signup");
    } else {
      setEmail(storedEmail);
      setPassword(storedPassword);
    }
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);

    const verifyRes = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    if (!verifyRes.ok) {
      const data = await verifyRes.json();
      toast.error(data.error || "Invalid or expired code.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error("Verification successful, but login failed. Please try logging in manually.");
      router.push("/login");
    } else {
      sessionStorage.removeItem("verification_email");
      sessionStorage.removeItem("verification_password");
      toast.success("Account verified! Welcome to Fastway Send.");
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed to resend");
      
      toast.success("A new 6-digit code has been sent to your email.");
      setTimer(60); // Reset timer
    } catch (error) {
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Verify Your Account</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            Please confirm your account by entering the 6-digit code we sent to <span className="font-semibold text-foreground">{email}</span>.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-xs font-semibold text-muted-foreground mb-2 text-center">
              Enter 6-Digit Code
            </label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="text-center text-2xl tracking-[0.5em] font-bold bg-background border-border text-primary placeholder:text-muted-foreground/50"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 text-base font-semibold">
            {loading ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Verifying...</> : "Verify Code"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {timer > 0 ? (
            <p>Resend code in {timer}s</p>
          ) : (
            <button 
              onClick={handleResend} 
              disabled={resending} 
              className="font-semibold text-accent hover:underline disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend Code"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}