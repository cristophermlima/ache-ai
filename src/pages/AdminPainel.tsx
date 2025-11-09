import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

interface Advertisement {
  id: string;
  title: string;
  subtitle: string;
  cta_text: string;
  gradient: string;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
}

export default function AdminPainel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [newAd, setNewAd] = useState({
    title: "",
    subtitle: "",
    cta_text: "Explorar",
    gradient: "from-primary via-primary/90 to-primary/80",
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/lojista/login");
        return;
      }

      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (error || !roleData) {
        toast.error("Acesso negado. Apenas administradores podem acessar esta área.");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      fetchAdvertisements();
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvertisements = async () => {
    const { data, error } = await supabase
      .from("advertisements")
      .select("*")
      .order("display_order");

    if (error) {
      toast.error("Erro ao carregar propagandas");
      return;
    }

    setAdvertisements(data || []);
  };

  const handleCreateAd = async () => {
    if (!newAd.title || !newAd.subtitle) {
      toast.error("Preencha título e subtítulo");
      return;
    }

    const { error } = await supabase
      .from("advertisements")
      .insert([newAd]);

    if (error) {
      toast.error("Erro ao criar propaganda");
      return;
    }

    toast.success("Propaganda criada com sucesso!");
    setNewAd({
      title: "",
      subtitle: "",
      cta_text: "Explorar",
      gradient: "from-primary via-primary/90 to-primary/80",
      is_active: true,
      display_order: 0,
    });
    fetchAdvertisements();
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from("advertisements")
      .update({ is_active: !currentState })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar propaganda");
      return;
    }

    toast.success("Propaganda atualizada!");
    fetchAdvertisements();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("advertisements")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao deletar propaganda");
      return;
    }

    toast.success("Propaganda deletada!");
    fetchAdvertisements();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Painel de Administração</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Criar Nova Propaganda */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nova Propaganda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newAd.title}
                onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                placeholder="Ex: Encontre produtos locais"
              />
            </div>
            <div>
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input
                id="subtitle"
                value={newAd.subtitle}
                onChange={(e) => setNewAd({ ...newAd, subtitle: e.target.value })}
                placeholder="Ex: Compre de lojas próximas a você"
              />
            </div>
            <div>
              <Label htmlFor="cta">Texto do Botão</Label>
              <Input
                id="cta"
                value={newAd.cta_text}
                onChange={(e) => setNewAd({ ...newAd, cta_text: e.target.value })}
                placeholder="Ex: Explorar Agora"
              />
            </div>
            <div>
              <Label htmlFor="gradient">Gradiente (Tailwind classes)</Label>
              <Textarea
                id="gradient"
                value={newAd.gradient}
                onChange={(e) => setNewAd({ ...newAd, gradient: e.target.value })}
                placeholder="Ex: from-primary via-primary/90 to-primary/80"
              />
            </div>
            <div>
              <Label htmlFor="order">Ordem de Exibição</Label>
              <Input
                id="order"
                type="number"
                value={newAd.display_order}
                onChange={(e) => setNewAd({ ...newAd, display_order: parseInt(e.target.value) })}
              />
            </div>
            <Button onClick={handleCreateAd} className="w-full">
              Criar Propaganda
            </Button>
          </CardContent>
        </Card>

        {/* Lista de Propagandas */}
        <Card>
          <CardHeader>
            <CardTitle>Propagandas Cadastradas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {advertisements.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma propaganda cadastrada ainda
              </p>
            ) : (
              advertisements.map((ad) => (
                <div
                  key={ad.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{ad.title}</h3>
                      <p className="text-sm text-muted-foreground">{ad.subtitle}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Botão: {ad.cta_text} | Ordem: {ad.display_order}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={ad.is_active}
                        onCheckedChange={() => handleToggleActive(ad.id, ad.is_active)}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(ad.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className={`bg-gradient-to-r ${ad.gradient} text-primary-foreground p-4 rounded text-sm`}>
                    Preview do gradiente
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
