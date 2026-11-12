export type Kategorija = 'igralo' | 'dekoracija';
export type Oblika = 'grad' | 'tobogan' | 'zogice' | 'baloni';
export type Prostor = 'zunaj' | 'notri';
export type StatusRezervacije = 'nova' | 'potrjena' | 'zavrnjena' | 'zakljucena';

/** Igralo ali dekoracija (tabela "ponudba"). */
export interface Ponudba {
  id?: string;
  slug: string;
  kategorija: Kategorija;
  ime: string;
  kratek_opis: string;
  opis: string;
  /** Cena na dan v EUR; null pomeni "po dogovoru". */
  cena: number | null;
  mere: string;
  starost: string;
  nosilnost: string;
  znacilnosti: string[];
  slike: string[];
  /** Barve ilustracije, dokler ni fotografije. */
  barve: string[];
  oblika: Oblika;
  aktivno: boolean;
  vrstni_red: number;
}

export interface Podjetje {
  ime: string;
  kratkoIme: string;
  slogan: string;
  telefon: string;
  email: string;
  instagram: string;
  facebook: string;
  naslov: string;
  obmocje: string;
  delovniCas: string;
  dostava: string;
  cenaOd: number;
  cenaDo: number;
  /** Pravni podatki (pogoji, zasebnost). */
  pravnoIme: string;
  sedez: string;
  maticna: string;
  davcna: string;
  ddvZavezanec: boolean;
}

export interface Prednost {
  ikona: string;
  naslov: string;
  opis: string;
}

export interface Vprasanje {
  vprasanje: string;
  odgovor: string;
}

/** E-poštna obvestila (pošilja Edge Function "obvestila"). */
export interface Obvestila {
  /** Kam pošiljamo obvestila lastniku; prazno = e-pošta podjetja. */
  email: string;
  lastnikNova: boolean;
  lastnikDnevni: boolean;
  strankaPrejeta: boolean;
  strankaStatus: boolean;
  strankaOpomnik: boolean;
}

/** Vse nastavitve strani (ena vrstica v tabeli "nastavitve"). */
export interface Nastavitve {
  podjetje: Podjetje;
  hero: { naslov: string; podnaslov: string };
  /** Pasica na vrhu strani; prazno = skrito. */
  obvestilo: string;
  prednosti: Prednost[];
  kraji: string[];
  vprasanja: Vprasanje[];
  /** Pogoji odpovedi rezervacije (splošni pogoji, točka 4). */
  pogojiOdpovedi: string;
  obvestila: Obvestila;
}

export interface Postavka {
  slug: string;
  ime: string;
  kategorija: Kategorija;
  cena: number | null;
}

export interface Rezervacija {
  id?: string;
  created_at?: string;
  datum: string;
  kraj: string;
  prostor: Prostor;
  ime: string;
  telefon: string;
  email: string;
  opomba: string;
  postavke: Postavka[];
  skupaj: number;
  status: StatusRezervacije;
  opomba_admin: string;
  sprejeti_pogoji?: boolean;
  /** Samo v adminu: poslana e-poštna sporočila za to rezervacijo. */
  email_dnevnik?: EmailVnos[];
}

export interface EmailVnos {
  vrsta: string;
  uspeh: boolean;
  napaka: string;
  created_at: string;
}
