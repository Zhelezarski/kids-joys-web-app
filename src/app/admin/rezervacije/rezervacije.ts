import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EmailVnos, Postavka, Ponudba, Rezervacija, StatusRezervacije } from '../../models';
import { AdminApi } from '../../services/admin-api';
import { Podatki } from '../../services/podatki';
import { danes, datumSl, telLink } from '../../util';

type Filter = 'prihajajoce' | 'nove' | 'potrjene' | 'pretekle' | 'zavrnjene' | 'vse';

const STATUSI: { id: StatusRezervacije; ime: string }[] = [
  { id: 'nova', ime: 'Nova' },
  { id: 'potrjena', ime: 'Potrjena' },
  { id: 'zakljucena', ime: 'Zaključena' },
  { id: 'zavrnjena', ime: 'Zavrnjena' },
];

const VRSTE_EMAILOV: Record<string, string> = {
  lastnik_nova: 'obvestilo vam',
  stranka_prejeta: 'potrdilo o prejemu',
  stranka_potrjena: 'potrditev',
  stranka_zavrnjena: 'zavrnitev',
  stranka_opomnik: 'opomnik',
};

const prazna = (): Rezervacija => ({
  datum: danes(), kraj: '', prostor: 'zunaj', ime: '', telefon: '', email: '', opomba: '',
  postavke: [], skupaj: 0, status: 'potrjena', opomba_admin: '',
});

