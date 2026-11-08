import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Kategorija, Oblika, Ponudba } from '../../models';
import { AdminApi } from '../../services/admin-api';
import { Ilustracija } from '../../shared/ilustracija';
import { slugify } from '../../util';

const nova = (kategorija: Kategorija): Ponudba => ({
  slug: '', kategorija, ime: '', kratek_opis: '', opis: '', cena: null, mere: '',
  starost: kategorija === 'igralo' ? '3 do 9 let' : '', nosilnost: kategorija === 'igralo' ? 'do 250 kg' : '',
  znacilnosti: [], slike: [], barve: ['#e8412c', '#2f6fdb', '#f6c026'],
  oblika: kategorija === 'igralo' ? 'grad' : 'baloni', aktivno: true, vrstni_red: 999,
});

@Component({
  selector: 'app-ponudba-uredi',
  imports: [FormsModule, RouterLink, Ilustracija],
  template: `
    <a routerLink="/admin/ponudba" class="nazaj">← Igrala in dekoracije</a>

    @if (m(); as p) {
      <form (ngSubmit)="shrani()" #f="ngForm">
        <div class="adm-glava">
          <div><h1>{{ p.id ? p.ime || 'Urejanje' : (p.kategorija === 'igralo' ? 'Novo igralo' : 'Nova dekoracija') }}</h1>
            @if (p.id) { <p>Na strani: /igrala/{{ p.slug }}</p> }</div>
          <div class="adm-vrsta">
            <label class="vidno"><input type="checkbox" name="aktivno" [(ngModel)]="p.aktivno" /> Objavljeno</label>
            <button class="adm-gumb glavni" type="submit" [disabled]="shranjujem() || !p.ime">{{ shranjujem() ? 'Shranjujem …' : 'Shrani' }}</button>
          </div>
        </div>

        @if (napaka()) { <p class="adm-napaka">{{ napaka() }}</p> }
        @if (ok()) { <p class="adm-ok">{{ ok() }}</p> }

        <div class="postavitev">
          <div>
            <section class="adm-plosca">
              <h2>Osnovno</h2>
              <div class="polja">
                <div class="adm-vrsta">
                  <label class="radio"><input type="radio" name="kategorija" value="igralo" [(ngModel)]="p.kategorija" /> Igralo</label>
                  <label class="radio"><input type="radio" name="kategorija" value="dekoracija" [(ngModel)]="p.kategorija" /> Dekoracija</label>
                </div>
                <label class="adm-polje">Ime *<input name="ime" [(ngModel)]="p.ime" (ngModelChange)="predlagajSlug($event)" required /></label>
                <label class="adm-polje">Spletni naslov <small>samo male črke, številke in vezaji</small>
                  <input name="slug" [(ngModel)]="p.slug" (input)="slugRocno = true" (blur)="p.slug = slugify(p.slug)" /></label>
                <label class="adm-polje">Kratek opis <small>prikaže se na kartici</small>
                  <input name="kratek_opis" [(ngModel)]="p.kratek_opis" maxlength="160" /></label>
                <label class="adm-polje">Opis
                  <textarea name="opis" rows="5" [(ngModel)]="p.opis"></textarea></label>
              </div>
            </section>

            <section class="adm-plosca">
              <h2>Cena in podrobnosti</h2>
              <div class="adm-mreza">
                <label class="adm-polje">Cena na dan (€) <small>prazno = po dogovoru</small>
                  <input type="number" name="cena" min="0" step="1" [(ngModel)]="p.cena" /></label>
                <label class="adm-polje">Mere<input name="mere" [(ngModel)]="p.mere" placeholder="npr. 6 × 4 m, višina 3 m" /></label>
                <label class="adm-polje">Starost<input name="starost" [(ngModel)]="p.starost" /></label>
                <label class="adm-polje">Nosilnost<input name="nosilnost" [(ngModel)]="p.nosilnost" /></label>
              </div>
              <label class="adm-polje" style="margin-top:14px">Značilnosti <small>vsaka v svojo vrstico</small>
                <textarea name="znacilnosti" rows="4" [(ngModel)]="znacilnosti"></textarea></label>
            </section>
          </div>

          <div>
            <section class="adm-plosca">
              <h2>Fotografije</h2>
              <p class="pomoc">Prva fotografija je glavna. Velike slike se pred nalaganjem samodejno pomanjšajo.</p>
              <div class="slike">
                @for (s of p.slike; track s; let i = $index) {
                  <figure>
                    <img [src]="s" alt="" />
                    @if (i === 0) { <span class="glavna">Glavna</span> }
                    <div class="sl-gumbi">
                      @if (i > 0) { <button type="button" (click)="naGlavno(i)" title="Nastavi za glavno">★</button> }
                      @if (i > 0) { <button type="button" (click)="premakniSliko(i, -1)" title="Levo">←</button> }
                      @if (i < p.slike.length - 1) { <button type="button" (click)="premakniSliko(i, 1)" title="Desno">→</button> }
                      <button type="button" (click)="odstraniSliko(i)" title="Odstrani">✕</button>
                    </div>
                  </figure>
                }
                <label class="dodaj" [class.dela]="nalagam() > 0">
                  <input type="file" accept="image/*" multiple (change)="dodajSlike($event)" hidden />
                  <span>{{ nalagam() > 0 ? 'Nalagam ' + nalagam() + ' …' : '+ Dodaj fotografije' }}</span>
                </label>
              </div>
            </section>

            <section class="adm-plosca">
              <h2>Ilustracija brez fotografije</h2>
              <div class="ilu">
                <app-ilustracija [ponudba]="p" [samoIlustracija]="true" />
                <div class="polja">
                  <label class="adm-polje">Oblika
                    <select name="oblika" [ngModel]="p.oblika" (ngModelChange)="nastaviObliko($event)">
                      @for (o of oblike; track o.id) { <option [value]="o.id">{{ o.ime }}</option> }
                    </select>
                  </label>
                  <div class="adm-vrsta">
                    @for (b of [0, 1, 2]; track b) {
                      <input type="color" [name]="'barva' + b" [ngModel]="p.barve[b]" (ngModelChange)="nastaviBarvo(b, $event)" />
                    }
                  </div>
                </div>
              </div>
            </section>

            @if (p.id) {
              <section class="adm-plosca">
                <h2>Brisanje</h2>
                @if (brisem()) {
                  <p>Izbrišem <b>{{ p.ime }}</b> in vse njegove fotografije? Tega ni mogoče razveljaviti.</p>
                  <div class="adm-vrsta">
                    <button class="adm-gumb nevaren" type="button" (click)="izbrisi()">Da, izbriši</button>
                    <button class="adm-gumb" type="button" (click)="brisem.set(false)">Prekliči</button>
                  </div>
                } @else {
                  <p class="pomoc">Če ga želiš samo začasno skriti, odkljukaj »Objavljeno«.</p>
                  <button class="adm-gumb nevaren" type="button" (click)="brisem.set(true)">Izbriši</button>
                }
              </section>
            }
          </div>
        </div>
      </form>
    } @else if (napaka()) {
      <p class="adm-napaka">{{ napaka() }}</p>
    } @else {
      <p class="adm-prazno">Nalagam …</p>
    }
  `,
  styles: `
    .nazaj { display: inline-block; margin-bottom: 12px; font-weight: 700; text-decoration: none; }
    .postavitev { display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px; align-items: start; }
    .postavitev > div { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
    .postavitev .adm-plosca + .adm-plosca { margin-top: 0; }
    .polja { display: flex; flex-direction: column; gap: 12px; }
    .radio, .vidno { display: flex; gap: 6px; align-items: center; font-weight: 700; }
    .pomoc { color: var(--siva); margin: -4px 0 12px; font-size: .9rem; }
    .slike { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; }
    figure { margin: 0; position: relative; border-radius: 10px; overflow: hidden; aspect-ratio: 1; background: var(--adm-ozadje); }
    figure img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .glavna { position: absolute; top: 6px; left: 6px; background: var(--rdeca); color: #fff; font-size: .72rem; font-weight: 800; padding: 2px 7px; border-radius: 999px; }
    .sl-gumbi { position: absolute; inset: auto 0 0 0; display: flex; justify-content: flex-end; gap: 4px; padding: 6px; background: linear-gradient(transparent, #0008); }
    .sl-gumbi button { width: 28px; height: 28px; border-radius: 7px; border: 0; background: #fffe; cursor: pointer; font-weight: 800; }
    .dodaj { aspect-ratio: 1; border: 2px dashed var(--adm-rob); border-radius: 10px; display: grid; place-items: center; text-align: center; cursor: pointer; font-weight: 700; color: var(--modra); padding: 8px; }
    .dodaj:hover { background: var(--adm-ozadje); }
    .dodaj.dela { cursor: progress; color: var(--siva); }
    .ilu { display: grid; grid-template-columns: 140px 1fr; gap: 14px; align-items: start; }
    .ilu app-ilustracija { border-radius: 10px; }
    input[type=color] { width: 44px; height: 36px; border: 1px solid var(--adm-rob); border-radius: 8px; padding: 2px; background: #fff; cursor: pointer; }
    @media (max-width: 860px) { .postavitev { grid-template-columns: 1fr; } }
  `,
})
export class PonudbaUredi implements OnInit {
  /** Iz poti /admin/ponudba/:id */
  id = input<string>();
  /** ?kategorija=dekoracija pri novi */
  kategorija = input<string>();

