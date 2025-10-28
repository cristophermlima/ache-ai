import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const storeSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome da loja é obrigatório" }).max(100),
  whatsapp: z.string().trim().min(10, { message: "WhatsApp inválido" }).max(20),
  address: z.string().trim().min(1, { message: "Endereço é obrigatório" }).max(255),
  city: z.string().trim().min(1, { message: "Cidade é obrigatória" }).max(100),
  state: z.string().trim().optional(),
  opening_time: z.string().optional(),
  closing_time: z.string().optional(),
  operating_days: z.array(z.string()).optional(),
});

interface StoreEditFormProps {
  store: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const daysOfWeek = [
  { value: "monday", label: "Segunda" },
  { value: "tuesday", label: "Terça" },
  { value: "wednesday", label: "Quarta" },
  { value: "thursday", label: "Quinta" },
  { value: "friday", label: "Sexta" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

export const StoreEditForm = ({ store, onSuccess, onCancel }: StoreEditFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: store?.name || "",
    whatsapp: store?.whatsapp || "",
    address: store?.address || "",
    city: store?.city || "",
    state: store?.state || "",
    opening_time: store?.opening_time || "",
    closing_time: store?.closing_time || "",
    operating_days: store?.operating_days || ["monday", "tuesday", "wednesday", "thursday", "friday"],
  });

  const handleDayToggle = (day: string) => {
    setFormData({
      ...formData,
      operating_days: formData.operating_days.includes(day)
        ? formData.operating_days.filter((d: string) => d !== day)
        : [...formData.operating_days, day],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validated = storeSchema.parse(formData);
      setLoading(true);

      const { error } = await supabase
        .from("stores")
        .update({
          name: validated.name,
          whatsapp: validated.whatsapp,
          address: validated.address,
          city: validated.city,
          state: validated.state || null,
          opening_time: validated.opening_time || null,
          closing_time: validated.closing_time || null,
          operating_days: validated.operating_days || null,
        })
        .eq("id", store.id);

      if (error) throw error;

      toast({
        title: "Loja atualizada!",
        description: "As informações foram salvas com sucesso.",
      });

      onSuccess();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao atualizar loja",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Nome da Loja *</Label>
          <Input
            id="name"
            placeholder="Ex: Boutique Fashion"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="whatsapp">WhatsApp (com DDD) *</Label>
          <Input
            id="whatsapp"
            placeholder="Ex: 11999999999"
            value={formData.whatsapp}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Endereço Completo *</Label>
          <Input
            id="address"
            placeholder="Ex: Rua das Flores, 123 - Centro"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Cidade *</Label>
          <Input
            id="city"
            placeholder="Ex: São Paulo"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            placeholder="Ex: SP"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="opening_time">Horário de Abertura</Label>
          <Input
            id="opening_time"
            type="time"
            value={formData.opening_time}
            onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="closing_time">Horário de Fechamento</Label>
          <Input
            id="closing_time"
            type="time"
            value={formData.closing_time}
            onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Dias de Funcionamento</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {daysOfWeek.map((day) => (
              <div key={day.value} className="flex items-center space-x-2">
                <Checkbox
                  id={day.value}
                  checked={formData.operating_days.includes(day.value)}
                  onCheckedChange={() => handleDayToggle(day.value)}
                />
                <label
                  htmlFor={day.value}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {day.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};
