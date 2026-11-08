import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Podatki } from '../../services/podatki';

@Component({
  selector: 'app-kontakt',
  imports: [RouterLink],
  template: `
    <section class="sekcija">
      <div class="okvir">
        <h1>Kontakt</h1>
        <p class="podnaslov">{{ pj().delovniCas }}. Najhitreje nas dobite po telefonu.</p>
        <div class="kontakti">
          <a class="kontakt" [href]="'tel:' + p.tel()"><span>📞</span><b>Telefon</b>{{ pj().telefon }}</a>
          <a class="kontakt" [href]="'mailto:' + pj().email"><span>✉️</span><b>E-pošta</b>{{ pj().email }}</a>
          @if (pj().instagram) {
            <a class="kontakt" [href]="'https://instagram.com/' + pj().instagram" target="_blank" rel="noopener"><span>📸</span><b>Instagram</b>&#64;{{ pj().instagram }}</a>
          }
          @if (pj().facebook) {
            <a class="kontakt" [href]="pj().facebook" target="_blank" rel="noopener"><span>👍</span><b>Facebook</b>{{ pj().kratkoIme }}</a>
          }
          <div class="kontakt"><span>📍</span><b>Lokacija</b>{{ pj().naslov }}</div>
          <div class="kontakt"><span>🚚</span><b>Dostava</b>{{ pj().dostava }}</div>
        </div>
      </div>
    </section>

    @if (p.nastavitve().vprasanja.length) {
      <section class="sekcija">
        <div class="okvir ozek">
          <h2>Pogosta vprašanja</h2>
          @for (q of p.nastavitve().vprasanja; track $index) {
            <details><summary>{{ q.vprasanje }}</summary><p>{{ q.odgovor }}</p></details>
          }
          <p class="vec">Imate drugo vprašanje? <a routerLink="/rezervacija">Pošljite povpraševanje</a> ali nas pokličite.</p>
        </div>
      </section>
    }
  `,
  styles: `
    .kontakti { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
    .kontakt { background: var(--bela); border-radius: 20px; padding: 20px; box-shadow: var(--senca); text-decoration: none; color: var(--siva); display: flex; flex-direction: column; gap: 2px; word-break: break-word; }
    .kontakt span { font-size: 1.8rem; }
    .kontakt b { color: var(--temna); font-family: var(--naslovna); font-size: 1.15rem; }
    .ozek { max-width: 760px; }
    details { background: var(--bela); border-radius: 16px; box-shadow: var(--senca); margin: 12px 0; padding: 0 20px; }
    summary { cursor: pointer; font-weight: 800; padding: 16px 28px 16px 0; list-style: none; position: relative; }
    summary::after { content: '+'; position: absolute; right: 0; color: var(--rdeca); font-size: 1.4rem; line-height: 1; }
    details[open] summary::after { content: '–'; }
    details p { margin: 0 0 16px; color: var(--siva); white-space: pre-line; }
    .vec { margin-top: 24px; }
  `,
})
export class Kontakt {
  p = inject(Podatki);
  pj = this.p.podjetje;
}