@Component({
  selector: 'app-admin-rezervacije',
  imports: [FormsModule],
  template: `
    <div class="adm-glava">
      <div><h1>Rezervacije</h1><p>{{ rez().length }} skupaj · {{ steviloNovih() }} novih</p></div>
      <button class="adm-gumb glavni" type="button" (click)="odpriNovo()">+ Dodaj rezervacijo</button>
    </div>

    @if (napaka()) { <p class="adm-napaka">{{ napaka() }}</p> }
    @if (info()) { <p class="adm-ok">{{ info() }}</p> }

    @if (nova(); as n) {
      <form class="adm-plosca nova" (ngSubmit)="shraniNovo()">
        <h2>Nova rezervacija (npr. po telefonu)</h2>
        <div class="adm-mreza">
          <label class="adm-polje">Datum<input type="date" name="datum" [(ngModel)]="n.datum" required /></label>
          <label class="adm-polje">Kraj<input name="kraj" [(ngModel)]="n.kraj" required /></label>
          <label class="adm-polje">Prostor
            <select name="prostor" [(ngModel)]="n.prostor"><option value="zunaj">Zunaj</option><option value="notri">Notri</option></select>
          </label>
          <label class="adm-polje">Status
            <select name="status" [(ngModel)]="n.status">@for (s of statusi; track s.id) { <option [value]="s.id">{{ s.ime }}</option> }</select>
          </label>
          <label class="adm-polje">Ime<input name="ime" [(ngModel)]="n.ime" required /></label>
          <label class="adm-polje">Telefon<input name="telefon" [(ngModel)]="n.telefon" required /></label>
          <label class="adm-polje">E-pošta<input name="email" [(ngModel)]="n.email" /></label>
          <label class="adm-polje">Skupaj (€)<input type="number" name="skupaj" [(ngModel)]="n.skupaj" min="0" /></label>
        </div>
        <p class="naslov">Igrala in dekoracije</p>
        <div class="izbire">
          @for (p of ponudba(); track p.slug) {
            <label><input type="checkbox" [checked]="imaPostavko(n, p.slug)" (change)="preklopiPostavko(n, p)" /> {{ p.ime }}</label>
          }
        </div>
        <label class="adm-polje">Opomba stranke<textarea name="opomba" rows="2" [(ngModel)]="n.opomba"></textarea></label>
        <div class="adm-vrsta" style="margin-top:12px">
          <button class="adm-gumb glavni" type="submit" [disabled]="!n.ime || !n.telefon || !n.kraj || !n.datum">Shrani</button>
          <button class="adm-gumb" type="button" (click)="nova.set(null)">Prekliči</button>
        </div>
      </form>
    }

    <div class="orodja">
      <div class="adm-zavihki">
        @for (f of filtri; track f.id) {
          <button type="button" [class.aktiven]="filter() === f.id" (click)="filter.set(f.id)">{{ f.ime }}</button>
        }
      </div>
      <input class="iskanje" type="search" placeholder="Išči po imenu, telefonu, kraju …" [value]="iskanje()" (input)="iskanje.set($any($event.target).value)" />
    </div>

    @for (r of prikazane(); track r.id) {
      <article class="adm-plosca karta" [class.nova-rez]="r.status === 'nova'">
        <div class="levo">
          <div class="datum">{{ datumSl(r.datum) }}</div>
          <span class="adm-oznaka" [class]="'st-' + r.status">{{ imeStatusa(r.status) }}</span>
          @if (konflikti().has(r.id!)) { <span class="adm-oznaka konflikt">⚠ isto igralo 2×</span> }
        </div>
        <div class="sredina">
          <div class="kdo"><b>{{ r.ime }}</b> · <a [href]="'tel:' + tel(r.telefon)">{{ r.telefon }}</a>
            @if (r.email) { · <a [href]="'mailto:' + r.email">{{ r.email }}</a> }</div>
          <div class="kje">📍 {{ r.kraj }} ({{ r.prostor === 'zunaj' ? 'zunaj' : 'notri' }})</div>
          <div class="kaj">
            @for (p of r.postavke; track p.slug) { <span class="postavka">{{ p.ime }}</span> }
            @if (r.skupaj) { <b>{{ r.skupaj }} €</b> }
          </div>
          @if (r.opomba) { <p class="opomba">💬 {{ r.opomba }}</p> }
          <label class="adm-polje interna">Interna opomba
            <textarea rows="1" [value]="r.opomba_admin" (change)="shraniOpombo(r, $any($event.target).value)" placeholder="npr. plačano, dostava ob 9h …"></textarea>
          </label>
          <small class="prejeto">Prejeto {{ r.created_at ? cas(r.created_at) : '' }}</small>
          @if (r.email_dnevnik?.length) {
            <small class="emaili">✉️
              @for (e of r.email_dnevnik; track $index; let zadnji = $last) {
                <span [class.neuspeh]="!e.uspeh" [title]="e.uspeh ? cas(e.created_at) : e.napaka">{{ imeEmaila(e) }}{{ e.uspeh ? '' : ' ✗' }}</span>{{ zadnji ? '' : ' · ' }}
              }
            </small>
          }
        </div>
        <div class="desno">
          @if (r.status === 'nova') {
            <button class="adm-gumb glavni majhen" type="button" (click)="status(r, 'potrjena')">✓ Potrdi</button>
            <button class="adm-gumb majhen" type="button" (click)="status(r, 'zavrnjena')">Zavrni</button>
          } @else {
            <select [value]="r.status" (change)="status(r, $any($event.target).value)">
              @for (s of statusi; track s.id) { <option [value]="s.id">{{ s.ime }}</option> }
            </select>
          }
          <a class="adm-gumb majhen" [href]="smsPotrditev(r)">💬 SMS stranki</a>
          @if (brisem() === r.id) {
            <button class="adm-gumb nevaren majhen" type="button" (click)="izbrisi(r)">Res izbriši</button>
            <button class="adm-gumb majhen" type="button" (click)="brisem.set(null)">Ne</button>
          } @else {
            <button class="adm-gumb nevaren majhen" type="button" (click)="brisem.set(r.id!)">Izbriši</button>
          }
        </div>
      </article>
    } @empty {
      <div class="adm-plosca adm-prazno">{{ nalagam() ? 'Nalagam …' : 'Ni rezervacij v tem pogledu.' }}</div>
    }
  `,
  styles: `
    .nova { margin-bottom: 16px; }
    .naslov { font-weight: 700; margin: 14px 0 6px; }
    .izbire { display: flex; flex-wrap: wrap; gap: 6px 18px; margin-bottom: 12px; }
    .izbire label { display: flex; gap: 6px; align-items: center; }
    .orodja { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; align-items: start; }
    .iskanje { max-width: 320px; margin-bottom: 14px; }
    .karta { display: grid; grid-template-columns: 150px 1fr auto; gap: 16px; margin-top: 10px; }
    .karta.nova-rez { border-left: 4px solid var(--rumena); }
    .levo { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
    .datum { font-family: var(--naslovna); font-size: 1.15rem; font-weight: 800; }
    .konflikt { background: #fdecea; color: #b42318; }
    .sredina { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
    .kaj { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .postavka { background: var(--adm-ozadje); border-radius: 6px; padding: 2px 8px; font-size: .88rem; }
    .opomba { margin: 4px 0 0; color: var(--siva); white-space: pre-line; }
    .interna { margin-top: 6px; font-weight: 600; }
    .prejeto, .emaili { color: var(--siva); }
    .emaili .neuspeh { color: #b42318; cursor: help; }
    .desno { display: flex; flex-direction: column; gap: 6px; align-items: stretch; min-width: 130px; }
    @media (max-width: 760px) {
      .karta { grid-template-columns: 1fr; }
      .levo { flex-direction: row; flex-wrap: wrap; align-items: center; }
      .desno { flex-direction: row; flex-wrap: wrap; }
    }
  `,
})
export class AdminRezervacije implements OnInit {
  /** ?f=nove iz pregleda */
  f = input<string>();

