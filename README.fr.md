**Langue :** [English](README.md) | [Français](README.fr.md)

# AgencyFlow

AgencyFlow est une application web bilingue (français / anglais) qui aide une agence de marketing digital à gérer ses **clients**, ses **campagnes**, ses **employés** et ses **tâches** depuis un tableau de bord moderne.

Il s'agit d'un projet full-stack pensé pour un portfolio : un frontend React + Vite, une API REST Express et une base PostgreSQL accédée via Prisma.

---

## Fonctionnalités

- **Authentification** — connexion/déconnexion avec un JWT stocké dans un cookie HTTP-only, hachage des mots de passe avec bcryptjs, routes frontend protégées et middleware d'authentification côté serveur.
- **Rôles** — `ADMIN` (gestion complète) et `EMPLOYEE` (consultation des données, mise à jour du statut des tâches assignées). Les permissions sont appliquées côté backend, pas seulement dans l'interface.
- **Tableau de bord** — statistiques réelles issues de PostgreSQL (clients, campagnes actives, tâches terminées/en attente, employés) avec des graphiques Recharts. Aucun chiffre codé en dur.
- **Clients** — CRUD complet avec recherche et filtre par statut.
- **Campagnes** — CRUD complet, reliées aux clients, avec budget, dates et statut.
- **Tâches** — CRUD complet, assignation aux employés, lien optionnel avec une campagne, priorité, échéance et mise à jour du statut en ligne.
- **Employés** — gestion de l'équipe par l'administrateur. Les empreintes de mot de passe ne sont jamais exposées.
- **Paramètres** — mise à jour du profil, changement du mot de passe et choix de la langue.
- Page **Politique de confidentialité**.
- **Interface bilingue** — français (par défaut) et anglais, avec un sélecteur de langue persistant.
- **Design responsive** — ordinateurs, tablettes et mobiles.

## Captures d'écran

> Espaces réservés — à remplacer par de vraies captures une fois l'application lancée.

| Tableau de bord | Clients | Tâches |
| --- | --- | --- |
| _bientôt_ | _bientôt_ | _bientôt_ |

## Stack technique

**Frontend :** React 18, JavaScript, Vite, Tailwind CSS, React Router, Axios, Recharts, Lucide React.

**Backend :** Node.js, Express, PostgreSQL, Prisma ORM (5.22.0), JWT (`jsonwebtoken`), `bcryptjs`, `helmet`, `cors`, `cookie-parser`, `express-rate-limit`, validation Zod.

**Tests :** Vitest, Supertest (API), React Testing Library (UI), Playwright (e2e).

## Structure du projet

```
AgencyFlow/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Modèles de données
│   │   └── seed.js             # Création de l'admin (lit les variables d'env)
│   ├── src/
│   │   ├── config/             # env, client prisma
│   │   ├── controllers/        # auth, clients, campaigns, tasks, employees, stats
│   │   ├── middleware/         # authenticate, authorize, validate, erreurs, rate limit
│   │   ├── routes/             # Définitions des routes REST
│   │   ├── utils/              # jwt, password, helpers http
│   │   ├── validators/         # Schémas Zod
│   │   ├── app.js              # Application Express
│   │   └── server.js           # Démarrage du serveur HTTP
│   └── tests/                  # Vitest + Supertest
├── frontend/
│   ├── e2e/                    # Tests Playwright
│   ├── public/                 # favicon + logo (SVG)
│   └── src/
│       ├── api/                # client axios + fonctions d'API
│       ├── components/         # layout + composants réutilisables
│       ├── context/            # Providers Auth + Language
│       ├── i18n/               # Traductions FR/EN
│       ├── pages/              # Login, Dashboard, Clients, Campaigns, Tasks, Employees, Settings, Privacy
│       ├── App.jsx             # Routeur
│       └── main.jsx            # Point d'entrée
├── .env.example
├── .gitignore
├── README.md
├── README.fr.md                # (ce fichier)
└── PROJECT_PROGRESS.md
```

## Prérequis

- **Node.js** 18+ (développé avec Node 20/24)
- **npm** 9+
- **PostgreSQL** 13+ (local ou accessible sur le réseau)

## Installation

Depuis la racine du dépôt :

