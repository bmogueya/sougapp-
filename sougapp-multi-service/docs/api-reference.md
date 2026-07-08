# Référence API — Supabase

SougApp utilise Supabase (PostgreSQL) comme backend. L'accès aux données se fait via le client Supabase avec RLS (Row Level Security).

## Tables principales

### profiles
Utilisateurs de la plateforme (clients, marchands, livreurs, admins).
| Colonne | Type | Contrainte |
|---------|------|-----------|
| id | uuid | PK, FK → auth.users |
| role | user_role | 'customer', 'merchant', 'driver', 'dispatcher', 'super_admin' |
| first_name | text | |
| last_name | text | |
| phone | text | UNIQUE |
| email | text | |
| zone_id | integer | FK → zones |

### stores
Commerces et enseignes partenaires.
| Colonne | Type | Contrainte |
|---------|------|-----------|
| id | uuid | PK |
| owner_id | uuid | FK → profiles |
| module_id | text | FK → modules |
| name | text | |
| description | text | |
| is_open | boolean | |
| phone | text | |

### products
Produits vendus par les stores.
| Colonne | Type | Contrainte |
|---------|------|-----------|
| id | uuid | PK |
| store_id | uuid | FK → stores |
| merchant_id | uuid | FK → profiles |
| category_id | uuid | FK → categories |
| name | text | |
| price | numeric(10,2) | |
| in_stock | boolean | |
| search_vector | tsvector | Full-text search |

### orders
Commandes clients.
| Colonne | Type | Contrainte |
|---------|------|-----------|
| id | uuid | PK |
| customer_id | uuid | FK → profiles |
| store_id | uuid | FK → stores |
| driver_id | uuid | FK → profiles |
| status | text | CHECK (11 valeurs) |
| total_amount | numeric(10,2) | |
| created_at | timestamptz | INDEX DESC |

## RLS (Row Level Security)
Toutes les tables ont RLS activé. Les politiques sont basées sur le rôle utilisateur via les fonctions helpers `get_my_role()` et `is_admin()`.
