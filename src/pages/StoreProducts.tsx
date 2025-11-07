import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Store, MapPin, Clock } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  category: string;
  image_url: string | null;
  store_id: string;
  colors?: string[] | null;
  sizes?: any;
  stores: {
    name: string;
    address: string;
    city: string | null;
    whatsapp: string;
    latitude: number | null;
    longitude: number | null;
    opening_time: string | null;
    closing_time: string | null;
    operating_days: string[] | null;
  };
}

const StoreProducts = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [storeName, setStoreName] = useState("");
  const [storeInfo, setStoreInfo] = useState<Product["stores"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storeId) {
      fetchStoreProducts();
    }
  }, [storeId]);

  const fetchStoreProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          stores (
            name,
            address,
            city,
            whatsapp,
            latitude,
            longitude,
            opening_time,
            closing_time,
            operating_days
          )
        `)
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const productsWithTypedDays = (data || []).map(product => ({
        ...product,
        stores: {
          ...product.stores,
          operating_days: Array.isArray(product.stores.operating_days) 
            ? product.stores.operating_days as string[]
            : null
        }
      }));

      setProducts(productsWithTypedDays);
      if (productsWithTypedDays.length > 0) {
        setStoreName(productsWithTypedDays[0].stores.name);
        setStoreInfo(productsWithTypedDays[0].stores);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar produtos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
    if (!storeInfo?.operating_days || storeInfo.operating_days.length === 0) {
      return null;
    }
    
    const days = storeInfo.operating_days.map(day => dayLabels[day] || day);
    
    if (days.length === 7) return "Todos os dias";
    
    const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    const isWeekdaysOnly = weekdays.every(day => storeInfo.operating_days?.includes(day)) 
                           && storeInfo.operating_days.length === 5;
    if (isWeekdaysOnly) return "Seg a Sex";
    
    return days.join(", ");
  };

  const isStoreOpen = () => {
    if (!storeInfo?.opening_time || !storeInfo?.closing_time) return true;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [openHour, openMin] = storeInfo.opening_time.split(':').map(Number);
    const [closeHour, closeMin] = storeInfo.closing_time.split(':').map(Number);
    
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Store className="h-6 w-6" />
              <h1 className="text-xl font-bold">Produtos da Loja</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Store Info */}
      {storeInfo && (
        <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold">{storeName}</h2>
                    <Badge variant={isStoreOpen() ? "default" : "secondary"}>
                      {isStoreOpen() ? "Aberta" : "Fechada"}
                    </Badge>
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{storeInfo.address}</p>
                      {storeInfo.city && <p className="text-sm">{storeInfo.city}</p>}
                    </div>
                  </div>
                  {storeInfo.opening_time && storeInfo.closing_time && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-5 w-5 shrink-0" />
                      <div>
                        <p>
                          {storeInfo.opening_time.slice(0, 5)} - {storeInfo.closing_time.slice(0, 5)}
                        </p>
                        {formatOperatingDays() && (
                          <p className="text-sm">{formatOperatingDays()}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {storeInfo.whatsapp && (
                  <Button
                    onClick={() => window.open(`https://wa.me/55${storeInfo.whatsapp.replace(/\D/g, '')}`, '_blank')}
                    className="shrink-0"
                  >
                    Contatar Loja
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-2xl font-bold mb-6">Todos os Produtos ({products.length})</h3>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando produtos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Esta loja ainda não possui produtos cadastrados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default StoreProducts;
