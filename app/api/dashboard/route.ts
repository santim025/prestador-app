import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Get user capital
    const capital = await prisma.userCapital.findUnique({
      where: { userId: session.user.id },
    })

    // Get active loans to calculate lent capital
    const loans = await prisma.loan.findMany({
      where: { 
        userId: session.user.id,
        status: "active",
      },
      select: { principalAmount: true },
    })

    const totalLent = loans.reduce(
      (sum, loan) => sum + Number(loan.principalAmount),
      0
    )

    // Get payments for monthly earnings
    const payments = await prisma.payment.findMany({
      where: { userId: session.user.id },
      orderBy: { paymentMonth: "desc" },
      take: 12,
    })

    // Calculate total interests from paid payments
    const totalInterests = payments
      .filter(p => p.wasPaid)
      .reduce((sum, p) => sum + Number(p.interestEarned), 0)

    // Group by month for chart data
    const monthMap = new Map<string, number>()
    payments.forEach((payment) => {
      if (payment.wasPaid) {
        const month = new Date(payment.paymentMonth).toLocaleDateString("es-ES", {
          month: "short",
          year: "numeric",
        })
        const interest = Number(payment.interestEarned)
        monthMap.set(month, (monthMap.get(month) || 0) + interest)
      }
    })

    const monthlyData = Array.from(monthMap, ([month, earnings]) => ({
      month,
      earnings: Number(earnings.toFixed(2)),
    })).reverse()

    return NextResponse.json({
      capital: {
        current_capital: Number(capital?.initialCapital || 0) + totalInterests,
        initial_capital: Number(capital?.initialCapital || 0),
      },
      totalLent,
      monthlyData,
      totalInterests,
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 })
  }
}
