"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { User, Percent, Calendar, Clock, CheckCircle, Trash2 } from "lucide-react"

interface Loan {
  id: string
  principal_amount: number
  interest_rate: number
  start_date: string
  payment_frequency_days: number
  status: string
  clients: {
    name: string
  }
}

interface LoanCardProps {
  loan: Loan
  onUpdate: () => void
}

export function LoanCard({ loan, onUpdate }: LoanCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const monthlyInterest = (loan.principal_amount * loan.interest_rate) / 100

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/loans/${loan.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        console.error("Error deleting loan")
      } else {
        onUpdate()
      }
    } catch (error) {
      console.error("Error deleting loan:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleStatusChange = async () => {
    setIsDeleting(true)
    try {
      const newStatus = loan.status === "active" ? "completed" : "active"
      const response = await fetch(`/api/loans/${loan.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        console.error("Error updating loan")
      } else {
        onUpdate()
      }
    } catch (error) {
      console.error("Error updating loan:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="py-0 overflow-hidden transition-colors hover:border-[rgba(0,0,0,0.14)]">
      <CardContent className="p-0">
        <div className="p-4 border-b border-[rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="rounded-full bg-[#E1F5EE] flex items-center justify-center flex-shrink-0"
                style={{ width: 36, height: 36 }}
              >
                <User className="h-4 w-4 text-[#0F6E56]" strokeWidth={2} />
              </div>
              <h3
                className="truncate"
                style={{ fontSize: 15, fontWeight: 500 }}
              >
                {loan.clients.name}
              </h3>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] ${
                loan.status === "active"
                  ? "bg-[#E1F5EE] text-[#0F6E56]"
                  : "bg-[#F0F0F0] text-secondary"
              }`}
              style={{ fontWeight: 500 }}
            >
              {loan.status === "active" ? "Activo" : "Completado"}
            </span>
          </div>
        </div>

        <div className="px-4 py-3">
          <span
            className="tabular-nums text-[#0F6E56]"
            style={{ fontSize: 20, fontWeight: 500 }}
          >
            ${loan.principal_amount.toLocaleString("es-CO")}
          </span>
          <p className="text-tertiary" style={{ fontSize: 11 }}>
            Capital prestado
          </p>
        </div>

        <div className="px-4 pb-4 space-y-2">
          <div className="flex items-center gap-2 text-[13px] text-secondary">
            <Percent className="h-3.5 w-3.5 text-tertiary" strokeWidth={1.75} />
            <span>Interés: {loan.interest_rate}%</span>
            <span className="text-[#0F6E56]" style={{ fontWeight: 500 }}>
              (${monthlyInterest.toLocaleString("es-CO", { minimumFractionDigits: 0 })}/mes)
            </span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-secondary">
            <Calendar className="h-3.5 w-3.5 text-tertiary" strokeWidth={1.75} />
            <span>Inicio: {new Date(loan.start_date).toLocaleDateString("es-CO")}</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-secondary">
            <Clock className="h-3.5 w-3.5 text-tertiary" strokeWidth={1.75} />
            <span>Frecuencia: cada {loan.payment_frequency_days} días</span>
          </div>
        </div>

        <div className="px-4 pb-4 space-y-2">
          <button
            onClick={handleStatusChange}
            disabled={isDeleting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[rgba(0,0,0,0.12)] py-2 text-[12px] text-secondary transition-colors hover:bg-[rgba(0,0,0,0.03)] hover:text-foreground disabled:opacity-60"
            style={{ fontWeight: 500 }}
          >
            <CheckCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
            {loan.status === "active" ? "Marcar Completado" : "Reactivar"}
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={isDeleting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[rgba(0,0,0,0.12)] py-2 text-[12px] text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                style={{ fontWeight: 500 }}
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                Eliminar
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar préstamo</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de que deseas eliminar el préstamo a {loan.clients.name}? Esta acción no se puede
                  deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Eliminar
              </AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
