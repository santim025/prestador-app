"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Image from "next/image"

interface Client {
  id: string
  name: string
  phone_number: string
  address: string
  payage_image_url: string | null
}

interface ClientCardProps {
  client: Client
  onUpdate: () => void
}

export function ClientCard({ client, onUpdate }: ClientCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from("clients").delete().eq("id", client.id)

    if (error) {
      console.error("Error deleting client:", error)
    } else {
      onUpdate()
    }
    setIsDeleting(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{client.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {client.payage_image_url && (
          <div className="relative w-full h-40 bg-muted rounded-md overflow-hidden">
            <Image
              src={client.payage_image_url || "/placeholder.svg"}
              alt={`Pagaré de ${client.name}`}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Celular:</span> {client.phone_number}
          </p>
          <p>
            <span className="font-semibold">Dirección:</span> {client.address}
          </p>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full" disabled={isDeleting}>
              Eliminar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar cliente</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas eliminar a {client.name}? Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
