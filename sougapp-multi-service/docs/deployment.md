# Déploiement SougApp

## Prérequis
- Compte [Vercel](https://vercel.com)
- Projet GitHub
- Compte [Supabase](https://supabase.com) avec projet actif
- Compte [Sentry](https://sentry.io) (optionnel)

## Variables d'environnement
Configurer dans Vercel Dashboard (Settings → Environment Variables) :
| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL du projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé anon Supabase (publique) |
| `VITE_SENTRY_DSN` | DSN Sentry (optionnel) |

## Déploiement automatique
1. Pusher le code sur GitHub
2. Importer le dépôt sur Vercel
3. Définir les variables d'environnement
4. Déployer (Vercel détecte automatiquement Vite)

## CI/CD
Le workflow GitHub Actions (`.github/workflows/ci.yml`) exécute :
- `lint` — oxlint sur tout le code
- `test` — vitest (49+ tests)
- `build` — TypeScript + Vite build

Le déploiement Vercel est automatique sur la branche `main`.

## Build local
```bash
npm run build    # tsc + vite build → dist/
npm run preview  # prévisualiser le build
```
