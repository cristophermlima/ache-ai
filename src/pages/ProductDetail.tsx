import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, MapPin, ShoppingCart, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductVariantSelector } from "@/components/ProductVariantSelector";

interface ProductVariant {
  id: string;
  size: string | null;
  color: string | null;
  stock: number;
  sku: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  category: string;
  image_url: string | null;
  colors?: string[] | null;
  sizes?: string[] | null;
  size_type?: string | null;
  stores: {
    name: string;
    whatsapp: string;
    address: string;
    city: string | null;
    opening_time: string | null;
    closing_time: string | null;
    operating_days: string[] | null;
  };
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          stores (
            name,
            whatsapp,
            address,
            city,
            opening_time,
            closing_time,
            operating_days
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      
      const productWithTypedData = {
        ...data,
        colors: Array.isArray(data.colors) ? data.colors as string[] : null,
        sizes: Array.isArray(data.sizes) ? data.sizes as string[] : null,
        stores: {
          ...data.stores,
          operating_days: Array.isArray(data.stores.operating_days) 
            ? data.stores.operating_days as string[]
            : null
        }
      };
      
      setProduct(productWithTypedData);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar produto",
        description: error.message,
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!product) return;

    // Check if variant is required but not selected
    if (selectedVariant === null) {
      // This will happen only if there are variants to select
      toast({
        title: "Selecione uma opção",
        description: "Por favor, selecione cor e/ou tamanho antes de adicionar ao carrinho.",
        variant: "destructive",
      });
      return;
    }

    if (selectedVariant && selectedVariant.stock === 0) {
      toast({
        title: "Produto indisponível",
        description: "Esta variante está sem estoque no momento.",
        variant: "destructive",
      });
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const cartItemId = selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id;
    const existingItem = cart.find((item: any) => item.id === cartItemId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: cartItemId,
        productId: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity: 1,
        variant: selectedVariant ? {
          size: selectedVariant.size,
          color: selectedVariant.color,
        } : null,
        store: product.stores,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    toast({
      title: "Adicionado ao carrinho!",
      description: `${product.name} foi adicionado ao seu carrinho.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!product) return null;

  const dayLabels: Record<string, string> = {
    monday: "Seg",
    tuesday: "Ter",
    wednesday: "Qua",
    thursday: "Qui",
    friday: "Sex",
    saturday: "Sáb",
    sunday: "Dom",
  };

  const formatOperatingDays = () => {
    if (!product.stores.operating_days || product.stores.operating_days.length === 0) {
      return null;
    }
    
    const days = product.stores.operating_days.map(day => dayLabels[day] || day);
    
    // If all days, show "Todos os dias"
    if (days.length === 7) return "Todos os dias";
    
    // If weekdays only
    const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    const isWeekdaysOnly = weekdays.every(day => product.stores.operating_days?.includes(day)) 
                           && product.stores.operating_days.length === 5;
    if (isWeekdaysOnly) return "Seg a Sex";
    
    return days.join(", ");
  };

  const isStoreOpen = () => {
    if (!product.stores.opening_time || !product.stores.closing_time) return true;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [openHour, openMin] = product.stores.opening_time.split(':').map(Number);
    const [closeHour, closeMin] = product.stores.closing_time.split(':').map(Number);
    
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  const storeOpen = isStoreOpen();
  const operatingDays = formatOperatingDays();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Store className="h-8 w-8" />
              <h1 className="text-2xl font-bold">ACHA AI</h1>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/cart")}
              className="hover:bg-primary-foreground/10"
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                <span className="text-9xl">{product.category === "Roupas" ? "👕" : product.category === "Calçados" ? "👟" : "👜"}</span>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <Badge variant="outline">{product.category}</Badge>
              </div>
              <p className="text-4xl font-bold text-primary">
                R$ {product.price.toFixed(2)}
              </p>
            </div>

            {product.description && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Descrição</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            <ProductVariantSelector
              productId={product.id}
              onVariantSelect={setSelectedVariant}
              required={true}
            />

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Informações da Loja</h3>
                  <Badge variant={storeOpen ? "default" : "secondary"}>
                    {storeOpen ? "Aberta" : "Fechada"}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-primary" />
                    <span className="font-medium">{product.stores.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div className="flex flex-col">
                      {product.stores.city && (
                        <span className="font-semibold text-primary">{product.stores.city}</span>
                      )}
                      <span>{product.stores.address}</span>
                    </div>
                  </div>
                  {product.stores.opening_time && product.stores.closing_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <div className="flex flex-col">
                        <span>
                          {product.stores.opening_time.slice(0, 5)} - {product.stores.closing_time.slice(0, 5)}
                        </span>
                        {operatingDays && (
                          <span className="text-xs text-muted-foreground">{operatingDays}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full"
              onClick={addToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Adicionar ao Carrinho
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
