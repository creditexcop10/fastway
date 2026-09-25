"use client";

import { useState } from "react";
import { Search, Bell, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DashboardSidebar } from "./DashboardSidebar";

export function DashboardHeader({ profile }: { profile: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-8">
      {/* Mobile Hamburger */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger className="inline-flex items-center justify-center h-10 w-10 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open Menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 border-0 bg-primary">
          <DashboardSidebar profile={profile} onNavigate={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 md:max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tracking numbers..." 
            className="pl-9 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-accent"
          />
        </div>
      </div>
      
      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent"></span>
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            {profile?.full_name?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </div>
    </header>
  );
}