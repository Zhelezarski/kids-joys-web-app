import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Postavka, Rezervacija as Rez } from '../../models';
import { Podatki } from '../../services/podatki';
import { Supa } from '../../services/supa';
import { danes, datumSl } from '../../util';

@Component({
  selector: 'app-rezervacija',
  imports: [RouterLink],
  template: `
    <section class="sekcija">
      <div class="okvir ozek">
        <h1>Rezervacija</h1>

        @if (stanje() === 'poslano') {
          <div class="uspeh">
            <h2>🎉 Hvala, povpraševanje smo prejeli!</h2>
            <p>Za {{ datumSl(datum()) }} vam bomo kmalu odgovorili na {{ telefon() }}. Za hitrejši odgovor nas lahko pokličete na
              <a [href]="'tel:' + p.tel()">{{ p.podjetje().telefon }}</a>.</p>
            @if (email() && p.nastavitve().obvestila.strankaPrejeta) {
              <p>Povzetek povpraševanja smo poslali tudi na <b>{{ email() }}</b>. Če ga ne vidite, preverite mapo z neželeno pošto.</p>
            }
            <button class="gumb drugi" type="button" (click)="novo()">Nova rezervacija</button>
          </div>
        } @else {
          <p class="podnaslov">Izpolnite obrazec in odgovorili vam bomo s potrditvijo termina. Lahko nas tudi pokličete na
            <a [href]="'tel:' + p.tel()">{{ p.podjetje().telefon }}</a>.</p>

          <form (submit)="oddaj($event)" novalidate>
            <fieldset>
              <legend>1. Kdaj in kje?</legend>
              <div class="vrsta">
                <label>Datum *
                  <input type="date" [min]="min" [value]="datum()" (input)="nastaviDatum(v($event))" />
                  @if (poslano() && !datum()) { <span class="napaka">Vpišite datum.</span> }
                </label>
                <label>Kraj *
                  <input type="text" placeholder="npr. Nova Gorica" [value]="kraj()" (input)="kraj.set(v($event))" />
                  @if (poslano() && !kraj()) { <span class="napaka">Vpišite kraj.</span> }
                </label>
              </div>
              <div class="radio">
                <label><input type="radio" name="prostor" [checked]="prostor() === 'zunaj'" (change)="prostor.set('zunaj')" /> Zunaj</label>
                <label><input type="radio" name="prostor" [checked]="prostor() === 'notri'" (change)="prostor.set('notri')" /> V notranjem prostoru</label>
              </div>
            </fieldset>

            <fieldset>
              <legend>2. Kaj želite?</legend>
              <div class="izbire">
                @for (i of p.igrala(); track i.slug) {
                  @let zas = zasedena().includes(i.slug);
                  <label class="izbira" [class.izbrano]="izbrano().has(i.slug)" [class.zasedeno]="zas">
                    <input type="checkbox" [checked]="izbrano().has(i.slug)" [disabled]="zas" (change)="preklopi(i.slug)" />
                    <span>{{ i.ime }}</span>
                    <small>{{ zas ? 'Na ta dan že zasedeno' : (i.cena !== null ? i.cena + ' € / dan' : 'po dogovoru') }}</small>
                  </label>
                }
                @for (d of p.dekoracije(); track d.slug) {
                  <label class="izbira dek" [class.izbrano]="izbrano().has(d.slug)">
                    <input type="checkbox" [checked]="izbrano().has(d.slug)" (change)="preklopi(d.slug)" />
                    <span>{{ d.ime }}</span>
                    <small>{{ d.cena !== null ? d.cena + ' €' : 'po dogovoru' }}</small>
                  </label>
                }
              </div>
              @if (poslano() && izbrano().size === 0) { <p class="napaka">Izberite vsaj eno igralo ali dekoracijo.</p> }
            </fieldset>

            <fieldset>
              <legend>3. Vaši podatki</legend>
              <div class="vrsta">
                <label>Ime in priimek *
                  <input type="text" autocomplete="name" [value]="ime()" (input)="ime.set(v($event))" />
                  @if (poslano() && !ime()) { <span class="napaka">Vpišite ime.</span> }
                </label>
                <label>Telefon *
                  <input type="tel" autocomplete="tel" [value]="telefon()" (input)="telefon.set(v($event))" />
                  @if (poslano() && !telefon()) { <span class="napaka">Vpišite telefon.</span> }
                </label>
              </div>
              <label>E-pošta
                <input type="email" autocomplete="email" [value]="email()" (input)="email.set(v($event))" />
                @if (obvesti()) { <small class="namig">Neobvezno. Nanjo vam pošljemo obvestila o rezervaciji (potrdilo, potrditev termina, opomnik).</small> }
              </label>
              <label>Opomba
                <textarea rows="3" placeholder="Priložnost, število otrok, želene barve dekoracije …" [value]="opomba()" (input)="opomba.set(v($event))"></textarea>
              </label>
            </fieldset>

            <label class="soglasje">
              <input type="checkbox" [checked]="pogoji()" (change)="pogoji.set(!pogoji())" />
              <span>Strinjam se s <a routerLink="/pogoji" target="_blank">splošnimi pogoji najema</a> in sem seznanjen/a s
                <a routerLink="/zasebnost" target="_blank">politiko zasebnosti</a>. *</span>
            </label>
            @if (poslano() && !pogoji()) { <p class="napaka">Za oddajo rezervacije potrdite splošne pogoje.</p> }

            @if (ocena() > 0) {
              <p class="ocena">Okvirna cena: <b>{{ ocena() }} €</b>{{ imaPoDogovoru() ? ' + postavke po dogovoru' : '' }}</p>
            }
            @if (napaka()) { <p class="napaka velika">{{ napaka() }} Pokličite nas ali pošljite e-pošto.</p> }

            <div class="gumbi">
              <button class="gumb" type="submit" [disabled]="stanje() === 'posiljam'">
                {{ stanje() === 'posiljam' ? 'Pošiljam …' : (supa.povezan ? 'Pošlji rezervacijo' : '✉️ Pošlji po e-pošti') }}
              </button>
              <button class="gumb drugi" type="button" (click)="sms()">💬 Pošlji SMS</button>
            </div>
            <p class="drobno">Rezervacija je potrjena, ko vam odgovorimo.</p>
          </form>
        }
      </div>
    </section>
  `,
  styles: `
    .ozek { max-width: 760px; }
    form { display: flex; flex-direction: column; gap: 20px; }
    fieldset { border: 0; background: var(--bela); border-radius: 20px; padding: 20px; box-shadow: var(--senca); margin: 0; min-width: 0; }
    legend { font-family: var(--naslovna); font-weight: 800; font-size: 1.2rem; float: left; width: 100%; margin-bottom: 12px; }
    .izbire { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; clear: both; }
    .izbira { display: grid; grid-template-columns: auto 1fr; column-gap: 10px; align-items: center; border: 2px solid #eee4d6; border-radius: 14px; padding: 12px; cursor: pointer; }
    .izbira small { grid-column: 2; color: var(--siva); }
    .izbira.izbrano { border-color: var(--rdeca); background: #fff3f1; }
    .izbira.dek.izbrano { border-color: var(--vijolicna); background: #f5f0ff; }
    .izbira.zasedeno { opacity: .55; cursor: not-allowed; }
    .izbira.zasedeno small { color: var(--rdeca); font-weight: 700; }
    .izbira input { width: 20px; height: 20px; accent-color: var(--rdeca); grid-row: span 2; }
    .vrsta { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; clear: both; }
    label { display: flex; flex-direction: column; gap: 6px; font-weight: 700; margin-bottom: 10px; }
    input[type=text], input[type=tel], input[type=email], input[type=date], textarea {
      font: inherit; padding: 12px 14px; border: 2px solid #eee4d6; border-radius: 12px; background: var(--kremna); width: 100%;
    }
    input:focus, textarea:focus { outline: none; border-color: var(--modra); }
    .radio { display: flex; gap: 20px; flex-wrap: wrap; }
    .radio label { flex-direction: row; align-items: center; font-weight: 600; }
    .napaka { color: var(--rdeca); font-size: .85rem; font-weight: 700; margin: 0; }
    .napaka.velika { font-size: 1rem; background: #fff3f1; padding: 12px 16px; border-radius: 12px; }
    .ocena { background: #fff4cc; border-radius: 14px; padding: 12px 16px; margin: 0; }
    .gumbi { display: flex; gap: 14px; flex-wrap: wrap; }
    .drobno { color: var(--siva); font-size: .85rem; margin: 0; }
    .namig { color: var(--siva); font-size: .82rem; font-weight: 600; }
    .soglasje { flex-direction: row; align-items: flex-start; gap: 10px; font-weight: 600; margin: 0; }
    .soglasje input { width: 20px; height: 20px; flex: none; margin-top: 2px; accent-color: var(--rdeca); }
    .uspeh { background: var(--bela); border-radius: 24px; padding: 28px; box-shadow: var(--senca); border-top: 6px solid var(--zelena); }
    @media (max-width: 620px) { .izbire, .vrsta { grid-template-columns: 1fr; } }
  `,
})
export class Rezervacija {
  /** Iz query parametrov ?igralo=... ali ?dekoracija=... */
  igralo = input<string>();
  dekoracija = input<string>();

