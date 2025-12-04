"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  HandCoins,
  CreditCard,
  Wallet,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/prestamos", label: "Préstamos", icon: HandCoins },
  { href: "/pagos", label: "Pagos", icon: CreditCard },
  { href: "/capital", label: "Capital", icon: Wallet },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-card">
      <div className="flex items-center overflow-x-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 hover:bg-accent/50",
              pathname === item.href
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
