-- Create stores table for lojistas
CREATE TABLE public.stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  address TEXT NOT NULL,
  opening_time TIME,
  closing_time TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stores
CREATE POLICY "Anyone can view stores"
  ON public.stores
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own store"
  ON public.stores
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own store"
  ON public.stores
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own store"
  ON public.stores
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Anyone can view products"
  ON public.products
  FOR SELECT
  USING (true);

CREATE POLICY "Store owners can create products"
  ON public.products
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = products.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can update their products"
  ON public.products
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = products.store_id
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can delete their products"
  ON public.products
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.stores
      WHERE stores.id = products.store_id
      AND stores.user_id = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers
CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();