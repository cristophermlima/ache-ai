import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().trim().email({ message: "E-mail inválido" }),
  password: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const LojistaCadastro = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = signupSchema.parse({ email, password, confirmPassword });
      setLoading(true);

      console.log("Iniciando cadastro para:", validated.email);

      const redirectUrl = `${window.location.origin}/lojista/cadastro-loja`;

      const { data, error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      console.log("Resposta do signup:", { data, error });

      if (error) {
        console.error("Erro no signup:", error);
        throw error;
      }

      if (data.user) {
        console.log("Usuário criado com sucesso:", data.user.id);
        toast({
          title: "Cadastro realizado!",
          description: "Agora vamos cadastrar sua loja.",
        });
        navigate("/lojista/cadastro-loja");
      } else if (data.session === null && !error) {
        // Email confirmation might be required
        console.log("Cadastro realizado, mas pode precisar confirmar email");
        toast({
          title: "Cadastro realizado!",
          description: "Agora vamos cadastrar sua loja.",
        });
        navigate("/lojista/cadastro-loja");
      }
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
          title: "Erro ao criar conta",
          description: error.message === "User already registered" 
            ? "Este e-mail já está cadastrado" 
            : error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5" />
            <span>Voltar para início</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary rounded-full">
                <Store className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Cadastro de Lojista</CardTitle>
            <CardDescription>
              Crie sua conta e comece a vender
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Criando conta..." : "Criar Conta"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Já tem uma conta? </span>
              <Link to="/lojista/login" className="text-primary hover:underline font-medium">
                Fazer login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LojistaCadastro;