  private api = inject(AdminApi);
  private podatki = inject(Podatki);
  datumSl = datumSl;
  tel = telLink;
  statusi = STATUSI;
  filtri: { id: Filter; ime: string }[] = [
    { id: 'prihajajoce', ime: 'Prihajajoče' },
    { id: 'nove', ime: 'Nove' },
    { id: 'potrjene', ime: 'Potrjene' },
    { id: 'pretekle', ime: 'Pretekle' },
    { id: 'zavrnjene', ime: 'Zavrnjene' },
    { id: 'vse', ime: 'Vse' },
  ];

  rez = signal<Rezervacija[]>([]);
  ponudba = signal<Ponudba[]>([]);
  filter = signal<Filter>('prihajajoce');
  iskanje = signal('');
  nalagam = signal(true);
  napaka = signal('');
  info = signal('');
  brisem = signal<string | null>(null);
  nova = signal<Rezervacija | null>(null);

  steviloNovih = computed(() => this.rez().filter((r) => r.status === 'nova').length);

  prikazane = computed(() => {
    const d = danes();
    const q = this.iskanje().toLowerCase();
    let s = this.rez();
    switch (this.filter()) {
      case 'prihajajoce': s = s.filter((r) => r.datum >= d && r.status !== 'zavrnjena'); break;
      case 'nove': s = s.filter((r) => r.status === 'nova'); break;
      case 'potrjene': s = s.filter((r) => r.status === 'potrjena'); break;
      case 'pretekle': s = s.filter((r) => r.datum < d && r.status !== 'zavrnjena').reverse(); break;
      case 'zavrnjene': s = s.filter((r) => r.status === 'zavrnjena'); break;
    }
    if (q) s = s.filter((r) => [r.ime, r.telefon, r.email, r.kraj, ...r.postavke.map((p) => p.ime)].join(' ').toLowerCase().includes(q));
    return s;
  });

  /** Rezervacije, kjer je isto igralo isti dan rezervirano večkrat. */
  konflikti = computed(() => {
    const kljuci = new Map<string, string[]>();
    for (const r of this.rez()) {
      if (r.status !== 'nova' && r.status !== 'potrjena') continue;
      for (const p of r.postavke) {
        if (p.kategorija !== 'igralo') continue;
        const k = r.datum + '|' + p.slug;
        kljuci.set(k, [...(kljuci.get(k) ?? []), r.id!]);
      }
    }
    return new Set([...kljuci.values()].filter((v) => v.length > 1).flat());
  });

  async ngOnInit() {
    if (this.f() === 'nove') this.filter.set('nove');
    try {
      const [r, p] = await Promise.all([this.api.rezervacije(), this.api.vsaPonudba()]);
      this.rez.set(r);
      this.ponudba.set(p);
    } catch (e) {
      this.napaka.set((e as Error).message);
    } finally {
      this.nalagam.set(false);
    }
  }

