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
  "<br><br>Ha beállítottad az értékeket, a <b>Mentés</b> gombra kattintva véglegesítheted.";

  datasDescription: string = "A társasház adatait rögzítheted, pl.: gondnok neve, telefonszámok, ...<br>" +
  "Az első oszlop tartalmazhatja az új adat nevét, pl.:Közös képviselő neve, a második oszlop pedig a nevet.<br>" +
  "Egy sor törléséhez töröld ki mind a két értéket és nyomd meg a <b>Mentés</b> gombot.<br>" +
  "Módosításhoz írd át a rögzített adatokat, majd nyomd meg a <b>Mentés</b> gombot. " +
  "<br><br>Ha beállítottad az értékeket, a <b>Mentés</b> gombra kattintva véglegesítheted.";
  
  

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
}
