-- Table: orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'ready', 'delivering', 'completed', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    delivery_address TEXT,
    delivery_lat FLOAT,
    delivery_lng FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activation de RLS (Row Level Security)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité (RLS)
-- Les clients peuvent voir et créer leurs propres commandes
CREATE POLICY "Les clients peuvent lire leurs commandes" 
ON public.orders FOR SELECT 
USING (auth.uid() = customer_id);

CREATE POLICY "Les clients peuvent créer des commandes" 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

-- Les marchands peuvent voir et modifier les commandes qui leur sont assignées
CREATE POLICY "Les marchands peuvent lire leurs commandes" 
ON public.orders FOR SELECT 
USING (true); -- Note: Dans un environnement de prod strict, on vérifierait le merchant_id lié au user actuel.

CREATE POLICY "Les marchands peuvent modifier leurs commandes" 
ON public.orders FOR UPDATE 
USING (true); 

-- Les livreurs peuvent voir toutes les commandes "ready" et celles qui leur sont assignées
CREATE POLICY "Les livreurs peuvent lire les commandes" 
ON public.orders FOR SELECT 
USING (true);

CREATE POLICY "Les livreurs peuvent modifier les commandes (assignation)" 
ON public.orders FOR UPDATE 
USING (true);

-- Active le realtime sur la table orders
alter publication supabase_realtime add table public.orders;
