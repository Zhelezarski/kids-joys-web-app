// Privzeti podatki. Uporabijo se, dokler baza (Supabase) ni povezana,
// in kot začetna vsebina baze (supabase/seed.sql je ustvarjen iz te datoteke).
// Ko je baza povezana, vse urejaš v admin delu na /admin.

import { Nastavitve, Ponudba } from './models';

export const PRIVZETE_NASTAVITVE: Nastavitve = {
  podjetje: {
    ime: 'Napihljiva Igrala Kids Joy',
    kratkoIme: 'Kids Joy',
    slogan: 'Oddajamo v najem napihljiva igrala za vse priložnosti in krasimo prostore z baloni.',
    telefon: '070 258 245',
    email: 'kidsjoy.igrala@gmail.com',
    instagram: 'kids_joy_a2',
    facebook: 'https://www.facebook.com/share/1J8Crnadih/',
    naslov: 'Kromberk, Solkan, 5000 Nova Gorica',
    obmocje: 'Goriška in okolica',
    delovniCas: 'Vedno odprto, pokličite kadarkoli',
    dostava: 'Gratis v Novi Gorici, drugje po dogovoru',
    cenaOd: 60,
    cenaDo: 100,
    pravnoIme: '',
    sedez: '',
    maticna: '',
    davcna: '',
    ddvZavezanec: false,
  },
  hero: {
    naslov: 'Napihljiva igrala in dekoracije z baloni za nepozabne zabave',
    podnaslov: 'Pripeljemo, postavimo in pospravimo, vi pa uživate.',
  },
  obvestilo: '',
  prednosti: [
    { ikona: '🛡️', naslov: 'Varni in kakovostni', opis: 'Redno čiščenje in dezinfekcija igral.' },
    { ikona: '🎉', naslov: 'Za vse priložnosti', opis: 'Rojstni dnevi, praznovanja, zabave in šole.' },
    { ikona: '🏠', naslov: 'Notri in zunaj', opis: 'Primerni za dvorane, vrtce in vrtove.' },
    { ikona: '⚡', naslov: 'Hitra postavitev', opis: 'Pripeljemo, postavimo in pospravimo mi.' },
  ],
  pogojiOdpovedi:
    'Rezervacijo lahko brezplačno odpoveste najpozneje 2 dni pred dogodkom. Pri poznejši odpovedi vam lahko zaračunamo stroške, ki so nam že nastali (npr. prevoz), največ do višine 30 % cene najema.',
  kraji: ['Kanal', 'Renče', 'Bilje', 'Nova Gorica', 'Solkan', 'Dijaški dom'],
  vprasanja: [
    { vprasanje: 'Koliko stane najem?', odgovor: 'Cena na dan je od 60 € do 100 €, odvisno od igrala. Za dekoracije pripravimo ponudbo glede na velikost in želje.' },
    { vprasanje: 'Ali je dostava vključena?', odgovor: 'Na območju Nove Gorice je dostava brezplačna. Za ostala območja se dogovorimo.' },
    { vprasanje: 'Za koliko stare otroke so igrala?', odgovor: 'Igrala so namenjena otrokom od 3 do 9 let. Skupna nosilnost je do 250 kg.' },
    { vprasanje: 'Kaj potrebujem na lokaciji?', odgovor: 'Raven prostor, nekaj metrov prostora okoli igrala in električno vtičnico za ventilator. Igrala lahko postavimo notri ali zunaj.' },
    { vprasanje: 'Kaj če dežuje?', odgovor: 'Ob dežju ali močnem vetru igrala ne postavljamo zunaj. Prestavimo ga v notranji prostor ali dogovorimo nov termin.' },
    { vprasanje: 'Kdo postavi igralo?', odgovor: 'Igralo pripeljemo, postavimo, razložimo varno uporabo in ga po koncu tudi pospravimo.' },
  ],
};

const igralo = (p: Partial<Ponudba> & Pick<Ponudba, 'slug' | 'ime'>): Ponudba => ({
  kategorija: 'igralo', kratek_opis: '', opis: '', cena: null, mere: '', starost: '3 do 9 let', nosilnost: 'do 250 kg',
  znacilnosti: [], slike: [], barve: [], oblika: 'grad', aktivno: true, vrstni_red: 0, ...p,
});
const dekoracija = (p: Partial<Ponudba> & Pick<Ponudba, 'slug' | 'ime'>): Ponudba =>
  igralo({ kategorija: 'dekoracija', starost: '', nosilnost: '', oblika: 'baloni', ...p });

