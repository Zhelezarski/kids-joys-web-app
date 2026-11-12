import { inject, Injectable, signal } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Nastavitve, Ponudba, Rezervacija } from '../models';
import { pomanjsajSliko, slugify } from '../util';
import { Podatki } from './podatki';
import { Supa } from './supa';

const BUCKET = 'slike';

function napaka(e: { message: string } | null): void {
  if (!e) return;
  const m = e.message;
  if (/Invalid login credentials/i.test(m)) throw new Error('Napačna e-pošta ali geslo.');
  if (/row-level security|permission denied/i.test(m)) throw new Error('Ta račun nima admin pravic.');
  if (/duplicate key.*slug/i.test(m)) throw new Error('Ta spletni naslov (slug) že obstaja. Izberi drugega.');
  throw new Error(m);
}

@Injectable({ providedIn: 'root' })
export class AdminApi {
  private supa = inject(Supa);
  private podatki = inject(Podatki);

  readonly email = signal<string | null>(null);

  get povezan(): boolean {
    return this.supa.povezan;
  }

  private get c(): SupabaseClient {
    if (!this.supa.client) throw new Error('Baza ni povezana. Vpiši podatke v src/app/config.ts.');
    return this.supa.client;
  }

  // ---------- Prijava ----------
  async seja(): Promise<boolean> {
    if (!this.supa.client) return false;
    const { data } = await this.c.auth.getSession();
    this.email.set(data.session?.user.email ?? null);
    return !!data.session;
  }

  async jeAdmin(): Promise<boolean> {
    if (!this.supa.client) return false;
    const { data } = await this.c.rpc('je_admin');
    return data === true;
  }

  async prijava(email: string, geslo: string): Promise<void> {
    const { error } = await this.c.auth.signInWithPassword({ email, password: geslo });
    napaka(error);
    if (!(await this.jeAdmin())) {
      await this.c.auth.signOut();
      throw new Error('Ta račun nima admin pravic. Dodaj ga v tabelo "admini" (glej supabase/schema.sql).');
    }
    await this.seja();
  }

  async odjava(): Promise<void> {
    await this.c.auth.signOut();
    this.email.set(null);
  }

  async ponastaviGeslo(email: string): Promise<void> {
    const { error } = await this.c.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
    napaka(error);
  }

  async spremeniGeslo(geslo: string): Promise<void> {
    const { error } = await this.c.auth.updateUser({ password: geslo });
    napaka(error);
  }

  // ---------- Ponudba ----------
  async vsaPonudba(): Promise<Ponudba[]> {
    const { data, error } = await this.c.from('ponudba').select('*').order('vrstni_red');
    napaka(error);
    return ((data ?? []) as Ponudba[]).map((x) => ({ ...x, cena: x.cena === null ? null : Number(x.cena) }));
  }

  async ponudbaPoId(id: string): Promise<Ponudba | null> {
    const { data, error } = await this.c.from('ponudba').select('*').eq('id', id).maybeSingle();
    napaka(error);
    return data ? ({ ...data, cena: data.cena === null ? null : Number(data.cena) } as Ponudba) : null;
  }

  async shraniPonudbo(p: Ponudba): Promise<Ponudba> {
    const { id, ...vrstica } = { ...p, slug: slugify(p.slug || p.ime) };
    const q = id
      ? this.c.from('ponudba').update(vrstica).eq('id', id).select().single()
      : this.c.from('ponudba').insert(vrstica).select().single();
    const { data, error } = await q;
    napaka(error);
    void this.podatki.nalozi();
    return data as Ponudba;
  }

  async posodobiPonudbo(id: string, spremembe: Partial<Ponudba>): Promise<void> {
    const { error } = await this.c.from('ponudba').update(spremembe).eq('id', id);
    napaka(error);
    void this.podatki.nalozi();
  }

  async izbrisiPonudbo(p: Ponudba): Promise<void> {
    if (!p.id) return;
    const { error } = await this.c.from('ponudba').delete().eq('id', p.id);
    napaka(error);
    await Promise.all(p.slike.map((s) => this.izbrisiSliko(s)));
    void this.podatki.nalozi();
  }

  // ---------- Slike ----------
  async naloziSliko(file: File, mapa: string): Promise<string> {
    const blob = await pomanjsajSliko(file);
    const jpeg = blob.type === 'image/jpeg';
    const koncnica = jpeg ? 'jpg' : (file.name.split('.').pop() || 'jpg').toLowerCase();
    const pot = `${slugify(mapa) || 'splosno'}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${koncnica}`;
    const { error } = await this.c.storage.from(BUCKET).upload(pot, blob, {
      contentType: jpeg ? 'image/jpeg' : file.type,
      cacheControl: '31536000',
    });
    napaka(error);
    return this.c.storage.from(BUCKET).getPublicUrl(pot).data.publicUrl;
  }

  async izbrisiSliko(url: string): Promise<void> {
    const oznaka = `/object/public/${BUCKET}/`;
    const i = url.indexOf(oznaka);
    if (i < 0) return; // zunanja slika
    await this.c.storage.from(BUCKET).remove([decodeURIComponent(url.slice(i + oznaka.length))]);
  }

  // ---------- Rezervacije ----------
  async rezervacije(): Promise<Rezervacija[]> {
    let { data, error } = await this.c
      .from('rezervacije')
      .select('*, email_dnevnik(vrsta, uspeh, napaka, created_at)')
      .order('datum', { ascending: true });
    // Če tabela email_dnevnik (še) ne obstaja, naloži brez nje.
    if (error && /email_dnevnik/i.test(error.message)) {
      ({ data, error } = await this.c.from('rezervacije').select('*').order('datum', { ascending: true }));
    }
    napaka(error);
    return ((data ?? []) as Rezervacija[]).map((r) => ({ ...r, skupaj: Number(r.skupaj) }));
  }

  async posodobiRezervacijo(id: string, spremembe: Partial<Rezervacija>): Promise<void> {
    const { error } = await this.c.from('rezervacije').update(spremembe).eq('id', id);
    napaka(error);
  }

  async dodajRezervacijo(r: Rezervacija): Promise<void> {
    const { id: _id, created_at: _c, email_dnevnik: _e, ...vrstica } = r;
    const { error } = await this.c.from('rezervacije').insert(vrstica);
    napaka(error);
  }

  async izbrisiRezervacijo(id: string): Promise<void> {
    const { error } = await this.c.from('rezervacije').delete().eq('id', id);
    napaka(error);
  }

  // ---------- E-pošta ----------
  /** Pošlje testno sporočilo na e-naslov za obvestila. Vrne opis napake ali null. */
  async testniEmail(): Promise<string | null> {
    const { data, error } = await this.c.functions.invoke('obvestila', { body: { dogodek: 'test' } });
    if (error) {
      let opis = error.message;
      try {
        const telo = await (error as { context?: Response }).context?.json();
        if (telo?.napaka) opis = telo.napaka;
      } catch { /* brez telesa */ }
      return /Failed to send|fetch/i.test(opis) ? 'Funkcija »obvestila« ni dosegljiva (ali je nameščena v Supabase?).' : opis;
    }
    return data?.ok ? null : (data?.napaka ?? 'Neznana napaka.');
  }

  // ---------- Nastavitve ----------
  async shraniNastavitve(n: Nastavitve): Promise<void> {
    const { error } = await this.c.from('nastavitve').upsert({ id: 1, podatki: n, posodobljeno: new Date().toISOString() });
    napaka(error);
    this.podatki.nastavitve.set(n);
  }
}
