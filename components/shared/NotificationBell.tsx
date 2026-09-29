"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";

export function NotificationBell() {
  const supabase = createSupabaseBrowserClient();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    };

    fetchNotifications();

    // Subscribe to new notifications in real-time
    const channel = supabase
      .channel("notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        setNotifications((prev) => [payload.new, ...prev]);
        setUnreadCount((prev) => prev + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds);

    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => { setOpen(!open); if (!open && unreadCount > 0) handleMarkAllRead(); }}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div 
            className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="p-4 border-b">
              <h3 className="font-heading font-bold text-primary">Notifications</h3>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y">
              {notifications.length === 0 ? (
                <p className="p-8 text-center text-sm text-muted-foreground">No notifications yet.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`p-4 ${!n.is_read ? "bg-accent/5" : ""}`}>
                    <p className="text-sm font-medium text-primary">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}