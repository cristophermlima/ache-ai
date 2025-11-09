import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function QuemSomos() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Quem Somos</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-lg max-w-none space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Sobre o Acha Aí</h2>
          
          <p className="text-foreground">
            O <strong>Acha Aí</strong> é uma plataforma inovadora que conecta consumidores a lojas 
            locais, facilitando a descoberta de produtos próximos a você. Nossa missão é fortalecer 
            o comércio local e proporcionar uma experiência de compra conveniente e segura.
          </p>

          <h3 className="text-2xl font-semibold text-foreground mt-8">Nossa História</h3>
          <p className="text-foreground">
            Nascemos da necessidade de valorizar o comércio de bairro e facilitar a vida de quem 
            busca produtos com qualidade, rapidez e proximidade. Acreditamos que fortalecer os 
            negócios locais é essencial para o desenvolvimento da nossa comunidade.
          </p>

          <h3 className="text-2xl font-semibold text-foreground mt-8">O Que Oferecemos</h3>
          <ul className="list-disc pl-6 space-y-2 text-foreground">
            <li>Busca inteligente por produtos locais</li>
            <li>Filtros por localização e categoria</li>
            <li>Informações detalhadas sobre lojas e produtos</li>
            <li>Sistema de reserva e carrinho de compras</li>
            <li>Contato direto com lojistas via WhatsApp</li>
          </ul>

          <h3 className="text-2xl font-semibold text-foreground mt-8">Para Lojistas</h3>
          <p className="text-foreground">
            Se você é lojista e deseja expandir seu alcance, junte-se ao Acha Aí! Nossa plataforma 
            oferece ferramentas completas para gerenciar seus produtos, receber notificações de 
            interesse dos clientes e aumentar suas vendas.
          </p>

          <div className="mt-8">
            <Button onClick={() => navigate("/lojista/cadastro")} size="lg">
              Cadastre sua Loja
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
