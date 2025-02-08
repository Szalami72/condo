import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CostsService } from '../../../admin/services/costs.service';
import { MenuComponent } from '../menu/menu.component';
import { MessageService } from '../../../shared/services/message.service';
import { NotificationService } from '../../services/notification.service';
import { MetersService } from '../../../admin/services/meters.service';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-record',
  standalone: true,
  imports: [MenuComponent, CommonModule, FormsModule],
  templateUrl: './record.component.html',
  styleUrl: './record.component.css'
})
export class RecordComponent implements OnInit {
  settings: any[] = [];
  startDate: any;
  endDate: any;
  selectedPeriod: any;
  today: number = new Date().getDate();
  month: number = new Date().getMonth() + 1;
  evenMonths: boolean = true;
  enableRecord: boolean = false;
  userId: any;
  monthAndYear: any;
  hasThisMonthRecord: boolean = false;
  cold1: string = '';
  cold2: string = '';
  hot1: string = '';
  hot2: string = '';
  heating: string = '';
  cold1Value: number | null = null;
  cold2Value: number | null = null;
  hot1Value: number | null = null;
  hot2Value: number | null = null;
  heatingValue: number | null = null;
  cold1Serial: string = '';
  cold2Serial: string = '';
  hot1Serial: string = '';
  hot2Serial: string = '';

  constructor(
    private costsService: CostsService,
    private messageService: MessageService,
    private notificationService: NotificationService,
    private metersService: MetersService
  ) {}

  ngOnInit(): void {
    this.monthAndYear =  this.getCurrentMonthAndYear();
    console.log('📅 m and y:', this.monthAndYear);
  
    const currentUser = this.getCurrentUserDatas();
    if (currentUser) {
      this.userId = currentUser.id;
      console.log('👤 userId:', this.userId);
      this.initializeRecord();
      
    }
  }
  
  initializeRecord(): void {
    console.log('Record initialization');
    this.hasPreviousRecords(this.userId).subscribe((hasRecords) => {
      this.hasThisMonthRecord = hasRecords;
      console.log('📅 hasThisMonthRecord:', this.hasThisMonthRecord);

      // Csak akkor hívjuk a getSettings-et, ha a getPreviousRecords befejeződött
      this.getSettings();
      this.getMetersSerials(this.userId); 
      this.notificationService.setEnableRecordStatus(this.enableRecord);

    });
  }

  private getSettings(): void {
    this.costsService.getCosts().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.settings = response.data || [];
          console.log('📅 settings:', this.settings);
          this.setDates(this.settings);
          this.setMeters(this.settings);
          this.checkIsRecordEnabled();
          this.notificationService.setEnableRecordStatus(this.enableRecord);

        } else {
          this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
        }
      },
      error: () => {
        this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
      }
    });
  }

  private setDates(settings: any): void {
    this.startDate = settings.startDate;
    this.endDate = settings.endDate;
    this.selectedPeriod = settings.selectedPeriod; // everyMonth, evenMonths
    this.evenMonths = this.month % 2 === 0; // páros hónap-e a jelenlegi hónap
    console.log('📅 startDate:', this.startDate);
    console.log('📅 endDate:', this.endDate);
    console.log('📅 evenMonths?:', this.evenMonths);
    console.log('📅 month:', this.month);
  }

  private setMeters(settings: any): void {
    this.cold1 = settings.cold1;
    this.cold2 = settings.cold2;
    this.hot1 = settings.hot1;
    this.hot2 = settings.hot2;
    this.heating = settings.heating;
    console.log('📅 cold1:', this.cold1);
    console.log('📅 cold2:', this.cold2);
    console.log('📅 hot1:', this.hot1);
    console.log('📅 hot2:', this.hot2);
    console.log('📅 heating:', this.heating);
  }
  
  private checkIsRecordEnabled(): void {
    if (this.selectedPeriod === 'everyMonth') {
      if (this.today >= this.startDate && this.today <= this.endDate && !this.hasThisMonthRecord) {
        this.enableRecord = true;
      }
    } else if (this.selectedPeriod === 'evenMonths') {
      if (this.evenMonths) {
        if (this.today >= this.startDate && this.today <= this.endDate && !this.hasThisMonthRecord) {
          this.enableRecord = true;
        }
      } else {
        this.enableRecord = false;
      }
    }

    // Frissítjük az enableRecord állapotot a NotificationService-ben
    this.notificationService.setEnableRecordStatus(this.enableRecord);

    console.log(`📅 Ma: ${this.today}, Kezdés: ${this.startDate}, Vége: ${this.endDate}`);
    console.log(`✔️ enableRecord: ${this.enableRecord}`);
  }

  getCurrentMonthAndYear(): string {
    const today = new Date();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // A hónap 1-től 12-ig, padStart biztosítja a 2 számjegyű formátumot
    const year = today.getFullYear(); // Az aktuális év
    return `${month}-${year}`;
  }

  private getCurrentUserDatas(): any {
    const currentUserData = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (currentUserData) {
      const parsedData = JSON.parse(currentUserData);
      parsedData.id = Number(parsedData.id);
      return parsedData;
    }
    return null;
  }
  
  private hasPreviousRecords(userId: number): Observable<boolean> {
    return this.metersService.getPreviousMetersValues(userId).pipe(
      map((response) => {
        const isRecordExists = this.checkIsRecordExists(response.data);
        console.log('📅 isRecordExists:', response.data);
        return isRecordExists;
      })
    );
  }
  
  private checkIsRecordExists(data: any[]): boolean {
    return data.some(record => record.monthAndYear === this.monthAndYear);
  }
  
  private getMetersSerials(userId: number): any {
    this.metersService.getMeterSerials(userId).subscribe({
      next: (response) => { 
        if (response.status === 'success') {
          console.log('📅 metersSerials:', response.data);
          this.setMetersSerials(response.data);
        } else {
          this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
        }
      },
      error: () => {
        this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!'); 
      }
    });
  }

  private setMetersSerials(data: any[]): void {
    // Objektumot hozunk létre, hogy a típusokhoz hozzárendelhessük a serialNum-okat
    const metersMap: { [key: string]: string } = {};
  
    // Végigmegyünk a kapott tömbön és feltöltjük a megfelelő kulcsokat
    data.forEach(meter => {
      metersMap[meter.typeOfMeter] = meter.serialNum;
    });
  
    // Beállítjuk a megfelelő változókat, ha léteznek az adatokban
    this.cold1Serial = metersMap['cold1'] || '';
    this.cold2Serial = metersMap['cold2'] || '';
    this.hot1Serial = metersMap['hot1'] || '';
    this.hot2Serial = metersMap['hot2'] || '';
  
    // Ellenőrzés: Kiírjuk a konzolra az értékeket
    console.log('📅 cold1Serial:', this.cold1Serial);
    console.log('📅 cold2Serial:', this.cold2Serial);
    console.log('📅 hot1Serial:', this.hot1Serial);
    console.log('📅 hot2Serial:', this.hot2Serial);
  }
  
}