export const PRIVZETA_PONUDBA: Ponudba[] = [
  igralo({
    slug: 'mavricni-grad', ime: 'Mavrični grad s toboganom', vrstni_red: 1, cena: 60,
    kratek_opis: 'Klasični grad za skakanje z manjšim toboganom. Idealen za dvorane.',
    opis: 'Barvit grad, ki ga otroci obožujejo. Ima prostor za skakanje in tobogan, zato je odličen za rojstne dneve doma ali v dvorani. Zaradi kompaktne velikosti ga postavimo tudi v manjše prostore.',
    mere: 'pribl. 4 × 3,5 m, višina 2,5 m',
    znacilnosti: ['Primeren za notranjo uporabo', 'Hitra postavitev', 'Mreža za varnost ob straneh'],
    barve: ['#e8412c', '#2f6fdb', '#f6c026'], oblika: 'grad',
  }),
  igralo({
    slug: 'grad-z-zogicami', ime: 'Grad s toboganom in bazenom žogic', vrstni_red: 2, cena: 80,
    kratek_opis: 'Skakanje, tobogan in bazen z barvnimi žogicami v enem.',
    opis: 'Igralo z dvema doživetjema: najprej skakanje in plezanje, nato spust po toboganu naravnost v bazen z barvnimi žogicami. Žogice so vključene v najem.',
    mere: 'pribl. 5 × 4 m, višina 2,8 m',
    znacilnosti: ['Bazen z žogicami vključen', 'Notranja in zunanja uporaba', 'Mreža za varnost ob straneh'],
    barve: ['#3db34a', '#f6c026', '#e8412c'], oblika: 'zogice',
  }),
  igralo({
    slug: 'veliki-tobogan', ime: 'Veliki grad z dvojnim toboganom', vrstni_red: 3, cena: 100,
    kratek_opis: 'Naše največje igralo, 6 m dolžine in 3 m višine. Zvezda vsake zabave.',
    opis: 'Velik grad z visokim plezalnim delom in dvojnim toboganom. Najbolj priljubljen za večja praznovanja, šolske dneve in prireditve na prostem, kjer se zabava več otrok hkrati.',
    mere: '6 × 4 m, višina 3 m',
    znacilnosti: ['Največje igralo v ponudbi', 'Odlično za prireditve na prostem', 'Hkrati več otrok'],
    barve: ['#f08a1c', '#7b4fc9', '#2f6fdb'], oblika: 'tobogan',
  }),
  dekoracija({
    slug: 'rojstni-dan', ime: 'Rojstnodnevna dekoracija', vrstni_red: 1,
    kratek_opis: 'Baloni, številke in ozadje za fotografiranje v izbranih barvah.',
    opis: 'Postavimo balonski lok ali steno, velike številke za leta in usklajene barve po želji. Lahko jo kombinirate z najemom igrala.',
    znacilnosti: ['Barve po želji', 'Velike številke', 'Ozadje za fotografije'], barve: ['#e8412c', '#f6c026', '#2f6fdb'],
  }),
  dekoracija({
    slug: 'balonski-lok', ime: 'Balonski lok in girlande', vrstni_red: 2,
    kratek_opis: 'Organski lok ali girlanda za vhod, mizo s sladicami ali oder.',
    opis: 'Balonske girlande in loki različnih dolžin za vhod, sladko mizo ali oder. Primerno za vrtce, šole, otvoritve in zabave.',
    znacilnosti: ['Različne dolžine', 'Notri in zunaj', 'Postavitev in odvoz'], barve: ['#7b4fc9', '#f39ac0', '#ffffff'],
  }),
  dekoracija({
    slug: 'krst-obhajilo', ime: 'Krst, obhajilo in birma', vrstni_red: 3,
    kratek_opis: 'Nežne pastelne dekoracije za družinska praznovanja.',
    opis: 'Pastelne barve, bele in zlate podrobnosti ter napis z imenom. Dekoracijo uskladimo s prostorom in mizo.',
    znacilnosti: ['Pastelni toni', 'Napis z imenom', 'Usklajeno s prostorom'], barve: ['#9fd3f5', '#f7d9e3', '#e9c46a'],
  }),
  dekoracija({
    slug: 'poroka-obletnica', ime: 'Poroke in obletnice', vrstni_red: 4,
    kratek_opis: 'Elegantna dekoracija dvorane z baloni v vaših barvah.',
    opis: 'Dekoracija dvorane, vhoda in glavne mize. Uporabljamo elegantne kombinacije barv in kovinske balone.',
    znacilnosti: ['Elegantne kombinacije', 'Dekoracija dvorane', 'Postavitev in odvoz'], barve: ['#ffffff', '#e9c46a', '#c9a227'],
  }),
];
