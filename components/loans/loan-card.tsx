"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
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
import { User, DollarSign, Percent, Calendar, Clock, CheckCircle, Trash2 } from "lucide-react"

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
    <Card className="shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-0">
        {/* Header con nombre del cliente y estado */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <User className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900">{loan.clients.name}</h3>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                loan.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {loan.status === "active" ? "Activo" : "Completado"}
            </span>
          </div>
        </div>

        {/* Monto principal destacado */}
        <div className="px-5 py-4 bg-gray-50">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <span className="text-2xl font-bold text-emerald-600">
              ${loan.principal_amount.toLocaleString("es-CO")}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 ml-7">Capital prestado</p>
        </div>

        {/* Detalles del préstamo */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Percent className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Interés: {loan.interest_rate}%</span>
            <span className="text-emerald-600 font-medium">
              (${monthlyInterest.toLocaleString("es-CO", { minimumFractionDigits: 0 })}/mes)
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>Inicio: {new Date(loan.start_date).toLocaleDateString("es-CO")}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>Frecuencia: cada {loan.payment_frequency_days} días</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="px-5 pb-5 space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleStatusChange}
            disabled={isDeleting}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {loan.status === "active" ? "Marcar Completado" : "Reactivar"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" 
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
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
