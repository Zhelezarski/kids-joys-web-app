import { Component, inject } from '@angular/core';
import { Podatki } from '../../services/podatki';
import { Kartica } from '../../shared/kartica';
import { Kombinacija } from '../../shared/kombinacija';

@Component({
  selector: 'app-dekoracije',
  imports: [Kartica, Kombinacija],
  template: `
    <section class="sekcija">
      <div class="okvir">
        <h1>Dekoracije z baloni</h1>
        <p class="podnaslov">
          Prostor okrasimo za vaše praznovanje: balonski loki, girlande, številke in ozadja za fotografije.
          Barve uskladimo z vašimi željami, ceno pa pripravimo glede na velikost postavitve.
        </p>
        <div class="mreza">
          @for (d of p.dekoracije(); track d.slug) { <app-kartica [ponudba]="d" /> }
        </div>
        <app-kombinacija />
      </div>
    </section>
  `,
})
export class Dekoracije {
  p = inject(Podatki);
}
