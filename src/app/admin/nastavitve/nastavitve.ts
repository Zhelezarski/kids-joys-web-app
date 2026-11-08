import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Nastavitve } from '../../models';
import { AdminApi } from '../../services/admin-api';
import { Podatki } from '../../services/podatki';

@Component({
  selector: 'app-admin-nastavitve',
  imports: [FormsModule],
  template: `
    @if (n(); as n) {
      <form (ngSubmit)="shrani()">
        <div class="adm-glava vrh">
          <div><h1>Nastavitve</h1><p>Podatki podjetja in besedila na strani.</p></div>
          <button class="adm-gumb glavni" type="submit" [disabled]="shranjujem()">{{ shranjujem() ? 'Shranjujem …' : 'Shrani nastavitve' }}</button>
        </div>
        @if (napaka()) { <p class="adm-napaka">{{ napaka() }}</p> }
        @if (ok()) { <p class="adm-ok">{{ ok() }}</p> }

        <section class="adm-plosca">
          <h2>Obvestilo na vrhu strani</h2>
          <label class="adm-polje">Besedilo <small>npr. »Do 15. 12. zasedeno« ali »Novo: igralo z vodnim toboganom!«. Prazno = skrito.</small>
            <input name="obvestilo" [(ngModel)]="n.obvestilo" maxlength="160" /></label>
        </section>

        <section class="adm-plosca">
          <h2>Podjetje in kontakt</h2>
          <div class="adm-mreza">
            <label class="adm-polje">Polno ime<input name="ime" [(ngModel)]="n.podjetje.ime" /></label>
            <label class="adm-polje">Kratko ime <small>v glavi strani</small><input name="kratkoIme" [(ngModel)]="n.podjetje.kratkoIme" /></label>
            <label class="adm-polje">Telefon<input name="telefon" [(ngModel)]="n.podjetje.telefon" /></label>
            <label class="adm-polje">E-pošta<input type="email" name="email" [(ngModel)]="n.podjetje.email" /></label>
            <label class="adm-polje">Instagram <small>samo uporabniško ime</small><input name="instagram" [(ngModel)]="n.podjetje.instagram" /></label>
            <label class="adm-polje">Facebook povezava<input name="facebook" [(ngModel)]="n.podjetje.facebook" /></label>
            <label class="adm-polje">Naslov<input name="naslov" [(ngModel)]="n.podjetje.naslov" /></label>
            <label class="adm-polje">Območje<input name="obmocje" [(ngModel)]="n.podjetje.obmocje" /></label>
            <label class="adm-polje">Delovni čas<input name="delovniCas" [(ngModel)]="n.podjetje.delovniCas" /></label>
            <label class="adm-polje">Dostava<input name="dostava" [(ngModel)]="n.podjetje.dostava" /></label>
            <label class="adm-polje">Cena od (€)<input type="number" name="cenaOd" [(ngModel)]="n.podjetje.cenaOd" /></label>
            <label class="adm-polje">Cena do (€)<input type="number" name="cenaDo" [(ngModel)]="n.podjetje.cenaDo" /></label>
          </div>
          <label class="adm-polje" style="margin-top:14px">Slogan<textarea name="slogan" rows="2" [(ngModel)]="n.podjetje.slogan"></textarea></label>
        </section>

        <section class="adm-plosca">
          <h2>Naslovnica</h2>
          <div class="stolpec">
            <label class="adm-polje">Velik naslov<input name="heroNaslov" [(ngModel)]="n.hero.naslov" /></label>
            <label class="adm-polje">Dodatno besedilo pod sloganom<input name="heroPod" [(ngModel)]="n.hero.podnaslov" /></label>
          </div>
        </section>

        <section class="adm-plosca">
          <div class="adm-glava"><h2 style="margin:0">Prednosti <small>(štiri kartice na naslovnici)</small></h2>
            <button class="adm-gumb majhen" type="button" (click)="n.prednosti.push({ ikona: '⭐', naslov: '', opis: '' })">+ Dodaj</button></div>
          @for (x of n.prednosti; track $index; let i = $index) {
            <div class="vrstica prednost">
              <input [name]="'pi' + i" [(ngModel)]="x.ikona" class="ikona" aria-label="Ikona" />
              <input [name]="'pn' + i" [(ngModel)]="x.naslov" placeholder="Naslov" />
              <input [name]="'po' + i" [(ngModel)]="x.opis" placeholder="Opis" />
              <button class="adm-gumb majhen nevaren" type="button" (click)="odstrani(n.prednosti, i)">✕</button>
            </div>
          }
        </section>

        <section class="adm-plosca">
          <h2>Kraji, kjer ste že bili</h2>
          <label class="adm-polje"><small>Ločeni z vejico</small>
            <input name="kraji" [(ngModel)]="kraji" /></label>
        </section>

        <section class="adm-plosca">
          <div class="adm-glava"><h2 style="margin:0">Pogosta vprašanja</h2>
            <button class="adm-gumb majhen" type="button" (click)="n.vprasanja.push({ vprasanje: '', odgovor: '' })">+ Dodaj vprašanje</button></div>
          @for (q of n.vprasanja; track $index; let i = $index; let zadnji = $last) {
            <div class="vprasanje">
              <input [name]="'vq' + i" [(ngModel)]="q.vprasanje" placeholder="Vprašanje" />
              <textarea [name]="'va' + i" rows="2" [(ngModel)]="q.odgovor" placeholder="Odgovor"></textarea>
              <div class="adm-vrsta">
                <button class="adm-gumb majhen" type="button" [disabled]="i === 0" (click)="premakni(n.vprasanja, i, -1)">↑</button>
                <button class="adm-gumb majhen" type="button" [disabled]="zadnji" (click)="premakni(n.vprasanja, i, 1)">↓</button>
                <button class="adm-gumb majhen nevaren" type="button" (click)="odstrani(n.vprasanja, i)">Odstrani</button>
              </div>
            </div>
          }
        </section>

        <section class="adm-plosca">
          <h2>Moj račun</h2>
          <div class="adm-vrsta">
            <input type="password" name="novoGeslo" [(ngModel)]="novoGeslo" placeholder="Novo geslo (vsaj 8 znakov)" autocomplete="new-password" style="max-width:280px" />
            <button class="adm-gumb" type="button" [disabled]="novoGeslo.length < 8" (click)="spremeniGeslo()">Spremeni geslo</button>
          </div>
        </section>
      </form>
    } @else {
      <p class="adm-prazno">Nalagam …</p>
    }
  `,
  styles: `
    .vrh { position: sticky; top: 56px; z-index: 5; background: var(--adm-ozadje); padding: 8px 0; margin: -8px 0 12px; }
    .stolpec { display: flex; flex-direction: column; gap: 12px; }
    h2 small { font-weight: 400; color: var(--siva); font-size: .85rem; }
    .vrstica { display: grid; gap: 8px; align-items: center; margin-top: 8px; }
    .prednost { grid-template-columns: 56px 1fr 2fr auto; }
    .ikona { text-align: center; font-size: 1.2rem; }
    .vprasanje { display: flex; flex-direction: column; gap: 6px; padding: 12px 0; border-top: 1px solid var(--adm-rob); }
    .vprasanje:first-of-type { border-top: 0; }
    @media (max-width: 640px) { .prednost { grid-template-columns: 56px 1fr auto; } .prednost input:nth-child(3) { grid-column: 1 / -1; grid-row: 2; } }
  `,
})
export class AdminNastavitve implements OnInit {
  private api = inject(AdminApi);
  private podatki = inject(Podatki);

