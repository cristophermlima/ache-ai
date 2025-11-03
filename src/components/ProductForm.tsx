import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Upload, X } from "lucide-react";
import { ProductVariantsForm } from "@/components/ProductVariantsForm";

const productSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome é obrigatório" }).max(100),
  price: z.number().positive({ message: "Preço deve ser maior que zero" }),
  description: z.string().max(1000).optional(),
  category: z.string().min(1, { message: "Categoria é obrigatória" }),
  stock: z.number().min(0).optional(),
  image_url: z.string().url({ message: "URL inválida" }).optional().or(z.literal("")),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  size_type: z.enum(["number", "letter", "none"]).optional(),
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
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url || null);
  const [formData, setFormData] = useState({
    name: product?.name || "",
    price: product?.price || "",
    description: product?.description || "",
    category: product?.category || "",
    stock: product?.stock || 0,
    image_url: product?.image_url || "",
    size_type: product?.size_type || "none",
  });
  const [colors, setColors] = useState<string[]>(product?.colors || []);
  const [sizes, setSizes] = useState<string[]>(product?.sizes || []);
  const [colorInput, setColorInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.image_url || null;

    try {
      setUploading(true);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast({
        title: "Erro ao fazer upload",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Upload image if a file was selected
      const uploadedImageUrl = await uploadImage();
      
      const validated = productSchema.parse({
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock.toString()) || 0,
        image_url: uploadedImageUrl || formData.image_url,
        colors: colors.length > 0 ? colors : [],
        sizes: sizes.length > 0 ? sizes : [],
        size_type: formData.size_type,
      });

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
          colors: validated.colors || [],
          sizes: validated.sizes || [],
          size_type: validated.size_type || "none",
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

  const currentProductId = product?.id;

  return (
    <div className="space-y-6">
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
          <Input
            id="category"
            placeholder="Ex: Roupas, Eletrônicos, Alimentos"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />
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
          <Label>Imagem do Produto</Label>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Fazer Upload</TabsTrigger>
              <TabsTrigger value="url">Inserir URL</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  id="image_file"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  onChange={handleImageFileChange}
                  className="flex-1"
                />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded" />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: PNG, JPG, WEBP, GIF (máx. 5MB)
              </p>
            </TabsContent>
            <TabsContent value="url" className="space-y-2">
              <Input
                id="image_url"
                type="url"
                placeholder="https://exemplo.com/imagem.jpg"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descrição Detalhada</Label>
          <Textarea
            id="description"
            placeholder="Descreva o produto em detalhes: características, materiais, diferenciais..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={5}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Cores Disponíveis</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Vermelho, Azul, Verde"
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (colorInput.trim() && !colors.includes(colorInput.trim())) {
                    setColors([...colors, colorInput.trim()]);
                    setColorInput("");
                  }
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (colorInput.trim() && !colors.includes(colorInput.trim())) {
                  setColors([...colors, colorInput.trim()]);
                  setColorInput("");
                }
              }}
            >
              Adicionar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {colors.map((color, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {color}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setColors(colors.filter((_, i) => i !== index))}
                />
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tipo de Tamanho</Label>
          <Select
            value={formData.size_type}
            onValueChange={(value) => {
              setFormData({ ...formData, size_type: value });
              if (value === "none") setSizes([]);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Tamanho Único / Não Aplicável</SelectItem>
              <SelectItem value="letter">Letras (P, M, G, GG, XG)</SelectItem>
              <SelectItem value="number">Números</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.size_type !== "none" && (
          <div className="space-y-2">
            <Label>Tamanhos Disponíveis</Label>
            <div className="flex gap-2">
              <Input
                placeholder={formData.size_type === "letter" ? "Ex: P, M, G" : "Ex: 38, 40, 42"}
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) {
                      setSizes([...sizes, sizeInput.trim()]);
                      setSizeInput("");
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (sizeInput.trim() && !sizes.includes(sizeInput.trim())) {
                    setSizes([...sizes, sizeInput.trim()]);
                    setSizeInput("");
                  }
                }}
              >
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {sizes.map((size, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {size}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSizes(sizes.filter((_, i) => i !== index))}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading || uploading} className="flex-1">
          {uploading ? "Fazendo upload..." : loading ? "Salvando..." : product ? "Atualizar" : "Criar"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>

    {(colors.length > 0 || sizes.length > 0) && currentProductId && (
      <ProductVariantsForm
        productId={currentProductId}
        colors={colors}
        sizes={sizes}
      />
    )}
  </div>
  );
};
