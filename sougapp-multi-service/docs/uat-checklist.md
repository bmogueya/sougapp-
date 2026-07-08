# Checklist Recette Fonctionnelle — MVP

## Auth
- [ ] Connexion avec email/mot de passe
- [ ] Message d'erreur si mauvais identifiants
- [ ] Déconnexion
- [ ] Redirection par rôle (admin → /, merchant → /merchant, driver → /driver)

## Super Admin
- [ ] Dashboard : KPIs, graphiques visibles
- [ ] Utilisateurs : lister, créer, modifier
- [ ] Marchands : lister, créer, modifier
- [ ] Livreurs : lister
- [ ] Commandes : lister, filtrer par statut
- [ ] Zones : lister, créer, modifier
- [ ] Modules : activer/désactiver
- [ ] Promotions : lister, créer, modifier, supprimer
- [ ] Finance : transactions visibles

## Marchand
- [ ] Dashboard : stats et commandes récentes
- [ ] Produits : lister, créer, modifier, supprimer
- [ ] Catégories : gérer
- [ ] Commandes : voir et traiter

## Client
- [ ] Home : stores à proximité, catégories
- [ ] Recherche : stores et produits
- [ ] StoreView : détails, produits par catégorie
- [ ] Panier : ajouter, retirer, checkout

## Livreur
- [ ] Dashboard : missions en ligne
- [ ] Statut online/offline
- [ ] Historique des missions

## Internationalisation
- [ ] FR : tout affiché en français
- [ ] AR : bascule RTL, textes en arabe
- [ ] EN : textes en anglais

## Responsive
- [ ] Mobile (320px) : navigation, tableaux scrollables
- [ ] Tablette (768px) : grilles 2 colonnes
- [ ] Desktop (1024px+) : sidebar + contenu

## Accessibilité
- [ ] Skip-to-content link visible au focus
- [ ] Modal : focus trap + ESC pour fermer
- [ ] Tabulation : navigation clavier fonctionnelle
