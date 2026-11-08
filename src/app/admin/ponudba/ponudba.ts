import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Kategorija, Ponudba } from '../../models';
import { AdminApi } from '../../services/admin-api';
import { Ilustracija } from '../../shared/ilustracija';
import { poVrsti } from '../../util';

@Component({
  selector: 'app-admin-ponudba',
  imports: [RouterLink, Ilustracija],
  template: `
    <div class="adm-glava">
      <div><h1>Igrala in dekoracije</h1><p>Vrstni red, vidnost in urejanje vsebine.</p></div>
      <a class="adm-gumb glavni" routerLink="/admin/ponudba/nova" [queryParams]="{ kategorija: kat() }">+ Dodaj {{ kat() === 'igralo' ? 'igralo' : 'dekoracijo' }}</a>
    </div>

    @if (napaka()) { <p class="adm-napaka">{{ napaka() }}</p> }

    <div class="adm-zavihki">
      <button type="button" [class.aktiven]="kat() === 'igralo'" (click)="kat.set('igralo')">Igrala ({{ stevilo('igralo') }})</button>
      <button type="button" [class.aktiven]="kat() === 'dekoracija'" (click)="kat.set('dekoracija')">Dekoracije ({{ stevilo('dekoracija') }})</button>
    </div>

    <div class="adm-plosca seznam">
      @for (p of prikazane(); track p.id; let i = $index; let zadnji = $last) {
        <div class="vrstica" [class.skrito]="!p.aktivno">
          <app-ilustracija [ponudba]="p" class="sl" />
          <div class="info">
            <a [routerLink]="['/admin/ponudba', p.id]"><b>{{ p.ime }}</b></a>
            <span>{{ p.cena !== null ? p.cena + ' € / dan' : 'Po dogovoru' }} · {{ p.slike.length }} {{ p.slike.length === 1 ? 'slika' : 'slik' }}</span>
          </div>
          <label class="vidno"><input type="checkbox" [checked]="p.aktivno" (change)="preklopiVidnost(p)" /> {{ p.aktivno ? 'Objavljeno' : 'Skrito' }}</label>
          <div class="adm-vrsta">
            <button class="adm-gumb majhen" type="button" [disabled]="i === 0" (click)="premakni(i, -1)" aria-label="Gor">↑</button>
            <button class="adm-gumb majhen" type="button" [disabled]="zadnji" (click)="premakni(i, 1)" aria-label="Dol">↓</button>
            <a class="adm-gumb majhen" [routerLink]="['/admin/ponudba', p.id]">Uredi</a>
          </div>
        </div>
      } @empty {
        <p class="adm-prazno">{{ nalagam() ? 'Nalagam …' : 'Še nič. Dodaj prvo s gumbom zgoraj.' }}</p>
      }
    </div>
  `,
  styles: `
    .seznam { padding: 6px 18px; }
    .vrstica { display: grid; grid-template-columns: 84px 1fr auto auto; gap: 14px; align-items: center; padding: 12px 0; border-top: 1px solid var(--adm-rob); }
    .vrstica:first-child { border-top: 0; }
    .vrstica.skrito { opacity: .55; }
    .sl { border-radius: 8px; width: 84px; }
    .info { display: flex; flex-direction: column; min-width: 0; }
    .info a { color: var(--temna); text-decoration: none; }
    .info span { color: var(--siva); font-size: .88rem; }
    .vidno { display: flex; gap: 6px; align-items: center; font-weight: 600; font-size: .9rem; white-space: nowrap; }
    @media (max-width: 640px) { .vrstica { grid-template-columns: 64px 1fr; } .sl { width: 64px; } .vidno, .vrstica .adm-vrsta { grid-column: 2; } }
  `,
})
export class AdminPonudba implements OnInit {
  private api = inject(AdminApi);
  vse = signal<Ponudba[]>([]);
  kat = signal<Kategorija>('igralo');
  nalagam = signal(true);
  napaka = signal('');

  prikazane = computed(() => this.vse().filter((p) => p.kategorija === this.kat()).sort(poVrsti));

  stevilo(k: Kategorija) {
    return this.vse().filter((p) => p.kategorija === k).length;
  }

  async ngOnInit() {
    try {
      this.vse.set(await this.api.vsaPonudba());
    } catch (e) {
      this.napaka.set((e as Error).message);
    } finally {
      this.nalagam.set(false);
    }
  }

  async preklopiVidnost(p: Ponudba) {
    try {
      await this.api.posodobiPonudbo(p.id!, { aktivno: !p.aktivno });
      this.vse.update((s) => s.map((x) => (x.id === p.id ? { ...x, aktivno: !p.aktivno } : x)));
    } catch (e) {
      this.napaka.set((e as Error).message);
    }
  }

  async premakni(i: number, smer: -1 | 1) {
    const s = [...this.prikazane()];
    [s[i], s[i + smer]] = [s[i + smer], s[i]];
    const novi = s.map((p, ix) => ({ ...p, vrstni_red: ix + 1 }));
    this.vse.update((v) => v.map((x) => novi.find((n) => n.id === x.id) ?? x));
    try {
      await Promise.all(novi.map((p) => this.api.posodobiPonudbo(p.id!, { vrstni_red: p.vrstni_red })));
    } catch (e) {
      this.napaka.set((e as Error).message);
    }
  }
}
