-- Add location fields to stores table
ALTER TABLE public.stores 
ADD COLUMN city TEXT,
ADD COLUMN state TEXT,
ADD COLUMN latitude NUMERIC(10, 8),
ADD COLUMN longitude NUMERIC(11, 8);

-- Create index for location-based queries
CREATE INDEX idx_stores_city ON public.stores(city);
CREATE INDEX idx_stores_location ON public.stores(latitude, longitude);