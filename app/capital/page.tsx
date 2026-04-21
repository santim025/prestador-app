"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Wallet, TrendingUp, Activity } from "lucide-react";

interface Capital {
  id: string;
  initialCapital: number;
}

function formatCOP(value: number) {
  return `$${value.toLocaleString("es-CO", { minimumFractionDigits: 0 })}`;
}

export default function CapitalPage() {
  const [capital, setCapital] = useState<Capital | null>(null);
  const [totalInterestEarned, setTotalInterestEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newInitialCapital, setNewInitialCapital] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchCapitalData();
  }, []);

  const fetchCapitalData = async () => {
    try {
      const capitalResponse = await fetch("/api/capital");
      if (capitalResponse.ok) {
        const capitalData = await capitalResponse.json();
        setCapital(capitalData);
        setNewInitialCapital(capitalData?.initialCapital?.toString() || "0");
      }

      const paymentsResponse = await fetch("/api/payments");
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        const total = paymentsData
          .filter((p: any) => p.was_paid)
          .reduce((sum: number, p: any) => sum + Number(p.interest_earned), 0);
        setTotalInterestEarned(total);
      }
    } catch (error) {
      console.error("Error fetching capital data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInitialCapital = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const response = await fetch("/api/capital", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initialCapital: parseFloat(newInitialCapital) }),
      });

      if (!response.ok) throw new Error("Error updating capital");

      setIsDialogOpen(false);
      fetchCapitalData();
    } catch (error) {
      console.error("Error updating capital:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-secondary text-sm">Cargando...</p>
      </div>
    );
  }

  const initialCapitalValue = Number(capital?.initialCapital || 0);
  const currentCapital = initialCapitalValue + totalInterestEarned;
  const growth = initialCapitalValue
    ? (totalInterestEarned / initialCapitalValue) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <div className="space-y-4 p-4 sm:p-6 max-w-7xl mx-auto">
        <PageHeader
          title="Mi Capital"
          action={
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button
                  className="rounded-lg bg-foreground text-background px-4 py-2 text-[13px] transition-opacity hover:opacity-90"
                  style={{ fontWeight: 500 }}
                >
                  Actualizar Capital
                </button>
              </DialogTrigger>
              <DialogContent className="w-[90%] sm:w-full rounded-xl">
                <DialogHeader>
                  <DialogTitle
                    className="text-[16px]"
                    style={{ fontWeight: 500 }}
                  >
                    Actualizar Capital Inicial
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleUpdateInitialCapital}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label htmlFor="capital" className="form-label block">
                      Capital Inicial
                    </label>
                    <Input
                      id="capital"
                      type="number"
                      placeholder="0"
                      value={newInitialCapital}
                      onChange={(e) => setNewInitialCapital(e.target.value)}
                      required
                      disabled={isUpdating}
                      step="1000"
                    />
                    <p className="text-tertiary" style={{ fontSize: 11 }}>
                      Este es tu dinero inicial al comenzar a prestar. El
                      capital actual se calcula automáticamente.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full rounded-lg bg-foreground text-background py-2.5 text-[13px] transition-opacity hover:opacity-90 disabled:opacity-60"
                    style={{ fontWeight: 500 }}
                  >
                    {isUpdating ? "Actualizando..." : "Guardar"}
                  </button>
                </form>
              </DialogContent>
            </Dialog>
          }
        />

        <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Capital Inicial"
            value={formatCOP(initialCapitalValue)}
            icon={Wallet}
            tone="neutral"
          />
          <StatCard
            label="Capital Actual"
            value={formatCOP(currentCapital)}
            subtitle="Inicial + Intereses"
            icon={TrendingUp}
            tone="emerald"
          />
          <StatCard
            label="Crecimiento"
            value={`${growth.toFixed(1)}%`}
            subtitle={`${formatCOP(totalInterestEarned)} ganados`}
            icon={Activity}
            tone="amber"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-[14px]" style={{ fontWeight: 500 }}>
              Información del Capital
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-[13px] text-secondary">
            <p>
              <span className="text-foreground" style={{ fontWeight: 500 }}>
                Capital Inicial:
              </span>{" "}
              Tu dinero al comenzar a prestar.
            </p>
            <p>
              <span className="text-foreground" style={{ fontWeight: 500 }}>
                Capital Actual:
              </span>{" "}
              Tu capital inicial más todos los intereses cobrados.
            </p>
            <p>
              <span className="text-foreground" style={{ fontWeight: 500 }}>
                Crecimiento:
              </span>{" "}
              Porcentaje de aumento desde tu capital inicial.
            </p>
            <p className="text-tertiary">
              El capital actual se calcula automáticamente cuando marcas un pago
              como realizado.
            </p>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
