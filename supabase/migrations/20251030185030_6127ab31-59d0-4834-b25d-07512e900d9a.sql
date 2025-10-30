-- Add colors and sizes fields to products table
ALTER TABLE public.products 
ADD COLUMN colors text[] DEFAULT '{}',
ADD COLUMN sizes jsonb DEFAULT '[]',
ADD COLUMN size_type text CHECK (size_type IN ('number', 'letter', 'none')) DEFAULT 'none';

-- Update existing products to have the new fields
UPDATE public.products 
SET colors = '{}', 
    sizes = '[]', 
    size_type = 'none' 
WHERE colors IS NULL OR sizes IS NULL OR size_type IS NULL;