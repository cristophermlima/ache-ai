import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PoliticaPrivacidade() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Política de Privacidade</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg max-w-none space-y-6">
          <p className="text-sm text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <h2 className="text-2xl font-bold text-foreground">1. Informações que Coletamos</h2>
          <p className="text-foreground">
            Coletamos informações que você nos fornece diretamente ao criar uma conta, cadastrar 
            uma loja ou utilizar nossos serviços, incluindo:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>Nome e informações de contato (e-mail, telefone)</li>
            <li>Endereço e localização</li>
            <li>Informações sobre produtos e lojas cadastradas</li>
            <li>Dados de navegação e uso da plataforma</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8">2. Como Usamos suas Informações</h2>
          <p className="text-foreground">Utilizamos as informações coletadas para:</p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>Fornecer, manter e melhorar nossos serviços</li>
            <li>Processar transações e enviar notificações relacionadas</li>
            <li>Personalizar sua experiência na plataforma</li>
            <li>Comunicar-nos com você sobre atualizações e novidades</li>
            <li>Prevenir fraudes e garantir a segurança da plataforma</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8">3. Compartilhamento de Informações</h2>
          <p className="text-foreground">
            Não vendemos suas informações pessoais. Podemos compartilhar informações apenas:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>Com lojistas quando você demonstra interesse em seus produtos</li>
            <li>Com prestadores de serviços que nos auxiliam na operação da plataforma</li>
            <li>Quando exigido por lei ou para proteger nossos direitos</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8">4. Segurança</h2>
          <p className="text-foreground">
            Implementamos medidas de segurança para proteger suas informações contra acesso não 
            autorizado, alteração, divulgação ou destruição. No entanto, nenhum método de 
            transmissão pela internet é 100% seguro.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">5. Seus Direitos</h2>
          <p className="text-foreground">Você tem o direito de:</p>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>Acessar e atualizar suas informações pessoais</li>
            <li>Solicitar a exclusão de seus dados</li>
            <li>Revogar consentimentos previamente concedidos</li>
            <li>Solicitar a portabilidade de seus dados</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8">6. Contato</h2>
          <p className="text-foreground">
            Para questões sobre esta Política de Privacidade, entre em contato conosco em:{" "}
            <a href="mailto:hubache.ai@gmail.com" className="text-primary hover:underline">
              hubache.ai@gmail.com
            </a>
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8">7. Alterações nesta Política</h2>
          <p className="text-foreground">
            Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre 
            mudanças significativas publicando a nova política nesta página.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
