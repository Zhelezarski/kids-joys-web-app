import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PODJETJE } from './data';
import { Logo } from './shared/logo';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Logo],
  template: `
    <header class="glava">
      <div class="okvir glava-vrstica">
        <a routerLink="/" class="znamka" (click)="meni.set(false)">
          <app-logo />
          <span><b>Kids Joy</b><small>napihljiva igrala</small></span>
        </a>

        <button class="hamburger" type="button" (click)="meni.set(!meni())"
                [attr.aria-expanded]="meni()" aria-label="Meni">
          <span></span><span></span><span></span>
        </button>

        <nav [class.odprt]="meni()" (click)="meni.set(false)">
          <a routerLink="/igrala" routerLinkActive="aktiven">Igrala</a>
          <a routerLink="/dekoracije" routerLinkActive="aktiven">Dekoracije</a>
          <a routerLink="/kontakt" routerLinkActive="aktiven">Kontakt</a>
          <a routerLink="/rezervacija" class="gumb majhen">Rezerviraj</a>
        </nav>
      </div>
    </header>

    <main>
      <router-outlet />
    </main>

    <footer class="noga">
      <div class="okvir noga-mreza">
        <div>
          <div class="znamka"><app-logo /><span><b>Kids Joy</b><small>napihljiva igrala</small></span></div>
          <p>{{ p.slogan }}</p>
        </div>
        <div>
          <h4>Kontakt</h4>
          <a [href]="'tel:' + p.telefonLink">📞 {{ p.telefon }}</a>
          <a [href]="'mailto:' + p.email">✉️ {{ p.email }}</a>
          <span>📍 {{ p.naslov }}</span>
        </div>
        <div>
          <h4>Sledite nam</h4>
          <a [href]="p.facebook" target="_blank" rel="noopener">Facebook</a>
          <a [href]="'https://instagram.com/' + p.instagram" target="_blank" rel="noopener">Instagram &#64;{{ p.instagram }}</a>
        </div>
      </div>
      <p class="okvir avtorske">© {{ leto }} {{ p.ime }}</p>
    </footer>

    <a class="klic-plavajoc" [href]="'tel:' + p.telefonLink" aria-label="Pokliči">📞 Pokliči</a>
  `,
  styles: `
    .glava { position: sticky; top: 0; z-index: 20; background: color-mix(in srgb, var(--kremna) 92%, transparent); backdrop-filter: blur(8px); border-bottom: 1px solid #0000000f; }
    .glava-vrstica { display: flex; align-items: center; justify-content: space-between; height: 68px; }
    .znamka { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--temna); }
    .znamka span { display: flex; flex-direction: column; line-height: 1; }
    .znamka b { font-family: var(--naslovna); font-size: 1.4rem; color: var(--rdeca); }
    .znamka small { font-size: .75rem; color: var(--siva); letter-spacing: .04em; }
    nav { display: flex; align-items: center; gap: 22px; }
    nav a:not(.gumb) { color: var(--temna); text-decoration: none; font-weight: 700; }
    nav a.aktiven { color: var(--rdeca); }
    .hamburger { display: none; background: none; border: 0; padding: 10px; cursor: pointer; }
    .hamburger span { display: block; width: 24px; height: 3px; margin: 4px 0; border-radius: 2px; background: var(--temna); }
    @media (max-width: 720px) {
      .hamburger { display: block; }
      nav { position: absolute; top: 68px; left: 0; right: 0; flex-direction: column; align-items: stretch; gap: 0;
            background: var(--kremna); padding: 8px 16px 16px; box-shadow: var(--senca); display: none; }
      nav.odprt { display: flex; }
      nav a:not(.gumb) { padding: 14px 4px; border-bottom: 1px solid #0000000d; }
      nav .gumb { margin-top: 12px; text-align: center; }
    }
    .noga { background: var(--temna); color: #f3eee6; margin-top: 64px; padding: 48px 0 24px; }
    .noga .znamka { color: #fff; }
    .noga-mreza { display: grid; grid-template-columns: 2fr 1.5fr 1fr; gap: 32px; }
    .noga h4 { font-family: var(--naslovna); margin: 0 0 10px; font-size: 1.1rem; }
    .noga a, .noga span { display: block; color: #f3eee6; text-decoration: none; margin: 6px 0; }
    .noga p { color: #cfc8bd; max-width: 34ch; }
    .avtorske { margin-top: 32px; font-size: .85rem; color: #a49c90; }
    @media (max-width: 720px) { .noga-mreza { grid-template-columns: 1fr; } }
    .klic-plavajoc { display: none; }
    @media (max-width: 720px) {
      .klic-plavajoc { display: block; position: fixed; right: 16px; bottom: 16px; z-index: 30; background: var(--zelena); color: #fff;
                       padding: 12px 18px; border-radius: 999px; font-weight: 800; text-decoration: none; box-shadow: 0 8px 20px #3db34a66; }
    }
  `,
})
export class App {
  p = PODJETJE;
  meni = signal(false);
  leto = new Date().getFullYear();
}
