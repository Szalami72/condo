import { Injectable } from '@angular/core';
import { MetersService } from '../../admin/services/meters.service';
import { CostsService } from '../../admin/services/costs.service';
import { MessageService } from '../../shared/services/message.service';
import { FilesService } from '../../admin/services/files.service';
import { NotificationService } from './notification.service';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  today: number = new Date().getDate();
  month: number = new Date().getMonth() + 1;
  datas: any[] = [];
  userId: any;

  constructor(
    private metersService: MetersService,
    private costsService: CostsService,
    private messageService: MessageService,
    private notificationService: NotificationService,
    private filesService: FilesService
  ) { }

  async inicialize(): Promise<any> {
    this.datas = [];
    const monthAndYear = this.getCurrentMonthAndYear();
    this.datas.push({ monthAndYear: monthAndYear });
  
    const currentUserId = this.getCurrentUserDatas();
    this.userId = currentUserId;
    this.datas.push({ userId: currentUserId });
  
    const previousRecords = await this.hasPreviousRecords(currentUserId).toPromise() || [];
    this.datas.push({ previousRecords: previousRecords });
  
    const settings = await this.getSettings();
    this.datas.push({ settings: settings });
  
    const isRecordExists = this.checkIsRecordExists(previousRecords);
    this.datas.push({ recordExists: isRecordExists });
  
    const dates = this.setDates(settings, monthAndYear);
    this.datas.push({ dates: dates });
  
    const isRecordEnabled = this.checkIsRecordEnabled(
      dates.selectedPeriod,
      dates.startDate,
      dates.endDate,
      isRecordExists,
      dates.evenThisMonth
    );
    this.datas.push({ recordEnabled: isRecordEnabled });
    this.notificationService.setEnableRecordStatus(isRecordEnabled);
  
    const files = await this.getFiles();
    this.datas.push({ files: files });
  
    if (files.length > 0) {
      const lastFileDate = files[0].created_at;
      const checkFileDate = this.checkFileDate(lastFileDate);
      if (checkFileDate) {
        this.notificationService.setNewFileStatus(true);
      }
    } 
  
    return this.datas;
  }
  


  getCurrentMonthAndYear(): string {
    const today = new Date();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${month}-${year}`;
  }


  getCurrentUserDatas(): any {
    const currentUserData = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (currentUserData) {
      const parsedData = JSON.parse(currentUserData);
      parsedData.id = Number(parsedData.id);
      return parsedData.id;
    }
    return null;
  }

  private hasPreviousRecords(userId: number): Observable<any[]> {
    return this.metersService.getPreviousMetersValues(userId).pipe(
      map((response) => {
        return response.data || []; 
      })
    );
  }

  private checkIsRecordExists(data: any[]): boolean {
    return data.some(record => this.datas.some(dataRecord => dataRecord.monthAndYear === record.monthAndYear));
  }

  private async getSettings(): Promise<any[]> { 
    return new Promise<any[]>((resolve, reject) => {
      this.costsService.getCosts().subscribe({
        next: (response) => {
          if (response.status === 'success') {
            resolve(response.data || []); 
          } else {
            this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
            reject('Error loading settings');
          }
        },
        error: (error) => {
          this.messageService.setErrorMessage('Hiba történt az adatok betöltése során. Próbáld meg később!');
          reject(error);
        }
      });
    });
  }

  private setDates(settings: any, monthAndYear: string): any {
    const [monthString, yearString] = monthAndYear.split('-'); 
    
    const month = parseInt(monthString, 10);

    const evenMonths = month % 2 === 0; 

    const dates = {
      startDate: settings.startDate || null,
      endDate: settings.endDate || null,
      selectedPeriod: settings.selectedPeriod || null,
      evenThisMonth: evenMonths
    };

    return dates;
}

  

  checkIsRecordEnabled(selectedPeriod: any, startDate: any, endDate: any, isRecordExists: any, evenThisMonth: any): boolean { // previousRecords is any[]
   
    if (selectedPeriod === 'everyMonth') {
      return this.today >= startDate && this.today <= endDate && !isRecordExists;
    } else if (selectedPeriod === 'evenMonths') {
      if (evenThisMonth) {
        return this.today >= startDate && this.today <= endDate && !isRecordExists;
      } else {
        return false;
      }
    }
    return false;
  }

  async getFiles(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.filesService.getFiles().subscribe( 
        (response: any) => {
          if (response && response.status === 'success') {  
            resolve(response.data);
          } else {
            this.messageService.setErrorMessage('Hiba az adatok betöltése során. Próbáld meg később!');
            reject('Hiba az adatok betöltése során');
          }
        },
        (error: any) => {
          console.log('Hiba:', error);
          this.messageService.setErrorMessage('Hiba az adatok betöltése során. Próbáld meg később!');
          reject(error);
        }
      );
    });
  }

  checkFileDate(lastFileDate: string): boolean {
    const storedTime = localStorage.getItem(`lastVisitedTime_files_${this.userId}`);
    if (!storedTime) return true; // Ha nincs mentett idő, minden fájl új
  
    const storedDate = new Date(lastFileDate.replace(' ', 'T'));
    const storedLastVisitedTime = new Date(storedTime);
  
    return storedLastVisitedTime < storedDate;
  }
  
  
  
  
}

  

