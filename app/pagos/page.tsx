"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentCard } from "@/components/payments/payment-card"

interface Payment {
  id: string
  loan_id: string
  payment_month: string
  interest_earned: number
  was_paid: boolean
  payment_date: string | null
  loans: {
    clients: {
      name: string
    }
  }
}

export default function PagosPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("payments")
      .select("*, loans(clients(name))")
      .order("payment_month", { ascending: false })

    if (error) {
      console.error("Error fetching payments:", error)
    } else {
      setPayments(data || [])
    }
    setLoading(false)
  }

  const pendingPayments = payments.filter((p) => !p.was_paid)
  const completedPayments = payments.filter((p) => p.was_paid)

  const totalPending = pendingPayments.reduce((sum, p) => sum + Number(p.interest_earned), 0)
  const totalCompleted = completedPayments.reduce((sum, p) => sum + Number(p.interest_earned), 0)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <DashboardHeader />

      <div className="space-y-6 p-6">
        <h2 className="text-3xl font-bold">Registro de Pagos</h2>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {totalPending.toLocaleString("es-CO", {
                  minimumFractionDigits: 0,
                })}
              </div>
              <p className="text-xs text-muted-foreground">{pendingPayments.length} pagos sin procesar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagos Completados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {totalCompleted.toLocaleString("es-CO", {
                  minimumFractionDigits: 0,
                })}
              </div>
              <p className="text-xs text-muted-foreground">{completedPayments.length} pagos procesados</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">Pendientes ({pendingPayments.length})</TabsTrigger>
            <TabsTrigger value="completed">Completados ({completedPayments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingPayments.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">No hay pagos pendientes. ¡Excelente!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingPayments.map((payment) => (
                  <PaymentCard key={payment.id} payment={payment} onUpdate={fetchPayments} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedPayments.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">No hay pagos completados aún.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedPayments.map((payment) => (
                  <PaymentCard key={payment.id} payment={payment} onUpdate={fetchPayments} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
