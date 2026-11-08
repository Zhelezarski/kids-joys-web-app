import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminApi } from '../../services/admin-api';
import { Logo } from '../../shared/logo';

@Component({
  selector: 'app-admin-postavitev',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Logo],
  template: `
    <div class="adm lupina">
      <header class="vrh">
        <a routerLink="/admin" class="znamka"><app-logo /><b>Kids Joy</b><span>admin</span></a>
        <button class="hamb" type="button" (click)="meni.set(!meni())" aria-label="Meni">☰</button>
        <nav [class.odprt]="meni()" (click)="meni.set(false)">
          <a routerLink="/admin" routerLinkActive="aktiven" [routerLinkActiveOptions]="{ exact: true }">Pregled</a>
          <a routerLink="/admin/rezervacije" routerLinkActive="aktiven">Rezervacije</a>
          <a routerLink="/admin/ponudba" routerLinkActive="aktiven">Igrala in dekoracije</a>
          <a routerLink="/admin/nastavitve" routerLinkActive="aktiven">Nastavitve</a>
          <span class="loc"></span>
          <a routerLink="/" target="_blank">Ogled strani ↗</a>
          <button type="button" (click)="odjava()">Odjava</button>
        </nav>
      </header>
      <main class="vsebina"><router-outlet /></main>
    </div>
  `,
  styles: `
    .lupina { min-height: 100vh; background: var(--adm-ozadje); }
    .vrh { position: sticky; top: 0; z-index: 10; background: var(--temna); color: #fff; display: flex; align-items: center; gap: 16px; padding: 0 16px; height: 56px; }
    .znamka { display: flex; align-items: center; gap: 8px; color: #fff; text-decoration: none; flex: none; }
    .znamka app-logo { width: 32px; height: 32px; }
    .znamka b { font-family: var(--naslovna); font-size: 1.2rem; }
    .znamka span { font-size: .75rem; opacity: .6; text-transform: uppercase; letter-spacing: .08em; }
    nav { display: flex; align-items: center; gap: 4px; flex: 1; }
    nav a, nav button { color: #d9d3c9; text-decoration: none; font: inherit; font-weight: 700; padding: 8px 12px; border-radius: 8px; background: none; border: 0; cursor: pointer; white-space: nowrap; }
    nav a:hover, nav button:hover { background: #ffffff14; color: #fff; }
    nav a.aktiven { background: #ffffff1f; color: #fff; }
    .loc { flex: 1; }
    .hamb { display: none; margin-left: auto; background: none; border: 0; color: #fff; font-size: 1.5rem; cursor: pointer; }
    .vsebina { max-width: 1100px; margin: 0 auto; padding: 24px 16px 64px; }
    @media (max-width: 860px) {
      .hamb { display: block; }
      nav { display: none; position: absolute; top: 56px; left: 0; right: 0; flex-direction: column; align-items: stretch; background: var(--temna); padding: 8px 12px 14px; }
      nav.odprt { display: flex; }
      .loc { display: none; }
      nav button { text-align: left; }
    }
  `,
})
export class AdminPostavitev {
  private api = inject(AdminApi);
  private router = inject(Router);
  meni = signal(false);

  async odjava() {
    await this.api.odjava();
    await this.router.navigateByUrl('/admin/prijava');
  }
}
