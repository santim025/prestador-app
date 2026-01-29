"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

interface PaymentCardProps {
  payment: Payment;
  onUpdate: () => void;
}

export function PaymentCard({ payment, onUpdate }: PaymentCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const formatMonth = (dateString: string) => {
    // Asegurar que la fecha se interprete correctamente añadiendo una hora segura (mediodía)
    // Esto evita que '2025-11-01' se convierta en '2025-10-31 19:00' por la zona horaria
    const date = new Date(`${dateString}T12:00:00`);
    return date.toLocaleDateString("es-CO", {
      month: "long",
      year: "numeric",
    });
  };

  const handlePaymentToggle = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch(`/api/payments/${payment.id}`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Error updating payment");
      }

      onUpdate();
    } catch (error) {
      console.error("Error toggling payment:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card
      className={
        payment.was_paid
          ? "bg-green-50 dark:bg-green-950"
          : "bg-yellow-50 dark:bg-yellow-950"
      }
    >
      <CardHeader>
        <CardTitle className="text-lg">{payment.loans.clients.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Mes:</span>{" "}
            {formatMonth(payment.payment_month)}
          </p>
          <p>
            <span className="font-semibold">Interés:</span> $
            {Number(payment.interest_earned).toLocaleString("es-CO", {
              minimumFractionDigits: 0,
            })}
          </p>
          <p>
            <span className="font-semibold">Estado:</span>{" "}
            <span
              className={`rounded px-2 py-1 text-xs font-semibold ${
                payment.was_paid
                  ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
                  : "bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
              }`}
            >
              {payment.was_paid ? "Pagado" : "Pendiente"}
            </span>
          </p>
          {payment.payment_date && (
            <p>
              <span className="font-semibold">Fecha de Pago:</span>{" "}
              {new Date(payment.payment_date).toLocaleDateString("es-CO")}
            </p>
          )}
        </div>

        <Button
          onClick={handlePaymentToggle}
          disabled={isProcessing}
          className="w-full"
          variant={payment.was_paid ? "outline" : "default"}
        >
          {isProcessing
            ? "Procesando..."
            : payment.was_paid
            ? "Marcar como No Pagado"
            : "Marcar como Pagado"}
        </Button>
      </CardContent>
    </Card>
  );
}
