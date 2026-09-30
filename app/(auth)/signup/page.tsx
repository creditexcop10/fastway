"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const registerSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignupPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setLoading(true);

    const cleanEmail = values.email.trim().toLowerCase();
    
    // 1. Create the user in Supabase
    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: values.password,
      options: {
        data: { full_name: values.full_name }
      }
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // 2. Sign them out immediately so they must verify the OTP first
    await supabase.auth.signOut();

    // 3. Call our API route to generate and send the OTP
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: cleanEmail }),
    });

    if (!res.ok) {
      toast.error("Failed to send verification code. Please try again.");
      setLoading(false);
      return;
    }

    // 4. Store email and password temporarily to log them in after verification
    sessionStorage.setItem("verification_email", cleanEmail);
    sessionStorage.setItem("verification_password", values.password);
    
    toast.success("Account created! Please enter the 6-digit code sent to your email.");
    router.push("/verify");
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Create Account</h2>
          <p className="text-sm text-muted-foreground">Join Fastway Send today</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <Label htmlFor="full_name" className="block text-xs font-semibold mb-1">Full Name</Label>
            <Input id="full_name" placeholder="John Doe" {...register("full_name")} />
            {errors.full_name && <p className="text-xs text-destructive mt-1">{errors.full_name.message}</p>}
          </div>

          <div>
            <Label htmlFor="email" className="block text-xs font-semibold mb-1">Email Address</Label>
            <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="password" className="block text-xs font-semibold mb-1">Password</Label>
            <Input id="password" type="password" placeholder="******" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="px-6 pb-6 text-center text-xs text-muted-foreground">
          Already have an account? <a href="/login" className="text-accent font-semibold hover:underline">Sign In</a>
        </div>
      </div>
    </div>
  );
}