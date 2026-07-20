# Déployer Lexora sur O2Switch

Guide pas-à-pas pour un premier déploiement de test. Lexora a deux parties à
héberger séparément :
- **Frontend** (React/Vite, statique) sur le domaine principal
- **Backend** (Express + Socket.io + MySQL) sur un sous-domaine, via le
  "Node.js Selector" de cPanel

## 0. Prérequis

- Domaine : **lexora-jeu.fr** (créé) — frontend sur `lexora-jeu.fr`,
  backend sur le sous-domaine `api.lexora-jeu.fr`
- Un compte O2Switch actif
- DNS propagés vers O2Switch pour `lexora-jeu.fr`
- Le certificat SSL activé sur le domaine ET le sous-domaine `api.` une
  fois créé (AutoSSL de cPanel, gratuit et généralement automatique une
  fois le DNS bon — vérifier dans cPanel > SSL/TLS Status)

Sans HTTPS actif, la connexion ne fonctionnera pas : en production les
cookies de session sont marqués `secure`, donc ils exigent HTTPS.

## 1. Base de données MySQL

Dans cPanel > **Bases de données MySQL** :
1. Créer une base (ex. `lexora`) — le nom réel sera préfixé par ton login
   cPanel (ex. `moncpanel_lexora`).
2. Créer un utilisateur MySQL avec un mot de passe fort, l'associer à la
   base avec **tous les privilèges**.
3. Noter host (généralement `localhost`), nom de base, utilisateur, mot de
   passe — ils vont dans le `.env` du backend (étape 3).

Puis exécuter les migrations, dans l'ordre, via **phpMyAdmin** (cPanel) ou
en SSH avec le client `mysql` :
```
server/src/db/schema.sql
server/src/db/002_profile_columns.sql
server/src/db/003_games.sql
server/src/db/004_friendships.sql
server/src/db/005_sessions.sql
server/src/db/006_ranking.sql
server/src/db/007_stats.sql
server/src/db/008_badges.sql
server/src/db/009_game_moves.sql
```
(`schema.sql` contient un `CREATE DATABASE` — si la base existe déjà via
cPanel, retire cette ligne ou ignore l'erreur "database already exists" et
laisse le reste s'exécuter.)

## 2. Backend — Node.js App (cPanel)

Dans cPanel > **Configuration Node.js App** (ou "Node.js Selector") :
1. Créer une application :
   - **Version Node** : la plus récente disponible (18+)
   - **Dossier de l'application** : ex. `lexora-api`
   - **Domaine/sous-domaine** : `api.lexora-jeu.fr` (créer d'abord ce
     sous-domaine dans cPanel > Sous-domaines si pas déjà fait)
   - **Fichier de démarrage** : `src/index.js`
2. Uploader le contenu du dossier `server/` (hors `node_modules`) dans le
   dossier de l'application, via le gestionnaire de fichiers cPanel, FTP/SFTP,
   ou Git si O2Switch propose "Git Version Control" dans ton offre.
3. Dans l'onglet "Variables d'environnement" de l'app Node.js, renseigner
   (voir [server/.env.example](server/.env.example) pour le détail de
   chaque variable) :
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (étape 1)
   - `SESSION_SECRET` : génère une valeur dédiée à la prod, différente du
     dev — ex. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `CLIENT_ORIGIN` : `https://lexora-jeu.fr` (sans slash final)
   - `NODE_ENV` : `production`
   - **Ne pas** fixer `PORT` — cPanel l'assigne lui-même à l'app.
4. Cliquer "Exécuter NPM Install" depuis l'interface (installe les
   dépendances sur le serveur).
5. Démarrer l'application.

## 3. Frontend — build statique

En local, avant de builder :
1. Crée `.env.production` à la racine du projet (voir
   [.env.example](.env.example)) avec :
   ```
   VITE_API_URL=https://api.lexora-jeu.fr
   ```
