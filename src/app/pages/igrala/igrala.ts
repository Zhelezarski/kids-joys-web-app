import { Component, inject } from '@angular/core';
import { Podatki } from '../../services/podatki';
import { Kartica } from '../../shared/kartica';
import { Kombinacija } from '../../shared/kombinacija';

@Component({
  selector: 'app-igrala',
  imports: [Kartica, Kombinacija],
  template: `
    <section class="sekcija">
      <div class="okvir">
        <h1>Napihljiva igrala</h1>
        <p class="podnaslov">
          Vsa igrala so za otroke od 3 do 9 let, primerna za notranjo in zunanjo uporabo.
          Dostava: {{ p.podjetje().dostava }}.
        </p>
        <div class="mreza">
          @for (i of p.igrala(); track i.slug) { <app-kartica [ponudba]="i" /> }
          @empty { @if (p.nalozeno()) { <p>Trenutno ni objavljenih igral.</p> } @else { <p>Nalagam …</p> } }
        </div>
        <app-kombinacija />
      </div>
    </section>
  `,
})
export class Igrala {
  p = inject(Podatki);
}
