// Kids Joy – e-poštna obvestila (Supabase Edge Function "obvestila").
//
// Kliče jo baza (sprožilec na tabeli rezervacije in dnevni pg_cron) prek pg_net,
// admin pa jo kliče za testno sporočilo. E-pošto pošilja prek Brevo (brevo.com, EU).
//
// Skrivnosti (Edge Functions → Secrets):
//   BREVO_API_KEY       obvezno, API ključ iz Brevo (SMTP & API → API keys)
//   EMAIL_POSILJATELJ   neobvezno, potrjen pošiljatelj v Brevo (privzeto e-pošta podjetja iz nastavitev)
//   STRAN_URL           neobvezno, naslov strani (privzeto GitHub Pages)
//
// Dogodki (telo zahteve { dogodek, id }):
//   nova       nova rezervacija s strani → lastniku obvestilo, stranki potrdilo o prejemu
//   potrjena   rezervacija potrjena → stranki potrditev
//   zavrnjena  rezervacija zavrnjena → stranki obvestilo
//   dnevno     vsak dan popoldne → stranki opomnik za jutrišnji dogodek, lastniku dnevni povzetek
//   test       testno sporočilo lastniku (samo prijavljen admin)

import { createClient } from 'jsr:@supabase/supabase-js@2';

type Postavka = { slug: string; ime: string; kategorija: string; cena: number | null };
type Rez = {
  id: string; created_at: string; datum: string; kraj: string; prostor: string; ime: string; telefon: string;
  email: string; opomba: string; postavke: Postavka[]; skupaj: number; status: string;
};
type Obvestila = {
  email: string; lastnikNova: boolean; lastnikDnevni: boolean;
  strankaPrejeta: boolean; strankaStatus: boolean; strankaOpomnik: boolean;
};
type Podjetje = { ime: string; kratkoIme: string; telefon: string; email: string; pravnoIme: string; sedez: string };
type Nast = { podjetje: Podjetje; obvestila: Obvestila; pogojiOdpovedi: string };

const PRIVZETO: Nast = {
  podjetje: { ime: 'Napihljiva Igrala Kids Joy', kratkoIme: 'Kids Joy', telefon: '070 258 245', email: 'kidsjoy.igrala@gmail.com', pravnoIme: '', sedez: '' },
  obvestila: { email: '', lastnikNova: true, lastnikDnevni: true, strankaPrejeta: true, strankaStatus: true, strankaOpomnik: true },
  pogojiOdpovedi: '',
};

const env = (k: string) => Deno.env.get(k) ?? '';
const STRAN = (env('STRAN_URL') || 'https://zhelezarski.github.io/kids-joys-web-app').replace(/\/$/, '');
const db = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } });

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const odgovor = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

