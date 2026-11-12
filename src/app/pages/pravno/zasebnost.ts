import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Podatki } from '../../services/podatki';

export const PRAVNO_VELJA_OD = '12. 11. 2026';

@Component({
  selector: 'app-zasebnost',
  imports: [RouterLink],
  template: `
    <section class="sekcija">
      <article class="okvir pravno">
        <h1>Politika zasebnosti</h1>
        <p class="velja">Velja od {{ veljaOd }}</p>

        <p>V tej politiki pojasnjujemo, katere osebne podatke zbiramo, zakaj jih potrebujemo, kako dolgo jih hranimo in kakšne pravice imate.
          Podatke obdelujemo v skladu s Splošno uredbo o varstvu podatkov (GDPR, Uredba (EU) 2016/679) in Zakonom o varstvu osebnih podatkov (ZVOP-2).</p>

        <h2>1. Upravljavec osebnih podatkov</h2>
        <div class="okvircek">
          <p><b>{{ ime() }}</b></p>
          <p>{{ sedez() }}</p>
          @if (pj().maticna) { <p>Matična številka: {{ pj().maticna }}</p> }
          @if (pj().davcna) { <p>Davčna številka: {{ pj().davcna }}</p> }
          <p>E-pošta: <a [href]="'mailto:' + pj().email">{{ pj().email }}</a></p>
          <p>Telefon: {{ pj().telefon }}</p>
        </div>
        <p>Pooblaščene osebe za varstvo podatkov nismo dolžni imenovati. Za vsa vprašanja o vaših podatkih nam pišite na zgornji e-naslov.</p>

        <h2>2. Katere podatke zbiramo</h2>
        <p>Ko pošljete rezervacijo ali povpraševanje prek obrazca, telefona, SMS ali e-pošte, obdelujemo:</p>
        <ul>
          <li>ime in priimek,</li>
          <li>telefonsko številko,</li>
          <li>e-poštni naslov, če ga navedete,</li>
          <li>datum in kraj dogodka ter ali bo igralo zunaj ali v notranjem prostoru,</li>
          <li>izbrana igrala in dekoracije,</li>
          <li>vsebino opombe, ki jo sami napišete,</li>
          <li>podatek, da ste potrdili splošne pogoje, ter čas oddaje.</li>
        </ul>
        <p>Prosimo, da v opombo ne pišete podatkov o zdravju ali drugih občutljivih podatkov. Podatkov o otrocih, ki bodo uporabljali igrala, ne zbiramo.</p>

        <h2>3. Namen in pravna podlaga</h2>
        <div class="tabela">
          <table>
            <thead><tr><th>Namen</th><th>Pravna podlaga</th></tr></thead>
            <tbody>
              <tr><td>Obravnava povpraševanja, potrditev termina, dostava in izvedba najema</td><td>Sklenitev in izvajanje pogodbe (6. člen GDPR, točka (b) odstavka 1)</td></tr>
              <tr><td>Pošiljanje e-poštnih obvestil o rezervaciji (potrdilo o prejemu, potrditev ali zavrnitev termina, opomnik dan pred dogodkom), če ste navedli e-pošto</td><td>Sklenitev in izvajanje pogodbe (točka (b))</td></tr>
              <tr><td>Izdaja računa in vodenje poslovnih knjig</td><td>Zakonska obveznost (točka (c)), npr. Zakon o davku na dodano vrednost in davčni predpisi</td></tr>
              <tr><td>Reševanje pritožb in uveljavljanje zahtevkov</td><td>Zakoniti interes (točka (f))</td></tr>
              <tr><td>Varnost spletne strani in admin dostopa</td><td>Zakoniti interes (točka (f))</td></tr>
            </tbody>
          </table>
        </div>
        <p>E-poštna obvestila so izključno storitvena sporočila o vaši rezervaciji. Ne pošiljamo novic ali oglasnih sporočil.</p>
        <p>Podatkov ne uporabljamo za oglaševanje, jih ne prodajamo in na njihovi podlagi ne sprejemamo avtomatiziranih odločitev ali profiliramo.</p>

        <h2>4. Kako dolgo hranimo podatke</h2>
        <ul>
          <li><b>Rezervacije in povpraševanja</b> se iz baze samodejno izbrišejo 12 mesecev po datumu dogodka. Zavrnjena povpraševanja lahko izbrišemo tudi prej.</li>
          <li><b>Računi</b> se hranijo 10 let po koncu leta, na katero se nanašajo, kot zahteva davčna zakonodaja.</li>
          <li><b>Evidenca poslanih e-poštnih obvestil</b> (vrsta sporočila in čas pošiljanja, brez vsebine) se izbriše skupaj z rezervacijo, najpozneje po 12 mesecih.</li>
          <li><b>Sporočila</b> po telefonu, SMS ali e-pošti hranimo, dokler so potrebna za izvedbo najema in morebitne pritožbe, nato jih izbrišemo.</li>
        </ul>

        <h2>5. Kdo ima dostop do podatkov</h2>
        <p>Do rezervacij ima dostop samo ponudnik prek zaščitenega admin dela. Pri delovanju strani nam pomagajo obdelovalci, ki podatke obdelujejo samo po naših navodilih:</p>
        <ul>
          <li><b>Supabase Inc.</b> gosti bazo rezervacij in fotografije. Podatki so shranjeni v podatkovnem centru v Frankfurtu (Nemčija, EU).</li>
          <li><b>Sendinblue SAS (Brevo)</b>, Pariz, Francija (EU), pošilja e-poštna obvestila o rezervaciji. Prejme vaše ime, e-poštni naslov in podatke o rezervaciji, ki so v sporočilu.</li>
          <li><b>GitHub Inc.</b> (GitHub Pages) gosti spletno stran. Za zagotavljanje varnosti in delovanja lahko začasno beleži IP-naslov obiskovalca.</li>
        </ul>
        <p>Če ponudnik ali njegovi podobdelovalci podatke obdelujejo zunaj Evropskega gospodarskega prostora, je prenos zavarovan s standardnimi pogodbenimi klavzulami Evropske komisije ali z okvirom EU-ZDA za zasebnost podatkov.
          Podatke lahko posredujemo tudi državnim organom, kadar to zahteva zakon.</p>

        <h2>6. Piškotki in sledenje</h2>
        <p>Spletna stran <b>ne uporablja analitičnih, oglaševalskih ali sledilnih piškotkov</b> in ne nalaga vsebin tretjih oseb. Pisave so shranjene na našem strežniku,
          povezavi na Facebook in Instagram pa sta navadni povezavi, ki ob ogledu strani ne pošiljata podatkov tem omrežjem.
          Zato pasica s soglasjem za piškotke ni potrebna.</p>
        <p>Samo pri prijavi v admin del brskalnik shrani podatek o seji. Ta je nujen za prijavo in se ne uporablja za sledenje.</p>

        <h2>7. Vaše pravice</h2>
        <p>Kadarkoli lahko zahtevate:</p>
        <ul>
          <li>dostop do svojih podatkov in kopijo,</li>
          <li>popravek netočnih podatkov,</li>
          <li>izbris podatkov, razen kadar jih moramo hraniti po zakonu,</li>
          <li>omejitev obdelave,</li>
          <li>prenos podatkov v strukturirani obliki,</li>
          <li>ugovor obdelavi, ki temelji na zakonitem interesu.</li>
        </ul>
        <p>Zahtevo pošljite na <a [href]="'mailto:' + pj().email">{{ pj().email }}</a>. Odgovorili vam bomo brez nepotrebnega odlašanja, najpozneje v enem mesecu. Uveljavljanje pravic je brezplačno.</p>
        <p>Če menite, da vaše podatke obdelujemo v nasprotju s predpisi, se lahko pritožite pri nadzornem organu:</p>
        <div class="okvircek">
          <p><b>Informacijski pooblaščenec Republike Slovenije</b></p>
          <p>Dunajska cesta 22, 1000 Ljubljana</p>
          <p>E-pošta: <a href="mailto:gp.ip@ip-rs.si">gp.ip&#64;ip-rs.si</a> · <a href="https://www.ip-rs.si" target="_blank" rel="noopener">www.ip-rs.si</a></p>
        </div>

        <h2>8. Varnost</h2>
        <p>Stran deluje prek šifrirane povezave (HTTPS). Dostop do rezervacij je omejen na prijavljene skrbnike, pravila v bazi pa preprečujejo, da bi obiskovalci brali tuje podatke.</p>

        <h2>9. Spremembe</h2>
        <p>Politiko lahko posodobimo, na primer ob spremembi storitev ali predpisov. Veljavna različica je vedno objavljena na tej strani z datumom začetka veljavnosti.
          Glej tudi <a routerLink="/pogoji">splošne pogoje najema</a>.</p>
      </article>
    </section>
  `,
})
export class Zasebnost {
  p = inject(Podatki);
  pj = this.p.podjetje;
  veljaOd = PRAVNO_VELJA_OD;
  ime = computed(() => this.pj().pravnoIme || this.pj().ime);
  sedez = computed(() => this.pj().sedez || this.pj().naslov);
}
