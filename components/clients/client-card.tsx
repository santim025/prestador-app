"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
import { User, Phone, MapPin, Trash2 } from "lucide-react"

interface Client {
  id: string
  name: string
  phoneNumber: string
  address: string
  payageImageUrl: string | null
}

interface ClientCardProps {
  client: Client
  onUpdate: () => void
}

export function ClientCard({ client, onUpdate }: ClientCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        console.error("Error deleting client")
      } else {
        onUpdate()
      }
    } catch (error) {
      console.error("Error deleting client:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="py-0 overflow-hidden transition-colors hover:border-[rgba(0,0,0,0.14)]">
      <CardContent className="p-0">
        <div className="p-4 border-b border-[rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full bg-[#E6EFFE] flex items-center justify-center flex-shrink-0"
              style={{ width: 36, height: 36 }}
            >
              <User className="h-4 w-4 text-[#1E4FC4]" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h3
                className="truncate"
                style={{ fontSize: 15, fontWeight: 500 }}
              >
                {client.name}
              </h3>
            </div>
          </div>
        </div>

        {client.payageImageUrl && (
          <div className="relative w-full h-32 bg-muted">
            <Image
              src={client.payageImageUrl || "/placeholder.svg"}
              alt={`Pagaré de ${client.name}`}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="p-4 space-y-2.5">
          <div className="flex items-center gap-2.5 text-[13px] text-secondary">
            <Phone className="h-3.5 w-3.5 text-tertiary" strokeWidth={1.75} />
            <span>{client.phoneNumber}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[13px] text-secondary">
            <MapPin className="h-3.5 w-3.5 text-tertiary" strokeWidth={1.75} />
            <span className="truncate">{client.address}</span>
          </div>
        </div>

        <div className="px-4 pb-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                disabled={isDeleting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[rgba(0,0,0,0.12)] py-2 text-[12px] text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                style={{ fontWeight: 500 }}
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                Eliminar
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar cliente</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estás seguro de que deseas eliminar a {client.name}? Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Eliminar
              </AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
