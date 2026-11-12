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
- **E-poštna obvestila**: vam ob novi rezervaciji in dnevni pregled; stranki potrdilo, potrditev ali zavrnitev in opomnik
  (glej spodaj).
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

## E-poštna obvestila (enkrat, ~10 minut)

Stran samodejno pošilja e-pošto prek **Brevo** (brezplačno do 300 sporočil na dan, podjetje iz EU):

| Komu | Kdaj |
| --- | --- |
| Vam | takoj, ko nekdo odda rezervacijo na strani (odgovor gre neposredno stranki) |
| Vam | vsak dan ob ~17h: jutrišnji dogodki in rezervacije, ki še čakajo na potrditev (samo če je kaj) |
| Stranki | potrdilo o prejemu povpraševanja |
| Stranki | potrditev ali zavrnitev, ko v adminu spremenite status (tudi ročno vnesena potrjena rezervacija) |
| Stranki | opomnik dan pred dogodkom (potrjene rezervacije) |

Stranka dobi e-pošto samo, če jo je navedla. Vsako sporočilo se pošlje največ enkrat; v adminu pri
rezervaciji vidite, kaj je bilo poslano (✗ = ni uspelo, z miško nad njim vidite razlog).
Posamezna obvestila vklopite ali izklopite v **Nastavitve → E-poštna obvestila**.

Nastavitev:

1. Ustvari brezplačen račun na [brevo.com](https://www.brevo.com).
2. **Senders, Domains & Dedicated IPs → Senders → Add a sender**: dodaj e-pošto podjetja
   (npr. `kidsjoy.igrala@gmail.com`) in jo potrdi s klikom na povezavo v prejetem sporočilu.
3. **SMTP & API → API Keys → Generate a new API key**, kopiraj ključ.
4. V Supabase: **Edge Functions → Secrets → Add new secret**: ime `BREVO_API_KEY`, vrednost = ključ.
5. V adminu **Nastavitve → E-poštna obvestila → Pošlji testno sporočilo**.

Neobvezno (isti meni Secrets):
- `EMAIL_POSILJATELJ`: drug potrjen pošiljatelj v Brevo (privzeto e-pošta podjetja iz nastavitev).
- `STRAN_URL`: naslov strani, ko dobite svojo domeno (npr. `https://kidsjoy.si`).

Ko kupite svojo domeno, jo v Brevo avtenticirajte (**Domains → Add a domain**, DNS zapisi) in
uporabite pošiljatelja na tej domeni (npr. `info@kidsjoy.si`): sporočila bodo redkeje v neželeni pošti.

**Pozabljeno geslo za admin**: Supabase privzeto pošilja le nekaj e-poštnih sporočil na uro.
Za zanesljivo pošiljanje: Supabase **Authentication → Emails → SMTP Settings → Enable custom SMTP**
s podatki iz Brevo **SMTP & API → SMTP** (host `smtp-relay.brevo.com`, port `587`, uporabnik in SMTP ključ,
pošiljatelj = potrjena e-pošta iz koraka 2).

Tehnično: funkcija je v `supabase/functions/obvestila`, sprožilec in dnevni opravek pa v `supabase/schema.sql`.

## Opomba glede brezplačnega paketa

Supabase brezplačen projekt po 7 dneh brez obiskov zaspi. Zbudiš ga z enim klikom v
Supabase nadzorni plošči. Ko ima stran redne obiske, se to ne zgodi.
