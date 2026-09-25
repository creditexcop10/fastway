"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "./AdminSidebar";

export function AdminHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-8 md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger className="inline-flex items-center justify-center h-10 w-10 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open Menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 border-0 bg-primary">
          <AdminSidebar onNavigate={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
      
      <div className="flex items-center gap-2 font-heading text-lg font-bold uppercase tracking-tight text-primary">
        Admin Panel
      </div>
    </header>
  );
}