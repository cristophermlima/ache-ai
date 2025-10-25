import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }).max(100),
  price: z.number().positive({ message: "Preço deve ser maior que zero" }),
  description: z.string().max(500).optional(),
  category: z.string().min(1, { message: "Categoria é obrigatória" }),
  stock: z.number().min(0).optional(),
  image_url: z.string().url({ message: "URL inválida" }).optional().or(z.literal("")),
});

interface ProductFormProps {
  storeId: string;
  product?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ProductForm = ({ storeId, product, onSuccess, onCancel }: ProductFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || "",
    price: product?.price || "",
    description: product?.description || "",
    category: product?.category || "",
    stock: product?.stock || 0,
    image_url: product?.image_url || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validated = productSchema.parse({
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock.toString()) || 0,
      });

      setLoading(true);

      if (product) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update(validated)
          .eq("id", product.id);

        if (error) throw error;

        toast({
          title: "Produto atualizado!",
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        // Create new product
        const productData = {
          name: validated.name,
          price: validated.price,
          description: validated.description || null,
          category: validated.category,
          stock: validated.stock || 0,
          image_url: validated.image_url || null,
          store_id: storeId,
        };
        
        const { error } = await supabase.from("products").insert(productData);

        if (error) throw error;

        toast({
          title: "Produto criado!",
          description: "O produto foi adicionado com sucesso.",
        });
      }

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
          title: "Erro ao salvar produto",
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
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Produto *</Label>
          <Input
            id="name"
            placeholder="Ex: Camiseta Básica"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Preço (R$) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Roupas">Roupas</SelectItem>
              <SelectItem value="Calçados">Calçados</SelectItem>
              <SelectItem value="Acessórios">Acessórios</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Estoque</Label>
          <Input
            id="stock"
            type="number"
            placeholder="0"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="image_url">URL da Imagem</Label>
          <Input
            id="image_url"
            type="url"
            placeholder="https://exemplo.com/imagem.jpg"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            placeholder="Descreva o produto..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Salvando..." : product ? "Atualizar" : "Criar"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};
