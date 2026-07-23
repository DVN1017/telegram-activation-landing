# Telegram Activation Landing

Projet SaaS-like pour demander l'activation d'un compte Telegram.

Structure:

- `index.html` — Landing page
- `success.html` — Page affichée après paiement
- `admin.html` — Tableau de bord administrateur
- `style.css` — Styles
- `main.js` — Logique UI, formulaire et redirection
- `supabase.js` — Initialisation Supabase (à configurer)
- `vendor/supabase/supabase.js` — Bundle navigateur officiel Supabase (copie locale)

Configuration:

1. Ouvrir `config.js` et remplacer `SUPABASE_URL` et `SUPABASE_ANON_KEY` par vos valeurs.
2. Mettre votre numéro WhatsApp dans `config.js` (`WHATSAPP_NUMBER`).
3. Personnaliser chaque service dans `config.js` sous `SERVICES`, avec `nom`, `prix` et `chariow` pour la page de paiement.
   - Si un service n'a pas de `chariow`, la valeur `CHARIOW_REDIRECT` est utilisée en secours.
4. Installer la dépendance officielle puis copier le bundle navigateur local :

```bash
npm install --save-exact @supabase/supabase-js@2
mkdir -p vendor/supabase
cp node_modules/@supabase/supabase-js/dist/umd/supabase.js vendor/supabase/supabase.js
```

Schéma recommandé (inclut `order_number`, `payment_reference`, `service` et `price`) :

```sql
create table public.activation_requests (
	id uuid default gen_random_uuid() primary key,
	order_number text not null unique,
	created_at timestamptz default now(),
	updated_at timestamptz default now(),
	fullname text,
	phone text,
	country text,
	email text,
	service text,
	price numeric,
	payment_reference text,
	payment_status text default 'pending',
	status text default 'waiting'
);
```

Adaptez le type `price` si vous préférez `text` ou `integer`.

Note de sécurité : le frontend utilise `SUPABASE_ANON_KEY`. Si vous exposez des données sensibles, configurez des policies RLS appropriées sur Supabase pour limiter l'accès aux seules lignes et actions autorisées.

Un fichier `database.sql` a été ajouté avec le schéma recommandé et des index utiles.

Déploiement:

Héberger sur Vercel / Netlify / Cloudflare Pages. Aucun build nécessaire.