  private api = inject(AdminApi);
  private router = inject(Router);
  slugify = slugify;

  oblike: { id: Oblika; ime: string }[] = [
    { id: 'grad', ime: 'Grad' },
    { id: 'tobogan', ime: 'Grad s toboganom' },
    { id: 'zogice', ime: 'Grad z žogicami' },
    { id: 'baloni', ime: 'Baloni' },
  ];

  m = signal<Ponudba | null>(null);
  znacilnosti = '';
  napaka = signal('');
  ok = signal('');
  shranjujem = signal(false);
  nalagam = signal(0);
  brisem = signal(false);
  slugRocno = false;
  /** Slike, odstranjene v tem urejanju; izbrišejo se iz shrambe ob shranjevanju. */
  private odstranjene: string[] = [];

  nastaviObliko(oblika: Oblika) {
    const p = this.m();
    if (p) this.m.set({ ...p, oblika });
  }

  nastaviBarvo(i: number, barva: string) {
    const p = this.m();
    if (!p) return;
    const barve = [...p.barve];
    barve[i] = barva;
    this.m.set({ ...p, barve });
  }

  async ngOnInit() {
    const id = this.id();
    if (!id) {
      this.m.set(nova(this.kategorija() === 'dekoracija' ? 'dekoracija' : 'igralo'));
      return;
    }
    try {
      const p = await this.api.ponudbaPoId(id);
      if (!p) throw new Error('Tega vnosa ni več.');
      this.slugRocno = true;
      this.znacilnosti = p.znacilnosti.join('\n');
      this.m.set({ ...p, barve: [0, 1, 2].map((i) => p.barve[i] || '#e8412c') });
    } catch (e) {
      this.napaka.set((e as Error).message);
    }
  }

