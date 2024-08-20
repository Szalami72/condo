import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DescriptionService {

  recDatesDescription: string = "A lakók a kezdő és a befejezés dátum közötti időszakban " +
   "adhatják le az óraállásaikat az online felületen.<br>" + 
   "A befejezés dátum után már csak az adminisztrátor tudja rögzíteni a más módon leadott óraállásokat." +
   "<br><br>Ha beállítottad az értékeket, a <b>Mentés</b> gombra kattintva véglegesítheted.";

  metersDescription: string = "Válaszd ki azokat a mérőórákat, amelyeknek az értékeit a lakók leadhatják " +
  "az online felületen.<br>" +
  "Például ha két vízóra van a lakásban, akkor válaszd a <b>Hideg 1</b> és a <b>Meleg 1</b>-et.<br>" + 
  "Ha csak a melegvíz fogyasztást kell leadni akkor válaszd a <b>Meleg 1</b> és/vagy a <b>Meleg 2</b>-őt." +
  "<br><br>Ha beállítottad az értékeket, a <b>Mentés</b> gombra kattintva véglegesítheted.";

  costsDescription: string = "A közös költség lehet m<sup>2</sup> alapú, lakásonként beállított vagy fix összeg.<br><br>" +
  "A lakásonként beállított összeget általában olyan társasházakban érdemes használni, ahol csak 3 - 5 féle lakás van. (pl.: 33, 44 vagy 60 lakásos lépcsőházaknál)<br>" +
  "Ez esetben a lakók/lakások adatainak rögzítésénél ki lehet választani a közös költség összegét.<br>" +
  "A fix összeg azt jelenti hogy minden lakásnak ugyanannyi a közös költsége.<br>" +
  "A vízóra nélküli lakások albetéti díjának megadása a közös költséghez hasonló." +
  "<br>Az 'Egyéb befizetés'-nél tudod rögzíteni a közös költségen kívüli kiadásokat. Pl. felújítás." +
  "<br><br>Ha beállítottad az értékeket, a <b>Mentés</b> gombra kattintva véglegesítheted.";

  datasDescription: string = "A társasház adatait rögzítheted, pl.: gondnok neve, telefonszámok, ...<br>" +
  "Az első oszlop tartalmazhatja az új adat nevét, pl.:Közös képviselő neve, a második oszlop pedig a nevet.<br>" +
  "Egy sor törléséhez töröld ki mind a két értéket és nyomd meg a <b>Mentés</b> gombot.<br>" +
  "Módosításhoz írd át a rögzített adatokat, majd nyomd meg a <b>Mentés</b> gombot. " +
  "<br><br>Ha beállítottad az értékeket, a <b>Mentés</b> gombra kattintva véglegesítheted.";
  
  metersDetailsDescription: string = "A lakókat név és lépcsőház szerint rendezheted sorba a bal oldalon található kapcsolóval.<br>" +
  "A jobb oldali <b>Pótolandók</b> kapcsoló aktiválásával a listában csak azok a lakók jelennek meg akiknek még nincs vagy hiányos a rögzítése.<br>" +
  "Az <b>Előző</b> gombra kattintva megnézheted a lakó utolsó 12 hónapi óraállásait.<br>" +
  "A <b>A hónap lezárása</b> gombra kattintva véglegesítheted az adatokat.<br>";
  
  residentDetailsDescription: string = "A lakókat név és lépcsőház szerint rendezheted sorba a bal oldalon található kapcsolóval.<br>" +
  "Új lakó felvételéhez kattints a <b>Új lakó felvétele</b> gombra.<br>" +
  "Az adatainak rögzítése után egy email-t küld ki a rendszer az új lakónak. Az email tartalmaza egy generált jelszó amivel be tud lépni az oldalra.<br>" +
  "A lakó szerkesztéséhez kattints az adatait tartalmazó sorra.<br>" +
  "Az adatokat beírva, vagy ha már volt rögzítve akkor a listából kiválasztva adhatod meg.<br>" +
  "A <b>Törlés</b> gombra kattintva törölheted a lakó adatait.<br>" +
  "A <b>Mentés</b> gombra kattintva véglegesítheted az adatokat.<br>";

  bulletinBoardDescription: string = "Itt hozhatsz létre tartalmakat, amik a lakók felületén fognak megjelenni.<br>" +
  "A szerkesztő felületen tudod formázni a szöveget, hasonlóképp mint egy szövegszerkesztőn.<br>" +
  "Az előzőleg feltöltött tartalomra kattintva az bekerül a szerkesztő mezőbe, ahol módosítani illetve törölni tudod.<br>" +
  "A <b>Mentés</b> gombra kattintva véglegesítheted az adatokat.<br>";

  constructor() { }
  getRecDatesDescription(): string {
    return this.recDatesDescription;
  }

  getCostsDescription(): string {
    return this.costsDescription;
  }

  getMetersDescription(): string {
    return this.metersDescription;
  }

  getDatasDescription(): string {
    return this.datasDescription;
  }

  getMetersDetailsDescription(): string {
    return this.metersDetailsDescription;
  }

  getResidentDetailsDescription(): string {
    return this.residentDetailsDescription;
  }

  getBulletinBoardDescription(): string {
    return this.bulletinBoardDescription;
  }

}
