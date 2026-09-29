"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Check if tokens are in the URL (Supabase puts them there on email click)
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    const accessToken = urlParams.get("access_token") || hashParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token") || hashParams.get("refresh_token");

    if (accessToken && refreshToken) {
      // 2. Forcefully establish the session using the tokens
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(() => {
        setIsReady(true);
      });
    } else {
      // 3. If no tokens in URL, check if they are already logged in
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setIsReady(true);
        } else {
          // No tokens, no session. Kick them back to request a new link.
          toast.error("Invalid or expired reset link.");
          router.push("/forgot-password");
        }
      });
    }
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      router.push("/dashboard");
      router.refresh();
    }
    setLoading(false);
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Set New Password</h2>
          <p className="text-sm text-muted-foreground">Enter your new password below</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="password" className="block text-xs font-semibold mb-1">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="******" 
                className="pl-10 pr-10" 
                required 
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            {loading ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}