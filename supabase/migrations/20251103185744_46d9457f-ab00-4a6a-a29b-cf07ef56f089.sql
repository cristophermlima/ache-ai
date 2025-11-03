-- Criar tabela de variantes de produtos
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size VARCHAR(50),
  color VARCHAR(100),
  stock INTEGER NOT NULL DEFAULT 0,
  sku VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, size, color)
);

-- Habilitar RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Política de visualização (todos podem ver)
CREATE POLICY "Anyone can view product variants"
ON public.product_variants
FOR SELECT
USING (true);

-- Política de criação (apenas donos da loja)
CREATE POLICY "Store owners can create variants"
ON public.product_variants
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM products
    JOIN stores ON products.store_id = stores.id
    WHERE products.id = product_variants.product_id
    AND stores.user_id = auth.uid()
  )
);

-- Política de atualização (apenas donos da loja)
CREATE POLICY "Store owners can update their variants"
ON public.product_variants
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM products
    JOIN stores ON products.store_id = stores.id
    WHERE products.id = product_variants.product_id
    AND stores.user_id = auth.uid()
  )
);

-- Política de exclusão (apenas donos da loja)
CREATE POLICY "Store owners can delete their variants"
ON public.product_variants
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM products
    JOIN stores ON products.store_id = stores.id
    WHERE products.id = product_variants.product_id
    AND stores.user_id = auth.uid()
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_product_variants_updated_at
BEFORE UPDATE ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();