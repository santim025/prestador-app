"use client";

import type React from "react";

import { useEffect, useState } from "react";
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
    clientId: "",
    principalAmount: "",
    interestRate: "",
    startDate: new Date().toISOString().split("T")[0],
    paymentFrequencyDays: "30",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients");
      if (!response.ok) throw new Error("Error fetching clients");
      const data = await response.json();
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
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
      const response = await fetch("/api/loans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: formData.clientId,
          principalAmount: parseFloat(formData.principalAmount),
          interestRate: parseFloat(formData.interestRate),
          startDate: formData.startDate,
          paymentFrequencyDays: formData.paymentFrequencyDays,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear préstamo");
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
        <Label htmlFor="clientId">Cliente</Label>
        <Select
          value={formData.clientId}
          onValueChange={(value) => handleSelectChange("clientId", value)}
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
        <Label htmlFor="principalAmount">Monto del Préstamo</Label>
        <Input
          id="principalAmount"
          name="principalAmount"
          type="number"
          placeholder="1000000"
          value={formData.principalAmount}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          step="1000"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="interestRate">Tasa de Interés Mensual (%)</Label>
        <Input
          id="interestRate"
          name="interestRate"
          type="number"
          placeholder="5"
          value={formData.interestRate}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          step="0.1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="startDate">Fecha de Inicio</Label>
        <Input
          id="startDate"
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleInputChange}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentFrequencyDays">
          Frecuencia de Pago (días)
        </Label>
        <Select
          value={formData.paymentFrequencyDays}
          onValueChange={(value) =>
            handleSelectChange("paymentFrequencyDays", value)
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
