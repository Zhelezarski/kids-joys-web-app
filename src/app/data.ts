// ==========================================================
//  VSI PODATKI STRANI SO TUKAJ.
//  Spremeni besedila, cene in slike samo v tej datoteki.
//  Fotografije daj v mapo /public/slike in vpiši ime datoteke,
//  npr. slike: ['slike/grad-tobogan-1.jpg'].
// ==========================================================

export interface Podjetje {
  ime: string;
  kratkoIme: string;
  slogan: string;
  telefon: string;
  telefonLink: string;
  email: string;
  instagram: string;
  facebook: string;
  naslov: string;
  obmocje: string;
  delovniCas: string;
  cenaOd: number;
  cenaDo: number;
}

export interface Ponudba {
  id: string;
  ime: string;
  kratekOpis: string;
  opis: string;
  /** Cena na dan v EUR; null pomeni "po dogovoru". */
  cena: number | null;
  mere?: string;
  starost?: string;
  nosilnost?: string;
  znacilnosti: string[];
  slike: string[];
  /** Barve za ilustracijo, dokler ni prave fotografije. */
  barve: [string, string, string];
  oblika: 'grad' | 'tobogan' | 'zogice' | 'baloni';
}

export interface Vprasanje {
  vprasanje: string;
  odgovor: string;
}

export const PODJETJE: Podjetje = {
  ime: 'Napihljiva Igrala Kids Joy',
  kratkoIme: 'Kids Joy',
  slogan: 'Oddajamo v najem napihljiva igrala za vse priložnosti in krasimo prostore z baloni.',
  telefon: '070 258 245',
  telefonLink: '+38670258245',
  email: 'kidsjoy.igrala@gmail.com',
  instagram: 'kids_joy_a2',
  facebook: 'https://www.facebook.com/share/1J8Crnadih/',
  naslov: 'Kromberk, Solkan, 5000 Nova Gorica',
  obmocje: 'Goriška in okolica',
  delovniCas: 'Vedno odprto, pokličite kadarkoli',
  cenaOd: 60,
  cenaDo: 100,
};

export const PREDNOSTI = [
  { ikona: '🛡️', naslov: 'Varni in kakovostni', opis: 'Redno čiščenje in dezinfekcija igral.' },
  { ikona: '🎉', naslov: 'Za vse priložnosti', opis: 'Rojstni dnevi, praznovanja, zabave in šole.' },
  { ikona: '🏠', naslov: 'Notri in zunaj', opis: 'Primerni za dvorane, vrtce in vrtove.' },
  { ikona: '⚡', naslov: 'Hitra postavitev', opis: 'Pripeljemo, postavimo in pospravimo mi.' },
];

export const IGRALA: Ponudba[] = [
  {
    id: 'mavricni-grad',
    ime: 'Mavrični grad s toboganom',
    kratekOpis: 'Klasični grad za skakanje z manjšim toboganom. Idealen za dvorane.',
    opis: 'Barvit grad, ki ga otroci obožujejo. Ima prostor za skakanje in tobogan, zato je odličen za rojstne dneve doma ali v dvorani. Zaradi kompaktne velikosti ga postavimo tudi v manjše prostore.',
    cena: 60,
    mere: 'pribl. 4 × 3,5 m, višina 2,5 m',
    starost: '3 do 9 let',
    nosilnost: 'do 250 kg',
    znacilnosti: ['Primeren za notranjo uporabo', 'Hitra postavitev', 'Mreža za varnost ob straneh'],
    slike: [],
    barve: ['#e8412c', '#2f6fdb', '#f6c026'],
    oblika: 'grad',
  },
  {
    id: 'grad-z-zogicami',
    ime: 'Grad s toboganom in bazenom žogic',
    kratekOpis: 'Skakanje, tobogan in bazen z barvnimi žogicami v enem.',
    opis: 'Igralo z dvema doživetjema: najprej skakanje in plezanje, nato spust po toboganu naravnost v bazen z barvnimi žogicami. Žogice so vključene v najem.',
    cena: 80,
    mere: 'pribl. 5 × 4 m, višina 2,8 m',
    starost: '3 do 9 let',
    nosilnost: 'do 250 kg',
    znacilnosti: ['Bazen z žogicami vključen', 'Notranja in zunanja uporaba', 'Mreža za varnost ob straneh'],
    slike: [],
    barve: ['#3db34a', '#f6c026', '#e8412c'],
    oblika: 'zogice',
  },
  {
    id: 'veliki-tobogan',
    ime: 'Veliki grad z dvojnim toboganom',
    kratekOpis: 'Naše največje igralo, 6 m dolžine in 3 m višine. Zvezda vsake zabave.',
    opis: 'Velik grad z visokim plezalnim delom in dvojnim toboganom. Najbolj priljubljen za večja praznovanja, šolske dneve in prireditve na prostem, kjer se zabava več otrok hkrati.',
    cena: 100,
    mere: '6 × 4 m, višina 3 m',
    starost: '3 do 9 let',
    nosilnost: 'do 250 kg',
    znacilnosti: ['Največje igralo v ponudbi', 'Odlično za prireditve na prostem', 'Hkrati več otrok'],
    slike: [],
    barve: ['#f08a1c', '#7b4fc9', '#2f6fdb'],
    oblika: 'tobogan',
  },
];

