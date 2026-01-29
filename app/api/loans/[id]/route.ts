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
    const { status } = await request.json()

    // Verify ownership
    const loan = await prisma.loan.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!loan) {
      return NextResponse.json({ error: "Préstamo no encontrado" }, { status: 404 })
    }

    const updatedLoan = await prisma.loan.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(updatedLoan)
  } catch (error) {
    console.error("Error updating loan:", error)
    return NextResponse.json({ error: "Error al actualizar préstamo" }, { status: 500 })
  }
}

export async function DELETE(
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
    const loan = await prisma.loan.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!loan) {
      return NextResponse.json({ error: "Préstamo no encontrado" }, { status: 404 })
    }

    // Delete associated payments first
    await prisma.payment.deleteMany({
      where: { loanId: id },
    })

    // Then delete the loan
    await prisma.loan.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting loan:", error)
    return NextResponse.json({ error: "Error al eliminar préstamo" }, { status: 500 })
  }
}
