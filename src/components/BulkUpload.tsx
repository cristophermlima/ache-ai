import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface BulkUploadProps {
  storeId: string;
  onSuccess: () => void;
}

export const BulkUpload = ({ storeId, onSuccess }: BulkUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const template = `name,price,description,category,stock,size_type,sizes,colors
Camiseta Básica,39.90,Camiseta 100% algodão,Roupas Masculinas,50,letter,"P,M,G,GG","Branco,Preto,Azul"
Vestido Floral,89.90,Vestido estampado,Roupas Femininas,30,letter,"P,M,G",Rosa
Tênis Esportivo,199.90,Tênis para corrida,Calçados,20,number,"38,39,40,41,42","Preto,Branco"
Perfume Importado,150.00,Fragrância suave,Cosméticos,100,none,,`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_produtos.csv";
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template baixado",
      description: "Use este arquivo como exemplo para o upload em massa.",
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({
          title: "Arquivo vazio",
          description: "O arquivo CSV deve conter pelo menos o cabeçalho e uma linha de dados.",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      const headers = lines[0].split(",").map(h => h.trim());
      const products = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ''));
        
        if (values.length < headers.length) continue;

        const product: any = {
          store_id: storeId,
          name: values[0],
          price: parseFloat(values[1]) || 0,
          description: values[2] || null,
          category: values[3] || "Outros",
          stock: parseInt(values[4]) || 0,
          size_type: values[5] || "none",
        };

        // Parse sizes
        if (values[6]) {
          const sizesStr = values[6].replace(/^"|"$/g, '');
          product.sizes = sizesStr.split(",").map(s => s.trim()).filter(Boolean);
        } else {
          product.sizes = [];
        }

        // Parse colors
        if (values[7]) {
          const colorsStr = values[7].replace(/^"|"$/g, '');
          product.colors = colorsStr.split(",").map(c => c.trim()).filter(Boolean);
        } else {
          product.colors = [];
        }

        products.push(product);
      }

      const { error } = await supabase
        .from("products")
        .insert(products);

      if (error) throw error;

      toast({
        title: "Upload concluído!",
        description: `${products.length} produto(s) adicionado(s) com sucesso.`,
      });

      onSuccess();
      e.target.value = "";
    } catch (error: any) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload em Massa</CardTitle>
        <CardDescription>
          Adicione múltiplos produtos de uma vez usando um arquivo CSV
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            Baixar Template CSV
          </Button>
          
          <div className="flex-1">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={uploading}
              className="cursor-pointer"
            />
          </div>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Instruções:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Baixe o template CSV para ver o formato correto</li>
            <li>Preencha os dados dos produtos no arquivo</li>
            <li>Para múltiplos tamanhos ou cores, separe com vírgula entre aspas</li>
            <li>size_type: "letter" (P,M,G), "number" (38,40,42) ou "none"</li>
          </ul>
        </div>

        {uploading && (
          <div className="text-center text-sm text-muted-foreground">
            Processando arquivo...
          </div>
        )}
      </CardContent>
    </Card>
  );
};