export const DEKORACIJE: Ponudba[] = [
  {
    id: 'rojstni-dan',
    ime: 'Rojstnodnevna dekoracija',
    kratekOpis: 'Baloni, številke in ozadje za fotografiranje v izbranih barvah.',
    opis: 'Postavimo balonski lok ali steno, velike številke za leta in usklajene barve po želji. Lahko jo kombinirate z najemom igrala.',
    cena: null,
    znacilnosti: ['Barve po želji', 'Velike številke', 'Ozadje za fotografije'],
    slike: [],
    barve: ['#e8412c', '#f6c026', '#2f6fdb'],
    oblika: 'baloni',
  },
  {
    id: 'balonski-lok',
    ime: 'Balonski lok in girlande',
    kratekOpis: 'Organski lok ali girlanda za vhod, mizo s sladicami ali oder.',
    opis: 'Balonske girlande in loki različnih dolžin za vhod, sladko mizo ali oder. Primerno za vrtce, šole, otvoritve in zabave.',
    cena: null,
    znacilnosti: ['Različne dolžine', 'Notri in zunaj', 'Postavitev in odvoz'],
    slike: [],
    barve: ['#7b4fc9', '#f39ac0', '#ffffff'],
    oblika: 'baloni',
  },
  {
    id: 'krst-obhajilo',
    ime: 'Krst, obhajilo in birma',
    kratekOpis: 'Nežne pastelne dekoracije za družinska praznovanja.',
    opis: 'Pastelne barve, bele in zlate podrobnosti ter napis z imenom. Dekoracijo uskladimo s prostorom in mizo.',
    cena: null,
    znacilnosti: ['Pastelni toni', 'Napis z imenom', 'Usklajeno s prostorom'],
    slike: [],
    barve: ['#9fd3f5', '#f7d9e3', '#e9c46a'],
    oblika: 'baloni',
  },
  {
    id: 'poroka-obletnica',
    ime: 'Poroke in obletnice',
    kratekOpis: 'Elegantna dekoracija dvorane z baloni v vaših barvah.',
    opis: 'Dekoracija dvorane, vhoda in glavne mize. Uporabljamo elegantne kombinacije barv in kovinske balone.',
    cena: null,
    znacilnosti: ['Elegantne kombinacije', 'Dekoracija dvorane', 'Postavitev in odvoz'],
    slike: [],
    barve: ['#ffffff', '#e9c46a', '#c9a227'],
    oblika: 'baloni',
  },
];

export const KJE_SMO_BILI = ['Kanal', 'Renče', 'Bilje', 'Nova Gorica', 'Solkan', 'Dijaški dom'];

export const VPRASANJA: Vprasanje[] = [
  {
    vprasanje: 'Koliko stane najem?',
    odgovor: 'Cena na dan je od 60 € do 100 €, odvisno od igrala. Za dekoracije pripravimo ponudbo glede na velikost in želje.',
  },
  {
    vprasanje: 'Ali je dostava vključena?',
    odgovor: 'Na območju Nove Gorice je dostava brezplačna. Za ostala območja se dogovorimo.',
  },
  {
    vprasanje: 'Za koliko stare otroke so igrala?',
    odgovor: 'Igrala so namenjena otrokom od 3 do 9 let. Skupna nosilnost je do 250 kg.',
  },
  {
    vprasanje: 'Kaj potrebujem na lokaciji?',
    odgovor: 'Raven prostor, nekaj metrov prostora okoli igrala in električno vtičnico za ventilator. Igrala lahko postavimo notri ali zunaj.',
  },
  {
    vprasanje: 'Kaj če dežuje?',
    odgovor: 'Ob dežju ali močnem vetru igrala ne postavljamo zunaj. Prestavimo ga v notranji prostor ali dogovorimo nov termin.',
  },
  {
    vprasanje: 'Kdo postavi igralo?',
    odgovor: 'Igralo pripeljemo, postavimo, razložimo varno uporabo in ga po koncu tudi pospravimo.',
  },
];
