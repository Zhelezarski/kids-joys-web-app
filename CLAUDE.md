# Kids Joy – spletna stran za najem napihljivih igral in dekoracij

Website for **Napihljiva Igrala Kids Joy** (inflatable bouncy castle rental + balloon decorations,
Nova Gorica, Slovenia). Public site + admin panel. The owner is handing it over to a friend who runs the business.

**Talk to the user in English.** The whole website (all UI text, content, legal texts, admin panel), code identifiers,
file names and commit messages stay in Slovenian. Keep that convention (e.g. `igrala`, `dekoracije`, `rezervacija`, `nastavitve`, `ponudba`).

## Live

| What | Where |
| --- | --- |
| Site | https://zhelezarski.github.io/kids-joys-web-app/ |
| Admin | https://zhelezarski.github.io/kids-joys-web-app/admin |
| Repo | https://github.com/Zhelezarski/kids-joys-web-app (public, branch `main`) |
| Supabase project | `kids-joy`, ref `ndbekxmysqgmqrrllbfm`, region eu-central-1 (Frankfurt), free plan |
| Supabase dashboard | https://supabase.com/dashboard/project/ndbekxmysqgmqrrllbfm |
| Business Facebook | https://www.facebook.com/share/1J8Crnadih/ |

## Stack

- **Angular 20**: standalone components, signals, zoneless (`provideZonelessChangeDetection`), new control flow
  (`@if`, `@for`), `input()`, inline templates and styles in one `.ts` file per component. No NgModules, no zone.js.
- **Supabase** (`@supabase/supabase-js`): Postgres + Auth (admin login) + Storage (bucket `slike` for photos).
- **Hosting**: GitHub Pages, built by GitHub Actions on every push to `main` (`.github/workflows/deploy.yml`).
  Builds with `--base-href "/kids-joys-web-app/"` and copies `index.html` to `404.html` for SPA routing.
  When a custom domain is added, change the base href to `/` and add a `CNAME`.
- Fonts are **self-hosted** via `@fontsource/baloo-2` and `@fontsource/nunito` (configured in `angular.json` styles).
  Do NOT add Google Fonts or any third-party script/embed: the privacy policy promises no third-party requests and no
  tracking cookies, which is why there is no cookie banner.

## Commands

```bash
npm install
npm start        # http://localhost:4200
npm run build    # dist/kids-joy/browser
```

Push to `main` deploys automatically (~1 min). Check with `gh run list -R Zhelezarski/kids-joys-web-app -L 3`.
GitHub Actions sometimes gets stuck in `queued`; re-run from the Actions tab or `gh workflow run deploy.yml`.

## Delovni postopek (obvezno)

Vsaka sprememba gre prek pull requesta: razvoj na veji `claude/...`, `npm run build` mora uspeti, nato PR v `main`
in merge, da GitHub Actions objavi stran. Nikoli ne pushaj neposredno na `main`. To velja za vsako spremembo, vsakič.

## Structure

```
src/app/
  config.ts            Supabase URL + publishable key (public, safe in code; data protected by RLS)
  models.ts            Types: Ponudba (item), Nastavitve (site settings), Rezervacija (booking), ...
  data.ts              Default content; used when Supabase is not configured and as seed source
  util.ts              telLink, slugify, datumSl, danes, pomanjsajSliko (client-side image resize)
  app.routes.ts        Routes + admin guard
  javna-postavitev.ts  Public layout (header, footer, floating call button, notice banner)
  services/
    supa.ts            Supabase client (null when config.ts is empty)
    podatki.ts         Public data as signals (settings, items), booking submit, busy-dates RPC
    admin-api.ts       Admin CRUD: login, items, image upload/delete, bookings, settings
  pages/               Public: domov, igrala, igralo/:id, dekoracije, rezervacija, kontakt, pravno/{zasebnost,pogoji}
  admin/               prijava, postavitev (layout), pregled (dashboard), rezervacije, ponudba, ponudba-uredi, nastavitve
  shared/              kartica (item card), ilustracija (photo or SVG illustration fallback), logo
src/styles.css         Global tokens (--rdeca, --modra, --rumena, --zelena, --vijolicna, --kremna ...), public, admin (.adm-*) and legal (.pravno) styles
supabase/schema.sql    Full schema, RLS, storage, functions, triggers, cron. Re-runnable.
supabase/seed.sql      Initial content generated from data.ts
supabase/functions/obvestila/index.ts  Edge Function: all emails (Brevo API), deployed via Supabase MCP/CLI, verify_jwt=false
ADMIN.md               Admin setup guide (Slovenian)
```

## Database (Supabase, schema `public`)

