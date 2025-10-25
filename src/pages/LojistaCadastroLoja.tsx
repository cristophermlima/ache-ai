import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const storeSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome da loja é obrigatório" }).max(100),
  whatsapp: z.string().trim().min(10, { message: "WhatsApp inválido" }).max(20),
  address: z.string().trim().min(1, { message: "Endereço é obrigatório" }).max(255),
  opening_time: z.string().optional(),
  closing_time: z.string().optional(),
});

const LojistaCadastroLoja = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    address: "",
    opening_time: "",
    closing_time: "",
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/lojista/login");
      return;
    }
    setUser(user);

    // Check if store already exists
    const { data: store } = await supabase
      .from("stores")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (store) {
      navigate("/lojista/painel");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      const validated = storeSchema.parse(formData);
      setLoading(true);

      const { error } = await supabase.from("stores").insert({
        user_id: user.id,
        name: validated.name,
        whatsapp: validated.whatsapp,
        address: validated.address,
        opening_time: validated.opening_time || null,
        closing_time: validated.closing_time || null,
      });

      if (error) throw error;

      toast({
        title: "Loja cadastrada!",
        description: "Sua loja foi criada com sucesso.",
      });
      navigate("/lojista/painel");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao cadastrar loja",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Store className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Cadastre sua Loja</CardTitle>
          <CardDescription>
            Preencha as informações da sua loja para começar a vender
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Nome da Loja *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Boutique Fashion"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="whatsapp">WhatsApp (com DDD) *</Label>
                <Input
                  id="whatsapp"
                  placeholder="Ex: 11999999999"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Endereço Completo *</Label>
                <Input
                  id="address"
                  placeholder="Ex: Rua das Flores, 123 - Centro"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="opening_time">Horário de Abertura</Label>
                <Input
                  id="opening_time"
                  type="time"
                  value={formData.opening_time}
                  onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="closing_time">Horário de Fechamento</Label>
                <Input
                  id="closing_time"
                  type="time"
                  value={formData.closing_time}
                  onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar Loja"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LojistaCadastroLoja;
