import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DEKORACIJE, IGRALA, KJE_SMO_BILI, PODJETJE, PREDNOSTI } from '../../data';
import { Kartica } from '../../shared/kartica';
import { Ilustracija } from '../../shared/ilustracija';

@Component({
  selector: 'app-domov',
  imports: [RouterLink, Kartica, Ilustracija],
  template: `
    <section class="hero">
      <div class="okvir hero-mreza">
        <div>
          <span class="znacka">🎈 Nova Gorica in okolica</span>
          <h1>Skakanje, smeh in <span class="poudarek">nepozabne</span> zabave</h1>
          <p class="uvod">{{ p.slogan }} Pripeljemo, postavimo in pospravimo, vi pa uživate.</p>
          <div class="gumbi">
            <a routerLink="/rezervacija" class="gumb">Rezerviraj termin</a>
            <a [href]="'tel:' + p.telefonLink" class="gumb drugi">📞 {{ p.telefon }}</a>
          </div>
          <ul class="dejstva">
            <li><b>{{ p.cenaOd }}–{{ p.cenaDo }} €</b><span>na dan</span></li>
            <li><b>3–9 let</b><span>starost otrok</span></li>
            <li><b>Gratis</b><span>dostava v N. Gorici</span></li>
          </ul>
        </div>
        <div class="hero-slika">
          <app-ilustracija [ponudba]="igrala[2]" />
        </div>
      </div>
    </section>

    <section class="sekcija">
      <div class="okvir">
        <div class="prednosti">
          @for (x of prednosti; track x.naslov) {
            <div class="prednost">
              <span class="ikona">{{ x.ikona }}</span>
              <h3>{{ x.naslov }}</h3>
              <p>{{ x.opis }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <section class="sekcija">
      <div class="okvir">
        <h2>Naša igrala</h2>
        <p class="podnaslov">Cena na dan od {{ p.cenaOd }} € do {{ p.cenaDo }} €, odvisno od modela.</p>
        <div class="mreza">
          @for (i of igrala; track i.id) {
            <app-kartica [ponudba]="i" [povezava]="'/igrala/' + i.id" />
          }
        </div>
      </div>
    </section>

    <section class="sekcija dekor">
      <div class="okvir dekor-mreza">
        <div>
          <span class="znacka">🎀 Novo</span>
          <h2>Dekoracije prostorov z baloni</h2>
          <p class="podnaslov">Rojstni dnevi, krsti, poroke in otvoritve. Balonske loke, girlande in ozadja za fotografije pripravimo v vaših barvah.</p>
          <a routerLink="/dekoracije" class="gumb">Poglej dekoracije</a>
        </div>
        <app-ilustracija [ponudba]="dekoracije[0]" class="dekor-slika" />
      </div>
    </section>

    <section class="sekcija">
      <div class="okvir">
        <h2>Kje smo že zabavali otroke</h2>
        <div class="kraji">
          @for (k of kraji; track k) { <span>📍 {{ k }}</span> }
        </div>
      </div>
    </section>

    <section class="okvir">
      <div class="poziv">
        <h2>Imate datum? Rezervirajte, dokler je prost.</h2>
        <p>Termini ob vikendih gredo hitro. Pošljite povpraševanje ali nas pokličite.</p>
        <div class="gumbi">
          <a routerLink="/rezervacija" class="gumb drugi">Pošlji povpraševanje</a>
          <a [href]="'tel:' + p.telefonLink" class="gumb drugi">📞 {{ p.telefon }}</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .hero { padding: 40px 0 24px; background: radial-gradient(circle at 85% 20%, #ffe7a3 0, transparent 40%), radial-gradient(circle at 10% 90%, #d5e6ff 0, transparent 35%); }
    .hero-mreza { display: grid; grid-template-columns: 1.1fr 1fr; gap: 40px; align-items: center; }
    .poudarek { color: var(--rdeca); }
    .uvod { font-size: 1.15rem; color: var(--siva); max-width: 48ch; }
    .gumbi { display: flex; flex-wrap: wrap; gap: 14px; margin: 24px 0; }
    .dejstva { list-style: none; padding: 0; margin: 8px 0 0; display: flex; gap: 28px; flex-wrap: wrap; }
    .dejstva li { display: flex; flex-direction: column; }
    .dejstva b { font-family: var(--naslovna); font-size: 1.5rem; color: var(--modra); }
    .dejstva span { font-size: .85rem; color: var(--siva); }
    .hero-slika app-ilustracija { border-radius: 28px; box-shadow: var(--senca); transform: rotate(2deg); }
    @media (max-width: 820px) { .hero-mreza { grid-template-columns: 1fr; } .hero-slika { order: -1; } }

    .prednosti { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
    .prednost { background: var(--bela); border-radius: 20px; padding: 20px; box-shadow: var(--senca); }
    .prednost .ikona { font-size: 2rem; }
    .prednost h3 { margin: 8px 0 4px; font-size: 1.15rem; }
    .prednost p { margin: 0; color: var(--siva); font-size: .95rem; }
    @media (max-width: 820px) { .prednosti { grid-template-columns: 1fr 1fr; } }

    .dekor { background: #fdeef3; }
    .dekor-mreza { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; }
    .dekor-slika { border-radius: 28px; box-shadow: var(--senca); }
    @media (max-width: 820px) { .dekor-mreza { grid-template-columns: 1fr; } }

    .kraji { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
    .kraji span { background: var(--bela); border-radius: 999px; padding: 8px 16px; box-shadow: var(--senca); font-weight: 700; }

    .poziv { background: var(--modra); color: #fff; border-radius: 28px; padding: 40px 32px; text-align: center; }
    .poziv p { color: #dbe7ff; }
    .poziv .gumbi { justify-content: center; }
  `,
})
export class Domov {
  p = PODJETJE;
  igrala = IGRALA;
  dekoracije = DEKORACIJE;
  prednosti = PREDNOSTI;
  kraji = KJE_SMO_BILI;
}
