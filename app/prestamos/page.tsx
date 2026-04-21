"use client";

import { useEffect, useState } from "react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoanForm } from "@/components/loans/loan-form";
import { LoanCard } from "@/components/loans/loan-card";
import { HandCoins } from "lucide-react";

interface Loan {
  id: string;
  client_id: string;
  principal_amount: number;
  interest_rate: number;
  start_date: string;
  payment_frequency_days: number;
  status: string;
  clients: {
    name: string;
  };
}

export default function PrestamosPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await fetch("/api/loans");
      if (!response.ok) throw new Error("Error fetching loans");
      const data = await response.json();
      setLoans(data || []);
    } catch (error) {
      console.error("Error fetching loans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoanAdded = () => {
    setIsDialogOpen(false);
    fetchLoans();
  };

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
        <PageHeader
          title="Préstamos Activos"
          action={
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button
                  className="rounded-lg bg-foreground text-background px-4 py-2 text-[13px] transition-opacity hover:opacity-90"
                  style={{ fontWeight: 500 }}
                >
                  Crear Préstamo
                </button>
              </DialogTrigger>
              <DialogContent className="w-[90%] sm:w-full rounded-xl">
                <DialogHeader>
                  <DialogTitle
                    className="text-[16px]"
                    style={{ fontWeight: 500 }}
                  >
                    Nuevo Préstamo
                  </DialogTitle>
                </DialogHeader>
                <LoanForm onSuccess={handleLoanAdded} />
              </DialogContent>
            </Dialog>
          }
        />

        {loans.length === 0 ? (
          <EmptyState
            icon={HandCoins}
            title="Aún no has creado préstamos"
            description="Registra tu primer préstamo para llevar el seguimiento de intereses y pagos."
          />
        ) : (
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} onUpdate={fetchLoans} />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