- `ponudba`: igrala and dekoracije (`kategorija` = `igralo` | `dekoracija`), `slug` unique, `slike` text[] of public
  storage URLs (first = main photo), `barve` + `oblika` drive the SVG illustration when there is no photo,
  `aktivno` (published), `vrstni_red` (order), `cena` null = "po dogovoru".
- `nastavitve`: single row `id = 1`, `podatki` jsonb = `Nastavitve` type (company info, legal data, hero texts,
  notice banner, advantages, places, FAQ, cancellation terms). `Podatki.nalozi()` merges it over `PRIVZETE_NASTAVITVE`,
  so new fields need a default in `data.ts`.
- `rezervacije`: bookings; `postavke` jsonb snapshot of chosen items; `status` nova | potrjena | zavrnjena | zakljucena;
  `sprejeti_pogoji` must be true for anonymous insert.
- `admini` (user_id) + `je_admin()`; `admin_emaili` + trigger `kidsjoy_nov_uporabnik_admin` on `auth.users`
  auto-grants admin to listed emails when the user is created.
- `zasedena_igrala(d date)`: security definer RPC, returns slugs of igrala already booked that day (no personal data).
- RLS: public reads active items and settings; anon can only INSERT bookings (status nova, future date, terms accepted),
  never read them; admins can do everything. Storage bucket `slike` is public-read, admin-write.
- pg_cron job `kidsjoy-brisanje-starih-rezervacij` deletes bookings 12 months after the event (GDPR retention,
  stated in the privacy policy).

- `email_dnevnik`: log of sent emails (vrsta, uspeh, napaka; no content), FK to rezervacije on delete cascade;
  admin read-only, also used to send each email only once.
- Emails: trigger `kidsjoy_rezervacija_obvestila` (insert / status change) and pg_cron `kidsjoy-dnevna-obvestila`
  (16:07 UTC) call `obvestila_poslji()` → pg_net POST to Edge Function `obvestila` with header `x-kidsjoy-skrivnost`
  (Vault secret `kidsjoy_obvestila_skrivnost`, checked by the function via service-role-only RPC `obvestila_skrivnost()`).
  Admin "test" event is authorized with the admin's JWT. Toggles + recipient live in `Nastavitve.obvestila`.
  Function secrets: `BREVO_API_KEY` (required), `EMAIL_POSILJATELJ`, `STRAN_URL` (optional). Brevo is listed as a
  processor in the privacy policy; changing provider means updating `/zasebnost`.

Any schema change: apply it to Supabase AND append it to `supabase/schema.sql` (keep the file re-runnable).
Supabase security advisor warns that `je_admin` and `zasedena_igrala` are executable by anon: intentional.

## Legal (Slovenia / EU)

`/zasebnost` (GDPR, ZVOP-2) and `/pogoji` (ZVPot-1, OZ) read company/legal fields from settings.
Effective date constant `PRAVNO_VELJA_OD` in `pages/pravno/zasebnost.ts`; update it when texts change.
Facts relied on: no 14-day withdrawal for date-specific leisure services (ZVPot-1, 135. člen, točka 12);
EU ODR platform was discontinued in 2025, so no ODR link; non-VAT payer wording cites 94. člen ZDDV-1.
If you add analytics, embeds, payments, newsletters etc., the privacy policy and consent flow must be updated first.

## Open tasks / known gaps

- [ ] Admin user: create in Supabase Auth (Authentication → Users → Add user, Auto Confirm) with an email listed in
      `admin_emaili`; then disable "Allow new users to sign up".
- [ ] Legal data in admin → Nastavitve → Pravni podatki (full legal name s.p./d.o.o., seat, matična, davčna, DDV)
      and confirm cancellation terms. Admin dashboard warns until filled.
- [ ] Real photos and real per-item prices/sizes (current 60/80/100 € and sizes except the 6 × 4 × 3 m castle are guesses;
      only the 60–100 €/day range, 3–9 years, 250 kg and free delivery in Nova Gorica come from the Facebook page).
- [ ] Transfer Supabase project to the friend's organization (Project Settings → General → Transfer project) and,
      optionally, the GitHub repo. Friend should sign the Supabase DPA.
- [ ] Custom domain (friend buys e.g. a `.si` domain): add `CNAME`, set base href to `/`, configure DNS and Pages.
- [ ] Emails are implemented but need a Brevo account: verify sender, set `BREVO_API_KEY` in Supabase Edge Function
      secrets, then admin → Nastavitve → "Pošlji testno sporočilo" (see ADMIN.md). Optionally configure Brevo SMTP for
      Supabase Auth emails (password reset). SMS notifications not implemented.
- [ ] Legal texts are carefully drafted but not lawyer-reviewed; recommend a quick review before launch.