  imeStatusa(s: StatusRezervacije) {
    return STATUSI.find((x) => x.id === s)?.ime ?? s;
  }

  cas(iso: string) {
    return new Date(iso).toLocaleString('sl-SI', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  imeEmaila(e: EmailVnos) {
    return VRSTE_EMAILOV[e.vrsta] ?? e.vrsta;
  }

  /** Ali bo stranka ob tem statusu dobila e-pošto (in je še ni). */
  private obvestiStranko(r: Rezervacija, status: StatusRezervacije): boolean {
    if (!r.email || !this.podatki.nastavitve().obvestila.strankaStatus) return false;
    if (status !== 'potrjena' && status !== 'zavrnjena') return false;
    const vrsta = status === 'potrjena' ? 'stranka_potrjena' : 'stranka_zavrnjena';
    return !(r.email_dnevnik ?? []).some((e) => e.vrsta === vrsta && e.uspeh);
  }

  smsPotrditev(r: Rezervacija) {
    const t = `Pozdravljeni ${r.ime}, potrjujemo rezervacijo za ${datumSl(r.datum)} (${r.postavke.map((p) => p.ime).join(', ')}). Lep pozdrav, Kids Joy`;
    return `sms:${telLink(r.telefon)}?body=${encodeURIComponent(t)}`;
  }

  private posodobiLokalno(id: string, sp: Partial<Rezervacija>) {
    this.rez.update((s) => s.map((x) => (x.id === id ? { ...x, ...sp } : x)));
  }

  async status(r: Rezervacija, status: StatusRezervacije) {
    await this.izvedi(async () => {
      await this.api.posodobiRezervacijo(r.id!, { status });
      this.posodobiLokalno(r.id!, { status });
      if (this.obvestiStranko(r, status)) this.info.set(`${r.ime} bo po e-pošti (${r.email}) prejel/a ${status === 'potrjena' ? 'potrditev' : 'obvestilo o zavrnitvi'}.`);
    });
  }

  async shraniOpombo(r: Rezervacija, opomba_admin: string) {
    await this.izvedi(async () => {
      await this.api.posodobiRezervacijo(r.id!, { opomba_admin });
      this.posodobiLokalno(r.id!, { opomba_admin });
    });
  }

  async izbrisi(r: Rezervacija) {
    await this.izvedi(async () => {
      await this.api.izbrisiRezervacijo(r.id!);
      this.rez.update((s) => s.filter((x) => x.id !== r.id));
      this.brisem.set(null);
    });
  }

  odpriNovo() {
    this.nova.set(prazna());
  }

  imaPostavko(n: Rezervacija, slug: string) {
    return n.postavke.some((p) => p.slug === slug);
  }

  preklopiPostavko(n: Rezervacija, p: Ponudba) {
    const postavke: Postavka[] = this.imaPostavko(n, p.slug)
      ? n.postavke.filter((x) => x.slug !== p.slug)
      : [...n.postavke, { slug: p.slug, ime: p.ime, kategorija: p.kategorija, cena: p.cena }];
    n.postavke = postavke;
    n.skupaj = postavke.reduce((s, x) => s + (x.cena ?? 0), 0);
  }

  async shraniNovo() {
    const n = this.nova();
    if (!n) return;
    await this.izvedi(async () => {
      await this.api.dodajRezervacijo({ ...n, skupaj: Number(n.skupaj) || 0 });
      this.rez.set(await this.api.rezervacije());
      this.nova.set(null);
      if (n.email && n.status === 'potrjena' && this.podatki.nastavitve().obvestila.strankaStatus) {
        this.info.set(`${n.ime} bo po e-pošti (${n.email}) prejel/a potrditev rezervacije.`);
      }
    });
  }

  private async izvedi(fn: () => Promise<void>) {
    this.napaka.set('');
    this.info.set('');
    try {
      await fn();
    } catch (e) {
      this.napaka.set((e as Error).message);
    }
  }
}
