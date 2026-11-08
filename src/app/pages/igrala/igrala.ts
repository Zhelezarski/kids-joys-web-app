import { Component } from '@angular/core';
import { IGRALA, PODJETJE } from '../../data';
import { Kartica } from '../../shared/kartica';

@Component({
  selector: 'app-igrala',
  imports: [Kartica],
  template: `
    <section class="sekcija">
      <div class="okvir">
        <h1>Napihljiva igrala</h1>
        <p class="podnaslov">
          Vsa igrala so za otroke od 3 do 9 let, primerna za notranjo in zunanjo uporabo.
          Na območju Nove Gorice je dostava brezplačna.
        </p>
        <div class="mreza">
          @for (i of igrala; track i.id) {
            <app-kartica [ponudba]="i" [povezava]="'/igrala/' + i.id" />
          }
        </div>
        <p class="opomba">Cene veljajo za en dan najema in so od {{ p.cenaOd }} € do {{ p.cenaDo }} €, odvisno od modela.</p>
      </div>
    </section>
  `,
  styles: `.opomba { margin-top: 28px; color: var(--siva); font-size: .95rem; }`,
})
export class Igrala {
  p = PODJETJE;
  igrala = IGRALA;
}
