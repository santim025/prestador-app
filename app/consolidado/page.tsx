"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Download, Mail, Loader2, FileText, CheckCircle2, AlertTriangle } from "lucide-react";

type Feedback =
  | { kind: "success"; message: string }
  | { kind: "error"; message: string }
  | null;

function currentMonth(offset = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default function ConsolidadoPage() {
  const [fromMonth, setFromMonth] = useState(currentMonth(-2));
  const [toMonth, setToMonth] = useState(currentMonth(0));
  const [recipient, setRecipient] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const rangeValid = useMemo(() => {
    if (!fromMonth || !toMonth) return false;
    return fromMonth <= toMonth;
  }, [fromMonth, toMonth]);

  const handleDownload = async () => {
    setFeedback(null);
    if (!rangeValid) {
      setFeedback({
        kind: "error",
        message: "El mes inicial no puede ser mayor al final.",
      });
      return;
    }
    setIsDownloading(true);
    try {
      const res = await fetch(
        `/api/reports/consolidated/pdf?from=${fromMonth}&to=${toMonth}`
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo generar el PDF");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lendtrack-consolidado-${fromMonth}_a_${toMonth}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setFeedback({
        kind: "success",
        message: "PDF descargado correctamente.",
      });
    } catch (err: any) {
      setFeedback({
        kind: "error",
        message: err?.message || "Error al generar el PDF.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!rangeValid) {
      setFeedback({
        kind: "error",
        message: "El mes inicial no puede ser mayor al final.",
      });
      return;
    }
    if (!recipient) {
      setFeedback({
        kind: "error",
        message: "Ingresa un correo destinatario.",
      });
      return;
    }
    setIsSending(true);
    try {
      const res = await fetch("/api/reports/consolidated/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromMonth,
          to: toMonth,
          recipient,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "No se pudo enviar el correo");
      }
      setFeedback({
        kind: "success",
        message: `Consolidado enviado a ${recipient}.`,
      });
    } catch (err: any) {
      setFeedback({
        kind: "error",
        message: err?.message || "Error al enviar el correo.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <div className="space-y-4 p-4 sm:p-6 max-w-4xl mx-auto">
        <PageHeader title="Consolidado" />

        <Card>
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start gap-3 pb-4 border-b border-[rgba(0,0,0,0.06)]">
              <div
                className="flex items-center justify-center rounded-full bg-[#E1F5EE] flex-shrink-0"
                style={{ width: 36, height: 36 }}
              >
                <FileText className="h-4 w-4 text-[#0F6E56]" strokeWidth={2} />
              </div>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 500 }}>
                  Reporte de pagos por periodo
                </h2>
                <p
                  className="text-secondary mt-0.5"
                  style={{ fontSize: 13 }}
                >
                  Genera un PDF profesional con los pagos realizados en el
                  rango de meses seleccionado. Lo puedes descargar o enviarlo
                  por correo.
                </p>
              </div>
            </div>

            <form onSubmit={handleSend} className="space-y-4 pt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="from" className="form-label block">
                    Desde mes
                  </label>
                  <Input
                    id="from"
                    type="month"
                    value={fromMonth}
                    onChange={(e) => setFromMonth(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="to" className="form-label block">
                    Hasta mes
                  </label>
                  <Input
                    id="to"
                    type="month"
                    value={toMonth}
                    onChange={(e) => setToMonth(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="recipient" className="form-label block">
                  Enviar a
                </label>
                <Input
                  id="recipient"
                  type="email"
                  placeholder="nombre@correo.com"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
                <p
                  className="text-tertiary"
                  style={{ fontSize: 11 }}
                >
                  Solo necesario si vas a enviar por correo.
                </p>
              </div>

              {feedback && (
                <div
                  className={`flex items-start gap-2 rounded-lg px-3 py-2 text-[13px] ${
                    feedback.kind === "success"
                      ? "bg-[#E1F5EE] text-[#0F6E56]"
                      : "bg-[#FDECEC] text-[#B3261E]"
                  }`}
                >
                  {feedback.kind === "success" ? (
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" strokeWidth={2} />
                  ) : (
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" strokeWidth={2} />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading || isSending}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[rgba(0,0,0,0.12)] bg-card px-4 py-2 text-[13px] text-foreground transition-colors hover:bg-[rgba(0,0,0,0.03)] disabled:opacity-60"
                  style={{ fontWeight: 500 }}
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                  ) : (
                    <Download className="h-4 w-4" strokeWidth={2} />
                  )}
                  {isDownloading ? "Generando..." : "Descargar PDF"}
                </button>

                <button
                  type="submit"
                  disabled={isSending || isDownloading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-4 py-2 text-[13px] transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ fontWeight: 500 }}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                  ) : (
                    <Mail className="h-4 w-4" strokeWidth={2} />
                  )}
                  {isSending ? "Enviando..." : "Enviar por correo"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 sm:p-6 space-y-2 text-[13px] text-secondary">
            <p style={{ fontSize: 14, fontWeight: 500 }} className="text-foreground">
              ¿Qué incluye el consolidado?
            </p>
            <ul className="space-y-1 list-disc pl-4">
              <li>Todos los pagos marcados como realizados dentro del rango.</li>
              <li>Cliente, mes, fecha de pago, tasa de interés, monto prestado y monto del interés cobrado.</li>
              <li>Totales: dinero cobrado, cantidad de pagos y clientes involucrados.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
