# Cape Island Recovery — Falmouth, MA

Cape Island Recovery moves food and opens doors. Based in Falmouth, MA (316 Gifford St), it delivers
meals and groceries to people in recovery and neighbors in need, and connects people in recovery to
benefits, treatment, housing and meetings. Rides are a planned future service.
A program of Inspiration Is Everywhere Inc., a 501(c)(3) nonprofit (EIN 82-5186366).

**Live (draft):** https://platinum00001.github.io/cape-island-recovery/ (GitHub Pages, deploys on push to `main`).
Custom domain capeisland.org (HostGator) is NOT connected yet.

## Edit
- Page text: edit `tools/build.py`, run `python3 tools/build.py`, commit the regenerated `*.html`.
- Contact email, phone, donate link, Supabase settings: `config.js` only.
- Database: `supabase/schema.sql` — schema `cape_island_recovery` in Supabase project james-sites
  (`oiousqgzqcjanikglkxl`), Row Level Security on every table.

## Setup still needed (Supabase dashboard)
1. Project Settings → Data API → Exposed schemas: add `cape_island_recovery` (keep the others).
   Until then, forms show an "email us instead" fallback.
2. Authentication → URL Configuration → Redirect URLs: add
   `https://platinum00001.github.io/cape-island-recovery/**` (later also `https://capeisland.org/**`).
   Do not change the shared Site URL.
3. Make an admin (after signing in once):
   `insert into cape_island_recovery.admins (user_id, note) select id, 'admin' from auth.users where email = '…';`

Never put a service_role or secret key in this repo — the publishable key in `config.js` is public by design.
