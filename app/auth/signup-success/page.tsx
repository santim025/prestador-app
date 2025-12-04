"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Cuenta creada</CardTitle>
            <CardDescription>Por favor, confirma tu correo electrónico</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Hemos enviado un enlace de confirmación a tu correo electrónico. Por favor, haz clic en el enlace para
              confirmar tu cuenta.
            </p>
            <p className="text-sm text-muted-foreground">
              Una vez confirmado tu correo, podrás iniciar sesión y comenzar a gestionar tus préstamos.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Ir a inicio de sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
