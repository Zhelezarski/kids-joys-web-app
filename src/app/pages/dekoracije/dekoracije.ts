import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DEKORACIJE } from '../../data';
import { Kartica } from '../../shared/kartica';

@Component({
  selector: 'app-dekoracije',
  imports: [RouterLink, Kartica],
  template: `
    <section class="sekcija">
      <div class="okvir">
        <h1>Dekoracije z baloni</h1>
        <p class="podnaslov">
          Prostor okrasimo za vaše praznovanje: balonski loki, girlande, številke in ozadja za fotografije.
          Barve uskladimo z vašimi željami, ceno pa pripravimo glede na velikost postavitve.
        </p>
        <div class="mreza">
          @for (d of dekoracije; track d.id) {
            <app-kartica [ponudba]="d" />
          }
        </div>
        <div class="kombinacija">
          <h2>🎈 + 🏰 Igralo in dekoracija skupaj</h2>
          <p>Ob najemu igrala vam pripravimo tudi dekoracijo, zato za celotno zabavo potrebujete samo en klic.</p>
          <a routerLink="/rezervacija" class="gumb">Pošlji povpraševanje</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .kombinacija { margin-top: 40px; background: #fdeef3; border-radius: 24px; padding: 28px; }
    .kombinacija p { color: var(--siva); }
  `,
})
export class Dekoracije {
  dekoracije = DEKORACIJE;
}
