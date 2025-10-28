import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const storeSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome da loja é obrigatório" }).max(100),
  whatsapp: z.string().trim().min(10, { message: "WhatsApp inválido" }).max(20),
  address: z.string().trim().min(1, { message: "Endereço é obrigatório" }).max(255),
  city: z.string().trim().min(1, { message: "Cidade é obrigatória" }).max(100),
  state: z.string().trim().optional(),
  opening_time: z.string().optional(),
  closing_time: z.string().optional(),
  operating_days: z.array(z.string()).optional(),
});

const daysOfWeek = [
  { value: "monday", label: "Segunda" },
  { value: "tuesday", label: "Terça" },
  { value: "wednesday", label: "Quarta" },
  { value: "thursday", label: "Quinta" },
  { value: "friday", label: "Sexta" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

const LojistaCadastroLoja = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    address: "",
    city: "",
    state: "",
    opening_time: "",
    closing_time: "",
    operating_days: ["monday", "tuesday", "wednesday", "thursday", "friday"] as string[],
  });
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleDayToggle = (day: string) => {
    setFormData({
      ...formData,
      operating_days: formData.operating_days.includes(day)
        ? formData.operating_days.filter((d) => d !== day)
        : [...formData.operating_days, day],
    });
  };

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      console.log("Verificando usuário autenticado...");
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Erro ao obter usuário:", userError);
      }
      
      if (!user) {
        console.log("Usuário não autenticado, redirecionando para login");
        navigate("/lojista/login");
        return;
      }
      
      console.log("Usuário autenticado:", user.id);
      setUser(user);

      // Check if store already exists
      const { data: store, error: storeError } = await supabase
        .from("stores")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (storeError) {
        console.error("Erro ao verificar loja:", storeError);
      }

      if (store) {
        console.log("Loja já existe, redirecionando para painel");
        navigate("/lojista/painel");
      } else {
        console.log("Usuário pronto para cadastrar loja");
      }
    } catch (error) {
      console.error("Erro em checkUser:", error);
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
          
          // Reverse geocoding to get city name
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (data.address) {
            setFormData({
              ...formData,
              city: data.address.city || data.address.town || data.address.village || "",
              state: data.address.state || "",
            });
            
            toast({
              title: "Localização obtida!",
              description: `Cidade: ${data.address.city || data.address.town || ""}`,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      console.error("Usuário não definido");
      toast({
        title: "Erro",
        description: "Usuário não autenticado. Por favor, faça login novamente.",
        variant: "destructive",
      });
      navigate("/lojista/login");
      return;
    }

    try {
      console.log("Validando dados da loja...");
      const validated = storeSchema.parse(formData);
      console.log("Dados validados:", validated);
      
      setLoading(true);

      console.log("Inserindo loja no banco para user_id:", user.id);
      const { data, error } = await supabase.from("stores").insert({
        user_id: user.id,
        name: validated.name,
        whatsapp: validated.whatsapp,
        address: validated.address,
        city: validated.city,
        state: validated.state || null,
        opening_time: validated.opening_time || null,
        closing_time: validated.closing_time || null,
        operating_days: validated.operating_days || null,
      }).select();

      console.log("Resultado da inserção:", { data, error });

      if (error) {
        console.error("Erro ao inserir loja:", error);
        throw error;
      }

      console.log("Loja cadastrada com sucesso!");
      toast({
        title: "Loja cadastrada!",
        description: "Sua loja foi criada com sucesso.",
      });
      navigate("/lojista/painel");
    } catch (error: any) {
      console.error("Erro capturado:", error);
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao cadastrar loja",
          description: error.message || "Erro desconhecido. Verifique o console para mais detalhes.",
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
                <Label htmlFor="city">Cidade *</Label>
                <div className="flex gap-2">
                  <Input
                    id="city"
                    placeholder="Ex: São Paulo"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                  >
                    {gettingLocation ? "..." : "📍"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  placeholder="Ex: SP"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
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

              <div className="space-y-2 md:col-span-2">
                <Label>Dias de Funcionamento</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {daysOfWeek.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={day.value}
                        checked={formData.operating_days.includes(day.value)}
                        onCheckedChange={() => handleDayToggle(day.value)}
                      />
                      <label
                        htmlFor={day.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {day.label}
                      </label>
                    </div>
                  ))}
                </div>
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
