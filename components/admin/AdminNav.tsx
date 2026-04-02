"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Users, Gamepad2, Target, MinusCircle, LayoutDashboard, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/teams", label: "Teams & Members", icon: Users },
  { href: "/admin/games", label: "Games & Scores", icon: Gamepad2 },
  { href: "/admin/missions", label: "Missions", icon: Target },
  { href: "/admin/deductions", label: "Deductions", icon: MinusCircle },
];

export function AdminNav() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  function handleLogout() {
    sessionStorage.removeItem("lagablab_admin");
    window.location.href = "/admin";
  }

  return (
    <aside className="w-64 shrink-0 bg-charcoal flex flex-col h-full border-r border-white/5">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3">
        <div className="bg-flame rounded-xl p-2">
          <Flame className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-heading text-sm font-bold text-white tracking-tight">Lagablab</div>
          <div className="text-[10px] font-medium text-white/35 uppercase tracking-widest">Admin</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(href, exact)
                ? "bg-flame text-white"
                : "text-white/45 hover:bg-white/5 hover:text-white/80"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/5 space-y-0.5">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/45 hover:bg-white/5 hover:text-white/80 transition-colors"
        >
          <LayoutDashboard className="h-4 w-4" />
          View Scoreboard
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/45 hover:bg-white/5 hover:text-white/80 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
