"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Settings, LogOut, PlusCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Book Shipment", href: "/dashboard/book", icon: PlusCircle },
  { name: "My Shipments", href: "/dashboard/shipments", icon: Package },
  { name: "Profile", href: "/dashboard/profile", icon: Settings },
];

export function DashboardSidebar({ profile, onNavigate }: { profile: any, onNavigate?: () => void }) {
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
      <div className="flex h-20 items-center gap-0 px-6 font-heading text-lg font-bold uppercase border-b border-primary-foreground/10 shrink-0">
        <span>FASTWAY</span>
        <Image src="/favicon.png" alt="Logo" width={32} height={32} className="h-8 w-8 mx-1.5" />
        <span className="bg-gradient-to-r from-primary-foreground to-accent bg-clip-text text-transparent">SEND</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-2">
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

      {/* Footer */}
      <div className="p-4 border-t border-primary-foreground/10 shrink-0">
        <div className="px-4 py-2 mb-2">
          <p className="text-sm font-medium truncate">{profile?.full_name || "User"}</p>
          <p className="text-xs text-primary-foreground/50 truncate">{profile?.role?.toUpperCase()}</p>
        </div>
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