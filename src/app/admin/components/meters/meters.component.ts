import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

import { MetersService } from '../../services/meters.service';
import { MessageService } from '../../../shared/services/message.service';
import { MenuComponent } from "../menu/menu.component";
import { DescriptionService } from '../../services/description.service';
import { InfomodalComponent } from '../../../shared/sharedcomponents/infomodal/infomodal.component';
import { MessageComponent } from '../../../shared/sharedcomponents/message/message.component';
import { ConfirmmodalComponent } from '../../../shared/sharedcomponents/confirmmodal/confirmmodal.component';
import { PreviousmetersvaluesComponent } from '../../../shared/sharedcomponents/previousmetersvalues/previousmetersvalues.component';
import { MeterData } from '../../models/costandmeterdatas.model';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-meters',
  standalone: true,
  imports: [MenuComponent, 
    NgbPaginationModule, 
    MessageComponent,
    FormsModule,
    CommonModule,],
  templateUrl: './meters.component.html',
  styleUrls: ['../../../shared/css/userlist.css', './meters.component.css']
})
export class MetersComponent implements OnInit {

  users: any[] = [];
  filteredUsers: any[] = [];

  page: number = 1;
  pageSize: number = 25;

  searchTerm: string = '';
  filterEmptyFields: boolean = false;

  loadErrorMessage = "Hiba történt az adatok betöltése során. Próbáld meg később!";

  meterData: MeterData = {
    commonCost: undefined,
    amountSmeter: undefined,
    amountFix: undefined,
    subDepSmeter: undefined,
    subDepFix: undefined,
    cold1: '',
    cold2: '',
    hot1: '',
    hot2: '',
    heating: '',
    severally: '',
    calculateCost: '',
    countAverage: '',

  };

  monthAndYear: string = '';

  sortedColumn: string | null = null;
  constructor(public messageService: MessageService, 
    private metersService: MetersService,
    private modalService: NgbModal,
    private descriptionService: DescriptionService
  ) { }

  ngOnInit() {
    this.initializeData();
  }
  initializeData() {
    this.messageService.setErrorMessage('Adatok betöltése...');
    this.monthAndYear = this.getCurrentMonthAndYear();
    this.getMeters();
    this.getAllResidentsAndMeters();
  }

  onPageSizeChange() {
    this.page = 1;
  }

  filterUsers() {
    const term = this.searchTerm ? this.searchTerm.toLowerCase() : '';
  
    this.filteredUsers = this.users.filter((user) =>
      (user.username.toLowerCase().includes(term) ||
      (user.typeOfBuildings && user.typeOfBuildings.toLowerCase().includes(term))) &&
      (!this.filterEmptyFields || // Csak akkor alkalmazzuk a szűrőt, ha a filterEmptyFields igaz
        ((user.cold1 === null && this.meterData.cold1) || (user.cold2 === null && this.meterData.cold2) || (user.hot1 === null && this.meterData.hot1)
         || (user.hot2 === null && this.meterData.hot2) || (user.heating === null && this.meterData.heating))
      )
    );
  
    if (this.sortedColumn) {
      this.sortUsers(this.sortedColumn);
    }
  }
  

  getAllResidentsAndMeters() {
    const monthAndYear = this.getCurrentMonthAndYear();

    //console.log("monthAndYear", monthAndYear);

    this.metersService.getMetersValues(monthAndYear).subscribe(
      response => {
        if (response.status === 'success') {
          this.users = response.data;
          this.messageService.setErrorMessage('');
          //console.log("meters", this.users);

          this.filterUsers(); 
          this.sortUsers('username');
        } else {
          this.messageService.setErrorMessage(this.loadErrorMessage);
        }
      },
      error => {
        this.messageService.setErrorMessage(this.loadErrorMessage);
      }
    );
  }

  getMeters() { 
    this.metersService.getMeters().subscribe(
      data => {
        this.meterData.cold1 = data.cold1 || '';
        this.meterData.cold2 = data.cold2 || '';
        this.meterData.hot1 = data.hot1 || '';
        this.meterData.hot2 = data.hot2 || '';
        this.meterData.heating = data.heating || '';
        this.meterData.severally = data.severally || '';
        this.meterData.calculateCost = data.calculateCost || '';
        this.meterData.countAverage = data.countAverage || '';
      },
      error => {
        this.messageService.setErrorMessage(this.loadErrorMessage);
      }
    );
    //console.log("meterData", this.meterData);
  }
  

