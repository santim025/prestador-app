import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const loans = await prisma.loan.findMany({
      where: { userId: session.user.id },
      include: {
        client: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Transform to match expected format
    const transformedLoans = loans.map(loan => ({
      id: loan.id,
      client_id: loan.clientId,
      principal_amount: Number(loan.principalAmount),
      interest_rate: Number(loan.interestRate),
      start_date: loan.startDate.toISOString().split("T")[0],
      payment_frequency_days: loan.paymentFrequencyDays,
      status: loan.status,
      clients: {
        name: loan.client.name,
      },
    }))

    return NextResponse.json(transformedLoans)
  } catch (error) {
    console.error("Error fetching loans:", error)
    return NextResponse.json({ error: "Error al obtener préstamos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { clientId, principalAmount, interestRate, startDate, paymentFrequencyDays } = await request.json()

    // Create loan
    const loan = await prisma.loan.create({
      data: {
        userId: session.user.id,
        clientId,
        principalAmount,
        interestRate,
        startDate: new Date(startDate),
        paymentFrequencyDays: parseInt(paymentFrequencyDays),
        status: "active",
      },
    })

    // Calculate first payment month
    const [year, month] = startDate.split("-").map(Number)
    const nextMonthDate = new Date(year, month, 1)
    const paymentMonth = nextMonthDate

    // Calculate monthly interest
    const monthlyInterest = (principalAmount * interestRate) / 100

    // Create first payment record
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        loanId: loan.id,
        paymentMonth,
        interestEarned: monthlyInterest,
        wasPaid: false,
      },
    })

    return NextResponse.json(loan)
  } catch (error) {
    console.error("Error creating loan:", error)
    return NextResponse.json({ error: "Error al crear préstamo" }, { status: 500 })
  }
}
