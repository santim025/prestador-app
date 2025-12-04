"use client";

import type React from "react";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ClientFormProps {
  onSuccess: () => void;
}

export function ClientForm({ onSuccess }: ClientFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    address: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let imageUrl = null;

      // Upload image if provided
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Error uploading image");
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      }

      // Save client to database
      // Save client to database
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Usuario no autenticado");

      const { error: insertError } = await supabase.from("clients").insert({
        user_id: user.id,
        name: formData.name,
        phone_number: formData.phone_number,
        address: formData.address,
        payage_image_url: imageUrl,
      });

      if (insertError) throw insertError;

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear cliente");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          placeholder="Juan Pérez"
          value={formData.name}
          onChange={handleInputChange}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone_number">Celular</Label>
        <Input
          id="phone_number"
          name="phone_number"
          placeholder="+57 300 1234567"
          value={formData.phone_number}
          onChange={handleInputChange}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Textarea
          id="address"
          name="address"
          placeholder="Calle 123 #45-67"
          value={formData.address}
          onChange={handleInputChange}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="payage_image">Imagen del Pagaré (opcional)</Label>
        <Input
          id="payage_image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={isLoading}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Guardando..." : "Guardar Cliente"}
      </Button>
    </form>
  );
}