// ---------- Pomožne ----------
const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** YYYY-MM-DD v slovenskem času (+n dni). */
function dan(n = 0): string {
  const d = new Date(Date.now() + n * 86400000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Ljubljana' }).format(d);
}

function datumSl(iso: string): string {
  return new Date(iso.slice(0, 10) + 'T12:00:00Z').toLocaleDateString('sl-SI', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}

function telLink(t: string): string {
  const d = t.replace(/[^\d+]/g, '');
  if (d.startsWith('+')) return d;
  if (d.startsWith('00')) return '+' + d.slice(2);
  if (d.startsWith('0')) return '+386' + d.slice(1);
  return d;
}

const veljavenEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

async function nastavitve(): Promise<Nast> {
  const { data } = await db.from('nastavitve').select('podatki').eq('id', 1).maybeSingle();
  const p = (data?.podatki ?? {}) as Partial<Nast>;
  return {
    podjetje: { ...PRIVZETO.podjetje, ...(p.podjetje ?? {}) },
    obvestila: { ...PRIVZETO.obvestila, ...(p.obvestila ?? {}) },
    pogojiOdpovedi: p.pogojiOdpovedi ?? '',
  };
}

async function rezervacija(id: string): Promise<Rez | null> {
  const { data } = await db.from('rezervacije').select('*').eq('id', id).maybeSingle();
  return data as Rez | null;
}

async function zePoslano(rezId: string | null, vrsta: string, odDne?: string): Promise<boolean> {
  let q = db.from('email_dnevnik').select('id', { count: 'exact', head: true }).eq('vrsta', vrsta).eq('uspeh', true);
  q = rezId ? q.eq('rezervacija_id', rezId) : q.is('rezervacija_id', null);
  if (odDne) q = q.gte('created_at', odDne + 'T00:00:00+01:00');
  const { count } = await q;
  return (count ?? 0) > 0;
}

// ---------- Pošiljanje ----------
type Sporocilo = { za: string; zaIme?: string; odgovoriNa?: string; zadeva: string; html: string; besedilo: string };

async function poslji(n: Nast, s: Sporocilo, vrsta: string, rezId: string | null): Promise<{ ok: boolean; napaka?: string }> {
  let napaka = '';
  const kljuc = env('BREVO_API_KEY');
  if (!kljuc) napaka = 'BREVO_API_KEY ni nastavljen (Supabase → Edge Functions → Secrets).';
  else if (!veljavenEmail(s.za)) napaka = `Neveljaven e-naslov prejemnika: ${s.za}`;
  else {
    try {
      const r = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': kljuc, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          sender: { name: n.podjetje.kratkoIme || n.podjetje.ime, email: env('EMAIL_POSILJATELJ') || n.podjetje.email },
          to: [{ email: s.za.trim(), ...(s.zaIme ? { name: s.zaIme } : {}) }],
          ...(s.odgovoriNa && veljavenEmail(s.odgovoriNa) ? { replyTo: { email: s.odgovoriNa.trim() } } : {}),
          subject: s.zadeva,
          htmlContent: s.html,
          textContent: s.besedilo,
          tags: ['kidsjoy', vrsta],
        }),
      });
      if (!r.ok) napaka = `Brevo ${r.status}: ${(await r.text()).slice(0, 300)}`;
    } catch (e) {
      napaka = 'Brevo ni dosegljiv: ' + (e as Error).message;
    }
  }
  await db.from('email_dnevnik').insert({ rezervacija_id: rezId, vrsta, uspeh: !napaka, napaka });
  if (napaka) console.error(`[${vrsta}] ${napaka}`);
  return napaka ? { ok: false, napaka } : { ok: true };
}

// ---------- Predloge ----------
function ovoj(n: Nast, naslov: string, telo: string, zaStranko: boolean): string {
  const pj = n.podjetje;
  const noga = zaStranko
    ? `${esc(pj.pravnoIme || pj.ime)}${pj.sedez ? ', ' + esc(pj.sedez) : ''}<br>
       Tel. <a href="tel:${telLink(pj.telefon)}" style="color:#6b6b6b">${esc(pj.telefon)}</a> ·
       <a href="mailto:${esc(pj.email)}" style="color:#6b6b6b">${esc(pj.email)}</a><br>
       To sporočilo ste prejeli, ker ste oddali rezervacijo na <a href="${STRAN}/" style="color:#6b6b6b">naši spletni strani</a>.
       <a href="${STRAN}/zasebnost" style="color:#6b6b6b">Politika zasebnosti</a>`
    : `Samodejno obvestilo spletne strani ${esc(pj.kratkoIme)}. Obvestila vklopiš ali izklopiš v
       <a href="${STRAN}/admin/nastavitve" style="color:#6b6b6b">admin → Nastavitve</a>.`;
  return `<!doctype html><html lang="sl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;background:#fdf6ec;font-family:Arial,Helvetica,sans-serif;color:#2b2b2b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6ec;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#e8412c;padding:18px 24px;color:#ffffff;font-size:20px;font-weight:bold">🎈 ${esc(pj.kratkoIme || pj.ime)}</td></tr>
<tr><td style="padding:24px;font-size:15px;line-height:1.55">
<h1 style="font-size:21px;margin:0 0 14px">${naslov}</h1>
${telo}
</td></tr>
<tr><td style="padding:16px 24px;background:#faf3e8;color:#6b6b6b;font-size:12px;line-height:1.5">${noga}</td></tr>
</table></td></tr></table></body></html>`;
}

const gumb = (href: string, besedilo: string) =>
  `<p style="margin:20px 0"><a href="${href}" style="display:inline-block;background:#e8412c;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:999px">${besedilo}</a></p>`;

