"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminLayoutClient({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex bg-background min-h-screen w-full relative transition-all duration-300">
      <AdminSidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <main className={`flex-1 ${isCollapsed ? "lg:ml-20" : "lg:ml-72"} flex flex-col min-h-screen transition-all duration-300`}>
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-card border-b border-border z-30 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-black italic">C</span>
            </div>
            <p className="text-sm font-bold text-foreground tracking-tight uppercase">COP CMS</p>
          </div>
          <Button
            onClick={() => setIsSidebarOpen(true)}
            variant="ghost"
            size="sm"
            className="p-2 -mr-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors h-auto"
          >
            <Menu size={24} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}

