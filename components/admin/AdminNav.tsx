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
    <aside className="w-64 shrink-0 border-r bg-white dark:bg-black flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b flex items-center gap-3">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-2">
          <Flame className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-extrabold text-sm">Lagablab</div>
          <div className="text-[10px] text-muted-foreground">Admin Panel</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(href, exact)
                ? "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LayoutDashboard className="h-4 w-4" />
          View Scoreboard
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
