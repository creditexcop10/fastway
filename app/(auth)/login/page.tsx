"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, type Variants } from "motion/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success("Login successful! Redirecting...");
      
      // Fetch the profile to check the role
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user?.id)
        .single();

      if (profile?.role === "admin") {
        router.push("/admins");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    }
  };

  return (
    <motion.div 
      className="w-full max-w-md"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Mobile Logo Link (Shows only on small screens) */}
      <div className="text-center mb-6 lg:hidden">
        <Link href="/">
          <div className="flex items-center justify-center gap-0 font-heading text-lg font-bold uppercase tracking-tight text-primary">
            <span>FASTWAY</span>
            <Image src="/favicon.png" alt="Fastway Send" width={32} height={32} className="h-8 w-8 mx-1.5" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">SEND</span>
          </div>
        </Link>
      </div>

      <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Sign In</h2>
          <p className="text-sm text-muted-foreground">Access your Fastway Send account</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <Label htmlFor="email" className="block text-xs font-semibold mb-1">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="john@example.com" className="pl-10" {...register("email")} />
            </div>
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="password" className="block text-xs font-semibold mb-1">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="******" className="pl-10 pr-10" {...register("password")} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            <div className="text-right">
              <a href="/forgot-password" className="text-xs text-accent hover:underline">
                Forgot Password?
              </a>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            {loading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : "Sign In to Account"}
          </Button>
        </form>

        <div className="px-6 pb-6 text-center text-xs text-muted-foreground">
          New to Fastway Send? <a href="/signup" className="text-accent font-semibold hover:underline">Create New Account</a>
        </div>
      </div>
    </motion.div>
  );
}