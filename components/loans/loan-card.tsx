"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
    const supabase = createClient()

    // Delete associated payments first
    await supabase.from("payments").delete().eq("loan_id", loan.id)

    // Then delete the loan
    const { error } = await supabase.from("loans").delete().eq("id", loan.id)

    if (error) {
      console.error("Error deleting loan:", error)
    } else {
      onUpdate()
    }
    setIsDeleting(false)
  }

  const handleStatusChange = async () => {
    setIsDeleting(true)
    const supabase = createClient()
    const newStatus = loan.status === "active" ? "completed" : "active"

    const { error } = await supabase.from("loans").update({ status: newStatus }).eq("id", loan.id)

    if (error) {
      console.error("Error updating loan:", error)
    } else {
      onUpdate()
    }
    setIsDeleting(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{loan.clients.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Monto:</span> ${loan.principal_amount.toLocaleString("es-CO")}
          </p>
          <p>
            <span className="font-semibold">Interés Mensual:</span> {loan.interest_rate}% ($
            {monthlyInterest.toLocaleString("es-CO", {
              minimumFractionDigits: 0,
            })}
            )
          </p>
          <p>
            <span className="font-semibold">Fecha:</span> {new Date(loan.start_date).toLocaleDateString("es-CO")}
          </p>
          <p>
            <span className="font-semibold">Frecuencia:</span> {loan.payment_frequency_days} días
          </p>
          <p>
            <span className="font-semibold">Estado:</span>{" "}
            <span
              className={`rounded px-2 py-1 text-xs font-semibold ${
                loan.status === "active"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
              }`}
            >
              {loan.status === "active" ? "Activo" : "Completado"}
            </span>
          </p>
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={handleStatusChange}
            disabled={isDeleting}
          >
            {loan.status === "active" ? "Marcar Completado" : "Reactivar"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full" disabled={isDeleting}>
                Eliminar
              </Button>
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
              <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
