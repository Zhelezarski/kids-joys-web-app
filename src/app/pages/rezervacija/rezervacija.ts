import { Component, computed, effect, input, signal } from '@angular/core';
import { DEKORACIJE, IGRALA, PODJETJE } from '../../data';

/**
 * Obrazec nima strežnika. Ob oddaji odpre e-pošto ali SMS z
 * izpolnjenim sporočilom, ki ga stranka samo še pošlje.
 */
@Component({
  selector: 'app-rezervacija',
  template: `
    <section class="sekcija">
      <div class="okvir ozek">
        <h1>Rezervacija</h1>
        <p class="podnaslov">Izpolnite obrazec in odgovorili vam bomo s potrditvijo termina. Lahko nas tudi pokličete na <a [href]="'tel:' + p.telefonLink">{{ p.telefon }}</a>.</p>

        <form (submit)="oddaj($event)" novalidate>
          <fieldset>
            <legend>1. Kaj želite?</legend>
            <div class="izbire">
              @for (i of igrala; track i.id) {
                <label class="izbira" [class.izbrano]="izbrano().has(i.id)">
                  <input type="checkbox" [checked]="izbrano().has(i.id)" (change)="preklopi(i.id)" />
                  <span>{{ i.ime }}</span>
                  <small>{{ i.cena }} € / dan</small>
                </label>
              }
              @for (d of dekoracije; track d.id) {
                <label class="izbira dek" [class.izbrano]="izbrano().has(d.id)">
                  <input type="checkbox" [checked]="izbrano().has(d.id)" (change)="preklopi(d.id)" />
                  <span>{{ d.ime }}</span>
                  <small>po dogovoru</small>
                </label>
              }
            </div>
            @if (poslano() && izbrano().size === 0) { <p class="napaka">Izberite vsaj eno igralo ali dekoracijo.</p> }
          </fieldset>

          <fieldset>
            <legend>2. Kdaj in kje?</legend>
            <div class="vrsta">
              <label>Datum *
                <input type="date" [min]="danes" [value]="datum()" (input)="datum.set(v($event))" />
                @if (poslano() && !datum()) { <span class="napaka">Vpišite datum.</span> }
              </label>
              <label>Kraj *
                <input type="text" placeholder="npr. Nova Gorica" [value]="kraj()" (input)="kraj.set(v($event))" />
                @if (poslano() && !kraj()) { <span class="napaka">Vpišite kraj.</span> }
              </label>
            </div>
            <div class="radio">
              <label><input type="radio" name="prostor" value="zunaj" [checked]="prostor() === 'zunaj'" (change)="prostor.set('zunaj')" /> Zunaj</label>
              <label><input type="radio" name="prostor" value="notri" [checked]="prostor() === 'notri'" (change)="prostor.set('notri')" /> V notranjem prostoru</label>
            </div>
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
            <label>Opomba
              <textarea rows="3" placeholder="Priložnost, število otrok, želene barve dekoracije ..." [value]="opomba()" (input)="opomba.set(v($event))"></textarea>
            </label>
          </fieldset>

          @if (ocena() > 0) {
            <p class="ocena">Okvirna cena igral: <b>{{ ocena() }} €</b> na dan{{ imaDekoracijo() ? ' + dekoracija po dogovoru' : '' }}</p>
          }

          <div class="gumbi">
            <button class="gumb" type="submit">✉️ Pošlji po e-pošti</button>
            <button class="gumb drugi" type="button" (click)="sms()">💬 Pošlji SMS</button>
          </div>
          <p class="drobno">Odpre se vaša e-pošta ali sporočila z že izpolnjenim besedilom. Rezervacija je potrjena, ko vam odgovorimo.</p>
        </form>
      </div>
    </section>
  `,
  styles: `
    .ozek { max-width: 760px; }
    form { display: flex; flex-direction: column; gap: 20px; }
    fieldset { border: 0; background: var(--bela); border-radius: 20px; padding: 20px; box-shadow: var(--senca); margin: 0; }
    legend { font-family: var(--naslovna); font-weight: 800; font-size: 1.2rem; float: left; width: 100%; margin-bottom: 12px; }
    .izbire { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; clear: both; }
    .izbira { display: grid; grid-template-columns: auto 1fr; column-gap: 10px; align-items: center; border: 2px solid #eee4d6; border-radius: 14px; padding: 12px; cursor: pointer; }
    .izbira small { grid-column: 2; color: var(--siva); }
    .izbira.izbrano { border-color: var(--rdeca); background: #fff3f1; }
    .izbira.dek.izbrano { border-color: var(--vijolicna); background: #f5f0ff; }
    .izbira input { width: 20px; height: 20px; accent-color: var(--rdeca); grid-row: span 2; }
    .vrsta { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; clear: both; }
    label { display: flex; flex-direction: column; gap: 6px; font-weight: 700; margin-bottom: 10px; }
    input[type=text], input[type=tel], input[type=date], textarea {
      font: inherit; padding: 12px 14px; border: 2px solid #eee4d6; border-radius: 12px; background: var(--kremna); width: 100%;
    }
    input:focus, textarea:focus { outline: none; border-color: var(--modra); }
    .radio { display: flex; gap: 20px; flex-wrap: wrap; }
    .radio label { flex-direction: row; align-items: center; font-weight: 600; }
    .napaka { color: var(--rdeca); font-size: .85rem; font-weight: 700; margin: 0; }
    .ocena { background: #fff4cc; border-radius: 14px; padding: 12px 16px; margin: 0; }
    .gumbi { display: flex; gap: 14px; flex-wrap: wrap; }
    .drobno { color: var(--siva); font-size: .85rem; margin: 0; }
    @media (max-width: 620px) { .izbire, .vrsta { grid-template-columns: 1fr; } }
  `,
})
export class Rezervacija {
  /** Iz query parametrov ?igralo=... ali ?dekoracija=... */
  igralo = input<string>();
  dekoracija = input<string>();

