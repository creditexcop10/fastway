"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, Package, Users, LayoutDashboard, LogOut, MessageSquare, Mail, Megaphone } from "lucide-react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Admin Overview", href: "/admins", icon: LayoutDashboard },
  { name: "Manage Shipments", href: "/admins/shipments", icon: Package },
  { name: "Users", href: "/admins/users", icon: Users },
  { name: "Messages", href: "/admins/messages", icon: MessageSquare },
  { name: "Contact Messages", href: "/admins/contacts", icon: Mail },
  { name: "Broadcasts", href: "/admins/broadcasts", icon: Megaphone },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex flex-col h-full w-full bg-primary text-primary-foreground">
      {/* Logo */}
      <div className="flex h-20 items-center gap-0 px-6 font-heading text-lg font-bold uppercase tracking-tight border-b border-primary-foreground/10 shrink-0">
        <span>FASTWAY</span>
        <Image src="/favicon.png" alt="Logo" width={32} height={32} className="h-8 w-8 mx-1.5" />
        <span className="bg-gradient-to-r from-primary-foreground to-accent bg-clip-text text-transparent">SEND</span>
      </div>

      {/* Admin Tag */}
      <div className="px-4 pt-6 pb-2 shrink-0">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent/80 flex items-center gap-2 pl-2">
          <ShieldCheck className="h-4 w-4" /> Admin Panel
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20" 
                  : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-primary-foreground/10 shrink-0">
        <Button 
          onClick={handleLogout} 
          variant="ghost" 
          className="w-full justify-start text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <LogOut className="mr-3 h-5 w-5" /> Logout
        </Button>
      </div>
    </div>
  );
}