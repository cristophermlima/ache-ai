import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
  category: string;
  stock: number;
  image_url: string | null;
}

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export const ProductList = ({ products, onEdit, onDelete }: ProductListProps) => {
  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground text-lg">
            Nenhum produto cadastrado ainda
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Clique em "Novo Produto" para adicionar seu primeiro produto
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <div className="relative h-48 bg-muted">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                <span className="text-5xl">
                  {product.category === "Roupas" ? "👕" : product.category === "Calçados" ? "👟" : "👜"}
                </span>
              </div>
            )}
          </div>

          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
              <Badge variant="outline">{product.category}</Badge>
            </div>

            <p className="text-2xl font-bold text-primary">
              R$ {product.price.toFixed(2)}
            </p>

            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            )}

            <p className="text-sm">
              <strong>Estoque:</strong> {product.stock} unidades
            </p>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(product)}
                className="flex-1"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="flex-1">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o produto "{product.name}"?
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(product.id)}>
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
