import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import StoreProducts from "./pages/StoreProducts";
import LojistaLogin from "./pages/LojistaLogin";
import LojistaCadastro from "./pages/LojistaCadastro";
import LojistaCadastroLoja from "./pages/LojistaCadastroLoja";
import LojistaPainel from "./pages/LojistaPainel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/produto/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/loja/:storeId" element={<StoreProducts />} />
          <Route path="/lojista/login" element={<LojistaLogin />} />
          <Route path="/lojista/cadastro" element={<LojistaCadastro />} />
          <Route path="/lojista/cadastro-loja" element={<LojistaCadastroLoja />} />
          <Route path="/lojista/painel" element={<LojistaPainel />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
