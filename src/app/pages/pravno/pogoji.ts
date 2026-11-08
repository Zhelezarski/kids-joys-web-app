import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Podatki } from '../../services/podatki';
import { PRAVNO_VELJA_OD } from './zasebnost';

@Component({
  selector: 'app-pogoji',
  imports: [RouterLink],
  template: `
    <section class="sekcija">
      <article class="okvir pravno">
        <h1>Splošni pogoji najema</h1>
        <p class="velja">Veljajo od {{ veljaOd }}</p>

        <h2>1. Splošno</h2>
        <p>Ti pogoji urejajo najem napihljivih igral in naročilo dekoracij z baloni pri ponudniku:</p>
        <div class="okvircek">
          <p><b>{{ ime() }}</b></p>
          <p>{{ sedez() }}</p>
          @if (pj().maticna) { <p>Matična številka: {{ pj().maticna }}</p> }
          @if (pj().davcna) { <p>Davčna številka: {{ pj().davcna }}</p> }
          <p>Telefon: {{ pj().telefon }} · E-pošta: <a [href]="'mailto:' + pj().email">{{ pj().email }}</a></p>
        </div>
        <p>Z oddajo rezervacije potrdite, da ste pogoje prebrali in se z njimi strinjate. Za vprašanja, ki jih pogoji ne urejajo, veljajo predpisi Republike Slovenije,
          zlasti Obligacijski zakonik (OZ) in Zakon o varstvu potrošnikov (ZVPot-1).</p>

        <h2>2. Rezervacija in sklenitev pogodbe</h2>
        <ul>
          <li>Rezervacija prek obrazca, telefona, SMS ali e-pošte je povpraševanje in za nobeno stran še ni zavezujoča.</li>
          <li>Pogodba je sklenjena, ko vam termin potrdimo po telefonu, SMS ali e-pošti.</li>
          <li>Prikaz zasedenosti na spletni strani je informativen. Velja le naša potrditev.</li>
          <li>Rezervacijo lahko odda le polnoletna oseba.</li>
        </ul>

        <h2>3. Cene in plačilo</h2>
        <ul>
          <li>Cene so navedene v evrih in veljajo za en dan najema, razen če se dogovorimo drugače. Cena dekoracij je določena s ponudbo.</li>
          <li>{{ pj().dostava }}. Morebitne stroške dostave izven območja vam sporočimo pred potrditvijo.</li>
          @if (pj().ddvZavezanec) {
            <li>Cene vključujejo DDV.</li>
          } @else {
            <li>Ponudnik ni zavezanec za DDV. DDV ni obračunan na podlagi prvega odstavka 94. člena ZDDV-1.</li>
          }
          <li>Plačilo je mogoče z gotovino ob dostavi ali z nakazilom na račun, razen če se dogovorimo drugače. Za vsak najem izdamo račun.</li>
          <li>Velja cena, ki je bila objavljena oziroma dogovorjena ob potrditvi rezervacije.</li>
        </ul>

        <h2>4. Odpoved rezervacije</h2>
        <p class="vrstice">{{ p.nastavitve().pogojiOdpovedi }}</p>
        <p>Ker se najem izvede na točno določen datum, potrošnik v skladu s 12. točko 135. člena ZVPot-1 nima pravice do odstopa od pogodbe v 14 dneh.
          To ne vpliva na zgoraj opisano možnost odpovedi.</p>

        <h2>5. Vreme in varnost</h2>
        <ul>
          <li>Napihljivih igral ne postavljamo in jih ne uporabljamo na prostem ob dežju, nevihti ali močnem vetru (sunki nad približno 38 km/h).</li>
          <li>Če zaradi vremena ali drugih varnostnih razlogov najema ni mogoče izvesti, ga brezplačno prestavimo v notranji prostor ali na drug termin.
            Če to ni mogoče, vam vrnemo že plačan znesek. Drugih stroškov ne povrnemo.</li>
          <li>Če se vreme poslabša med uporabo, mora najemnik otroke takoj odstraniti z igrala in izklopiti ventilator ter nas poklicati.</li>
        </ul>

        <h2>6. Dostava, postavitev in prevzem</h2>
        <ul>
          <li>Igralo pripeljemo, postavimo, pritrdimo in po koncu pospravimo mi. Ob predaji razložimo pravila varne uporabe.</li>
          <li>Najemnik zagotovi raven prostor brez ostrih predmetov, dovolj prostora okoli igrala, dostop do mesta postavitve ter vtičnico 230 V v bližini.</li>
          <li>Najemnik je za igralo odgovoren od predaje do prevzema. Igrala ne sme premikati, prestavljati ali dajati v uporabo tretjim osebam za plačilo.</li>
        </ul>

        <h2>7. Pravila varne uporabe</h2>
        <ul>
          <li>Ves čas uporabe mora otroke nadzorovati polnoletna oseba.</li>
          <li>Igrala so namenjena otrokom, kot je navedeno pri posameznem igralu (praviloma od 3 do 9 let). Upoštevajte nosilnost in priporočeno število otrok hkrati.</li>
          <li>Na igralu ni dovoljena obutev, očala, nakit, ostri predmeti, hrana, pijača, žvečilni gumi, barve ali konfeti.</li>
          <li>Prepovedani so salti, plezanje po stenah in strehi ter skakanje z igrala.</li>
          <li>Večji in manjši otroci naj se igrajo ločeno.</li>
          <li>Ventilator mora delovati ves čas uporabe. Ob izpadu elektrike otroci takoj zapustijo igralo.</li>
        </ul>

        <h2>8. Odgovornost in škoda</h2>
        <ul>
          <li>Ponudnik zagotavlja, da je igralo ob predaji čisto, nepoškodovano in varno za uporabo.</li>
          <li>Najemnik odgovarja za škodo na igralu, ki nastane zaradi nepravilne uporabe ali kršitve teh pogojev, ne pa za običajno obrabo.</li>
          <li>Ponudnik ne odgovarja za poškodbe in škodo, ki nastanejo zaradi neupoštevanja pravil varne uporabe ali neustreznega nadzora.
            Ta omejitev ne velja za škodo, ki jo ponudnik povzroči namenoma ali iz hude malomarnosti, ter za druge primere, ko odgovornosti po zakonu ni mogoče izključiti.</li>
        </ul>

        <h2>9. Pritožbe in reševanje sporov</h2>
        <p>Pritožbo nam sporočite po e-pošti <a [href]="'mailto:' + pj().email">{{ pj().email }}</a> ali po telefonu {{ pj().telefon }}.
          Prejem potrdimo in vam odgovorimo v najkrajšem možnem času, najpozneje v 8 delovnih dneh.</p>
        <p>Spore rešujemo sporazumno. Ponudnik ne priznava nobenega izvajalca izvensodnega reševanja potrošniških sporov kot pristojnega za reševanje sporov,
          ki bi jih potrošnik sprožil. Seznam izvajalcev je objavljen na spletni strani
          <a href="https://www.gov.si/teme/izvensodno-resevanje-potrosniskih-sporov/" target="_blank" rel="noopener">gov.si</a>.</p>
        <p>Če spora ne rešimo sporazumno, je pristojno stvarno pristojno sodišče v Republiki Sloveniji. Uporablja se pravo Republike Slovenije.</p>

        <h2>10. Varstvo osebnih podatkov</h2>
        <p>Kako obdelujemo vaše podatke, je opisano v <a routerLink="/zasebnost">politiki zasebnosti</a>.</p>

        <h2>11. Končne določbe</h2>
        <p>Ponudnik lahko pogoje spremeni. Za posamezno rezervacijo veljajo pogoji, ki so bili objavljeni ob njeni potrditvi.</p>
      </article>
    </section>
  `,
  styles: `.vrstice { white-space: pre-line; }`,
})
export class Pogoji {
  p = inject(Podatki);
  pj = this.p.podjetje;
  veljaOd = PRAVNO_VELJA_OD;
  ime = computed(() => this.pj().pravnoIme || this.pj().ime);
  sedez = computed(() => this.pj().sedez || this.pj().naslov);
}
