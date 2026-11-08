# Admin del – nastavitev

Admin del je na naslovu `/admin` (npr. https://zhelezarski.github.io/kids-joys-web-app/admin).
Podatki so shranjeni v brezplačni bazi **Supabase**.

## Kaj lahko admin ureja

- **Rezervacije**: nove, potrjene, pretekle in zavrnjene; potrjevanje in zavračanje, interne opombe,
  SMS stranki, ročni vnos rezervacij po telefonu, opozorilo, če je isto igralo isti dan rezervirano dvakrat.
- **Igrala in dekoracije**: dodajanje, urejanje, brisanje, fotografije (nalaganje, vrstni red, glavna slika),
  cena, mere, starost, nosilnost, značilnosti, objava ali skrivanje in vrstni red na strani.
- **Nastavitve**: kontakt, cene, slogan, besedila na naslovnici, obvestilo na vrhu strani,
  prednosti, kraji in pogosta vprašanja; sprememba gesla.
- **Pregled**: nova povpraševanja, prihajajoči dogodki in prihodek v tekočem mesecu.

Obiskovalci ob rezervaciji vidijo, katera igrala so na izbrani dan že zasedena.

## Postavitev (enkrat, ~10 minut)

1. Na [supabase.com](https://supabase.com) ustvari brezplačen račun in nov projekt (regija: Frankfurt).
2. V projektu odpri **SQL Editor**, prilepi vsebino `supabase/schema.sql` in klikni **Run**.
3. Nato prilepi še `supabase/seed.sql` in klikni **Run** (začetna igrala, dekoracije in besedila).
4. **Authentication → Users → Add user → Create new user**: vpiši svojo e-pošto in geslo,
   označi **Auto Confirm User**.
5. V **SQL Editor** zaženi (s svojo e-pošto):
   ```sql
   insert into public.admini (user_id)
   select id from auth.users where email = 'tvoj@email.si'
   on conflict do nothing;
   ```
6. **Authentication → Sign In / Providers**: izklopi **Allow new users to sign up**.
7. **Authentication → URL Configuration**: pod **Site URL** vpiši
   `https://zhelezarski.github.io/kids-joys-web-app/` (za povezavo »pozabljeno geslo«).
8. **Project Settings → API**: kopiraj **Project URL** in **anon public** ključ v
   `src/app/config.ts`, commitaj in pushaj. GitHub stran samodejno posodobi.

Dokler `config.ts` ni izpolnjen, stran deluje s podatki iz `src/app/data.ts`,
rezervacije pa se pošiljajo po e-pošti ali SMS.

## Opomba glede brezplačnega paketa

Supabase brezplačen projekt po 7 dneh brez obiskov zaspi. Zbudiš ga z enim klikom v
Supabase nadzorni plošči. Ko ima stran redne obiske, se to ne zgodi.
