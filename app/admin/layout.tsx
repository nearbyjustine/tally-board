"use client";

import { PinGate } from "@/components/admin/PinGate";
import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PinGate>
      <div className="flex h-screen overflow-hidden bg-warmwhite">
        <AdminNav />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </PinGate>
  );
}