  sortUsers(key: string) {
    if (this.filteredUsers.length > 1) {
      this.filteredUsers.sort((a, b) => {
        const valueA = this.getSortableValue(a[key]);
        const valueB = this.getSortableValue(b[key]);

        if (valueA < valueB) {
          return -1;
        }
        if (valueA > valueB) {
          return 1;
        }

        if (key === 'typeOfBuildings') {
          const floorA = this.getSortableValue(a['typeOfFloors']);
          const floorB = this.getSortableValue(b['typeOfFloors']);

          if (floorA < floorB) {
            return -1;
          }
          if (floorA > floorB) {
            return 1;
          }

          if (floorA === floorB) {
            const doorA = this.getSortableValue(a['typeOfDoors']);
            const doorB = this.getSortableValue(b['typeOfDoors']);

            if (doorA < doorB) {
              return -1;
            }
            if (doorA > doorB) {
              return 1;
            }
          }
        }

        return 0;
      });

      this.sortedColumn = key; 
    }
  }

  getSortableValue(value: any): any {
    if (!isNaN(value)) { 
      return parseFloat(value); 
    }
    return value && value.toUpperCase ? value.toUpperCase() : ''; 
  }

  getCurrentMonthAndYear(): string {
    const currentDate = new Date();
    const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
    const year = currentDate.getFullYear();

    return `${month}-${year}`;
  }

  justEmptyFields() {
    this.filterEmptyFields = !this.filterEmptyFields;
    this.filterUsers();
  }

  validatePositiveNumber(user: any, field: string) {
    if (user[field] < 0) {
      user[field] = 0;
    }
  }
  
