-- 4. Cartographie et coordonnées
-- Ajout des colonnes de latitude et longitude à la table merchants

alter table public.merchants
  add column latitude numeric(10, 8),
  add column longitude numeric(11, 8);

-- Exemple de données (A titre illustratif, on peut mettre à jour les démos)
-- update public.merchants set latitude = 18.0735, longitude = -15.9582 where id = 1; -- Nouakchott
