import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const payment = await prisma.payment.findFirst({
      where: { id, userId: session.user.id },
      include: {
        loan: true,
      },
    })

    if (!payment) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 })
    }

    const newWasPaid = !payment.wasPaid

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        wasPaid: newWasPaid,
        paymentDate: newWasPaid ? new Date() : null,
      },
    })

    // If marking as paid, create next month's payment
    if (newWasPaid) {
      const currentPaymentMonth = new Date(payment.paymentMonth)
      const nextMonthDate = new Date(
        currentPaymentMonth.getFullYear(),
        currentPaymentMonth.getMonth() + 1,
        1
      )

      // Check if next payment already exists
      const existingPayment = await prisma.payment.findFirst({
        where: {
          loanId: payment.loanId,
          paymentMonth: nextMonthDate,
        },
      })

      if (!existingPayment) {
        // Calculate monthly interest
        const monthlyInterest = Number(payment.loan.principalAmount) * Number(payment.loan.interestRate) / 100

        await prisma.payment.create({
          data: {
            userId: session.user.id,
            loanId: payment.loanId,
            paymentMonth: nextMonthDate,
            interestEarned: monthlyInterest,
            wasPaid: false,
          },
        })
      }
    }

    return NextResponse.json(updatedPayment)
  } catch (error) {
    console.error("Error updating payment:", error)
    return NextResponse.json({ error: "Error al actualizar pago" }, { status: 500 })
  }
}
