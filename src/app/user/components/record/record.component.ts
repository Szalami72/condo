import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CostsService } from '../../../admin/services/costs.service';
import { MenuComponent } from '../menu/menu.component';
import { MessageService } from '../../../shared/services/message.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-record',
  standalone: true,
  imports: [MenuComponent, CommonModule],
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

  constructor(
    private costsService: CostsService,
    private messageService: MessageService,
    private notificationService: NotificationService // Injection
  ) {}

  ngOnInit(): void {
    this.getSettings();
  }

  private getSettings(): void {
    this.costsService.getCosts().subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.settings = response.data || [];
          console.log('📅 settings:', this.settings);
          this.setDates(this.settings);
          this.checkIsRecordEnabled();
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

  private checkIsRecordEnabled(): void {
    if (this.selectedPeriod === 'everyMonth') {
      if (this.today >= this.startDate && this.today <= this.endDate) {
        this.enableRecord = true;
      }
    } else if (this.selectedPeriod === 'evenMonths') {
      if (this.evenMonths) {
        if (this.today >= this.startDate && this.today <= this.endDate) {
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
}
