import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IGRALA, PODJETJE } from '../../data';
import { Ilustracija } from '../../shared/ilustracija';

@Component({
  selector: 'app-igralo',
  imports: [RouterLink, Ilustracija],
  template: `
    <section class="sekcija">
      <div class="okvir">
        <a routerLink="/igrala" class="nazaj">← Vsa igrala</a>
        @if (igralo(); as i) {
          <div class="mreza-podrobno">
            <div>
              <app-ilustracija [ponudba]="i" class="glavna" />
              @if (i.slike.length > 1) {
                <div class="galerija">
                  @for (s of i.slike.slice(1); track s) { <img [src]="s" [alt]="i.ime" loading="lazy" /> }
                </div>
              }
            </div>
            <div>
              <h1>{{ i.ime }}</h1>
              <p class="cena">{{ i.cena }} € <small>/ dan</small></p>
              <p>{{ i.opis }}</p>
              <dl>
                @if (i.mere) { <dt>Mere</dt><dd>{{ i.mere }}</dd> }
                @if (i.starost) { <dt>Starost</dt><dd>{{ i.starost }}</dd> }
                @if (i.nosilnost) { <dt>Nosilnost</dt><dd>{{ i.nosilnost }}</dd> }
                <dt>Dostava</dt><dd>Gratis v Novi Gorici, drugje po dogovoru</dd>
                <dt>Potrebno</dt><dd>Raven prostor in električna vtičnica</dd>
              </dl>
              <ul class="znacilnosti">
                @for (z of i.znacilnosti; track z) { <li>✔ {{ z }}</li> }
              </ul>
              <div class="gumbi">
                <a class="gumb" routerLink="/rezervacija" [queryParams]="{ igralo: i.id }">Rezerviraj to igralo</a>
                <a class="gumb drugi" [href]="'tel:' + p.telefonLink">📞 Pokliči</a>
              </div>
            </div>
          </div>
        } @else {
          <h1>Igrala ni bilo mogoče najti</h1>
          <a routerLink="/igrala" class="gumb">Na seznam igral</a>
        }
      </div>
    </section>
  `,
  styles: `
    .nazaj { display: inline-block; margin-bottom: 20px; font-weight: 700; text-decoration: none; }
    .mreza-podrobno { display: grid; grid-template-columns: 1.1fr 1fr; gap: 40px; align-items: start; }
    .glavna { border-radius: 24px; box-shadow: var(--senca); }
    .galerija { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px; }
    .galerija img { border-radius: 12px; aspect-ratio: 1; object-fit: cover; width: 100%; }
    .cena { font-family: var(--naslovna); font-size: 2rem; font-weight: 800; color: var(--rdeca); margin: 0 0 8px; }
    .cena small { font-size: 1rem; color: var(--siva); }
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
  /** Iz poti /igrala/:id (withComponentInputBinding). */
  id = input<string>('');
  p = PODJETJE;
  igralo = computed(() => IGRALA.find((i) => i.id === this.id()));
}
