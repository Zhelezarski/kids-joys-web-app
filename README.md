# Napihljiva Igrala Kids Joy – Angular spletna stran

Spletna stran za najem napihljivih igral in dekoracije z baloni (Angular 20, standalone komponente, signali, brez zone.js).

## Zagon

Potrebuješ Node.js 20.19 ali novejši.

```bash
npm install
npm start          # http://localhost:4200
npm run build      # produkcijska različica v dist/kids-joy/browser
```

## Kje kaj spremeniš

| Kaj | Datoteka |
| --- | --- |
| Vsa vsebina, ko je baza povezana | admin del na `/admin` (glej ADMIN.md) |
| Privzeta vsebina brez baze | `src/app/data.ts` |
| Povezava z bazo | `src/app/config.ts` |
| Fotografije | `public/slike/` (pot vpiši v `data.ts` pri `slike`) |
| Barve in pisave | `src/styles.css` (spremenljivke v `:root`) |

## Strani

- `/` domov
- `/igrala` in `/igrala/:id` katalog in podrobnosti igrala
- `/dekoracije` dekoracije z baloni
- `/rezervacija` obrazec (podpira `?igralo=id` in `?dekoracija=id`)
- `/kontakt` kontakt in pogosta vprašanja
- `/admin` admin del (rezervacije, igrala, dekoracije, slike, nastavitve)

## Rezervacije

Obrazec nima strežnika. Ob oddaji odpre stranki e-pošto ali SMS s
pripravljenim besedilom na `kidsjoy.igrala@gmail.com` oz. `070 258 245`.
Če želiš, da povpraševanja prihajajo samodejno, lahko kasneje dodaš
storitev, kot je Formspree ali EmailJS.

## Objava

`dist/kids-joy/browser` naloži na Netlify, Vercel, Firebase Hosting ali
na običajno gostovanje. Pri navadnem gostovanju nastavi, da vse poti
vračajo `index.html` (SPA preusmeritev).

## Samodejna objava

Ob vsakem pushu na `main` GitHub Actions zgradi aplikacijo in jo objavi na GitHub Pages
(`.github/workflows/deploy.yml`). V repozitoriju mora biti v **Settings → Pages**
kot vir izbran **GitHub Actions**.
