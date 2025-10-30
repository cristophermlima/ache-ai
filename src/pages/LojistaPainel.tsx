import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Plus, Store, Edit, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductForm } from "@/components/ProductForm";
import { ProductList } from "@/components/ProductList";
import { StoreEditForm } from "@/components/StoreEditForm";
import { BulkUpload } from "@/components/BulkUpload";

interface StoreData {
  id: string;
  name: string;
  whatsapp: string;
  address: string;
  opening_time: string | null;
  closing_time: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  category: string;
  stock: number;
  image_url: string | null;
}

const LojistaPainel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showStoreEdit, setShowStoreEdit] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/lojista/login");
      return;
    }

    setUser(user);
    await loadStore(user.id);
  };

  const loadStore = async (userId: string) => {
    try {
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (storeError) {
        if (storeError.code === "PGRST116") {
          navigate("/lojista/cadastro-loja");
          return;
        }
        throw storeError;
      }

      setStore(storeData);
      await loadProducts(storeData.id);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (storeId: string) => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar produtos",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setProducts(data || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
  };

  const handleProductSaved = () => {
    if (store) {
      loadProducts(store.id);
    }
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleStoreSaved = () => {
    if (user) {
      loadStore(user.id);
    }
    setShowStoreEdit(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      toast({
        title: "Erro ao excluir produto",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Produto excluído",
      description: "O produto foi removido com sucesso.",
    });

    if (store) {
      loadProducts(store.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Painel do Lojista</h1>
                {store && <p className="text-sm opacity-90">{store.name}</p>}
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="hover:bg-primary-foreground/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Store Info Card */}
        {store && !showStoreEdit && (
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Informações da Loja</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStoreEdit(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Nome:</strong> {store.name}</p>
              <p><strong>WhatsApp:</strong> {store.whatsapp}</p>
              <p><strong>Endereço:</strong> {store.address}</p>
              {store.opening_time && store.closing_time && (
                <p>
                  <strong>Horário:</strong> {store.opening_time.slice(0, 5)} - {store.closing_time.slice(0, 5)}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Store Edit Form */}
        {store && showStoreEdit && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Editar Informações da Loja</CardTitle>
            </CardHeader>
            <CardContent>
              <StoreEditForm
                store={store}
                onSuccess={handleStoreSaved}
                onCancel={() => setShowStoreEdit(false)}
              />
            </CardContent>
          </Card>
        )}

        {/* Products Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Meus Produtos</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBulkUpload(!showBulkUpload)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload em Massa
            </Button>
            <Button
              onClick={() => {
                setEditingProduct(null);
                setShowForm(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </div>
        </div>

        {showBulkUpload && (
          <div className="mb-8">
            <BulkUpload
              storeId={store?.id || ""}
              onSuccess={() => {
                if (store) {
                  loadProducts(store.id);
                }
                setShowBulkUpload(false);
              }}
            />
          </div>
        )}

        {showForm ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductForm
                storeId={store?.id || ""}
                product={editingProduct}
                onSuccess={handleProductSaved}
                onCancel={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
              />
            </CardContent>
          </Card>
        ) : null}

        <ProductList
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default LojistaPainel;
