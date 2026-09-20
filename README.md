# Polyjoule — site web & back-office

Site vitrine de **Polyjoule**, l'association étudiante de Polytech Nantes qui conçoit et pilote des véhicules ultra-économes en énergie et les engage en compétition (Shell Eco-marathon, EducEco). Le projet livre à la fois le **site public** et un **back-office sur mesure** qui permet aux membres de l'association de le faire vivre sans écrire une ligne de code.

**En ligne :** [polyjoule.fr](https://polyjoule.fr)

## Pourquoi ce projet

Les membres d'une association étudiante changent chaque année. Un site figé dans le code se périme vite : palmarès, calendrier, équipe et photos doivent pouvoir être mis à jour par n'importe qui, en toute sécurité. J'ai donc construit un mini-CMS maison plutôt que de brancher une solution toute faite, avec un objectif : **ajouter un type de contenu ne doit coûter qu'une déclaration, pas un nouveau formulaire**.

## Fonctionnalités

**Site public**
- Accueil, présentation de l'association et de l'équipe, véhicules, palmarès, historique depuis 2005, calendrier avec fiches d'événements, galerie photo.
- Contenu rendu côté serveur à partir de la base : toute modification du back-office apparaît sur le site.
- SEO : métadonnées par page, données structurées JSON-LD, `sitemap.xml`, `robots.txt`, Google Analytics et Search Console.
- Pages légales (mentions légales, confidentialité).

**Back-office (`/admin`)**
- Authentification par identifiants, mots de passe hachés (bcrypt), session JWT à durée limitée, routes protégées par middleware.
- Formulaires **générés dynamiquement** à partir de définitions déclaratives : 11 collections de contenu gérées de la même façon.
- Éditeur de texte riche, téléversement d'images avec **recadrage** intégré (ratio défini par champ).
- Cycle **brouillon / publié**, avec **prévisualisation** des brouillons sur le vrai site.
- **Historique des révisions** de chaque entrée, avec restauration d'une version précédente.

## Stack technique

| Couche | Technologies |
| --- | --- |
| Front | Next.js 16 (App Router), React 19, Bootstrap 5 |
| Back | Route Handlers Next.js, NextAuth (Credentials + JWT), Zod |
| Données | PostgreSQL (Neon) via Prisma 6 |
| Médias | Vercel Blob |
| Déploiement | Vercel |

## Choix d'architecture

- **Contenu piloté par la configuration.** `lib/collections.js` décrit chaque collection (champs, types, validations, ratio d'image). `ContentForm` en déduit le formulaire d'édition : ajouter une section au site revient à ajouter un objet de configuration.
- **Modèle de données volontairement simple.** Une table `ContentEntry` (collection, slug, données JSON, statut, position) et une table `ContentRevision` qui archive chaque modification. Le schéma reste stable quand le contenu évolue.
- **Validation aux frontières.** Tous les payloads entrants des API d'administration passent par un schéma Zod avant toute écriture.
- **Accès protégé en profondeur.** Le middleware bloque `/admin` et `/api/admin` sans session ; les pages lisant la base sont rendues dynamiquement pour refléter immédiatement les changements.
- **Client Prisma singleton** pour éviter l'épuisement des connexions en développement (hot reload).

## Structure du dépôt

```
app/
  (site)/        pages publiques
  admin/         back-office (connexion, tableau de bord, formulaires)
  api/           auth, contenu, upload, prévisualisation
components/      navbar, footer, composants du back-office
lib/             auth, client Prisma, accès au contenu, définitions des collections
prisma/          schéma, migrations, script de seed
middleware.js    protection des routes d'administration
```

## Lancer le projet en local

Prérequis : Node.js 20+ et une base PostgreSQL (un projet Neon gratuit suffit).

```bash
git clone https://github.com/yassine-el-maghraoui/Polyjoule.git
cd Polyjoule
cp .env.example .env        # puis renseigner les variables
npm install
npm run prisma:generate
npx prisma migrate deploy   # crée les tables
npm run seed                # contenu de démonstration + compte admin
npm run dev                 # http://localhost:3000
```

Le back-office est accessible sur `http://localhost:3000/admin`. Le seed crée un compte administrateur par défaut dont les identifiants sont définis dans `prisma/seed.js` : **à changer avant tout déploiement**.

## Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `POSTGRES_PRISMA_URL` | Connexion PostgreSQL (pool) utilisée par l'application |
| `POSTGRES_URL_NON_POOLING` | Connexion directe utilisée par les migrations Prisma |
| `NEXTAUTH_SECRET` | Secret de signature des sessions |
| `NEXTAUTH_URL` | URL publique de l'application |
| `BLOB_READ_WRITE_TOKEN` | Accès à Vercel Blob pour les images téléversées |
| `PREVIEW_SECRET` | Secret de l'API de prévisualisation des brouillons |
| `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GSC_VERIFICATION` | Google Analytics / Search Console (optionnel) |

## Scripts

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build et serveur de production |
| `npm run lint` | Lint |
| `npm run prisma:generate` | Génère le client Prisma |
| `npm run prisma:migrate` | Crée ou applique une migration en développement |
| `npm run seed` | Initialise le contenu et le compte admin |

## Auteur

Développé par **Yassine El Maghraoui** au sein du pôle informatique de Polyjoule.
