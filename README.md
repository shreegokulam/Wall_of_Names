# Wall of Names

A live, installable community sign-in wall. Anyone who opens the link can add
their name, and it appears instantly on every open screen — no refresh —
via Supabase Realtime.

- **Frontend:** React + Vite, packaged as a PWA (installable, offline app shell)
- **Database:** Supabase (PostgreSQL)
- **Realtime:** Supabase Realtime (Postgres change feed over websockets)
- **Hosting:** Netlify

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → **New query**, paste in the contents of
   `supabase/schema.sql`, and run it. This creates the `names` table, opens
   public read/insert access, and adds the table to the realtime
   publication.
3. Go to **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key

   You'll need both in step 2 below.

> **Note on access:** the schema grants public read + insert with no
> login, matching "anyone can add their name." If you'd rather require
> sign-in or add moderation later, tighten the RLS policies in
> `supabase/schema.sql` accordingly.

## 2. Run it locally

```bash
npm install
cp .env.example .env
# edit .env and paste in your Supabase Project URL + anon key
npm run dev
```

Open the printed local URL — open it in two tabs and try adding a name in
one to see it appear instantly in the other.

## 3. Deploy to Netlify

**Option A — Netlify UI (recommended):**
1. Push this project to a GitHub repo.
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
3. Build command and publish directory are already set via `netlify.toml`
   (`npm run build` / `dist`) — Netlify will pick them up automatically.
4. Under **Site settings → Environment variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. Netlify gives you a `*.netlify.app` URL immediately; add a
   custom domain later if you want one.

**Option B — Netlify CLI:**
```bash
npm install -g netlify-cli
netlify init
netlify env:set VITE_SUPABASE_URL "https://your-project.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key"
netlify deploy --prod
```

## 4. Install as an app (PWA)

Once deployed, visiting the Netlify URL on a phone shows an "Add to Home
Screen" / install prompt (Chrome/Edge/Android show it automatically;
iOS Safari needs Share → Add to Home Screen). The app shell (layout,
styling) is cached for offline load; adding/seeing new names still needs
a network connection to reach Supabase.

## Project structure

```
wall-of-names/
├── index.html
├── vite.config.js          # Vite + PWA plugin (manifest, service worker)
├── netlify.toml            # Netlify build + SPA redirect config
├── .env.example
├── public/
│   └── icons/               # App icons (bronze plaque, generated)
├── src/
│   ├── main.jsx
│   ├── App.jsx              # UI + Supabase fetch/insert/realtime logic
│   ├── supabaseClient.js
│   └── index.css            # Bronze/wood engraved-plaque styling
└── supabase/
    └── schema.sql            # Table, RLS policies, realtime publication
```

## Customizing

- **Title/subtitle:** edit the two lines near the top of `src/App.jsx`.
- **Name length limit:** `maxLength` in `App.jsx`'s `<input>`, and the
  `check` constraint in `schema.sql` (keep both in sync).
- **Moderation:** since inserts are public, consider adding a Postgres
  trigger or Supabase Edge Function to filter profanity, or switch the
  insert policy to `authenticated` and add a simple sign-in step.
