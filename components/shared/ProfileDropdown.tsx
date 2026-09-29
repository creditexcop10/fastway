"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { LogOut, User, Settings } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProfileDropdown({ profile, role }: { profile: any, role: "customer" | "admin" }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = profile?.full_name?.charAt(0).toUpperCase() || "U";
  const name = profile?.full_name || "User";

  return (
    <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-3 cursor-pointer focus:outline-none">
        <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-primary">{name}</p>
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            {initials}
        </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
            <p className="text-sm font-semibold text-primary">{name}</p>
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
            <div className="h-px bg-border my-1" />
            
            {role === "customer" && (
            <DropdownMenuItem className="cursor-pointer p-0">
                <Link href="/dashboard/profile" className="w-full flex items-center gap-2 p-2">
                <User className="h-4 w-4" /> Profile
                </Link>
            </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2 p-2">
            <LogOut className="h-4 w-4" /> Logout
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );
}