  predlagajSlug(ime: string) {
    const p = this.m();
    if (p && !p.id && !this.slugRocno) p.slug = slugify(ime);
  }

  private osvezi() {
    const p = this.m();
    if (p) this.m.set({ ...p });
  }

  async dodajSlike(e: Event) {
    const p = this.m();
    const vhod = e.target as HTMLInputElement;
    const datoteke = Array.from(vhod.files ?? []);
    vhod.value = '';
    if (!p || !datoteke.length) return;
    this.napaka.set('');
    this.nalagam.set(datoteke.length);
    for (const f of datoteke) {
      try {
        const url = await this.api.naloziSliko(f, p.slug || p.ime || 'nova');
        p.slike = [...p.slike, url];
        this.osvezi();
      } catch (err) {
        this.napaka.set(`${f.name}: ${(err as Error).message}`);
      }
      this.nalagam.update((n) => n - 1);
    }
    if (p.id) await this.shrani(true);
  }

  naGlavno(i: number) {
    const p = this.m()!;
    p.slike = [p.slike[i], ...p.slike.filter((_, ix) => ix !== i)];
    this.osvezi();
  }

  premakniSliko(i: number, smer: -1 | 1) {
    const p = this.m()!;
    const s = [...p.slike];
    [s[i], s[i + smer]] = [s[i + smer], s[i]];
    p.slike = s;
    this.osvezi();
  }

  odstraniSliko(i: number) {
    const p = this.m()!;
    this.odstranjene.push(p.slike[i]);
    p.slike = p.slike.filter((_, ix) => ix !== i);
    this.osvezi();
  }

  async shrani(tiho = false) {
    const p = this.m();
    if (!p) return;
    this.napaka.set('');
    this.ok.set('');
    this.shranjujem.set(true);
    try {
      const cena = p.cena === null || (p.cena as unknown) === '' ? null : Number(p.cena);
      const shranjeno = await this.api.shraniPonudbo({
        ...p,
        cena,
        znacilnosti: this.znacilnosti.split('\n').map((z) => z.trim()).filter(Boolean),
      });
      await Promise.all(this.odstranjene.map((u) => this.api.izbrisiSliko(u)));
      this.odstranjene = [];
      if (!p.id) {
        await this.router.navigate(['/admin/ponudba', shranjeno.id], { replaceUrl: true });
        this.m.set({ ...p, id: shranjeno.id, slug: shranjeno.slug });
      } else {
        this.m.set({ ...p, slug: shranjeno.slug, cena });
      }
      this.slugRocno = true;
      if (!tiho) this.ok.set('Shranjeno. Spremembe so že vidne na strani.');
    } catch (e) {
      this.napaka.set((e as Error).message);
    } finally {
      this.shranjujem.set(false);
    }
  }

  async izbrisi() {
    const p = this.m();
    if (!p) return;
    try {
      await this.api.izbrisiPonudbo(p);
      await this.router.navigateByUrl('/admin/ponudba');
    } catch (e) {
      this.napaka.set((e as Error).message);
    }
  }
}
