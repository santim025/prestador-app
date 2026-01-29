"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
    <Card className="shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-0">
        {/* Header con avatar e info principal */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 truncate">{client.name}</h3>
            </div>
          </div>
        </div>

        {/* Imagen del pagaré si existe */}
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

        {/* Información de contacto */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Phone className="h-4 w-4 text-gray-400" />
            <span>{client.phoneNumber}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="truncate">{client.address}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="px-5 pb-5">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" 
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
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
