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

    const payments = await prisma.payment.findMany({
      where: { userId: session.user.id },
      include: {
        loan: {
          include: {
            client: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { paymentMonth: "desc" },
    })

    // Transform to match expected format
    const transformedPayments = payments.map(payment => ({
      id: payment.id,
      loan_id: payment.loanId,
      payment_month: payment.paymentMonth.toISOString().split("T")[0],
      interest_earned: Number(payment.interestEarned),
      was_paid: payment.wasPaid,
      payment_date: payment.paymentDate?.toISOString() || null,
      loans: {
        clients: {
          name: payment.loan.client.name,
        },
      },
    }))

    return NextResponse.json(transformedPayments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Error al obtener pagos" }, { status: 500 })
  }
}
