"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User, Calendar, Coins } from "lucide-react";

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
      if (!response.ok) throw new Error("Error updating payment");
      onUpdate();
    } catch (error) {
      console.error("Error toggling payment:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="py-0 overflow-hidden transition-colors hover:border-[rgba(0,0,0,0.14)]">
      <CardContent className="p-0">
        <div className="p-4 border-b border-[rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`rounded-full flex items-center justify-center flex-shrink-0 ${
                  payment.was_paid ? "bg-[#E1F5EE]" : "bg-[#FDF1DC]"
                }`}
                style={{ width: 36, height: 36 }}
              >
                <User
                  className={`h-4 w-4 ${
                    payment.was_paid ? "text-[#0F6E56]" : "text-[#A06410]"
                  }`}
                  strokeWidth={2}
                />
              </div>
              <h3
                className="truncate"
                style={{ fontSize: 15, fontWeight: 500 }}
              >
                {payment.loans.clients.name}
              </h3>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] ${
                payment.was_paid
                  ? "bg-[#E1F5EE] text-[#0F6E56]"
                  : "bg-[#FDF1DC] text-[#A06410]"
              }`}
              style={{ fontWeight: 500 }}
            >
              {payment.was_paid ? "Pagado" : "Pendiente"}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-[13px] text-secondary">
            <Calendar className="h-3.5 w-3.5 text-tertiary" strokeWidth={1.75} />
            <span className="capitalize">{formatMonth(payment.payment_month)}</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-secondary">
            <Coins className="h-3.5 w-3.5 text-tertiary" strokeWidth={1.75} />
            <span className="text-foreground tabular-nums" style={{ fontWeight: 500 }}>
              ${Number(payment.interest_earned).toLocaleString("es-CO", {
                minimumFractionDigits: 0,
              })}
            </span>
            <span>de interés</span>
          </div>
          {payment.payment_date && (
            <div className="flex items-center gap-2 text-[12px] text-tertiary">
              <span>
                Pagado el{" "}
                {new Date(payment.payment_date).toLocaleDateString("es-CO")}
              </span>
            </div>
          )}
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={handlePaymentToggle}
            disabled={isProcessing}
            className={
              payment.was_paid
                ? "w-full rounded-lg border border-[rgba(0,0,0,0.12)] py-2 text-[12px] text-secondary transition-colors hover:bg-[rgba(0,0,0,0.03)] hover:text-foreground disabled:opacity-60"
                : "w-full rounded-lg bg-foreground text-background py-2 text-[12px] transition-opacity hover:opacity-90 disabled:opacity-60"
            }
            style={{ fontWeight: 500 }}
          >
            {isProcessing
              ? "Procesando..."
              : payment.was_paid
              ? "Marcar como No Pagado"
              : "Marcar como Pagado"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