  saveMetersById(user: any) {
 
    if (
      (this.meterData.cold1 === "1" && (user.cold1 === null)) ||
      (this.meterData.cold2 === "1" && (user.cold2 === null)) ||
      (this.meterData.hot1 === "1" && (user.hot1 === null)) ||
      (this.meterData.hot2 === "1" && (user.hot2 === null)) ||
      (this.meterData.heating === "1" && (user.heating === null))
    ) {
      this.messageService.setErrorMessage('Nem adtál meg vagy hibás adatokat adtál meg!');
      return false;
    }

    const data = {
      userId: user.userId,
      mayId: this.getCurrentMonthAndYear(),
      cold1: user.cold1 !== null ? user.cold1 : 0,
      cold2: user.cold2 !== null ? user.cold2 : 0,
      hot1: user.hot1 !== null ? user.hot1 : 0,
      hot2: user.hot2 !== null ? user.hot2 : 0,
      heating: user.heating !== null ? user.heating : 0
    };
    
    this.metersService.saveMetersValuesById(data).subscribe(
      response => {
        if (response.status === 'success') {
          //console.log('saveMetersById', response.calculatedData);
          this.messageService.setMessage('Adatok mentése sikeres!');
        } else {
          this.messageService.setErrorMessage('Hiba történt a mentés során. Próbáld meg később!');
        }
      }
    )
    return true;
  }


closeMeters() {
  const modalRef = this.modalService.open(ConfirmmodalComponent, { centered: true });

  const messages = {
    withAverage: 'Biztosan le akarod zárni az állásokat?\n Akiknek nem lett rögzítve óraállás, azoknak átlagfogyasztás kerül elszámolásra.',
    withoutAverage: 'Biztosan le akarod zárni az állásokat?\n Akiknek nem lett rögzítve óraállás, azoknak nem lesz fogyasztás elszámolva.'
  };
  
  const message = this.meterData.countAverage === "1" ? messages.withAverage : messages.withoutAverage;
  

  modalRef.componentInstance.confirmMessage = message.replace(/\n/g, '<br>');

  modalRef.result.then(
    (result) => {
      if (result === 'confirmed') {
       
        this.justEmptyFields();
        if(this.filteredUsers.length === 0) {
          this.messageService.setErrorMessage('Már lezártad a hónapot. Lakónként tudsz módosítani.');
          this.justEmptyFields();
        }else {
          this.processFilteredUsers();
          this.filterEmptyFields = false;
          this.initializeData();

        }


      }
    },
    (reason) => {
      //console.log('Closed', reason);
    }
  );
}

processFilteredUsers() {
  let numberOfUsers = this.filteredUsers.length; // Kezdeti felhasználók száma
 

  this.filteredUsers.forEach((user, index) => {
    setTimeout(() => {
      this.getPreviousDatasById(user.userId, user.username, false).subscribe(
        prevValues => {
          const data = prevValues.data;
          this.calculateNewValues(data, user.userId, () => {
            numberOfUsers--;

            // Kiírjuk, hogy hány mentés van még hátra
            if (numberOfUsers > 0) {
              this.messageService.setMessage(`Még ${numberOfUsers} mentés van hátra. Ne zárd be a böngészőt!`, false);
            } else {
              // Ha minden mentés kész, végső üzenet
              this.messageService.setMessage('Mentés sikeres!', true);
            }
          });
        },
        error => {
          console.error('Error fetching previous values:', error);
        }
      );
    }, index * 100);
  });
}





calculateNewValues(data: any[], userId: number, onSaveComplete: () => void) {
  const lastValues = this.getLastValues(data);
  const firstValues = this.getFirstValues(data);
  let newCold1, newCold2, newHot1, newHot2, newHeating;

  if (this.meterData.countAverage === "1" && data.length > 0) {
    const averages = this.calculateAverages(lastValues, firstValues, data.length);
    newCold1 = lastValues.cold1 + averages.cold1;
    newCold2 = lastValues.cold2 + averages.cold2;
    newHot1 = lastValues.hot1 + averages.hot1;
    newHot2 = lastValues.hot2 + averages.hot2;
    newHeating = lastValues.heating + averages.heating;
  } else {
    newCold1 = lastValues.cold1 || 0;
    newCold2 = lastValues.cold2 || 0;
    newHot1 = lastValues.hot1 || 0;
    newHot2 = lastValues.hot2 || 0;
    newHeating = lastValues.heating || 0;
  }

  // console.log('Processed user:', userId);
  // console.log('New Values:', { newCold1, newCold2, newHot1, newHot2, newHeating });

  this.metersService.saveMetersValuesById({
    userId,
    mayId: this.getCurrentMonthAndYear(),
    cold1: newCold1 || 0,
    cold2: newCold2 || 0,
    hot1: newHot1 || 0,
    hot2: newHot2 || 0,
    heating: newHeating || 0,
  }).subscribe(
    response => {
      if (response.status === 'success') {
        onSaveComplete(); // Callback hívása
      } else {
        this.messageService.setErrorMessage('Hiba történt a mentés során. Próbáld meg később!');
      }
    }
  );
}




getLastValues(data: any[]) {
  if (data.length === 0) {
    // Ha a data üres, alapértelmezett értékeket ad vissza
    return { cold1: 0, cold2: 0, hot1: 0, hot2: 0, heating: 0 };
  }
  return {
    cold1: data[0].cold1 ?? 0,
    cold2: data[0].cold2 ?? 0,
    hot1: data[0].hot1 ?? 0,
    hot2: data[0].hot2 ?? 0,
    heating: data[0].heating ?? 0,
  };
}

getFirstValues(data: any[]) {
  if (data.length === 0) {
    // Ha a data üres, alapértelmezett értékeket ad vissza
    return { cold1: 0, cold2: 0, hot1: 0, hot2: 0, heating: 0 };
  }
  return {
    cold1: data[data.length - 1].cold1 ?? 0,
    cold2: data[data.length - 1].cold2 ?? 0,
    hot1: data[data.length - 1].hot1 ?? 0,
    hot2: data[data.length - 1].hot2 ?? 0,
    heating: data[data.length - 1].heating ?? 0,
  };
}

calculateAverages(lastValues: any, firstValues: any, length: number) {
  if (length === 0) {
    // Ha a data üres, az átlagok 0-k legyenek
    return { cold1: 0, cold2: 0, hot1: 0, hot2: 0, heating: 0 };
  }
  return {
    cold1: parseFloat(((lastValues.cold1 - firstValues.cold1) / length).toFixed(2)) || 0,
    cold2: parseFloat(((lastValues.cold2 - firstValues.cold2) / length).toFixed(2)) || 0,
    hot1: parseFloat(((lastValues.hot1 - firstValues.hot1) / length).toFixed(2)) || 0,
    hot2: parseFloat(((lastValues.hot2 - firstValues.hot2) / length).toFixed(2)) || 0,
    heating: parseFloat(((lastValues.heating - firstValues.heating) / length).toFixed(2)) || 0,
  };
}


  getMetersDetailsDescription() {
    const message = this.descriptionService.getMetersDetailsDescription();
    const modalRef = this.modalService.open(InfomodalComponent, { centered: true });
        modalRef.componentInstance.infoMessage = message;

  }

  getPreviousDatasById(userId: number, userName: string = '', showModal: boolean = true): Observable<any> {
    return this.metersService.getPreviousMetersValues(userId).pipe(
      tap(response => {
        if (response.status === 'success' && showModal) {
          const prevValues = response.data;
          const modalRef = this.modalService.open(PreviousmetersvaluesComponent, { centered: true });
          modalRef.componentInstance.prevValues = prevValues;
          modalRef.componentInstance.meterData = this.meterData;
          modalRef.componentInstance.userName = userName;
        }
      }),
      catchError(error => {
        this.messageService.setErrorMessage(this.loadErrorMessage);
        return throwError(error);
      })
    );
  }
  


  getSerialNumberPlaceholder(user: any, meterType: string): string {
    if (user.serialNumbers && user.serialNumbers.length > 0) {
        const meter = user.serialNumbers.find((sn: any) => sn.typeOfMeter === meterType);
        return meter ? meter.serialNum : '';
    }
    return '';
}

  
}

