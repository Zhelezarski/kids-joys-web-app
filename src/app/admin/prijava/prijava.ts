import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AdminApi } from '../../services/admin-api';
import { Logo } from '../../shared/logo';

@Component({
  selector: 'app-prijava',
  imports: [RouterLink, Logo],
  template: `
    <div class="ovoj adm">
      <form class="adm-plosca okno" (submit)="prijava($event)">
        <div class="glava"><app-logo /><div><h1>Kids Joy admin</h1><p>Prijava za urejanje strani</p></div></div>

        @if (!api.povezan) {
          <p class="adm-napaka">Baza še ni povezana. Vpiši podatke Supabase v <code>src/app/config.ts</code> (glej ADMIN.md).</p>
        } @else {
          <label class="adm-polje">E-pošta
            <input type="email" autocomplete="username" [value]="email()" (input)="email.set(v($event))" required />
          </label>
          <label class="adm-polje">Geslo
            <input type="password" autocomplete="current-password" [value]="geslo()" (input)="geslo.set(v($event))" required />
          </label>
          @if (napaka()) { <p class="adm-napaka">{{ napaka() }}</p> }
          @if (sporocilo()) { <p class="adm-ok">{{ sporocilo() }}</p> }
          <button class="adm-gumb glavni" type="submit" [disabled]="dela()">{{ dela() ? 'Prijavljam …' : 'Prijava' }}</button>
          <button class="povezava" type="button" (click)="pozabljeno()">Pozabljeno geslo?</button>
        }
        <a routerLink="/" class="povezava">← Nazaj na stran</a>
      </form>
    </div>
  `,
  styles: `
    .ovoj { min-height: 100vh; display: grid; place-items: center; padding: 16px; background: var(--adm-ozadje); }
    .okno { width: 100%; max-width: 380px; display: flex; flex-direction: column; gap: 14px; }
    .glava { display: flex; gap: 12px; align-items: center; }
    .glava h1 { font-size: 1.4rem; margin: 0; }
    .glava p { margin: 0; color: var(--siva); }
    .povezava { background: none; border: 0; font: inherit; color: var(--modra); cursor: pointer; text-align: center; padding: 0; }
  `,
})
export class Prijava {
  api = inject(AdminApi);
  private router = inject(Router);
  email = signal('');
  geslo = signal('');
  napaka = signal('');
  sporocilo = signal('');
  dela = signal(false);

  v(e: Event) {
    return (e.target as HTMLInputElement).value.trim();
  }

  async prijava(e: Event) {
    e.preventDefault();
    this.napaka.set('');
    this.dela.set(true);
    try {
      await this.api.prijava(this.email(), this.geslo());
      await this.router.navigateByUrl('/admin');
    } catch (err) {
      this.napaka.set((err as Error).message);
    } finally {
      this.dela.set(false);
    }
  }

  async pozabljeno() {
    this.napaka.set('');
    if (!this.email()) {
      this.napaka.set('Najprej vpiši e-pošto.');
      return;
    }
    try {
      await this.api.ponastaviGeslo(this.email());
      this.sporocilo.set('Poslali smo ti e-pošto s povezavo za novo geslo.');
    } catch (err) {
      this.napaka.set((err as Error).message);
    }
  }
}
