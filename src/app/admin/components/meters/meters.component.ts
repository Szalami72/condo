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

@Component({
  selector: 'app-meters',
  standalone: true,
  imports: [MenuComponent, 
    NgbPaginationModule, 
    MessageComponent,
    FormsModule,
    CommonModule,
    InfomodalComponent,],
  templateUrl: './meters.component.html',
  styleUrls: ['../../../shared/css/userlist.css', './meters.component.css']
})
export class MetersComponent implements OnInit {

  users: any[] = [];
  filteredUsers: any[] = [];

  page: number = 1;
  pageSize: number = 10;

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

  };

  monthAndYear: string = '';

  sortedColumn: string | null = null;

  constructor(public messageService: MessageService, 
    private metersService: MetersService,
    private modalService: NgbModal,
    private descriptionService: DescriptionService
  ) { }

  ngOnInit(): void {
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
        (user.cold1 === null || user.cold2 === null || user.hot1 === null || user.hot2 === null || user.heating === null) ||
        (user.cold1 === 0 || user.cold2 === 0 || user.hot1 === 0 || user.hot2 === 0 || user.heating === 0)
      )
    );
  
    if (this.sortedColumn) {
      this.sortUsers(this.sortedColumn);
    }
  }
  

  getAllResidentsAndMeters() {
    const monthAndYear = this.getCurrentMonthAndYear();

    console.log("monthAndYear", monthAndYear);

    this.metersService.getMetersValues(monthAndYear).subscribe(
      response => {
        if (response.status === 'success') {
          this.users = response.data;
          this.messageService.setErrorMessage('');
          console.log("meters", this.users);

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
      },
      error => {
        this.messageService.setErrorMessage(this.loadErrorMessage);
      }
    );
    console.log("meterData", this.meterData);
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
    // console.log('saveMetersById', user.userId);
    // console.log('mayId:', this.getCurrentMonthAndYear());
    // console.log('Cold1:', user.cold1);
    // console.log('Cold2:', user.cold2);
    // console.log('Hot1:', user.hot1);
    // console.log('Hot2:', user.hot2);
    // console.log('Heating:', user.heating);

    const data = {
      userId: user.userId,
      mayId: this.getCurrentMonthAndYear(),
      cold1: user.cold1,
      cold2: user.cold2,
      hot1: user.hot1,
      hot2: user.hot2,
      heating: user.heating
    };

    this.metersService.saveMetersValuesById(data).subscribe(
      response => {
        if (response.status === 'success') {
          this.messageService.setMessage('Adatok mentése sikeres!');
        } else {
          this.messageService.setErrorMessage('Hiba történt a mentés során. Próbáld meg később!');
        }
      }
    )
  }

  closeMeters() {
    const modalRef = this.modalService.open(ConfirmmodalComponent, { centered: true });
    
    const message = 'Biztosan le akarod zárni az állásokat?\n';

    let formattedMessage = message.replace(/\n/g, '<br>');

    modalRef.componentInstance.confirmMessage = formattedMessage;

    modalRef.result.then(
      (result) => {
        if (result === 'confirmed') {
          console.log('Confirmed');

        }
      },
      (reason) => {
        console.log('Closed', reason);
      }
    );
  }

  getMetersDetailsDescription() {
    const message = this.descriptionService.getMetersDetailsDescription();
    const modalRef = this.modalService.open(InfomodalComponent, { centered: true });
        modalRef.componentInstance.infoMessage = message;

  }

  getPreviousDatasById(userId: number) {
    console.log('getPreviousDatasById', userId);
    this.metersService.getPreviousMetersValues(userId).subscribe(
      response => {
        if (response.status === 'success') {
          const prevValues = response.data;
          console.log("prev:", prevValues);
          const modalRef = this.modalService.open(PreviousmetersvaluesComponent, { centered: true });
          modalRef.componentInstance.prevValues = prevValues;
          modalRef.componentInstance.meterData = this.meterData;

        } else {
          this.messageService.setErrorMessage(this.loadErrorMessage);
        }
      }
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

