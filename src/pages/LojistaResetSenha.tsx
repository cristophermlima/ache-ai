import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const schema = z
  .object({
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirm: z.string(),
  })
  .refine((vals) => vals.password === vals.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

const LojistaResetSenha = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  // Verifica se a sessão de recuperação está presente (vinda do link do e-mail)
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);
    };
    init();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = schema.parse({ password, confirm });
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password: validated.password,
      });

      if (error) throw error;

      toast({
        title: "Senha atualizada!",
        description: "Faça login novamente com a nova senha.",
      });
      navigate("/lojista/login");
    } catch (err: any) {
      const message = err?.errors?.[0]?.message || err?.message || "Erro ao atualizar senha";
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl">Redefinir senha</CardTitle>
            <CardDescription>
              {hasSession === false && (
                <span>
                  Link inválido ou expirado. Solicite um novo em
                  <span> </span>
                  <Link to="/lojista/login" className="text-primary underline">Esqueci minha senha</Link>.
                </span>
              )}
              {hasSession === true && "Defina sua nova senha abaixo."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasSession ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nova senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmar nova senha</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Atualizando..." : "Atualizar senha"}
                </Button>
                <div className="text-center text-sm">
                  <Link to="/lojista/login" className="text-primary hover:underline">Voltar ao login</Link>
                </div>
              </form>
            ) : hasSession === null ? (
              <div className="text-center text-muted-foreground">Verificando link...</div>
            ) : (
              <div className="text-center space-y-3">
                <Button asChild variant="default" className="w-full">
                  <Link to="/lojista/login">Voltar para o login</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LojistaResetSenha;
