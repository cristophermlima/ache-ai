-- Criar tabela de notificações para o lojista
CREATE TABLE public.store_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL,
  product_id UUID,
  notification_type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_store FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE,
  CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL
);

-- Habilitar RLS
ALTER TABLE public.store_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Store owners can view their notifications"
ON public.store_notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = store_notifications.store_id 
    AND stores.user_id = auth.uid()
  )
);

CREATE POLICY "Store owners can update their notifications"
ON public.store_notifications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM stores
    WHERE stores.id = store_notifications.store_id 
    AND stores.user_id = auth.uid()
  )
);

-- Índices para performance
CREATE INDEX idx_store_notifications_store_id ON public.store_notifications(store_id);
CREATE INDEX idx_store_notifications_created_at ON public.store_notifications(created_at DESC);
CREATE INDEX idx_store_notifications_is_read ON public.store_notifications(is_read);

-- Habilitar realtime para notificações
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_notifications;