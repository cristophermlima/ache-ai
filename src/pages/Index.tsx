import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, Store } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { useToast } from "@/hooks/use-toast";

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
    opening_time: string | null;
    closing_time: string | null;
  };
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

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
            opening_time,
            closing_time
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
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

  const filteredProducts = products.filter((product) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      product.name?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query) ||
      product.stores?.name?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Store className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Achei Aí</h1>
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
                <Button variant="outline" size="sm" className="font-semibold border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
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
            <p className="text-lg opacity-90">
              Conectamos consumidores com intenção de compra presencial às lojas físicas da região, fortalecendo o comércio local e gerando fluxo qualificado para o lojista
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por produto, categoria ou loja..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg bg-background text-foreground"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-12">
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
