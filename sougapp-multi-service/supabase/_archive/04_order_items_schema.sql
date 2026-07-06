-- Table pour stocker les produits d'une commande
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activation de RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité (simplifiées pour le MVP)
CREATE POLICY "Tout le monde peut lire les items de commande" 
ON public.order_items FOR SELECT 
USING (true);

CREATE POLICY "Les clients peuvent ajouter des items de commande" 
ON public.order_items FOR INSERT 
WITH CHECK (true);
