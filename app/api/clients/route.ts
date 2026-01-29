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

    const clients = await prisma.client.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { name, phoneNumber, address, payageImageUrl } = await request.json()

    const client = await prisma.client.create({
      data: {
        userId: session.user.id,
        name,
        phoneNumber,
        address,
        payageImageUrl,
      },
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 })
  }
}
