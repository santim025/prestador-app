"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Capital {
  id: string;
  initial_capital: number;
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
    const supabase = createClient();

    // Obtener capital inicial
    const { data: capitalData, error: capitalError } = await supabase
      .from("users_capital")
      .select("*")
      .single();

    if (capitalError) {
      console.error("Error fetching capital:", capitalError);
    } else {
      setCapital(capitalData);
      setNewInitialCapital(capitalData.initial_capital.toString());
    }

    // Calcular total de intereses cobrados (solo pagos realizados)
    const { data: paymentsData, error: paymentsError } = await supabase
      .from("payments")
      .select("interest_earned")
      .eq("was_paid", true);

    if (paymentsError) {
      console.error("Error fetching payments:", paymentsError);
    } else {
      const total =
        paymentsData?.reduce(
          (sum, payment) => sum + Number(payment.interest_earned),
          0
        ) || 0;
      setTotalInterestEarned(total);
    }

    setLoading(false);
  };

  const handleUpdateInitialCapital = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("users_capital")
        .update({ initial_capital: Number.parseFloat(newInitialCapital) })
        .eq("id", capital!.id);

      if (error) throw error;

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
        <p>Cargando...</p>
      </div>
    );
  }

  // Calcular el capital actual: capital inicial + intereses ganados
  const currentCapital = (capital?.initial_capital || 0) + totalInterestEarned;

  // Calcular el crecimiento basado en los intereses ganados
  const growth = capital?.initial_capital
    ? (totalInterestEarned / capital.initial_capital) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Mi Capital</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Actualizar Capital Inicial</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Actualizar Capital Inicial</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateInitialCapital} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="capital">Capital Inicial</Label>
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
                  <p className="text-xs text-muted-foreground">
                    Este es tu dinero inicial al comenzar a prestar. El capital
                    actual se calcula automáticamente.
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isUpdating}>
                  {isUpdating ? "Actualizando..." : "Guardar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Capital Inicial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {capital?.initial_capital?.toLocaleString("es-CO", {
                  minimumFractionDigits: 0,
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Capital Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                $
                {currentCapital.toLocaleString("es-CO", {
                  minimumFractionDigits: 0,
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Inicial + Intereses cobrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crecimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{growth.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                $
                {totalInterestEarned.toLocaleString("es-CO", {
                  minimumFractionDigits: 0,
                })}{" "}
                ganados
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Capital</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Capital Inicial:</span> Tu
                dinero al comenzar a prestar
              </p>
              <p>
                <span className="font-semibold">Capital Actual:</span> Tu
                capital inicial más todos los intereses cobrados
              </p>
              <p>
                <span className="font-semibold">Crecimiento:</span> Porcentaje
                de aumento desde tu capital inicial
              </p>
              <p className="text-muted-foreground">
                El capital actual se calcula automáticamente cuando marcas un
                pago como realizado.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
