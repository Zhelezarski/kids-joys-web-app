import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-kombinacija',
  imports: [RouterLink],
  template: `
    <div class="kombinacija">
      <h2>🎈 + 🏰 Igralo in dekoracija skupaj</h2>
      <p>Ob najemu igrala vam pripravimo tudi dekoracijo, zato za celotno zabavo potrebujete samo en klic.</p>
      <a routerLink="/rezervacija" class="gumb">Pošlji povpraševanje</a>
    </div>
  `,
  styles: `
    .kombinacija { margin-top: 40px; background: #fdeef3; border-radius: 24px; padding: 28px; }
    .kombinacija p { color: var(--siva); }
  `,
})
export class Kombinacija {}