  p = PODJETJE;
  igrala = IGRALA;
  dekoracije = DEKORACIJE;
  danes = new Date().toISOString().slice(0, 10);

  izbrano = signal<Set<string>>(new Set());
  datum = signal('');
  kraj = signal('');
  prostor = signal<'zunaj' | 'notri'>('zunaj');
  ime = signal('');
  telefon = signal('');
  opomba = signal('');
  poslano = signal(false);

  ocena = computed(() => IGRALA.filter((i) => this.izbrano().has(i.id)).reduce((s, i) => s + (i.cena ?? 0), 0));
  imaDekoracijo = computed(() => DEKORACIJE.some((d) => this.izbrano().has(d.id)));
  veljavno = computed(() => this.izbrano().size > 0 && !!this.datum() && !!this.kraj() && !!this.ime() && !!this.telefon());

  constructor() {
    effect(() => {
      const pred = [this.igralo(), this.dekoracija()].filter((x): x is string => !!x);
      if (pred.length) this.izbrano.update((s) => new Set([...s, ...pred]));
    });
  }

  v(e: Event): string {
    return (e.target as HTMLInputElement).value.trim();
  }

  preklopi(id: string) {
    this.izbrano.update((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  private besedilo(): string {
    const vse = [...IGRALA, ...DEKORACIJE].filter((x) => this.izbrano().has(x.id)).map((x) => '- ' + x.ime);
    const datum = this.datum() ? new Date(this.datum()).toLocaleDateString('sl-SI') : '';
    return [
      'Pozdravljeni, želim rezervirati:',
      ...vse,
      '',
      `Datum: ${datum}`,
      `Kraj: ${this.kraj()} (${this.prostor() === 'zunaj' ? 'zunaj' : 'v notranjem prostoru'})`,
      `Ime: ${this.ime()}`,
      `Telefon: ${this.telefon()}`,
      this.opomba() ? `Opomba: ${this.opomba()}` : '',
    ].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');
  }

  oddaj(e: Event) {
    e.preventDefault();
    this.poslano.set(true);
    if (!this.veljavno()) return;
    const zadeva = `Rezervacija ${this.datum()} – ${this.kraj()}`;
    location.href = `mailto:${this.p.email}?subject=${encodeURIComponent(zadeva)}&body=${encodeURIComponent(this.besedilo())}`;
  }

  sms() {
    this.poslano.set(true);
    if (!this.veljavno()) return;
    location.href = `sms:${this.p.telefonLink}?body=${encodeURIComponent(this.besedilo())}`;
  }
}
