import { computed, inject, Injectable, signal } from '@angular/core';
import { PRIVZETA_PONUDBA, PRIVZETE_NASTAVITVE } from '../data';
import { Nastavitve, Ponudba, Rezervacija } from '../models';
import { poVrsti, telLink } from '../util';
import { Supa } from './supa';

/** Javni podatki strani. Iz baze, če je povezana, sicer privzeti iz data.ts. */
@Injectable({ providedIn: 'root' })
export class Podatki {
  private supa = inject(Supa);

  readonly nastavitve = signal<Nastavitve>(PRIVZETE_NASTAVITVE);
  readonly ponudba = signal<Ponudba[]>(this.supa.povezan ? [] : PRIVZETA_PONUDBA);
  readonly nalozeno = signal(!this.supa.povezan);

  readonly podjetje = computed(() => this.nastavitve().podjetje);
  readonly tel = computed(() => telLink(this.podjetje().telefon));
  readonly igrala = computed(() => this.ponudba().filter((p) => p.kategorija === 'igralo' && p.aktivno).sort(poVrsti));
  readonly dekoracije = computed(() => this.ponudba().filter((p) => p.kategorija === 'dekoracija' && p.aktivno).sort(poVrsti));

  constructor() {
    void this.nalozi();
  }

  async nalozi(): Promise<void> {
    const c = this.supa.client;
    if (!c) return;
    const [n, p] = await Promise.all([
      c.from('nastavitve').select('podatki').eq('id', 1).maybeSingle(),
      c.from('ponudba').select('*').eq('aktivno', true).order('vrstni_red'),
    ]);
    const shranjene = n.data?.podatki as Partial<Nastavitve> | undefined;
    if (shranjene) {
      this.nastavitve.set({
        ...PRIVZETE_NASTAVITVE,
        ...shranjene,
        podjetje: { ...PRIVZETE_NASTAVITVE.podjetje, ...(shranjene.podjetje ?? {}) },
        hero: { ...PRIVZETE_NASTAVITVE.hero, ...(shranjene.hero ?? {}) },
        obvestila: { ...PRIVZETE_NASTAVITVE.obvestila, ...(shranjene.obvestila ?? {}) },
      });
    }
    if (p.data) this.ponudba.set((p.data as Ponudba[]).map((x) => ({ ...x, cena: x.cena === null ? null : Number(x.cena) })));
    else if (p.error) this.ponudba.set(PRIVZETA_PONUDBA);
    this.nalozeno.set(true);
  }

  poSlugu(slug: string): Ponudba | undefined {
    return this.ponudba().find((p) => p.slug === slug && p.aktivno);
  }

  /** Igrala, ki so na izbrani dan že rezervirana. */
  async zasedena(datum: string): Promise<string[]> {
    const c = this.supa.client;
    if (!c || !datum) return [];
    const { data } = await c.rpc('zasedena_igrala', { d: datum });
    return Array.isArray(data) ? (data as unknown[]).map(String) : [];
  }

  /** Shrani rezervacijo v bazo. Vrne null ob uspehu ali opis napake. */
  async oddaj(r: Rezervacija): Promise<string | null> {
    const c = this.supa.client;
    if (!c) return 'Baza ni povezana.';
    const { id: _id, created_at: _c, email_dnevnik: _e, ...vrstica } = r;
    const { error } = await c.from('rezervacije').insert(vrstica);
    return error ? error.message : null;
  }
}
