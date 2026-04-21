"use client";

import { useEffect, useState } from "react";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClientForm } from "@/components/clients/client-form";
import { ClientCard } from "@/components/clients/client-card";
import { Users } from "lucide-react";

interface Client {
  id: string;
  name: string;
  phoneNumber: string;
  address: string;
  payageImageUrl: string | null;
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients");
      if (!response.ok) throw new Error("Error fetching clients");
      const data = await response.json();
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClientAdded = () => {
    setIsDialogOpen(false);
    fetchClients();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-secondary text-sm">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <div className="space-y-4 p-4 sm:p-6 max-w-7xl mx-auto">
        <PageHeader
          title="Clientes"
          action={
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button
                  className="rounded-lg bg-foreground text-background px-4 py-2 text-[13px] transition-opacity hover:opacity-90"
                  style={{ fontWeight: 500 }}
                >
                  Agregar Cliente
                </button>
              </DialogTrigger>
              <DialogContent className="w-[90%] sm:w-full rounded-xl">
                <DialogHeader>
                  <DialogTitle
                    className="text-[16px]"
                    style={{ fontWeight: 500 }}
                  >
                    Nuevo Cliente
                  </DialogTitle>
                </DialogHeader>
                <ClientForm onSuccess={handleClientAdded} />
              </DialogContent>
            </Dialog>
          }
        />

        {clients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Aún no tienes clientes"
            description="Agrega tu primer cliente para empezar a registrar préstamos y llevar control de pagos."
          />
        ) : (
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onUpdate={fetchClients}
              />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
