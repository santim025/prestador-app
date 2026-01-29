"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  HandCoins,
  CreditCard,
  Wallet,
  LogOut,
  User,
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
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <nav className="border-b border-border bg-card">
      <div className="flex items-center justify-between">
        {/* Navigation Links */}
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

        {/* User Info & Logout */}
        <div className="flex items-center gap-4 px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground hidden md:inline">
              {session?.user?.email || ""}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