  p = inject(Podatki);
  supa = inject(Supa);
  min = danes();
  datumSl = datumSl;

  izbrano = signal<Set<string>>(new Set());
  zasedena = signal<string[]>([]);
  datum = signal('');
  kraj = signal('');
  prostor = signal<'zunaj' | 'notri'>('zunaj');
  ime = signal('');
  telefon = signal('');
  email = signal('');
  opomba = signal('');
  poslano = signal(false);
  stanje = signal<'urejam' | 'posiljam' | 'poslano'>('urejam');
  napaka = signal('');
  pogoji = signal(false);

  postavke = computed<Postavka[]>(() =>
    [...this.p.igrala(), ...this.p.dekoracije()]
      .filter((x) => this.izbrano().has(x.slug))
      .map((x) => ({ slug: x.slug, ime: x.ime, kategorija: x.kategorija, cena: x.cena })),
  );
  ocena = computed(() => this.postavke().reduce((s, x) => s + (x.cena ?? 0), 0));
  obvesti = computed(() => {
    const o = this.p.nastavitve().obvestila;
    return o.strankaPrejeta || o.strankaStatus || o.strankaOpomnik;
  });
  imaPoDogovoru = computed(() => this.postavke().some((x) => x.cena === null));
  veljavno = computed(() => this.pogoji() && this.izbrano().size > 0 && !!this.datum() && !!this.kraj() && !!this.ime() && !!this.telefon());

