import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Rezervacija } from '../../models';
import { AdminApi } from '../../services/admin-api';
import { danes, datumSl } from '../../util';

@Component({
  selector: 'app-pregled',
  imports: [RouterLink],
  template: `
    <div class="adm-glava">
      <div><h1>Pozdravljeni 👋</h1><p>{{ api.email() }}</p></div>
      <a class="adm-gumb glavni" routerLink="/admin/ponudba/nova">+ Dodaj igralo</a>
    </div>

    @if (napaka()) { <p class="adm-napaka">{{ napaka() }}</p> }

    <div class="stevilke">
      <a class="adm-plosca st" routerLink="/admin/rezervacije" [queryParams]="{ f: 'nove' }">
        <b>{{ nove().length }}</b><span>novih povpraševanj</span>
      </a>
      <div class="adm-plosca st"><b>{{ prihajajoce().length }}</b><span>potrjenih prihajajočih</span></div>
      <div class="adm-plosca st"><b>{{ tedenStevilo() }}</b><span>dogodkov v naslednjih 7 dneh</span></div>
      <div class="adm-plosca st"><b>{{ mesecPrihodek() }} €</b><span>potrjeno ta mesec</span></div>
    </div>

    <div class="adm-plosca">
      <div class="adm-glava" style="margin-bottom:8px">
        <h2 style="margin:0">Prihajajoči dogodki</h2>
        <a routerLink="/admin/rezervacije">Vse rezervacije →</a>
      </div>
      @for (r of naslednji(); track r.id) {
        <a class="vrstica" routerLink="/admin/rezervacije">
          <span class="datum">{{ datumSl(r.datum) }}</span>
          <span class="adm-oznaka" [class]="'st-' + r.status">{{ r.status }}</span>
          <span class="kdo">{{ r.ime }} · {{ r.kraj }}</span>
          <span class="kaj">{{ seznam(r) }}</span>
        </a>
      } @empty {
        <p class="adm-prazno">{{ nalagam() ? 'Nalagam …' : 'Ni prihajajočih rezervacij.' }}</p>
      }
    </div>
  `,
  styles: `
    .stevilke { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
    .st { display: flex; flex-direction: column; text-decoration: none; color: inherit; }
    .st b { font-family: var(--naslovna); font-size: 2rem; line-height: 1.1; font-variant-numeric: tabular-nums; }
    .st span { color: var(--siva); font-size: .9rem; }
    @media (max-width: 760px) { .stevilke { grid-template-columns: 1fr 1fr; } }
    .vrstica { display: grid; grid-template-columns: 150px 100px 1fr; gap: 4px 12px; align-items: center; padding: 10px 0; border-top: 1px solid var(--adm-rob); text-decoration: none; color: inherit; }
    .datum { font-weight: 800; }
    .kaj { grid-column: 3; color: var(--siva); font-size: .9rem; }
    .kdo { min-width: 0; }
    @media (max-width: 600px) { .vrstica { grid-template-columns: 1fr auto; } .kdo, .kaj { grid-column: 1 / -1; } }
  `,
})
export class Pregled implements OnInit {
  api = inject(AdminApi);
  datumSl = datumSl;
  rez = signal<Rezervacija[]>([]);
  nalagam = signal(true);
  napaka = signal('');

  private dan = danes();
  nove = computed(() => this.rez().filter((r) => r.status === 'nova'));
  prihajajoce = computed(() => this.rez().filter((r) => r.status === 'potrjena' && r.datum >= this.dan));
  naslednji = computed(() => this.rez().filter((r) => r.datum >= this.dan && (r.status === 'nova' || r.status === 'potrjena')).slice(0, 8));
  tedenStevilo = computed(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const meja = d.toISOString().slice(0, 10);
    return this.rez().filter((r) => r.status === 'potrjena' && r.datum >= this.dan && r.datum <= meja).length;
  });
  mesecPrihodek = computed(() => {
    const m = this.dan.slice(0, 7);
    return this.rez()
      .filter((r) => (r.status === 'potrjena' || r.status === 'zakljucena') && r.datum.startsWith(m))
      .reduce((s, r) => s + (r.skupaj || 0), 0);
  });

  seznam(r: Rezervacija) {
    return r.postavke.map((p) => p.ime).join(', ');
  }

  async ngOnInit() {
    try {
      this.rez.set(await this.api.rezervacije());
    } catch (e) {
      this.napaka.set((e as Error).message);
    } finally {
      this.nalagam.set(false);
    }
  }
}
