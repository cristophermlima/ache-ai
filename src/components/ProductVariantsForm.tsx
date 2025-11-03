import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface ProductVariant {
  id?: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
}

interface ProductVariantsFormProps {
  productId: string;
  colors: string[];
  sizes: string[];
}

export const ProductVariantsForm = ({ productId, colors, sizes }: ProductVariantsFormProps) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (productId) {
      fetchVariants();
    } else {
      generateVariants();
    }
  }, [productId, colors, sizes]);

  const fetchVariants = async () => {
    try {
      const { data, error } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productId);

      if (error) throw error;
      
      const formattedVariants = (data || []).map(v => ({
        id: v.id,
        size: v.size || "",
        color: v.color || "",
        stock: v.stock,
        sku: v.sku || "",
      }));

      setVariants(formattedVariants);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar variantes",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const generateVariants = () => {
    const newVariants: ProductVariant[] = [];
    
    if (colors.length === 0 && sizes.length === 0) {
      return;
    }

    if (colors.length > 0 && sizes.length > 0) {
      colors.forEach(color => {
        sizes.forEach(size => {
          newVariants.push({
            size,
            color,
            stock: 0,
            sku: `${color.toUpperCase()}-${size}`,
          });
        });
      });
    } else if (colors.length > 0) {
      colors.forEach(color => {
        newVariants.push({
          size: "",
          color,
          stock: 0,
          sku: color.toUpperCase(),
        });
      });
    } else if (sizes.length > 0) {
      sizes.forEach(size => {
        newVariants.push({
          size,
          color: "",
          stock: 0,
          sku: size,
        });
      });
    }

    setVariants(newVariants);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleSaveVariants = async () => {
    if (!productId) {
      toast({
        title: "Erro",
        description: "Salve o produto primeiro antes de adicionar variantes",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Delete existing variants
      await supabase
        .from("product_variants")
        .delete()
        .eq("product_id", productId);

      // Insert new variants
      const variantsToInsert = variants.map(v => ({
        product_id: productId,
        size: v.size || null,
        color: v.color || null,
        stock: v.stock,
        sku: v.sku || null,
      }));

      const { error } = await supabase
        .from("product_variants")
        .insert(variantsToInsert);

      if (error) throw error;

      toast({
        title: "Variantes salvas!",
        description: "As variantes do produto foram atualizadas com sucesso.",
      });

      fetchVariants();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar variantes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (colors.length === 0 && sizes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Controle de Estoque por Variante</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Adicione cores e/ou tamanhos ao produto para gerenciar o estoque por variante.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Controle de Estoque por Variante</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {colors.length > 0 && <TableHead>Cor</TableHead>}
                {sizes.length > 0 && <TableHead>Tamanho</TableHead>}
                <TableHead>SKU</TableHead>
                <TableHead className="w-[120px]">Estoque</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((variant, index) => (
                <TableRow key={index}>
                  {colors.length > 0 && (
                    <TableCell className="font-medium">{variant.color}</TableCell>
                  )}
                  {sizes.length > 0 && (
                    <TableCell className="font-medium">{variant.size}</TableCell>
                  )}
                  <TableCell>
                    <Input
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, "sku", e.target.value)}
                      placeholder="SKU"
                      className="max-w-[150px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) => updateVariant(index, "stock", parseInt(e.target.value) || 0)}
                      className="max-w-[100px]"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {productId && (
          <Button onClick={handleSaveVariants} disabled={loading} className="w-full">
            {loading ? "Salvando..." : "Salvar Variantes"}
          </Button>
        )}

        {!productId && (
          <p className="text-sm text-muted-foreground text-center">
            As variantes serão salvas automaticamente após criar o produto.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