2. `npm run build` → génère le dossier `dist/`.
3. Uploade le **contenu** de `dist/` (pas le dossier `dist` lui-même) dans
   le dossier racine du domaine principal côté O2Switch (`public_html` ou
   l'équivalent du sous-domaine choisi), via le gestionnaire de fichiers ou
   FTP/SFTP.

## 4. Vérifications

- Ouvrir le domaine du frontend : la page d'accueil doit s'afficher.
- Créer un compte, se connecter, lancer une partie locale et une partie en
  ligne à deux comptes.
- Chrome doit proposer d'installer l'app (icône dans la barre d'adresse, ou
  menu ⋮ > "Installer Lexora"). Sur iOS Safari : partager > "Sur l'écran
  d'accueil".
- Si le tour adverse ne se met pas à jour instantanément sans recharger la
  page : le reverse proxy d'O2Switch ne relaie peut-être pas les connexions
  WebSocket. Ce n'est pas bloquant — Socket.io retombe automatiquement sur
  du polling HTTP classique, un peu moins réactif mais fonctionnel, aucune
  action nécessaire de ton côté.

## Notes

- Les comptes de test créés en local (`testeur`, `amifriend1`, etc.)
  n'existent que dans la base MySQL locale — la base de prod démarre vide.
- Pense à changer `SESSION_SECRET` et le mot de passe MySQL par rapport au
  `.env` de dev (celui-ci ne doit jamais être réutilisé en production).

## 5. Déploiement continu (après la mise en place initiale)

Une fois les étapes 1 à 4 faites une première fois (domaine, base, app
Node.js cPanel créée), les mises à jour de code n'ont plus besoin d'être
refaites à la main : un workflow GitHub Actions
(`.github/workflows/deploy.yml`) automatise build + transfert + redémarrage
via SSH (l'hébergement Node.js d'O2Switch tourne derrière Phusion
Passenger, qui redémarre l'app dès qu'on touche `tmp/restart.txt` — pas
besoin de passer par l'UI cPanel).

**Runner auto-hébergé, pas un runner GitHub classique** : O2Switch bloque
silencieusement les connexions SSH entrantes depuis les plages IP des
runners GitHub hébergés, donc le job tourne sur ta propre machine
(`C:\Users\Flori\actions-runner`), enregistrée comme runner du dépôt. Avant
de déclencher un déploiement, démarre-le :
```
cd C:\Users\Flori\actions-runner
.\run.cmd
```
et laisse la fenêtre ouverte jusqu'à "Listening for Jobs". Pas besoin de
`rsync` (absent nativement sur Windows) : le transfert se fait en
tar+ssh, ce qui donne le même résultat (miroir complet du dossier,
dotfiles comme `.htaccess` inclus).

**Déclenchement** : manuel uniquement (`workflow_dispatch`), volontairement
— pas de déploiement automatique à chaque push sur `main`. Depuis l'onglet
"Actions" du dépôt GitHub, choisir le workflow "Deploy to production" puis
"Run workflow", ou en CLI : `gh workflow run deploy.yml`. Suivre le run
avec `gh run watch <run-id>`. **Testé et fonctionnel de bout en bout le
2026-07-20** — build, transfert frontend/backend, `npm install`,
redémarrage, vérifié en prod après coup (accueil OK, inscription + partie
bot OK).

**Secrets requis** (Settings > Secrets and variables > Actions du dépôt) :
- `SSH_PRIVATE_KEY` : clé privée d'une paire SSH dédiée au déploiement (pas
  la clé personnelle), dont la clé publique a été autorisée côté cPanel
  (Accès SSH > Importer une clé > Autoriser).
- `SSH_HOST` : `lexora-jeu.fr`
- `SSH_USER` : `dufl1993`

**Ce que le pipeline fait** : build du frontend (`npm run build`, utilise le
`.env.production` déjà committé), transfert (tar+ssh) de `dist/` vers
`~/lexora-jeu.fr/` et de `server/` (hors `node_modules`/`.env`) vers
`~/lexora.api/`, puis `npm install --omit=dev` et redémarrage.

**Ce que le pipeline ne fait PAS** : aucune migration de base de données.
Si un déploiement inclut un nouveau fichier `server/src/db/0XX_*.sql`, il
continue à se lancer à la main via SSH (`mysql -u ... -p ... < fichier.sql`)
comme décrit à l'étape 1 — volontairement non automatisé pour garder une
revue humaine avant tout changement de schéma en prod.

## 6. Environnement de staging

Une deuxième copie complète du site, isolée de la prod (sous-domaines,
base de données et app Node.js cPanel séparés), pour tester un déploiement
avant de le pousser en production — plus besoin de vérifier chaque fix
directement sur le vrai site avec des comptes jetables à nettoyer ensuite.

**Sous-domaines** : `staging.lexora-jeu.fr` (frontend) et
`staging-api.lexora-jeu.fr` (backend) — même procédure DNS/AutoSSL que
`api.lexora-jeu.fr` (voir Prérequis).

**Base de données MySQL** : une base **séparée** de la prod (ex.
`dufl1993_lexora_staging`), même procédure que l'étape 1, migrations
rejouées à l'identique (`server/src/db/combined_migrations.sql` en un seul
import phpMyAdmin plutôt que fichier par fichier).

