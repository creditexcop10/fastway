"use client";

import { sendBroadcast } from "@/app/actions/broadcast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Megaphone } from "lucide-react";
import { useState } from "react";

export default function BroadcastPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 1. Capture the form element before any async calls
    const form = e.currentTarget;
    
    setLoading(true);
    const formData = new FormData(form);
    const result = await sendBroadcast(formData);
    
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Broadcast sent to all users!");
      // 2. Use the captured reference to reset the form
      form.reset();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primary flex items-center gap-3">
          <Megaphone className="h-8 w-8 text-accent" /> Broadcast System
        </h1>
        <p className="text-muted-foreground">Send a mass email and in-app notification to all registered customers.</p>
      </div>

      <div className="bg-card border rounded-2xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject / Notification Title</Label>
            <Input id="subject" name="subject" placeholder="e.g. System Maintenance Notice" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" rows={6} placeholder="Type your announcement here..." required />
          </div>
          <Button type="submit" size="lg" className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...</> : "Send Broadcast"}
          </Button>
        </form>
      </div>
    </div>
  );
}