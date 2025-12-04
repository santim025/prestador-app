"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Client {
  id: string;
  name: string;
}

interface LoanFormProps {
  onSuccess: () => void;
}

export function LoanForm({ onSuccess }: LoanFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    client_id: "",
    principal_amount: "",
    interest_rate: "",
    start_date: new Date().toISOString().split("T")[0],
    payment_frequency_days: "30",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("clients")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching clients:", error);
    } else {
      setClients(data || []);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Usuario no autenticado");

      // Create the loan
      const { data: loanData, error: loanError } = await supabase
        .from("loans")
        .insert({
          user_id: user.id,
          client_id: formData.client_id,
          principal_amount: Number.parseFloat(formData.principal_amount),
          interest_rate: Number.parseFloat(formData.interest_rate),
          start_date: formData.start_date,
          payment_frequency_days: Number.parseInt(
            formData.payment_frequency_days
          ),
          status: "active",
        })
        .select()
        .single();

      if (loanError) throw loanError;

      // Create the first month's payment record
      if (loanData) {
        const monthlyInterest =
          (Number.parseFloat(formData.principal_amount) *
            Number.parseFloat(formData.interest_rate)) /
          100;

        // Calcular el primer día del siguiente mes de forma segura
        // Usamos split para obtener año, mes y día tal cual los ingresó el usuario
        const [year, month, day] = formData.start_date.split("-").map(Number);
        // Creamos la fecha usando componentes locales (mes es 0-indexado, así que month - 1)
        // Pero queremos el siguiente mes, así que usamos (month - 1) + 1 = month
        const nextMonthDate = new Date(year, month, 1);

        // Formatear a YYYY-MM-DD usando componentes locales para evitar UTC shift
        const yyyy = nextMonthDate.getFullYear();
        const mm = String(nextMonthDate.getMonth() + 1).padStart(2, "0");
        const dd = String(nextMonthDate.getDate()).padStart(2, "0");
        const paymentMonth = `${yyyy}-${mm}-${dd}`;

        const { error: paymentError } = await supabase.from("payments").insert({
          user_id: user.id,
          loan_id: loanData.id,
          payment_month: paymentMonth,
          interest_earned: monthlyInterest,
          was_paid: false,
        });

        if (paymentError) throw paymentError;
      }

      onSuccess();
    } catch (err: any) {
      console.error("Error creating loan:", err);
      setError(err?.message || "Error al crear préstamo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="client_id">Cliente</Label>
        <Select
          value={formData.client_id}
          onValueChange={(value) => handleSelectChange("client_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un cliente" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="principal_amount">Monto del Préstamo</Label>
        <Input
          id="principal_amount"
          name="principal_amount"
          type="number"
          placeholder="1000000"
          value={formData.principal_amount}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          step="1000"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="interest_rate">Tasa de Interés Mensual (%)</Label>
        <Input
          id="interest_rate"
          name="interest_rate"
          type="number"
          placeholder="5"
          value={formData.interest_rate}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          step="0.1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="start_date">Fecha de Inicio</Label>
        <Input
          id="start_date"
          name="start_date"
          type="date"
          value={formData.start_date}
          onChange={handleInputChange}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="payment_frequency_days">
          Frecuencia de Pago (días)
        </Label>
        <Select
          value={formData.payment_frequency_days}
          onValueChange={(value) =>
            handleSelectChange("payment_frequency_days", value)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Semanal (7 días)</SelectItem>
            <SelectItem value="15">Quincenal (15 días)</SelectItem>
            <SelectItem value="30">Mensual (30 días)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Guardando..." : "Crear Préstamo"}
      </Button>
    </form>
  );
}
