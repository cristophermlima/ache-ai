import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    category: string;
    stores: {
      name: string;
      address: string;
      opening_time: string | null;
      closing_time: string | null;
    };
  };
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();

  const isStoreOpen = () => {
    if (!product.stores.opening_time || !product.stores.closing_time) return true;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [openHour, openMin] = product.stores.opening_time.split(':').map(Number);
    const [closeHour, closeMin] = product.stores.closing_time.split(':').map(Number);
    
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  const storeOpen = isStoreOpen();

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(`/produto/${product.id}`)}
    >
      <div className="relative h-48 overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <span className="text-4xl">{product.category === "Roupas" ? "👕" : product.category === "Calçados" ? "👟" : "👜"}</span>
          </div>
        )}
        <Badge
          variant={storeOpen ? "default" : "secondary"}
          className="absolute top-2 right-2"
        >
          {storeOpen ? "Aberta" : "Fechada"}
        </Badge>
      </div>
      
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
          <Badge variant="outline" className="shrink-0">{product.category}</Badge>
        </div>
        
        <p className="text-2xl font-bold text-primary">
          R$ {product.price.toFixed(2)}
        </p>
        
        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">{product.stores.name}</span>
          </div>
          {product.stores.opening_time && product.stores.closing_time && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                {product.stores.opening_time.slice(0, 5)} - {product.stores.closing_time.slice(0, 5)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" onClick={(e) => {
          e.stopPropagation();
          navigate(`/produto/${product.id}`);
        }}>
          Ver Detalhes
        </Button>
      </CardFooter>
    </Card>
  );
};
