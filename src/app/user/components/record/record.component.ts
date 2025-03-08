import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../services/menu.service';
import { MenuComponent } from '../menu/menu.component';
import { MessageService } from '../../../shared/services/message.service';
import { MetersService } from '../../../shared/services/meters.service';
import { MessageComponent } from "../../../shared/sharedcomponents/message/message.component";

@Component({
  selector: 'app-record',
  standalone: true,
  imports: [MenuComponent, CommonModule, FormsModule, MessageComponent],
  templateUrl: './record.component.html',
  styleUrl: './record.component.css'
})
export class RecordComponent implements OnInit {
  
  startDate: any;
  endDate: any;
  selectedPeriod: any;
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
  prevRecords: any;
  isLoading: boolean = true; 
 

  constructor(
    private messageService: MessageService,
    private metersService: MetersService,
    private menuService: MenuService,

  ) {}

  
  async ngOnInit() {
    const menuData = await this.menuService.inicialize();
    console.log("Menu Data in Component:", menuData);
    
    this.initVariables(menuData);

    this.isLoading = true;
    this.prevRecords = await this.getPreviousRecord();
    console.log("Previous Records in Component:", this.prevRecords);
    
    this.isLoading = false;
  }

  initVariables(data: any): void {
    this.userId = data.find((item: { userId: any; }) => item.userId)?.userId;
    this.monthAndYear = data.find((item: { monthAndYear: any; }) => item.monthAndYear)?.monthAndYear;
    this.startDate = data.find((item: { settings: any; }) => item.settings)?.settings.startDate;
    this.endDate = data.find((item: { settings: any; }) => item.settings)?.settings.endDate;
    this.enableRecord = data.find((item: { recordEnabled: any; }) => item.recordEnabled)?.recordEnabled;
    this.hasThisMonthRecord = data.find((item: { recordExists: any; }) => item.recordExists)?.recordExists;
    this.selectedPeriod = data.find((item: { dates: any; }) => item.dates)?.dates.selectedPeriod;
    this.cold1 = data.find((item: { settings: any; }) => item.settings)?.settings.cold1;
    this.cold2 = data.find((item: { settings: any; }) => item.settings)?.settings.cold2;
    this.hot1 = data.find((item: { settings: any; }) => item.settings)?.settings.hot1;
    this.hot2 = data.find((item: { settings: any; }) => item.settings)?.settings.hot2;
    this.heating = data.find((item: { settings: any; }) => item.settings)?.settings.heating;
    this.getMetersSerials(this.userId);
  }

  
  private getMetersSerials(userId: number): any {
    this.metersService.getMeterSerials(userId).subscribe({
      next: (response) => { 
        if (response.status === 'success') {
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
    const metersMap: { [key: string]: string } = {};
  
    data.forEach(meter => {
      metersMap[meter.typeOfMeter] = meter.serialNum;
    });
  
    this.cold1Serial = metersMap['cold1'] || '';
    this.cold2Serial = metersMap['cold2'] || '';
    this.hot1Serial = metersMap['hot1'] || '';
    this.hot2Serial = metersMap['hot2'] || '';
  }
  
  record(): void {  
    if (!this.isValidRecord()) {
      return; 
    }

    this.metersService.saveMetersValuesById({
      userId: this.userId,
      mayId: this.monthAndYear,
      cold1: this.cold1Value,
      cold2: this.cold2Value,
      hot1: this.hot1Value,
      hot2: this.hot2Value,
      heating: this.heatingValue,
  }).subscribe({
    next: (response) => {
      if (response.status === 'success') {  
        this.messageService.setMessage('A mentés sikeres!');
        this.ngOnInit(); 
      } else {
        this.messageService.setErrorMessage('Hiba történt az adatok mentése során. Próbáld meg később!');
      }
    },
    error: () => {
      this.messageService.setErrorMessage('Hiba történt az adatok mentése során. Próbáld meg később!'); 
    }
});
  }

  private isValidRecord(): boolean {
    if (
      this.userId == null ||
      this.monthAndYear == null ||
      this.cold1Value == null || this.cold1Value < 0 ||
      this.cold2Value == null || this.cold2Value < 0 ||
      this.hot1Value == null || this.hot1Value < 0 ||
      this.hot2Value == null || this.hot2Value < 0 ||
      this.heatingValue == null || this.heatingValue < 0
    ) {
      this.messageService.setErrorMessage('Hibás adatok! Kérlek ellenőrizd az értékeket!');
      return false;
    }
    return true;
  }
  

  async getPreviousRecord(): Promise<any[]> {
    
    try {
      const response = await this.metersService.getPreviousMetersValues(this.userId).toPromise();
      if (response.status === 'success') {
        return response.data || [];
      } else {
        this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
        return [];
      }
    } catch (error) {
      this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
      return [];
    }
  }

  reverseMonthYear(date: string): string {
    const [month, year] = date.split('-');
    return `${year}-${month}`;
  }
  
  
}

