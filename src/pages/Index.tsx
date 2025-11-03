import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, Store, Shirt, Wine, Pizza, Smartphone, Footprints, ShoppingBag, Sparkles, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  category: string;
  image_url: string | null;
  store_id: string;
  stores: {
    name: string;
    address: string;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
    opening_time: string | null;
    closing_time: string | null;
    operating_days: string[] | null;
  };
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [cepInput, setCepInput] = useState("");
  const [distanceRadius, setDistanceRadius] = useState<number>(50);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const popularCategories = [
    { name: "Roupas Femininas", Icon: Shirt },
    { name: "Roupas Masculinas", Icon: Shirt },
    { name: "Cosméticos", Icon: Sparkles },
    { name: "Bebidas", Icon: Wine },
    { name: "Alimentos", Icon: Pizza },
    { name: "Eletrônicos", Icon: Smartphone },
    { name: "Calçados", Icon: Footprints },
    { name: "Acessórios", Icon: ShoppingBag },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
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
            latitude,
            longitude,
            opening_time,
            closing_time,
            operating_days
          )
        `)
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

  const searchByCep = async () => {
    if (!cepInput || cepInput.length < 8) {
      toast({
        title: "CEP inválido",
        description: "Digite um CEP válido com 8 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setGettingLocation(true);
    try {
      const cleanCep = cepInput.replace(/\D/g, '');
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "Verifique o CEP digitado e tente novamente.",
          variant: "destructive",
        });
        setGettingLocation(false);
        return;
      }

      setCityFilter(data.localidade);
      toast({
        title: "Localização obtida!",
        description: `Buscando em: ${data.localidade} - ${data.uf}`,
      });
      setGettingLocation(false);
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast({
        title: "Erro",
        description: "Não foi possível buscar o CEP.",
        variant: "destructive",
      });
      setGettingLocation(false);
    }
  };

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      if (!navigator.geolocation) {
        toast({
          title: "Localização não suportada",
          description: "Seu navegador não suporta geolocalização.",
          variant: "destructive",
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || "";
            setCityFilter(city);
            
            toast({
              title: "Localização obtida!",
              description: `Buscando em: ${city} (raio de ${distanceRadius}km)`,
            });
          }
          setGettingLocation(false);
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          toast({
            title: "Erro",
            description: "Não foi possível obter sua localização.",
            variant: "destructive",
          });
          setGettingLocation(false);
        }
      );
    } catch (error) {
      console.error("Erro:", error);
      setGettingLocation(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase().trim();
    const city = cityFilter.toLowerCase().trim();
    const category = categoryFilter.toLowerCase().trim();
    
    const matchesSearch = !query || (
      product.name?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query) ||
      product.stores?.name?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    );
    
    const matchesCity = !city || (
      product.stores?.city?.toLowerCase().includes(city)
    );

    const matchesCategory = !category || (
      product.category?.toLowerCase().includes(category)
    );

    const matchesDistance = !userLocation || 
      !product.stores?.latitude || 
      !product.stores?.longitude ||
      calculateDistance(
        userLocation.lat,
        userLocation.lng,
        Number(product.stores.latitude),
        Number(product.stores.longitude)
      ) <= distanceRadius;
    
    return matchesSearch && matchesCity && matchesCategory && matchesDistance;
  });

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
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/cart")}
                className="hover:bg-primary-foreground/10"
              >
                <ShoppingCart className="h-5 w-5 text-accent" />
              </Button>
              <Link to="/lojista/login">
                <Button variant="outline" size="sm" className="font-semibold border-primary-foreground/30 text-accent hover:bg-primary-foreground hover:text-primary">
                  Área do Lojista
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">
              Encontre o que você procura nas lojas locais
            </h2>
          
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por produto, categoria ou loja..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg bg-background text-foreground"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Filtrar por cidade..."
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="h-12 bg-background text-foreground"
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Buscar por CEP..."
                    value={cepInput}
                    onChange={(e) => setCepInput(e.target.value)}
                    maxLength={9}
                    className="h-12 bg-background text-foreground"
                  />
                  <Button
                    type="button"
                    onClick={searchByCep}
                    disabled={gettingLocation}
                    className="h-12 px-6 whitespace-nowrap"
                  >
                    {gettingLocation ? "..." : "Buscar CEP"}
                  </Button>
                  <Button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                    className="h-12 px-4"
                  >
                    <MapPin className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {userLocation && (
                <div className="bg-background/90 backdrop-blur-sm p-4 rounded-lg">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Raio de busca: {distanceRadius} km
                  </label>
                  <Slider
                    value={[distanceRadius]}
                    onValueChange={(value) => setDistanceRadius(value[0])}
                    min={1}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-8">
        <h3 className="text-2xl font-bold mb-4">Categorias Populares</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {popularCategories.map((cat) => (
            <Button
              key={cat.name}
              variant={categoryFilter.toLowerCase() === cat.name.toLowerCase() ? "default" : "outline"}
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => setCategoryFilter(categoryFilter === cat.name ? "" : cat.name)}
            >
              <cat.Icon className="h-6 w-6" />
              <span className="text-xs text-center">{cat.name}</span>
            </Button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 pb-12">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando produtos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchQuery
                ? "Nenhum produto encontrado para sua busca"
                : "Nenhum produto disponível no momento"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
