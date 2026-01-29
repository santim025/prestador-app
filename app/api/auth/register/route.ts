import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "El usuario ya existe" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with initial capital
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        capital: {
          create: {
            currentCapital: 0,
            initialCapital: 0,
          },
        },
      },
    })

    return NextResponse.json({
      message: "Usuario creado exitosamente",
      userId: user.id,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Error al crear el usuario" },
      { status: 500 }
    )
  }
}
