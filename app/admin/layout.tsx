"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { PinGate } from "@/components/admin/PinGate";
import { AdminNav } from "@/components/admin/AdminNav";
import { Flame, Menu } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();

  // Close nav on route change
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  return (
    <PinGate>
      <div className="flex h-screen overflow-hidden bg-warmwhite">
        <AdminNav open={navOpen} onClose={() => setNavOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile top bar */}
          <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-charcoal border-b border-white/5">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-flame rounded-lg p-1.5">
                <Flame className="h-4 w-4 text-white" />
              </div>
              <span className="font-heading text-sm font-bold text-white tracking-tight">Lagablab</span>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </PinGate>
  );
}