function tabela(vrstice: [string, string][]): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:8px 0 4px">${vrstice
    .map(([k, v]) => `<tr><td style="padding:6px 10px 6px 0;color:#6b6b6b;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:6px 0;font-weight:bold">${v}</td></tr>`)
    .join('')}</table>`;
}

const prostor = (r: Rez) => (r.prostor === 'notri' ? 'v notranjem prostoru' : 'zunaj');
const cenaPostavke = (p: Postavka) => (p.cena === null || p.cena === undefined ? 'po dogovoru' : `${p.cena} €`);
const seznamHtml = (r: Rez) => r.postavke.map((p) => `${esc(p.ime)} <span style="color:#6b6b6b;font-weight:normal">(${cenaPostavke(p)})</span>`).join('<br>');
const seznamTxt = (r: Rez) => r.postavke.map((p) => `  - ${p.ime} (${cenaPostavke(p)})`).join('\n');
const skupaj = (r: Rez) => {
  const s = Number(r.skupaj) || 0;
  const dog = r.postavke.some((p) => p.cena === null);
  return s ? `${s} €${dog ? ' + postavke po dogovoru' : ''}` : 'po dogovoru';
};

function podrobnosti(r: Rez, zaLastnika: boolean): { html: string; txt: string } {
  const v: [string, string][] = [
    ['Datum', esc(datumSl(r.datum))],
    ['Kraj', `${esc(r.kraj)} (${prostor(r)})`],
    ['Izbrano', seznamHtml(r)],
    ['Okvirna cena', esc(skupaj(r))],
  ];
  const t = [`Datum: ${datumSl(r.datum)}`, `Kraj: ${r.kraj} (${prostor(r)})`, `Izbrano:\n${seznamTxt(r)}`, `Okvirna cena: ${skupaj(r)}`];
  if (zaLastnika) {
    v.push(['Ime', esc(r.ime)], ['Telefon', `<a href="tel:${telLink(r.telefon)}" style="color:#2f6fdb">${esc(r.telefon)}</a>`]);
    t.push(`Ime: ${r.ime}`, `Telefon: ${r.telefon}`);
    if (r.email) { v.push(['E-pošta', `<a href="mailto:${esc(r.email)}" style="color:#2f6fdb">${esc(r.email)}</a>`]); t.push(`E-pošta: ${r.email}`); }
  }
  if (r.opomba) { v.push(['Opomba', esc(r.opomba).replace(/\n/g, '<br>')]); t.push(`Opomba: ${r.opomba}`); }
  return { html: tabela(v), txt: t.join('\n') };
}

const kontaktTxt = (n: Nast) => `${n.podjetje.kratkoIme || n.podjetje.ime}\nTel. ${n.podjetje.telefon} · ${n.podjetje.email}`;
const kontaktHtml = (n: Nast) =>
  `<p>Za vprašanja nas pokličite na <a href="tel:${telLink(n.podjetje.telefon)}" style="color:#2f6fdb">${esc(n.podjetje.telefon)}</a> ali odgovorite na to sporočilo.</p>
   <p>Lep pozdrav,<br>${esc(n.podjetje.kratkoIme || n.podjetje.ime)}</p>`;

function lastnikNova(n: Nast, r: Rez): Sporocilo {
  const d = podrobnosti(r, true);
  const povezava = `${STRAN}/admin/rezervacije?f=nove`;
  return {
    za: n.obvestila.email || n.podjetje.email,
    odgovoriNa: r.email || undefined,
    zadeva: `🎉 Nova rezervacija: ${datumSl(r.datum)} – ${r.kraj}`,
    html: ovoj(n, 'Nova rezervacija s spletne strani',
      `<p><b>${esc(r.ime)}</b> želi rezervirati za <b>${esc(datumSl(r.datum))}</b>.</p>${d.html}
       ${gumb(povezava, 'Potrdi ali zavrni v adminu')}
       <p style="color:#6b6b6b;font-size:13px">Stranko lahko pokličete ali ji odgovorite kar na to sporočilo${r.email ? '' : ' (e-pošte ni navedla)'}.
       Ko rezervacijo v adminu potrdite ali zavrnete, stranka samodejno dobi e-pošto (če jo je navedla).</p>`, false),
    besedilo: `Nova rezervacija s spletne strani\n\n${d.txt}\n\nPotrdi ali zavrni: ${povezava}`,
  };
}

function strankaPrejeta(n: Nast, r: Rez): Sporocilo {
  const d = podrobnosti(r, false);
  return {
    za: r.email, zaIme: r.ime, odgovoriNa: n.podjetje.email,
    zadeva: `Prejeli smo vaše povpraševanje za ${datumSl(r.datum)}`,
    html: ovoj(n, `Hvala, ${esc(r.ime.split(' ')[0])}! 🎈`,
      `<p>Prejeli smo vaše povpraševanje. <b>Rezervacija še ni potrjena</b>: preverili bomo termin in vam čim prej odgovorili s potrditvijo.</p>
       ${d.html}${kontaktHtml(n)}`, true),
    besedilo: `Hvala, prejeli smo vaše povpraševanje. Rezervacija še ni potrjena: preverili bomo termin in vam čim prej odgovorili.\n\n${d.txt}\n\n${kontaktTxt(n)}`,
  };
}

function strankaPotrjena(n: Nast, r: Rez): Sporocilo {
  const d = podrobnosti(r, false);
  const odpoved = n.pogojiOdpovedi
    ? `<p style="color:#6b6b6b;font-size:13px"><b>Odpoved:</b> ${esc(n.pogojiOdpovedi)} Več v <a href="${STRAN}/pogoji" style="color:#2f6fdb">splošnih pogojih najema</a>.</p>`
    : `<p style="color:#6b6b6b;font-size:13px">Več v <a href="${STRAN}/pogoji" style="color:#2f6fdb">splošnih pogojih najema</a>.</p>`;
  return {
    za: r.email, zaIme: r.ime, odgovoriNa: n.podjetje.email,
    zadeva: `✅ Rezervacija potrjena: ${datumSl(r.datum)}`,
    html: ovoj(n, 'Vaša rezervacija je potrjena! 🎉',
      `<p>Pozdravljeni ${esc(r.ime)}, z veseljem potrjujemo vašo rezervacijo.</p>${d.html}
       <p>Igralo pripeljemo, postavimo in po koncu pospravimo. Na lokaciji potrebujemo raven prostor in električno vtičnico.
       Dan pred dogodkom vam pošljemo kratek opomnik.</p>${odpoved}${kontaktHtml(n)}`, true),
    besedilo: `Vaša rezervacija je potrjena!\n\n${d.txt}\n\nNa lokaciji potrebujemo raven prostor in električno vtičnico.${n.pogojiOdpovedi ? '\n\nOdpoved: ' + n.pogojiOdpovedi : ''}\nSplošni pogoji: ${STRAN}/pogoji\n\n${kontaktTxt(n)}`,
  };
}

function strankaZavrnjena(n: Nast, r: Rez): Sporocilo {
  return {
    za: r.email, zaIme: r.ime, odgovoriNa: n.podjetje.email,
    zadeva: `Rezervacija za ${datumSl(r.datum)}`,
    html: ovoj(n, 'Žal termin ni na voljo',
      `<p>Pozdravljeni ${esc(r.ime)}, hvala za vaše povpraševanje za <b>${esc(datumSl(r.datum))}</b> (${esc(r.kraj)}).
       Žal vaše rezervacije tokrat ne moremo potrditi.</p>
       <p>Pokličite nas in z veseljem poiščemo drug termin ali drugo igralo.</p>
       ${gumb(`${STRAN}/rezervacija`, 'Izberi drug termin')}${kontaktHtml(n)}`, true),
    besedilo: `Hvala za povpraševanje za ${datumSl(r.datum)} (${r.kraj}). Žal rezervacije tokrat ne moremo potrditi. Pokličite nas in poiščemo drug termin.\n${STRAN}/rezervacija\n\n${kontaktTxt(n)}`,
  };
}

function strankaOpomnik(n: Nast, r: Rez): Sporocilo {
  const d = podrobnosti(r, false);
  return {
    za: r.email, zaIme: r.ime, odgovoriNa: n.podjetje.email,
    zadeva: `Jutri se vidimo! 🎈 ${r.kraj}`,
    html: ovoj(n, 'Jutri je zabava! 🎈',
      `<p>Pozdravljeni ${esc(r.ime)}, samo kratek opomnik za vaš jutrišnji dogodek.</p>${d.html}
       <p><b>Prosimo, pripravite:</b></p>
       <ul style="padding-left:20px;margin:0 0 12px">
         <li>raven prostor z nekaj metri prostora okoli igrala,</li>
         <li>električno vtičnico v bližini (za ventilator),</li>
         <li>dostop do mesta postavitve.</li>
       </ul>
       <p>Ob dežju ali močnem vetru igrala ne postavljamo zunaj. V tem primeru se dogovorimo za notranji prostor ali nov termin.</p>
       ${kontaktHtml(n)}`, true),
    besedilo: `Opomnik za vaš jutrišnji dogodek.\n\n${d.txt}\n\nPripravite raven prostor, električno vtičnico v bližini in dostop do mesta postavitve. Ob dežju ali vetru igrala ne postavljamo zunaj.\n\n${kontaktTxt(n)}`,
  };
}

function lastnikDnevni(n: Nast, jutri: Rez[], cakajo: Rez[]): Sporocilo {
  const vrsticaHtml = (r: Rez) =>
    `<tr><td style="padding:8px 0;border-top:1px solid #eee4d6;vertical-align:top"><b>${esc(datumSl(r.datum))}</b><br>
     ${esc(r.ime)} · <a href="tel:${telLink(r.telefon)}" style="color:#2f6fdb">${esc(r.telefon)}</a><br>
     📍 ${esc(r.kraj)} (${prostor(r)})<br><span style="color:#6b6b6b">${r.postavke.map((p) => esc(p.ime)).join(', ')}</span>
     ${r.opomba ? `<br><span style="color:#6b6b6b">💬 ${esc(r.opomba)}</span>` : ''}</td></tr>`;
  const vrsticaTxt = (r: Rez) => `- ${datumSl(r.datum)}: ${r.ime}, ${r.telefon}, ${r.kraj} (${prostor(r)}) – ${r.postavke.map((p) => p.ime).join(', ')}`;
  const blok = (naslov: string, s: Rez[]) =>
    s.length ? `<h2 style="font-size:17px;margin:18px 0 4px">${naslov}</h2><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${s.map(vrsticaHtml).join('')}</table>` : '';
  const deli: string[] = [];
  if (jutri.length) deli.push(`${jutri.length} ${jutri.length === 1 ? 'dogodek' : 'dogodki'} jutri`);
  if (cakajo.length) deli.push(`${cakajo.length} čaka na potrditev`);
  return {
    za: n.obvestila.email || n.podjetje.email,
    zadeva: `📅 Kids Joy: ${deli.join(', ')}`,
    html: ovoj(n, 'Dnevni pregled',
      `${blok(`🚚 Jutri (${esc(datumSl(dan(1)))})`, jutri)}${blok('⏳ Čakajo na potrditev', cakajo)}${gumb(`${STRAN}/admin/rezervacije`, 'Odpri rezervacije')}`, false),
    besedilo: [
      jutri.length ? `JUTRI:\n${jutri.map(vrsticaTxt).join('\n')}` : '',
      cakajo.length ? `ČAKAJO NA POTRDITEV:\n${cakajo.map(vrsticaTxt).join('\n')}` : '',
      `Rezervacije: ${STRAN}/admin/rezervacije`,
    ].filter(Boolean).join('\n\n'),
  };
}

function testno(n: Nast): Sporocilo {
  return {
    za: n.obvestila.email || n.podjetje.email,
    zadeva: '✅ Kids Joy: testno sporočilo',
    html: ovoj(n, 'E-poštna obvestila delujejo 🎉',
      `<p>To je testno sporočilo iz admin dela. Če ga berete, je pošiljanje pravilno nastavljeno.</p>
       <p>Vklopljena obvestila:</p><ul style="padding-left:20px">
       ${n.obvestila.lastnikNova ? '<li>nova rezervacija (vam)</li>' : ''}
       ${n.obvestila.lastnikDnevni ? '<li>dnevni pregled (vam)</li>' : ''}
       ${n.obvestila.strankaPrejeta ? '<li>potrdilo o prejemu (stranki)</li>' : ''}
       ${n.obvestila.strankaStatus ? '<li>potrditev ali zavrnitev (stranki)</li>' : ''}
       ${n.obvestila.strankaOpomnik ? '<li>opomnik dan pred dogodkom (stranki)</li>' : ''}</ul>`, false),
    besedilo: 'To je testno sporočilo iz admin dela. Pošiljanje e-pošte deluje.',
  };
}

// ---------- Dogodki ----------
async function obdelaj(dogodek: string, id: string | null): Promise<unknown> {
  const n = await nastavitve();
  const o = n.obvestila;
  const rezultati: Record<string, unknown> = {};
  const enkrat = async (r: Rez, vrsta: string, s: () => Sporocilo) => {
    if (await zePoslano(r.id, vrsta)) { rezultati[vrsta] = 'že poslano'; return; }
    rezultati[vrsta] = await poslji(n, s(), vrsta, r.id);
  };

  if (dogodek === 'test') return poslji(n, testno(n), 'test', null);

  if (dogodek === 'dnevno') {
    const { data: j } = await db.from('rezervacije').select('*').eq('status', 'potrjena').eq('datum', dan(1));
    const { data: c } = await db.from('rezervacije').select('*').eq('status', 'nova').gte('datum', dan(0)).order('datum');
    const jutri = (j ?? []) as Rez[];
    const cakajo = (c ?? []) as Rez[];
    if (o.strankaOpomnik) for (const r of jutri) if (r.email) await enkrat(r, 'stranka_opomnik', () => strankaOpomnik(n, r));
    if (o.lastnikDnevni && (jutri.length || cakajo.length) && !(await zePoslano(null, 'lastnik_dnevni', dan(0)))) {
      rezultati.lastnik_dnevni = await poslji(n, lastnikDnevni(n, jutri, cakajo), 'lastnik_dnevni', null);
    }
    return rezultati;
  }

  if (!id) return { napaka: 'manjka id' };
  const r = await rezervacija(id);
  if (!r) return { napaka: 'rezervacija ne obstaja' };
  r.postavke = Array.isArray(r.postavke) ? r.postavke : [];

  if (dogodek === 'nova') {
    if (o.lastnikNova) await enkrat(r, 'lastnik_nova', () => lastnikNova(n, r));
    if (o.strankaPrejeta && r.email) await enkrat(r, 'stranka_prejeta', () => strankaPrejeta(n, r));
  } else if (dogodek === 'potrjena' && r.status === 'potrjena') {
    if (o.strankaStatus && r.email) await enkrat(r, 'stranka_potrjena', () => strankaPotrjena(n, r));
  } else if (dogodek === 'zavrnjena' && r.status === 'zavrnjena') {
    if (o.strankaStatus && r.email) await enkrat(r, 'stranka_zavrnjena', () => strankaZavrnjena(n, r));
  }
  return rezultati;
}

// ---------- Avtorizacija ----------
let skrivnost: string | null = null;
async function veljavnaSkrivnost(prejeta: string | null): Promise<boolean> {
  if (!prejeta) return false;
  if (skrivnost === null) {
    const { data } = await db.rpc('obvestila_skrivnost');
    skrivnost = typeof data === 'string' ? data : '';
  }
  return !!skrivnost && prejeta === skrivnost;
}

async function jeAdmin(req: Request): Promise<boolean> {
  const zeton = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!zeton) return false;
  const { data } = await db.auth.getUser(zeton);
  if (!data.user) return false;
  const { count } = await db.from('admini').select('user_id', { count: 'exact', head: true }).eq('user_id', data.user.id);
  return (count ?? 0) > 0;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return odgovor({ napaka: 'samo POST' }, 405);

  let telo: { dogodek?: string; id?: string | null } = {};
  try { telo = await req.json(); } catch { /* prazno telo */ }
  const dogodek = String(telo.dogodek ?? '');

  if (dogodek === 'test') {
    if (!(await jeAdmin(req))) return odgovor({ napaka: 'Samo za admina.' }, 401);
  } else if (!['nova', 'potrjena', 'zavrnjena', 'dnevno'].includes(dogodek)) {
    return odgovor({ napaka: 'neznan dogodek' }, 400);
  } else if (!(await veljavnaSkrivnost(req.headers.get('x-kidsjoy-skrivnost')))) {
    return odgovor({ napaka: 'ni dovoljeno' }, 401);
  }

  try {
    return odgovor(await obdelaj(dogodek, telo.id ?? null));
  } catch (e) {
    console.error(e);
    return odgovor({ napaka: (e as Error).message }, 500);
  }
});