  constructor() {
    effect(() => {
      const pred = [this.igralo(), this.dekoracija()].filter((x): x is string => !!x);
      if (pred.length) this.izbrano.update((s) => new Set([...s, ...pred]));
    });
  }

  v(e: Event): string {
    return (e.target as HTMLInputElement).value.trim();
  }

  async nastaviDatum(d: string) {
    this.datum.set(d);
    const zas = await this.p.zasedena(d);
    this.zasedena.set(zas);
    if (zas.length) this.izbrano.update((s) => new Set([...s].filter((x) => !zas.includes(x))));
  }

  preklopi(slug: string) {
    this.izbrano.update((s) => {
      const n = new Set(s);
      if (n.has(slug)) n.delete(slug);
      else n.add(slug);
      return n;
    });
  }

  private besedilo(): string {
    const vrstice = [
      'Pozdravljeni, želim rezervirati:',
      ...this.postavke().map((x) => '- ' + x.ime),
      '',
      `Datum: ${datumSl(this.datum())}`,
      `Kraj: ${this.kraj()} (${this.prostor() === 'zunaj' ? 'zunaj' : 'v notranjem prostoru'})`,
      `Ime: ${this.ime()}`,
      `Telefon: ${this.telefon()}`,
    ];
    if (this.email()) vrstice.push(`E-pošta: ${this.email()}`);
    if (this.opomba()) vrstice.push(`Opomba: ${this.opomba()}`);
    return vrstice.join('\n');
  }

  async oddaj(e: Event) {
    e.preventDefault();
    this.poslano.set(true);
    this.napaka.set('');
    if (!this.veljavno()) return;

    if (!this.supa.povezan) {
      const zadeva = `Rezervacija ${this.datum()} – ${this.kraj()}`;
      location.href = `mailto:${this.p.podjetje().email}?subject=${encodeURIComponent(zadeva)}&body=${encodeURIComponent(this.besedilo())}`;
      return;
    }

    this.stanje.set('posiljam');
    const r: Rez = {
      datum: this.datum(), kraj: this.kraj(), prostor: this.prostor(), ime: this.ime(), telefon: this.telefon(),
      email: this.email(), opomba: this.opomba(), postavke: this.postavke(), skupaj: this.ocena(),
      status: 'nova', opomba_admin: '', sprejeti_pogoji: true,
    };
    const err = await this.p.oddaj(r);
    if (err) {
      this.stanje.set('urejam');
      this.napaka.set('Rezervacije ni bilo mogoče poslati.');
    } else {
      this.stanje.set('poslano');
    }
  }

  sms() {
    this.poslano.set(true);
    if (!this.veljavno()) return;
    location.href = `sms:${this.p.tel()}?body=${encodeURIComponent(this.besedilo())}`;
  }

  novo() {
    this.izbrano.set(new Set());
    this.datum.set('');
    this.opomba.set('');
    this.poslano.set(false);
    this.stanje.set('urejam');
  }
}