**Backend — Node.js App cPanel dédiée** : même procédure que l'étape 2, avec
ses propres variables d'environnement :
- `DB_HOST`/`DB_USER`/`DB_PASSWORD`/`DB_NAME` → la base staging ci-dessus
- `SESSION_SECRET` → une **nouvelle valeur générée**, jamais celle de prod
- `CLIENT_ORIGIN=https://staging.lexora-jeu.fr`
- `SERVER_ORIGIN=https://staging-api.lexora-jeu.fr`
- `NODE_ENV=production` (nécessaire pour les cookies secure en HTTPS
  cross-origin, staging étant dans la même situation que la prod)
- `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`/`VAPID_SUBJECT` → réutiliser la
  paire existante, pas liée à un domaine
- `SMTP_*`, `SENTRY_DSN`, `GOOGLE_*`, `FACEBOOK_*` → **laissés vides**
  volontairement (dégradation gracieuse déjà en place dans le code, comme en
  dev local) : pas de vrais emails envoyés depuis le staging, pas de bruit
  dans le projet Sentry de prod, boutons OAuth simplement inactifs. Câbler
  l'OAuth sur staging plus tard reste possible (ajouter une redirect URI
  staging dans Google Cloud Console / Facebook Developers) mais n'est pas
  fait par défaut.

**Frontend — build staging** : `.env.staging` committé à la racine
(`VITE_API_URL=https://staging-api.lexora-jeu.fr`, `VITE_VAPID_PUBLIC_KEY`
réutilisée, `VITE_SENTRY_DSN` volontairement omis). Chargé automatiquement
par `vite build --mode staging` (script `npm run build:staging`), sans
toucher à `.env.production`.

**Déploiement continu staging** : workflow séparé
`.github/workflows/deploy-staging.yml`, déclenchement manuel
(`gh workflow run deploy-staging.yml` ou bouton "Run workflow" sur "Deploy
to staging" dans l'onglet Actions), même runner auto-hébergé à démarrer
avant (voir plus haut), mêmes secrets SSH que la prod (même serveur, juste
des dossiers de destination différents — `~/staging.lexora-jeu.fr` et
`~/staging.lexora.api`). Délibérément un fichier séparé de `deploy.yml`
plutôt qu'un paramètre `environment` sur un menu déroulant : ça rend
impossible de déployer en prod par erreur en se trompant de sélection.

**Ce que le pipeline staging ne fait pas** : identique à la prod, aucune
migration de base de données automatique.
