"use client";

import { sendBroadcast } from "@/app/actions/broadcast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Megaphone, Search, Users, User } from "lucide-react";
import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function BroadcastPage() {
  const [loading, setLoading] = useState(false);
  const [recipientType, setRecipientType] = useState<"all" | "individual">("all");
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const supabase = createSupabaseBrowserClient();

  // Fetch users when individual mode is selected
  useEffect(() => {
    if (recipientType === "individual" && users.length === 0) {
      const fetchUsers = async () => {
        try {
          const res = await fetch("/api/admin/users-list");
          const data = await res.json();
          if (data.users) setUsers(data.users);
        } catch (error) {
          toast.error("Failed to load users.");
        }
      };
      fetchUsers();
    }
  }, [recipientType]);

  const filteredUsers = users.filter((u: any) => {
    if (!searchTerm) return true;
    const name = (u.full_name || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (recipientType === "individual" && !selectedUserId) {
      toast.error("Please select a recipient.");
      return;
    }

    setLoading(true);
    const formData = new FormData(form);
    
    if (recipientType === "individual") {
      formData.append("recipient_id", selectedUserId);
    }
    
    const result = await sendBroadcast(formData);
    
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(recipientType === "all" ? "Broadcast sent to all users!" : "Message sent!");
      form.reset();
      setSelectedUserId("");
      setRecipientType("all");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-heading text-3xl font-bold text-primary flex items-center gap-3">
          <Megaphone className="h-8 w-8 text-accent" /> Messaging Center
        </h1>
        <p className="text-muted-foreground">Send a message to all customers or a specific individual.</p>
      </div>

      <div className="bg-card border rounded-2xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient Selector */}
          <div className="space-y-3">
            <Label>Recipient</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRecipientType("all")}
                className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-colors ${
                  recipientType === "all" ? "border-accent bg-accent/5 text-accent" : "border-border text-muted-foreground hover:border-muted-foreground"
                }`}
              >
                <Users className="h-5 w-5" />
                <div className="text-left">
                  <p className="text-sm font-bold">All Customers</p>
                  <p className="text-xs">Mass email + notification</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRecipientType("individual")}
                className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-colors ${
                  recipientType === "individual" ? "border-accent bg-accent/5 text-accent" : "border-border text-muted-foreground hover:border-muted-foreground"
                }`}
              >
                <User className="h-5 w-5" />
                <div className="text-left">
                  <p className="text-sm font-bold">Individual</p>
                  <p className="text-xs">Send to one person</p>
                </div>
              </button>
            </div>
          </div>

          {/* User Search (only for individual) */}
          {recipientType === "individual" && (
            <div className="space-y-2">
              <Label htmlFor="recipient">Select Customer</Label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-9 bg-muted border-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="border rounded-xl max-h-48 overflow-y-auto divide-y">
                {filteredUsers.length === 0 ? (
                  <p className="p-4 text-center text-sm text-muted-foreground">No users found.</p>
                ) : (
                  filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => setSelectedUserId(user.id)}
                      className={`w-full text-left p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors ${
                        selectedUserId === user.id ? "bg-accent/10 ring-1 ring-accent" : ""
                      }`}
                    >
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                        {user.full_name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-primary truncate">{user.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Subject + Message */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" name="subject" placeholder="e.g. System Maintenance Notice" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" rows={6} placeholder="Type your announcement here..." required />
          </div>

          <Button type="submit" size="lg" className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
            {loading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...</>
            ) : (
              recipientType === "all" ? "Send to All Customers" : "Send to Individual"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}