  n = signal<Nastavitve | null>(null);
  kraji = '';
  novoGeslo = '';
  napaka = signal('');
  ok = signal('');
  shranjujem = signal(false);

  async ngOnInit() {
    await this.podatki.nalozi();
    const kopija = structuredClone(this.podatki.nastavitve());
    this.kraji = kopija.kraji.join(', ');
    this.n.set(kopija);
  }

  odstrani<T>(seznam: T[], i: number) {
    seznam.splice(i, 1);
  }

  premakni<T>(seznam: T[], i: number, smer: -1 | 1) {
    [seznam[i], seznam[i + smer]] = [seznam[i + smer], seznam[i]];
  }

  async shrani() {
    const n = this.n();
    if (!n) return;
    this.napaka.set('');
    this.ok.set('');
    this.shranjujem.set(true);
    try {
      await this.api.shraniNastavitve({
        ...n,
        podjetje: { ...n.podjetje, cenaOd: Number(n.podjetje.cenaOd) || 0, cenaDo: Number(n.podjetje.cenaDo) || 0 },
        kraji: this.kraji.split(',').map((k) => k.trim()).filter(Boolean),
        prednosti: n.prednosti.filter((p) => p.naslov.trim()),
        vprasanja: n.vprasanja.filter((q) => q.vprasanje.trim()),
      });
      this.ok.set('Shranjeno. Spremembe so že vidne na strani.');
    } catch (e) {
      this.napaka.set((e as Error).message);
    } finally {
      this.shranjujem.set(false);
    }
  }

  async spremeniGeslo() {
    this.napaka.set('');
    try {
      await this.api.spremeniGeslo(this.novoGeslo);
      this.novoGeslo = '';
      this.ok.set('Geslo je spremenjeno.');
    } catch (e) {
      this.napaka.set((e as Error).message);
    }
  }
}
