"use client";

import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { replyToContact } from "@/app/actions/reply";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";

export function ContactCard({ msg }: { msg: any }) {
  const [open, setOpen] = useState(false);

  const handleReply = async (formData: FormData) => {
    await replyToContact(formData);
    toast.success("Reply sent!");
    setOpen(false);
  };

  return (
    <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold">
          {msg.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-primary">{msg.name}</p>
          <p className="text-xs text-muted-foreground" suppressHydrationWarning>
            {new Date(msg.created_at).toLocaleString()}
          </p>
        </div>
      </div>
      <div className="space-y-2 text-sm text-muted-foreground mb-4 border-y py-4">
        <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {msg.email}</p>
        <p className="flex items-center gap-2 font-semibold text-foreground"><Mail className="h-4 w-4" /> {msg.subject}</p>
      </div>
      <p className="text-sm text-foreground/80 flex-1 mb-4">{msg.message}</p>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground w-full">
          Reply to Email
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to {msg.email}</DialogTitle>
          </DialogHeader>
          <form action={handleReply} className="space-y-4 py-4">
            <Input type="hidden" name="email" value={msg.email} />
            <Input name="subject" defaultValue={`Re: ${msg.subject}`} required />
            <Textarea name="message" rows={6} placeholder="Type your reply..." required />
            <DialogFooter>
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Send Reply</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}