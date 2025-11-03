import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ProductVariant {
  id: string;
  size: string | null;
  color: string | null;
  stock: number;
  sku: string | null;
}

interface ProductVariantSelectorProps {
  productId: string;
  onVariantSelect: (variant: ProductVariant | null) => void;
}

export const ProductVariantSelector = ({ productId, onVariantSelect }: ProductVariantSelectorProps) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  useEffect(() => {
    const variant = variants.find(
      v => v.color === selectedColor && v.size === selectedSize
    );
    onVariantSelect(variant || null);
  }, [selectedColor, selectedSize, variants]);

  const fetchVariants = async () => {
    try {
      const { data, error } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productId);

      if (error) throw error;
      setVariants(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar variantes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Carregando opções...</p>;
  }

  if (variants.length === 0) {
    return null;
  }

  const colors = [...new Set(variants.map(v => v.color).filter(Boolean))] as string[];
  const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))] as string[];

  const getAvailableSizes = () => {
    if (!selectedColor) return sizes;
    return sizes.filter(size =>
      variants.some(v => v.color === selectedColor && v.size === size && v.stock > 0)
    );
  };

  const getAvailableColors = () => {
    if (!selectedSize) return colors;
    return colors.filter(color =>
      variants.some(v => v.size === selectedSize && v.color === color && v.stock > 0)
    );
  };

  const getStockForVariant = () => {
    if (!selectedColor && !selectedSize) return null;
    const variant = variants.find(
      v => v.color === selectedColor && v.size === selectedSize
    );
    return variant?.stock || 0;
  };

  const availableColors = getAvailableColors();
  const availableSizes = getAvailableSizes();
  const stock = getStockForVariant();

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {colors.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Selecione a Cor</h3>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => {
                const isAvailable = availableColors.includes(color);
                return (
                  <Button
                    key={color}
                    variant={selectedColor === color ? "default" : "outline"}
                    size="sm"
                    disabled={!isAvailable}
                    onClick={() => setSelectedColor(color)}
                    className="min-w-[80px]"
                  >
                    {color}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {sizes.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Selecione o Tamanho</h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => {
                const isAvailable = availableSizes.includes(size);
                return (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    size="sm"
                    disabled={!isAvailable}
                    onClick={() => setSelectedSize(size)}
                    className="min-w-[60px]"
                  >
                    {size}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {stock !== null && (
          <div className="pt-2 border-t">
            <p className="text-sm">
              Estoque disponível: <Badge variant={stock > 0 ? "default" : "destructive"}>{stock} unidades</Badge>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
