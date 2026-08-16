# Koda's Cycle

Suivi pipi / caca (et repas, promenades, dodos) d'un chiot, à deux téléphones.

- **1 tap** pour horodater à l'instant, ou saisie **après coup** avec raccourcis −10/−30/−60/−120 min
- Chaque entrée est **signée** par la personne qui l'a notée
- Bandeau **« ça fait combien de temps »** qui passe en alerte au-delà de 3 h sans sortie
- Statistiques : compte du jour, moyenne par jour, créneaux horaires habituels
- **Fonctionne hors ligne** : les entrées sont gardées sur l'appareil et renvoyées au retour du réseau
- Installable sur l'écran d'accueil (PWA)

## Démarrer en local

```bash
npm install
npm run dev
```

Sans configuration Supabase, l'app tourne en **stockage local** : tout marche, mais les données ne quittent pas l'appareil (le badge en haut à droite affiche `local`).

## Activer la synchro à deux (~5 min)

1. Crée un projet gratuit sur [supabase.com](https://supabase.com) (New project ; note le mot de passe de la base, tu n'en auras pas besoin ici).
2. Dans le dashboard : **SQL Editor → New query**, colle le contenu de [`supabase/schema.sql`](supabase/schema.sql), puis **Run**.
3. **Project Settings → API** : copie `Project URL` et la clé `anon public`.
4. À la racine du projet, copie `.env.example` en `.env.local` et colle les deux valeurs.
5. Relance `npm run dev`. Le badge doit passer à `synchronisé`.

## Déployer

Sur Vercel ou Netlify : importe le repo, framework **Vite**, et ajoute les deux variables d'environnement `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans les réglages du projet. Envoie l'URL à ta copine — sur iPhone, **Partager → Sur l'écran d'accueil** installe l'app.

## Sécurité — à lire avant de partager le lien

Le schéma SQL ouvre la lecture et l'écriture à toute personne qui atteint le site. C'est un compromis assumé pour éviter des comptes à créer pour une app à deux : **le lien de déploiement est donc un secret**, ne le publie pas. Pour verrouiller davantage, remplace la policy par une règle sur `auth.uid()` et ajoute un login Supabase.

## Personnaliser

Tout est dans [`src/config.ts`](src/config.ts) : nom du chiot, seuil d'alerte, types d'événements (label, emoji, couleur, présence dans les boutons rapides).
