"use client";

import { useEffect, useState } from "react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentCard } from "@/components/payments/payment-card";
import { CheckCircle, Clock } from "lucide-react";

interface Payment {
  id: string;
  loan_id: string;
  payment_month: string;
  interest_earned: number;
  was_paid: boolean;
  payment_date: string | null;
  loans: {
    clients: {
      name: string;
    };
  };
}

function formatCOP(value: number) {
  return `$${value.toLocaleString("es-CO", { minimumFractionDigits: 0 })}`;
}

export default function PagosPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/payments");
      if (!response.ok) throw new Error("Error fetching payments");
      const data = await response.json();
      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const pendingPayments = payments.filter((p) => !p.was_paid);
  const completedPayments = payments.filter((p) => p.was_paid);

  const totalPending = pendingPayments.reduce(
    (sum, p) => sum + Number(p.interest_earned),
    0
  );
  const totalCompleted = completedPayments.reduce(
    (sum, p) => sum + Number(p.interest_earned),
    0
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-secondary text-sm">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <div className="space-y-4 p-4 sm:p-6 max-w-7xl mx-auto">
        <PageHeader title="Registro de Pagos" />

        <div className="grid gap-3 grid-cols-2">
          <StatCard
            label="Pagos Pendientes"
            value={formatCOP(totalPending)}
            subtitle={`${pendingPayments.length} sin procesar`}
            icon={Clock}
            tone="amber"
          />
          <StatCard
            label="Pagos Completados"
            value={formatCOP(totalCompleted)}
            subtitle={`${completedPayments.length} procesados`}
            icon={CheckCircle}
            tone="emerald"
          />
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">
              Pendientes ({pendingPayments.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completados ({completedPayments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingPayments.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="Todo al día"
                description="No tienes pagos pendientes por procesar."
              />
            ) : (
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingPayments.map((payment) => (
                  <PaymentCard
                    key={payment.id}
                    payment={payment}
                    onUpdate={fetchPayments}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedPayments.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="Aún sin pagos completados"
                description="Cuando marques pagos como realizados aparecerán aquí."
              />
            ) : (
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedPayments.map((payment) => (
                  <PaymentCard
                    key={payment.id}
                    payment={payment}
                    onUpdate={fetchPayments}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
}
