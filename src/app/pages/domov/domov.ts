import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Ponudba } from '../../models';
import { Podatki } from '../../services/podatki';
import { Kartica } from '../../shared/kartica';
import { Ilustracija } from '../../shared/ilustracija';

/** Prvi vnos s fotografijo, sicer prvi vnos. */
const izpostavljen = (s: Ponudba[]) => s.find((x) => x.slike.length) ?? s[0];

@Component({
  selector: 'app-domov',
  imports: [RouterLink, Kartica, Ilustracija],
  template: `
    <section class="hero">
      <div class="okvir">
        <div class="uvodni">
          <span class="znacka">🎈 {{ pj().obmocje }}</span>
          <h1>{{ n().hero.naslov }}</h1>
          <p class="uvod">{{ pj().slogan }} {{ n().hero.podnaslov }}</p>
        </div>

        <div class="storitvi">
          <a class="storitev igrala" routerLink="/igrala">
            @if (prvoIgralo(); as g) { <app-ilustracija [ponudba]="g" class="sl" /> }
            <div class="besedilo">
              <span class="oznaka">🏰 Najem</span>
              <h2>Napihljiva igrala</h2>
              <p>Gradovi in tobogani za otroke od 3 do 9 let. Pripeljemo, postavimo in pospravimo.</p>
              <div class="dno">
                <span class="cena">{{ pj().cenaOd }}–{{ pj().cenaDo }} € <small>/ dan</small></span>
                <span class="gumb majhen">Poglej igrala ({{ p.igrala().length }}) →</span>
              </div>
            </div>
          </a>

          <a class="storitev dekoracije" routerLink="/dekoracije">
            @if (prvaDekoracija(); as d) { <app-ilustracija [ponudba]="d" class="sl" /> }
            <div class="besedilo">
              <span class="oznaka">🎀 Okrasitev</span>
              <h2>Dekoracije z baloni</h2>
              <p>Balonski loki, girlande in ozadja za rojstne dneve, krste, poroke in otvoritve.</p>
              <div class="dno">
                <span class="cena">Po meri <small>v vaših barvah</small></span>
                <span class="gumb majhen vijolicen">Poglej dekoracije ({{ p.dekoracije().length }}) →</span>
              </div>
            </div>
          </a>
        </div>

        <div class="akcija">
          <a routerLink="/rezervacija" class="gumb">Rezerviraj termin</a>
          <a [href]="'tel:' + p.tel()" class="gumb drugi">📞 {{ pj().telefon }}</a>
          <span class="dostava">🚚 {{ pj().dostava }}</span>
        </div>
      </div>
    </section>

    <section class="sekcija">
      <div class="okvir">
        <div class="naslov-vrstica">
          <div>
            <h2>Napihljiva igrala</h2>
            <p class="podnaslov">Cena na dan od {{ pj().cenaOd }} € do {{ pj().cenaDo }} €, odvisno od modela.</p>
          </div>
          <a routerLink="/igrala" class="vec">Vsa igrala →</a>
        </div>
        <div class="mreza">
          @for (i of p.igrala(); track i.slug) { <app-kartica [ponudba]="i" /> }
        </div>
      </div>
    </section>

    @if (p.dekoracije().length) {
      <section class="sekcija dekor">
        <div class="okvir">
          <div class="naslov-vrstica">
            <div>
              <h2>Dekoracije z baloni</h2>
              <p class="podnaslov">Barve in postavitev uskladimo z vašim praznovanjem. Ceno pripravimo glede na velikost.</p>
            </div>
            <a routerLink="/dekoracije" class="vec">Vse dekoracije →</a>
          </div>
          <div class="mreza">
            @for (d of p.dekoracije(); track d.slug) { <app-kartica [ponudba]="d" /> }
          </div>
          <p class="kombo">🏰 + 🎈 <b>Igralo in dekoracija skupaj?</b> Uredimo celotno zabavo z enim klicem.
            <a routerLink="/rezervacija">Pošlji povpraševanje</a></p>
        </div>
      </section>
    }

    <section class="sekcija">
      <div class="okvir prednosti">
        @for (x of n().prednosti; track $index) {
          <div class="prednost">
            <span class="ikona">{{ x.ikona }}</span>
            <h3>{{ x.naslov }}</h3>
            <p>{{ x.opis }}</p>
          </div>
        }
      </div>
    </section>

    @if (n().kraji.length) {
      <section class="sekcija kraji-sekcija">
        <div class="okvir">
          <h2>Kje smo že zabavali otroke</h2>
          <div class="kraji">@for (k of n().kraji; track $index) { <span>📍 {{ k }}</span> }</div>
        </div>
      </section>
    }

    <section class="okvir">
      <div class="poziv">
        <h2>Imate datum? Rezervirajte, dokler je prost.</h2>
        <p>Termini ob vikendih gredo hitro. Pošljite povpraševanje ali nas pokličite.</p>
        <div class="gumbi">
          <a routerLink="/rezervacija" class="gumb drugi">Pošlji povpraševanje</a>
          <a [href]="'tel:' + p.tel()" class="gumb drugi">📞 {{ pj().telefon }}</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .hero { padding: 36px 0 40px; background: radial-gradient(circle at 90% 10%, #ffe7a3 0, transparent 35%), radial-gradient(circle at 5% 95%, #fbd9e6 0, transparent 35%); }
    .uvodni { text-align: center; max-width: 760px; margin: 0 auto 28px; }
    h1 { margin-top: 12px; text-wrap: balance; }
    .uvod { font-size: 1.15rem; color: var(--siva); margin: 0 auto; max-width: 56ch; }

    .storitvi { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
    .storitev { display: flex; flex-direction: column; background: var(--bela); border-radius: 28px; overflow: hidden; box-shadow: var(--senca);
                text-decoration: none; color: var(--temna); border: 3px solid transparent; transition: transform .15s, border-color .15s; }
    .storitev:hover { transform: translateY(-3px); }
    .storitev.igrala:hover { border-color: var(--modra); }
    .storitev.dekoracije:hover { border-color: var(--vijolicna); }
    .sl { border-radius: 0; }
    .besedilo { padding: 18px 22px 22px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .oznaka { font-weight: 800; font-size: .85rem; letter-spacing: .03em; }
    .igrala .oznaka { color: var(--modra); }
    .dekoracije .oznaka { color: var(--vijolicna); }
    .storitev h2 { margin: 0; font-size: clamp(1.5rem, 3.5vw, 2rem); }
    .storitev p { margin: 0; color: var(--siva); }
    .dno { margin-top: auto; padding-top: 12px; display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
    .cena { font-family: var(--naslovna); font-weight: 800; font-size: 1.3rem; color: var(--rdeca); }
    .dekoracije .cena { color: var(--vijolicna); }
    .cena small { font-size: .85rem; color: var(--siva); font-weight: 600; }
    .gumb.vijolicen { background: var(--vijolicna); box-shadow: 0 4px 0 #5a379a; }

    .akcija { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; justify-content: center; margin-top: 28px; }
    .dostava { color: var(--siva); font-weight: 700; }
    @media (max-width: 760px) { .storitvi { grid-template-columns: 1fr; } }

    .naslov-vrstica { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
    .vec { font-weight: 800; text-decoration: none; margin-bottom: 28px; }
    .dekor { background: #fdeef3; }
    .dekor .vec { color: var(--vijolicna); }
    .kombo { margin: 28px 0 0; background: var(--bela); border-radius: 16px; padding: 14px 18px; box-shadow: var(--senca); }

    .prednosti { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
    .prednost { background: var(--bela); border-radius: 20px; padding: 20px; box-shadow: var(--senca); }
    .prednost .ikona { font-size: 2rem; }
    .prednost h3 { margin: 8px 0 4px; font-size: 1.15rem; }
    .prednost p { margin: 0; color: var(--siva); font-size: .95rem; }
    @media (max-width: 820px) { .prednosti { grid-template-columns: 1fr 1fr; } }
    .kraji-sekcija { padding-top: 0; }
    .kraji { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
    .kraji span { background: var(--bela); border-radius: 999px; padding: 8px 16px; box-shadow: var(--senca); font-weight: 700; }
    .poziv { background: var(--modra); color: #fff; border-radius: 28px; padding: 40px 32px; text-align: center; }
    .poziv p { color: #dbe7ff; }
    .gumbi { display: flex; flex-wrap: wrap; gap: 14px; margin: 24px 0 0; justify-content: center; }
    @media (prefers-reduced-motion: reduce) { .storitev { transition: none; } .storitev:hover { transform: none; } }
  `,
})
export class Domov {
  p = inject(Podatki);
  n = this.p.nastavitve;
  pj = this.p.podjetje;
  prvoIgralo = computed(() => izpostavljen(this.p.igrala()));
  prvaDekoracija = computed(() => izpostavljen(this.p.dekoracije()));
}
