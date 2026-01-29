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

    const capital = await prisma.userCapital.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json(capital)
  } catch (error) {
    console.error("Error fetching capital:", error)
    return NextResponse.json({ error: "Error al obtener capital" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { initialCapital } = await request.json()

    const capital = await prisma.userCapital.update({
      where: { userId: session.user.id },
      data: { initialCapital },
    })

    return NextResponse.json(capital)
  } catch (error) {
    console.error("Error updating capital:", error)
    return NextResponse.json({ error: "Error al actualizar capital" }, { status: 500 })
  }
}
