"use client";

import type React from "react";

import { useState } from "react";
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
    phoneNumber: "",
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
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Error uploading image");
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      }

      // Save client to database
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          payageImageUrl: imageUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear cliente");
      }

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
        <Label htmlFor="phoneNumber">Celular</Label>
        <Input
          id="phoneNumber"
          name="phoneNumber"
          placeholder="+57 300 1234567"
          value={formData.phoneNumber}
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
