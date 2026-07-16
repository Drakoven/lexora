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
