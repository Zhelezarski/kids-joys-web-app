import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Ponudba } from '../models';
import { Ilustracija } from './ilustracija';

@Component({
  selector: 'app-kartica',
  imports: [RouterLink, Ilustracija],
  template: `
    <article class="kartica">
      <app-ilustracija [ponudba]="ponudba()" />
      <div class="vsebina">
        <h3>{{ ponudba().ime }}</h3>
        <p>{{ ponudba().kratek_opis }}</p>
        @if (ponudba().mere) {
          <p class="meta">📏 {{ ponudba().mere }}</p>
        }
        <div class="dno">
          <span class="cena">
            @if (ponudba().cena !== null) {
              {{ ponudba().cena }} € <small>/ dan</small>
            } @else {
              Po dogovoru
            }
          </span>
          <a class="gumb majhen" [routerLink]="[ponudba().kategorija === 'igralo' ? '/igrala' : '/dekoracije', ponudba().slug]">Več</a>
        </div>
      </div>
    </article>
  `,
  styles: `
    .kartica { background: var(--bela); border-radius: 20px; overflow: hidden; box-shadow: var(--senca); display: flex; flex-direction: column; height: 100%; }
    .vsebina { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
    h3 { margin: 0; font-size: 1.25rem; }
    p { margin: 0; color: var(--siva); }
    .meta { font-size: .9rem; }
    .dno { margin-top: auto; padding-top: 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .cena { font-family: var(--naslovna); font-weight: 800; font-size: 1.3rem; color: var(--rdeca); }
    .cena small { font-size: .85rem; color: var(--siva); font-weight: 600; }
  `,
})
export class Kartica {
  ponudba = input.required<Ponudba>();
}
