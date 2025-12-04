"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LoanForm } from "@/components/loans/loan-form"
import { LoanCard } from "@/components/loans/loan-card"

interface Loan {
  id: string
  client_id: string
  principal_amount: number
  interest_rate: number
  start_date: string
  payment_frequency_days: number
  status: string
  clients: {
    name: string
  }
}

export default function PrestamosPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchLoans()
  }, [])

  const fetchLoans = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("loans")
      .select("*, clients(name)")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching loans:", error)
    } else {
      setLoans(data || [])
    }
    setLoading(false)
  }

  const handleLoanAdded = () => {
    setIsDialogOpen(false)
    fetchLoans()
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />

      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Préstamos Activos</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Crear Préstamo</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nuevo Préstamo</DialogTitle>
              </DialogHeader>
              <LoanForm onSuccess={handleLoanAdded} />
            </DialogContent>
          </Dialog>
        </div>

        {loans.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">No hay préstamos registrados. Crea uno para comenzar.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} onUpdate={fetchLoans} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
