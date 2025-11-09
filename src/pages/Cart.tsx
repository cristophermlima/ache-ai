import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Minus, Plus, Store, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
  store: {
    name: string;
    whatsapp: string;
  };
}

const Cart = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
  };

  const updateQuantity = (id: string, delta: number) => {
    const updatedCart = cart.map((item) =>
      item.id === id
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeItem = (id: string) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    toast({
      title: "Item removido",
      description: "O item foi removido do carrinho",
    });
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const groupByStore = () => {
    const groups: { [key: string]: CartItem[] } = {};
    cart.forEach((item) => {
      const storeName = item.store.name;
      if (!groups[storeName]) {
        groups[storeName] = [];
      }
      groups[storeName].push(item);
    });
    return groups;
  };

  const sendToWhatsAppForStore = (storeName: string, items: CartItem[]) => {
    const whatsapp = items[0].store.whatsapp.replace(/\D/g, "");
    let message = `Olá! Vi esses produtos no ACHA AI e quero comprar:\n\n`;
    
    items.forEach((item) => {
      message += `📦 ${item.name}\n`;
      message += `   Quantidade: ${item.quantity}\n`;
      message += `   Preço: R$ ${item.price.toFixed(2)}\n`;
      message += `   Subtotal: R$ ${(item.price * item.quantity).toFixed(2)}\n\n`;
    });
    
    const storeTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    message += `💰 Total: R$ ${storeTotal.toFixed(2)}`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/55${whatsapp}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, "_blank");

    toast({
      title: "Mensagem enviada!",
      description: `Abrindo WhatsApp de ${storeName}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Store className="h-8 w-8" />
            <h1 className="text-2xl font-bold">ACHA AI</h1>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continuar Comprando
        </Button>

        <h1 className="text-3xl font-bold mb-8">Meu Carrinho</h1>

        {cart.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-lg mb-4">
                Seu carrinho está vazio
              </p>
              <Button onClick={() => navigate("/")}>
                Explorar Produtos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {Object.entries(groupByStore()).map(([storeName, items]) => (
                <div key={storeName} className="space-y-4">
                  {/* Store Header */}
                  <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      <h2 className="font-semibold text-lg">{storeName}</h2>
                    </div>
                    <Button
                      onClick={() => sendToWhatsAppForStore(storeName, items)}
                      size="sm"
                    >
                      Enviar para esta loja
                    </Button>
                  </div>

                  {/* Store Items */}
                  {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                            <span className="text-3xl">📦</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.store.name}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, -1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="font-bold text-lg text-primary">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-bold">Resumo do Pedido</h2>
                  
                  <div className="space-y-2 py-4 border-y">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">R$ {getTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">R$ {getTotal().toFixed(2)}</span>
                  </div>

                  <p className="text-xs text-center text-muted-foreground">
                    Clique em "Enviar para esta loja" ao lado de cada loja para enviar o pedido pelo WhatsApp
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