```bash
# 1. Installer toutes les dépendances (backend + frontend)
npm install

# 2. Créer le fichier d'environnement
cp .env.example .env
#    Puis modifier .env : DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD.

# 3. Générer le client Prisma
npm run prisma:generate

# 4. Créer le schéma de la base (crée la base si absente + applique les migrations)
npm run prisma:migrate

# 5. Créer le compte administrateur
npm run prisma:seed
```

> Les commandes Prisma s'exécutent depuis la **racine du dépôt** et chargent le `.env` racine (elles passent `--schema backend/prisma/schema.prisma`). Cela permet de garder un seul `.env` pour tout le monorepo.

### Configuration de PostgreSQL

```bash
# Exemple avec psql
psql -U postgres
CREATE USER agencyflow_user WITH PASSWORD 'change_me';
CREATE DATABASE agencyflow OWNER agencyflow_user;
\q
```

Renseignez la chaîne de connexion correspondante dans `.env` :

```
DATABASE_URL="postgresql://agencyflow_user:change_me@localhost:5432/agencyflow?schema=public"
```

## Variables d'environnement

Toutes les variables sont dans un unique fichier `.env` à la racine (voir `.env.example`) :

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | Chaîne de connexion PostgreSQL utilisée par Prisma |
| `PORT` | Port du backend (`5000` par défaut) |
| `NODE_ENV` | `development` ou `production` |
| `CLIENT_URL` | Origine du frontend pour le CORS (`http://localhost:5173` par défaut) |
| `JWT_SECRET` | Secret de signature des jetons — utilisez une valeur longue et aléatoire |
| `JWT_EXPIRES_IN` | Durée de vie du jeton (`8h` par défaut) |
| `COOKIE_NAME` | Nom du cookie de session HTTP-only |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Valeurs de l'administrateur créé par le seed |

Ne commitez jamais de vrais secrets. Le fichier `.env` est ignoré par Git.

## Lancer l'application

```bash
# Démarrer le backend (:5000) et le frontend (:5173) ensemble
npm run dev

# Ou séparément
npm run dev:backend
npm run dev:frontend
```

Ouvrez http://localhost:5173 et connectez-vous avec les identifiants de l'administrateur créé par le seed.

## Tests

```bash
# Tous les tests (Vitest + Supertest + RTL)
npm test

# Backend uniquement
npm run test --workspace=backend

# Frontend uniquement
npm run test --workspace=frontend

# Bout en bout (nécessite la stack lancée et les navigateurs Playwright)
npx playwright install        # téléchargement unique des navigateurs
npm run test:e2e
```

> Les tests backend nécessitent un client Prisma généré (`npm run prisma:generate`). Les tests API fournis n'ont pas besoin d'une base de données active.

## Build de production

```bash
npm run build          # génère le frontend dans frontend/dist
npm run start --workspace=backend   # lance l'API avec Node
```

## Guide de déploiement (bases)

- **Backend :** déployez l'API Express sur un hébergeur Node (Render, Railway, Fly.io, un VPS). Définissez toutes les variables d'environnement puis exécutez `prisma migrate deploy` à chaque release.
- **Frontend :** construisez avec Vite et hébergez le dossier statique `dist/` (Netlify, Vercel, Cloudflare Pages). Configurez l'origine de l'API et définissez `CLIENT_URL` côté backend sur l'URL du frontend déployé pour le CORS et les cookies.
- **Base de données :** utilisez un PostgreSQL managé et gardez `DATABASE_URL` secret.
- En production, le cookie de session est `Secure` et `SameSite=None` ; servez les deux applications en HTTPS.

## Considérations de sécurité

- Mots de passe hachés avec bcryptjs ; les empreintes ne sont jamais renvoyées par l'API.
- JWT dans un cookie HTTP-only (inaccessible au JavaScript) pour limiter le vol de jeton via XSS.
- `helmet` ajoute des en-têtes de sécurité ; `cors` est restreint à l'origine du frontend.
- Limitation de débit sur les routes d'authentification.
- Validation Zod sur tous les endpoints d'écriture.
- Autorisation par rôle appliquée côté serveur.

## Limitations actuelles

- Granularité de rôles simple (pas de permissions personnalisées).
- Pas de réinitialisation de mot de passe ni de vérification d'e-mail.
- L'assignation de tâches n'envoie pas de notifications.
- Les graphiques reflètent les totaux courants ; pas d'analyse historique.
- Les tests e2e nécessitent une base seedée et la stack lancée pour passer complètement.

## Licence

MIT — libre d'utilisation pour l'apprentissage et un portfolio.
