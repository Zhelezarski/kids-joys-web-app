import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Podatki } from '../../services/podatki';
import { Ilustracija } from '../../shared/ilustracija';

@Component({
  selector: 'app-igralo',
  imports: [RouterLink, Ilustracija],
  template: `
    <section class="sekcija">
      <div class="okvir">
        <a [routerLink]="igralo()?.kategorija === 'dekoracija' ? '/dekoracije' : '/igrala'" class="nazaj">← {{ igralo()?.kategorija === 'dekoracija' ? 'Vse dekoracije' : 'Vsa igrala' }}</a>
        @if (igralo(); as i) {
          <div class="mreza-podrobno">
            <div>
              @if (i.slike.length) {
                <img class="glavna" [src]="i.slike[izbrana()] || i.slike[0]" [alt]="i.ime" />
                @if (i.slike.length > 1) {
                  <div class="galerija">
                    @for (s of i.slike; track s; let ix = $index) {
                      <button type="button" [class.izbrana]="ix === izbrana()" (click)="izbrana.set(ix)"><img [src]="s" [alt]="i.ime + ' ' + (ix + 1)" loading="lazy" /></button>
                    }
                  </div>
                }
              } @else {
                <app-ilustracija [ponudba]="i" class="glavna" />
              }
            </div>
            <div>
              <h1>{{ i.ime }}</h1>
              <p class="cena">
                @if (i.cena !== null) { {{ i.cena }} € <small>/ dan</small> } @else { Po dogovoru }
              </p>
              <p class="opis">{{ i.opis }}</p>
              <dl>
                @if (i.mere) { <dt>Mere</dt><dd>{{ i.mere }}</dd> }
                @if (i.starost) { <dt>Starost</dt><dd>{{ i.starost }}</dd> }
                @if (i.nosilnost) { <dt>Nosilnost</dt><dd>{{ i.nosilnost }}</dd> }
                @if (i.kategorija === 'igralo') {
                  <dt>Dostava</dt><dd>{{ p.podjetje().dostava }}</dd>
                  <dt>Potrebno</dt><dd>Raven prostor in električna vtičnica</dd>
                }
              </dl>
              <ul class="znacilnosti">@for (z of i.znacilnosti; track $index) { <li>✔ {{ z }}</li> }</ul>
              <div class="gumbi">
                @if (i.kategorija === 'igralo') {
                  <a class="gumb" routerLink="/rezervacija" [queryParams]="{ igralo: i.slug }">Rezerviraj to igralo</a>
                } @else {
                  <a class="gumb" routerLink="/rezervacija" [queryParams]="{ dekoracija: i.slug }">Pošlji povpraševanje</a>
                }
                <a class="gumb drugi" [href]="'tel:' + p.tel()">📞 Pokliči</a>
              </div>
            </div>
          </div>
        } @else if (p.nalozeno()) {
          <h1>Ponudbe ni bilo mogoče najti</h1>
          <a routerLink="/" class="gumb">Na domačo stran</a>
        } @else {
          <p>Nalagam …</p>
        }
      </div>
    </section>
  `,
  styles: `
    .nazaj { display: inline-block; margin-bottom: 20px; font-weight: 700; text-decoration: none; }
    .mreza-podrobno { display: grid; grid-template-columns: 1.1fr 1fr; gap: 40px; align-items: start; }
    .glavna { display: block; width: 100%; aspect-ratio: 10 / 7; object-fit: cover; border-radius: 24px; box-shadow: var(--senca); }
    .galerija { display: grid; grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)); gap: 8px; margin-top: 10px; }
    .galerija button { padding: 0; border: 3px solid transparent; border-radius: 12px; overflow: hidden; cursor: pointer; background: none; }
    .galerija button.izbrana { border-color: var(--rdeca); }
    .galerija img { display: block; width: 100%; aspect-ratio: 1; object-fit: cover; }
    .cena { font-family: var(--naslovna); font-size: 2rem; font-weight: 800; color: var(--rdeca); margin: 0 0 8px; }
    .cena small { font-size: 1rem; color: var(--siva); }
    .opis { white-space: pre-line; }
    dl { display: grid; grid-template-columns: auto 1fr; gap: 6px 16px; background: var(--bela); padding: 16px 20px; border-radius: 16px; box-shadow: var(--senca); }
    dt { font-weight: 800; }
    dd { margin: 0; color: var(--siva); }
    .znacilnosti { list-style: none; padding: 0; }
    .znacilnosti li { margin: 6px 0; color: var(--zelena); font-weight: 700; }
    .gumbi { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 20px; }
    @media (max-width: 820px) { .mreza-podrobno { grid-template-columns: 1fr; } }
  `,
})
export class Igralo {
  /** Iz poti /igrala/:id */
  id = input<string>('');
  p = inject(Podatki);
  izbrana = signal(0);
  igralo = computed(() => this.p.poSlugu(this.id()));
}
